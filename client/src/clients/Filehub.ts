import {Blockchain, nop, op, User} from "ft3-lib";
import DirectoryService from "./DirectoryService";
import {hashData} from "../utils/crypto";
import { AES, enc } from 'crypto-js';

import Filechain from "./Filechain";
import ChainConnectionInfo from "ft3-lib/dist/lib/ft3/chain-connection-info";
import FsFile from "../models/FsFile";
import Operation from "ft3-lib/dist/lib/ft3/operation";
import {Voucher} from "..";
import {ChunkHashIndex, ChunkIndex} from "../models/Chunk";
import * as fs from "fs";

export default class Filehub {

  private readonly brid: string;
  private readonly nodeApiUrl: string;
  private readonly blockchain: Promise<Blockchain>;
  private readonly chains: ChainConnectionInfo[];

  public constructor(nodeApiUrl: string, brid: string, chainConnectionInfo: ChainConnectionInfo[]) {
    this.brid = brid;
    this.nodeApiUrl = nodeApiUrl;
    this.chains = chainConnectionInfo;
    this.blockchain = Blockchain.initialize(
      Buffer.from(brid, "hex"),
      new DirectoryService(chainConnectionInfo)
    );
  }

  /**
   * Stores a file. Contacts the filehub and allocates a chunk, and then persists the data in the correct filechain.
   *
   * @param passphrase optional parameter to have the file stored encrypted with a passphrase. Note that storing the file encrypted may require extra bytes allocated.
   */
  public async storeFile(user: User, file: FsFile, passphrase?: string): Promise<any> {
    console.log("Storing file: ", file);
    const bc = await this.blockchain;

    await bc.call(op("allocate_file", user.authDescriptor.id, file.name, file.size), user);

    const brid: Buffer = await this.getFileLocation(user, file.name);
    const filechain: Filechain = this.getFilechain(brid);

    const promises: Promise<any>[] = [];
    for (let i = 0; i < file.numberOfChunks(); i++) {
      promises.push(
        file.readChunk(i).then(chunk => this.storeChunk(user, filechain, new ChunkIndex(chunk, i), file.name, passphrase))
      )
    }

    return Promise.all(promises);
  }

  /**
   * Registers the admin user, this operation is only valid when there are no other admins.
   */
  public registerAdmin(user: User): Promise<void> {
    return this.blockchain.then(bc => bc.call(op("register_admin", user.authDescriptor.id), user));
  };

  /**
   * Registers a filechain to persist files in.
   *
   * @param user that is an admin of the filehub.
   * @param rid of the filechain.
   */
  public registerFilechain(user: User, rid: string): Promise<any> {
      return this.blockchain.then(bc => bc.call(op("add_filechain", user.authDescriptor.id, rid), user));
  };

  /**
   * Purchases a new voucher if possible.
   * It is only possible to buy a new voucher when there is less than a day left on your current one.
   */
  public async purchaseVoucher(user: User): Promise<any> {
    const bc = await this.blockchain;
    return await bc.transactionBuilder()
      .add(nop())
      .add(op("create_voucher", user.authDescriptor.id))
      .buildAndSign(user)
      .post();
  }

  /**
   * Get file names stored by a user.
   */
  public getUserFileNames(user: User): Promise<string[]> {
    return this.blockchain.then(bc => bc.query("get_file_names", {
      descriptor_id: user.authDescriptor.hash().toString("hex")
    }));
  }

  /**
   * Retrieves a file by its name.
   *
   * @param passphrase optional parameter to decrypt the read file with a passphrase.
   */
  public async getFileByPath(user: User, path: string, passphrase?: string): Promise<FsFile> {
    const brid = await this.getFileLocation(user, path);
    const chunkHashes: ChunkHashIndex[] = await this.blockchain.then(bc => bc.query("get_file_chunks", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      name: path
    }));

    const filechain = this.getFilechain(brid);

    const promises: Promise<ChunkIndex>[] = [];

    for (let i = 0; i < chunkHashes.length; i++) {
      promises.push(this.getChunk(user, filechain, chunkHashes[i]));
    }

    const chunkIndexes = await Promise.all(promises);

    if (passphrase == null) {
      return new Promise(resolve => resolve(FsFile.fromChunks(path, chunkIndexes)));
    } else {
      return new Promise(resolve => resolve(FsFile.fromChunks(path, chunkIndexes
        .map(chunk => new ChunkIndex(Buffer.from(this.decrypt(chunk.data.toString("utf8"), passphrase), "utf8"), chunk.idx)))));
    }
  }

  public async downloadFileByPath(user: User, path: string, passphrase?: string) {
    const brid = await this.getFileLocation(user, path);
    const chunkHashes: ChunkHashIndex[] = await this.blockchain.then(bc => bc.query("get_file_chunks", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      name: path
    }));

    console.log("1111 Chunk hashes: ", chunkHashes);

    const filechain = this.getFilechain(brid);

    const sortedArray = chunkHashes.sort((a, b) => a.idx - b.idx);
    console.log("2222 Sorted array: ", sortedArray);
    const bufferedArray: ChunkHashIndex[][] = this.bufferArray(sortedArray, 10);

    console.log("*** Buffered Array: ", bufferedArray);
    fs.writeFileSync(path, [], "utf8");

    for (let i = 0; i < bufferedArray.length; i++) {
      const promises: Promise<ChunkIndex>[] = [];
      const chunks = bufferedArray[i];

      for (let j = 0; j < chunks.length; j++) {
        promises.push(this.getChunk(user, filechain, chunks[j]));
      }

      const chunkIndexes = await Promise.all(promises);
      console.log("Chunk indexes: ", chunkIndexes);
      const deletePromises: Promise<void>[] = [];
      for (let k = 0; k < chunkIndexes.length; k++) {
        const data = chunkIndexes[k].data;
        console.log("Appending chunk: ", k, " length of data is: ", data.length);

        deletePromises.push(
          new Promise<void>(resolve => resolve(fs.appendFileSync(
            path, passphrase != null
              ? this.decrypt(data.toString(), passphrase)
              : data.toString())
            ))
        );
      }

      await Promise.all(deletePromises);
    }
  }

  private bufferArray(array: any[], buffer: number): any[][] {
    const arrayOfArrays: any[][] = [];
    for (let i=0; i<array.length; i+=buffer) {
      arrayOfArrays.push(array.slice(i, i+buffer));
    }

    return arrayOfArrays;
  }

  /**
   * Retrieves all the vouchers for the specific user.
   */
  public getVouchers(user: User): Promise<Voucher[]> {
    return this.blockchain.then(bc => bc.query("get_vouchers", {
      descriptor_id: user.authDescriptor.hash().toString("hex")
    }));
  }

  /**
   * Checks if the user has an active voucher.
   */
  public hasActiveVoucher(user: User): Promise<boolean> {
    return this.blockchain.then(bc => bc.query("has_active_voucher_for_timestamp", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      timestamp: Date.now()
    }));
  }

  /**
   * Returns how many bytes the user has allocated.
   */
  public getAllocatedBytes(user: User): Promise<number> {
    return this.blockchain.then(bc => bc.query("get_allocated_bytes", {
      descriptor_id: user.authDescriptor.hash().toString("hex")
    }));
  }

  private storeChunk(user: User, filechain: Filechain, chunkIndex: ChunkIndex, name: string, passphrase?: string) {
    const chunkToStore = passphrase != null
      ? Buffer.from(this.encrypt(chunkIndex.data.toString("utf8"), passphrase), "utf8")
      : chunkIndex.data;

    return this.allocateChunk(user, chunkToStore, name, chunkIndex.idx)
      .then(() => filechain.storeChunkData(user, chunkToStore));
  }

  private getFileLocation(user: User, name: string): Promise<Buffer> {
    return this.blockchain.then(bc => bc.query("get_file_location", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      name: name
    }))
  }

  private getChunk(user: User, filechain: Filechain, chunkHash: ChunkHashIndex): Promise<ChunkIndex> {
    console.log("Getting chunk hash: ", chunkHash);
    return Filehub.getFileByHash(user, filechain, chunkHash.hash)
      .then((data: string) => new ChunkIndex(Buffer.from(data, "hex"), chunkHash.idx));
  }

  private allocateChunk(user: User, chunk: Buffer, name: string, index: number): Promise<any> {
    const hash = hashData(chunk);
    console.log("Allocating hash: ", hash.toString("hex"));

    const operation: Operation = new Operation(
      "allocate_chunk",
      user.authDescriptor.id,
      name,
      hash,
      chunk.length,
      index
    );

    return this.blockchain.then(bc => bc.call(operation, user));
  };

  private getFilechain(brid: Buffer): Filechain {
    const chain = this.chains
      .find(c => c.chainId.toString("hex").toLocaleUpperCase() === brid.toString("hex").toLocaleUpperCase());

    if (chain == null) {
      throw new Error("Expected filechain not found in directory service");
    }

    return new Filechain(chain.url, chain.chainId.toString("hex"));
  }

  private encrypt(data: string, passphrase: string): string {
    return AES.encrypt(data, passphrase).toString();
  }

  private decrypt(data: string, passphrase: string): string {
    return AES.decrypt(data, passphrase).toString(enc.Utf8);
  }

  private static getFileByHash(user: User, filechain: Filechain, hash: Buffer): Promise<string> {
    return filechain.getFileByHash(user, hash);
  }

}