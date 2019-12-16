import {Blockchain, User} from "ft3-lib";
import DirectoryService from "./DirectoryService";
import {hashData} from "../utils/crypto";

import Filechain from "./Filechain";
import ChainConnectionInfo from "ft3-lib/dist/lib/ft3/chain-connection-info";
import ChunkMeta from "../models/ChunkMeta";
import FsFile from "../models/FsFile";
import Operation from "ft3-lib/dist/lib/ft3/operation";

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
   * Registers the admin user, this operation is only valid when there are no other admins.
   *
   * @param user that is to become admin.
   */
  public registerAdmin(user: User): Promise<void> {
    const operation = new Operation("register_admin", user.authDescriptor.hash().toString("hex"));
    return this.blockchain.then(bc => bc.call(operation, user));
  };

  /**
   * Registers a filechain to persist files in.
   *
   * @param user that is an admin of the filehub.
   * @param rid of the filechain.
   */
  public registerFilechain(user: User, rid: string): Promise<any> {
      const operation = new Operation("add_filechain", user.authDescriptor.hash().toString("hex"), rid);
      return this.blockchain.then(bc => bc.call(operation, user));
  };

  /**
   * Stores a file. Contacts the filehub and allocates a chunk, and then persists the data in the correct filechain.
   *
   * @param user that should be billed for the storage.
   * @param file that is to be stored.
   */
  public storeFile(user: User, file: FsFile): Promise<any> {
    return this.allocateChunk(user, file)
      .then(() => this.getChunk(user, hashData(file.data)))
      .then(chunk => this.getFilechain(chunk.brid).storeChunkData(user, file.data));
  }

  public async storeFileEncrypted(user: User, file: FsFile) {

  }

  /**
   * Gets all the files persisted by the user.
   *
   * @param user that has persisted previous files.
   */
  public async getUserFiles(user: User): Promise<FsFile[]> {
    return this.getChunks(user).then(chunks => Promise.all(chunks.map(chunk => this.getFullFile(user, chunk))));
  };

  private allocateChunk(user: User, file: FsFile): Promise<any> {
    const hash = hashData(file.data);

    const operation: Operation = new Operation(
      "allocate_chunk",
      user.authDescriptor.hash().toString("hex"),
      file.path,
      hash
    );

    return this.blockchain.then(bc => bc.call(operation, user));
  };

  private getChunk(user: User, hash: Buffer): Promise<ChunkMeta> {
    return this.blockchain.then(bc => bc.query("get_chunk", {
      hash: hash.toString("hex"),
      descriptor_id: user.authDescriptor.hash().toString("hex")
    }));
  }

  private getChunks(user: User): Promise<ChunkMeta[]> {
    return this.blockchain.then(bc => bc.query("get_chunks", {
      descriptor_id: user.authDescriptor.hash().toString("hex")
    }));
  };

  private async getFullFile(user: User, chunk: ChunkMeta): Promise<FsFile> {
    const filechain: Filechain = this.getFilechain(chunk.brid);
    return filechain.getFileByHash(user, chunk.hash).then(data => new FsFile(chunk.path, data));
  }

  private getFilechain(brid: Buffer): Filechain {
    const chain = this.chains.find(c => c.chainId.toString("hex").toLocaleUpperCase() === brid.toString("hex").toLocaleUpperCase());

    if (chain == null) {
      throw new Error("Expected filechain not found in directory service");
    }

    return new Filechain(chain.url, chain.chainId.toString("hex"));
  }

}