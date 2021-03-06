import { AES, enc } from "crypto-js";
import { Blockchain, ChainConnectionInfo, nop, op, Operation, User } from "ft3-lib";
import { hashData } from "../utils/crypto";
import DirectoryService from "./DirectoryService";

import * as fs from "fs";
import { IVoucher } from "..";
import logger from "../logger";
import { IAsset, IAssetBalance } from "../models/Asset";
import { ChunkIndex, IChunkHashFilechain, IChunkHashIndex } from "../models/Chunk";
import { IFilechainLocation } from "../models/FilechainLocation";
import { IFileStoringOptions } from "../models/FileStoringOptions";
import FsFile from "../models/FsFile";
import Filechain from "./Filechain";

export default class Filehub {
  private static encrypt(data: string, passphrase: string): string {
    return AES.encrypt(data, passphrase).toString();
  }

  private static decrypt(data: string, passphrase: string): string {
    return AES.decrypt(data, passphrase).toString(enc.Utf8);
  }

  private static getChunkDataByHash(filechain: Filechain, hash: Buffer): Promise<string> {
    return filechain.getChunkDataByHash(hash.toString("hex"));
  }

  private static bufferArray(array: any[], buffer: number): any[][] {
    const arrayOfArrays: any[][] = [];
    for (let i = 0; i < array.length; i += buffer) {
      arrayOfArrays.push(array.slice(i, i + buffer));
    }

    return arrayOfArrays;
  }

  private readonly brid: string;
  private readonly nodeApiUrl: string;
  private readonly blockchain: Promise<Blockchain>;

  private readonly chains: ChainConnectionInfo[];

  public constructor(nodeApiUrl: string, brid: string, chainConnectionInfo: ChainConnectionInfo[]) {
    this.brid = brid;
    this.nodeApiUrl = nodeApiUrl;
    this.chains = chainConnectionInfo;
    this.blockchain = Blockchain.initialize(Buffer.from(brid, "hex"), new DirectoryService(chainConnectionInfo));
  }

  /**
   * Executes a operation towards the Filehub.
   *
   * @param user to sign the operation.
   * @param operation to perform.
   */
  public executeOperation(user: User, operation: Operation, addNop?: boolean): Promise<void> {
    return this.blockchain.then(bc => {
      const trxBuilder = bc.transactionBuilder().add(operation);

      if (addNop) {
        trxBuilder.add(nop());
      }

      logger.debug("Executing %O", operation);
      return trxBuilder
        .buildAndSign(user)
        .post()
        .catch(error => {
          logger.error("Error executing operation %s %O", operation.name, error);
          throw error;
        });
    });
  }

  /**
   * Queries the Filehub for data.
   *
   * @param query the identifier of the query.
   * @param data to provide in the query.
   */
  public executeQuery(query: string, data: unknown) {
    return this.blockchain.then(bc => {
      logger.debug("Executing query '%s' with data: %O", query, data);
      return bc.query(query, data);
    });
  }

  /**
   * Purchases a new voucher if possible.
   * It is only possible to buy a new voucher when there is less than a day left on your current one.
   */
  public async purchaseVoucher(user: User, plan: string): Promise<any> {
    const bc = await this.blockchain;
    return bc
      .transactionBuilder()
      .add(nop())
      .add(op("purchase_voucher", user.authDescriptor.id, plan))
      .buildAndSign(user)
      .post();
  }

  /**
   * Stores a file. Contacts the Filehub and allocates a chunk, and then persists the data in the correct filechain.
   *
   * @param passphrase optional options for storing the file.
   */
  public async storeFile(user: User, file: FsFile, options?: IFileStoringOptions): Promise<any> {
    const fileName =
      options !== undefined && options && options.passphrase !== undefined && options.filenameEncrypted
        ? Filehub.encrypt(file.name, options.passphrase)
        : file.name;

    await this.executeOperation(
      user,
      op(
        "allocate_file",
        user.authDescriptor.id,
        fileName,
        file.size,
        options && options.plan ? options.plan : "CHROMIA"
      )
    );

    const filechainLocations = await this.getFileLocation(user, fileName, 3);

    const promises: Array<Promise<any>> = [];
    filechainLocations.forEach(filechainLocation =>
      promises.push(this.storeChunks(user, file, filechainLocation, fileName, options))
    );

    const result = await Promise.all(promises);
    return result;
  }

  /**
   * Marks a file for removal, the chunks of the file are removed at the next Filechain migration.
   */
  public removeFile(user: User, name: string, options?: IFileStoringOptions): Promise<any> {
    const fileName =
      options !== undefined && options && options.passphrase !== undefined && options.filenameEncrypted
        ? Filehub.encrypt(name, options.passphrase)
        : name;

    return this.executeOperation(user, op("deallocate_file", user.authDescriptor.id, fileName));
  }

  /**
   * Get file names stored by a user.
   */
  public getUserFileNames(user: User): Promise<string[]> {
    return this.executeQuery("get_file_names", {
      descriptor_id: user.authDescriptor.hash().toString("hex")
    });
  }

  /**
   * Retrieves a file by its name.
   *
   * @param passphrase optional options for retrieving file.
   */
  public async getFileByName(user: User, name: string, options?: IFileStoringOptions): Promise<FsFile> {
    try {
      const filechainLocations = await this.getFileLocation(user, name, 1);

      const chunkHashes: IChunkHashIndex[] = await this.executeQuery("get_file_chunks", {
        descriptor_id: user.authDescriptor.hash().toString("hex"),
        name
      });

      const filechain = this.initFilechainClient(filechainLocations[0]);

      const promises: Array<Promise<ChunkIndex>> = [];
      chunkHashes.every(value => promises.push(this.getChunk(filechain, value)));

      const chunkIndexes = await Promise.all(promises);

      if (!options || !options.passphrase) {
        return new Promise(resolve => resolve(FsFile.fromChunks(name, chunkIndexes)));
      } else {
        return new Promise(resolve =>
          resolve(
            FsFile.fromChunks(
              options.filenameEncrypted ? Filehub.decrypt(name, options.passphrase!) : name,
              chunkIndexes.map(
                chunk =>
                  new ChunkIndex(
                    Buffer.from(Filehub.decrypt(chunk.data.toString("utf8"), options.passphrase!), "utf8"),
                    chunk.idx
                  )
              )
            )
          )
        );
      }
    } catch (error) {
      logger.info("Error retrieving file: %O", error);
      const reject: Promise<FsFile> = Promise.reject(error);
      return reject;
    }
  }

  /**
   * Downloads a file by its name to the specified path (if provided),
   * else it will just use the filename and the current path.
   */
  public async downloadFileByName(user: User, name: string, path?: string, options?: IFileStoringOptions) {
    const filechainLocations = await this.getFileLocation(user, name, 1);

    const chunkHashes: IChunkHashIndex[] = await this.executeQuery("get_file_chunks", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      name
    });

    const filechain = this.initFilechainClient(filechainLocations[0]);

    const sortedArray = chunkHashes.sort((a, b) => a.idx - b.idx);
    const bufferedArray: IChunkHashIndex[][] = Filehub.bufferArray(sortedArray, 10);

    const location = path
      ? path
      : options && options.passphrase && options.filenameEncrypted
      ? Filehub.decrypt(name, options.passphrase)
      : name;

    fs.writeFileSync(location, [], "utf8");

    for (const chunks of bufferedArray) {
      const promises: Array<Promise<ChunkIndex>> = [];

      chunks.every(value => promises.push(this.getChunk(filechain, value)));

      const chunkIndexes = await Promise.all(promises);
      const deletePromises: Array<Promise<void>> = [];
      chunkIndexes.every(value =>
        deletePromises.push(
          new Promise<void>(resolve =>
            resolve(
              fs.appendFileSync(
                location,
                options && options.passphrase
                  ? Filehub.decrypt(value.data.toString(), options.passphrase)
                  : value.data.toString()
              )
            )
          )
        )
      );

      await Promise.all(deletePromises);
    }
  }

  /**
   * Retrieves all the vouchers for the specific user.
   */
  public getVouchers(user: User): Promise<IVoucher[]> {
    return this.executeQuery("get_vouchers", {
      descriptor_id: user.authDescriptor.hash().toString("hex")
    });
  }

  /**
   * Checks if the user has an active voucher.
   */
  public hasActiveVoucher(user: User, plan: string): Promise<boolean> {
    return this.executeQuery("has_active_voucher_for_timestamp", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      timestamp: Date.now(),
      voucher_plan: plan
    });
  }

  /**
   * Returns how many bytes the user has allocated.
   */
  public getAllocatedBytes(user: User): Promise<number> {
    return this.executeQuery("get_allocated_bytes", {
      descriptor_id: user.authDescriptor.hash().toString("hex")
    });
  }

  /**
   * Returns the balance of the user.
   */
  public async getBalance(user: User): Promise<number> {
    const asset: IAsset[] = await this.executeQuery("ft3.get_asset_by_name", { name: "CHR" });

    return this.executeQuery("ft3.get_asset_balance", {
      account_id: user.authDescriptor.hash().toString("hex"),
      asset_id: asset[0].id.toString("hex")
    }).then((assetBalance: IAssetBalance) => assetBalance.amount);
  }

  /**
   * Store chunk in the provided BRID.
   */
  public async copyChunkDataToOtherBrid(user: User, chunkHash: IChunkHashFilechain) {
    const filechainLocation: IFilechainLocation = { brid: chunkHash.brid, location: chunkHash.location };
    const oldFilechain = this.initFilechainClient(filechainLocation);

    const newLocation: IFilechainLocation = await this.executeQuery(
      "get_active_filechain_for_hash_in_disabled_filechain",
      {
        brid: chunkHash.brid.toString("hex"),
        hash: chunkHash.hash
      }
    );

    const newFilechain = this.initFilechainClient(newLocation);

    const data = await oldFilechain.getChunkDataByHash(chunkHash.hash.toString("hex"));
    return this.persistChunkDataInFilechain(user, newFilechain, Buffer.from(data, "hex"));
  }

  initFilechainClient(filechainLocation: IFilechainLocation): Filechain {
    const brid = filechainLocation.brid.toString("hex");
    let location = filechainLocation.location;

    logger.debug("Initializing filechain client with brid: %s", brid);

    if (location === "@DirectoryService") {
      logger.debug("Searching for Filechain location [%s] in DirectoryService", brid);
      const chain = this.chains.find(c => {
        const directoryChain = c.chainId.toString("hex").toLocaleUpperCase();
        logger.silly("Found in DC: %s", directoryChain);

        return directoryChain === brid.toLocaleUpperCase();
      });

      if (chain == null) {
        throw new Error("Expected filechain not found in directory service");
      }

      location = chain.url;
    }

    return new Filechain(location, brid);
  }

  private async storeChunks(
    user: User,
    file: FsFile,
    filechainLocation: IFilechainLocation,
    fileName: string,
    options?: IFileStoringOptions
  ) {
    const filechain: Filechain = this.initFilechainClient(filechainLocation);

    const promises: Array<Promise<any>> = [];
    for (let i = 0; i < file.numberOfChunks(); i++) {
      promises.push(
        file.getChunk(i).then(chunk => this.storeChunk(user, filechain, new ChunkIndex(chunk, i), fileName, options))
      );
    }

    const result = await Promise.all(promises);
    return result;
  }

  private storeChunk(
    user: User,
    filechain: Filechain,
    chunkIndex: ChunkIndex,
    name: string,
    options?: IFileStoringOptions
  ) {
    const chunkToStore =
      options !== undefined && options.passphrase != null
        ? Buffer.from(Filehub.encrypt(chunkIndex.data.toString("utf8"), options.passphrase), "utf8")
        : chunkIndex.data;

    return this.allocateChunk(user, chunkToStore, name, chunkIndex.idx).then(() =>
      this.persistChunkDataInFilechain(user, filechain, chunkToStore)
    );
  }

  private persistChunkDataInFilechain(user: User, filechain: Filechain, data: Buffer) {
    return filechain.storeChunkData(user, data);
  }

  private getFileLocation(user: User, name: string, replicaChains: number): Promise<IFilechainLocation[]> {
    return this.executeQuery("get_file_location", {
      descriptor_id: user.authDescriptor.hash().toString("hex"),
      name,
      replica_chains: replicaChains
    }).then((locations: IFilechainLocation[]) => {
      if (locations.length < 1) {
        throw new Error("Did not receive enough active & online Filechains");
      }
      return locations;
    });
  }

  private getChunk(filechain: Filechain, chunkHash: IChunkHashIndex): Promise<ChunkIndex> {
    return Filehub.getChunkDataByHash(filechain, chunkHash.hash).then(
      (data: string) => new ChunkIndex(Buffer.from(data, "hex"), chunkHash.idx)
    );
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

    return this.executeOperation(user, operation);
  }
}
