import {Blockchain, nop, op, User} from "ft3-lib";
import DirectoryService from "./DirectoryService";
import {hashData} from "../utils/crypto";

import Filechain from "./Filechain";
import ChainConnectionInfo from "ft3-lib/dist/lib/ft3/chain-connection-info";
import FsFile from "../models/FsFile";
import Operation from "ft3-lib/dist/lib/ft3/operation";
import {Voucher} from "..";
import {ChunkHashIndex, ChunkIndex} from "../models/Chunk";

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
   */
  public async storeFile(user: User, file: FsFile): Promise<any> {
    const bc = await this.blockchain;

    await bc.call(op("allocate_file", user.authDescriptor.id, file.name, file.data.length), user);
    await this.allocateChunks(user, file);

    const brid: Buffer = await this.getFileLocation(user, file.name);
    const filechain: Filechain = this.getFilechain(brid);

    return await Filehub.storeChunksInFilechain(user, filechain, file.chunks);
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

  public async storeFileEncrypted(user: User, file: FsFile) {

  }

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
   */
  public async getFileByName(user: User, name: string): Promise<FsFile> {
    const brid = await this.getFileLocation(user, name);
    const chunkHashes: ChunkHashIndex[] = await this.blockchain.then(bc => bc.query("get_file_chunks", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      name: name
    }));

    const filechain = this.getFilechain(brid);

    const promises: Promise<ChunkIndex>[] = [];

    for (let i = 0; i < chunkHashes.length; i++) {
      promises.push(this.getChunk(user, filechain, chunkHashes[i]));
    }

    const chunkIndexes = await Promise.all(promises);
    return new Promise(resolve => resolve(FsFile.fromChunks(name, chunkIndexes)));
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

  private static storeChunksInFilechain(user: User, filechain: Filechain, chunks: Buffer[]): Promise<any> {
    const promises: Promise<any>[] = [];

    for (let i = 0; i < chunks.length; i++) {
      promises.push(filechain.storeChunkData(user, chunks[i]));
    }

    return Promise.all(promises);
  }

  private getFileLocation(user: User, name: string): Promise<Buffer> {
    return this.blockchain.then(bc => bc.query("get_file_location", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      name: name
    }))
  }

  private async allocateChunks(user: User, file: FsFile): Promise<any> {
    const promises: Promise<any>[] = [];

    const chunks = file.chunks;
    for (let i = 0; i < chunks.length; i++) {
      promises.push(this.allocateChunk(user, chunks[i], file.name, i));
    }

    return await Promise.all(promises);
  }

  private getChunk(user: User, filechain: Filechain, chunkHash: ChunkHashIndex): Promise<ChunkIndex> {
    return Filehub.getFileByHash(user, filechain, chunkHash.hash)
      .then((data: string) => new ChunkIndex(Buffer.from(data, "hex"), chunkHash.idx));
  }

  private static getFileByHash(user: User, filechain: Filechain, hash: Buffer): Promise<string> {
    return filechain.getFileByHash(user, hash);
  }

  private allocateChunk(user: User, chunk: Buffer, name: string, index: number): Promise<any> {
    const hash = hashData(chunk);

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

}