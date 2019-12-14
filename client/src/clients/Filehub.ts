import {Blockchain, op, User} from "ft3-lib";
import DirectoryService from "./DirectoryService";
import {hashData} from "../utils/crypto";

import Filechain from "./Filechain";
import ChainConnectionInfo from "ft3-lib/dist/lib/ft3/chain-connection-info";
import Chunk from "../models/Chunk";
import File from "../models/File";
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

  public registerFilechain(user: User, brid: string): Promise<any> {
      const operation = new Operation("add_blockchain", user.authDescriptor.hash().toString("hex"), brid);
      return this.blockchain.then(bc => bc.call(operation, user));
  };

  public async storeFile(user: User, name: string, data: Buffer): Promise<any> {
    return this.allocateChunk(user, name, data)
      .then(() => this.getChunk(user, hashData(data)))
      .then(chunk => this.getFilechain(chunk.brid).storeChunkData(user, data));
  }

  public async getMyFiles(user: User): Promise<File[]> {
    return this.getChunks(user).then(chunks => Promise.all(chunks.map(chunk => this.getFile(user, chunk))));
  };

  private allocateChunk(user: User, name: string, data: Buffer): Promise<any> {
    const hash = hashData(data);

    const operation: Operation = new Operation(
      "allocate_chunk",
      user.authDescriptor.hash().toString("hex"),
      name,
      hash,
      user.keyPair.pubKey
    );

    return this.blockchain.then(bc => bc.call(operation, user));
  };

  private getChunk(user: User, hash: Buffer): Promise<Chunk> {
    return this.blockchain.then(bc => bc.query("get_chunk", {
      hash: hash.toString("hex"),
      pubkey: user.keyPair.pubKey.toString("hex")
    }));
  }

  private getChunks(user: User): Promise<Chunk[]> {
    return this.blockchain.then(bc => bc.query("get_chunks", {
      pubkey: user.keyPair.pubKey.toString("hex")
    }));
  };

  private async getFile(user: User, chunk: Chunk): Promise<File> {
    const filechain: Filechain = this.getFilechain(chunk.brid);
    return filechain.getFileByHash(user, chunk.hash)
      .then(data => new File(chunk.name, data));
  }

  private getFilechain(brid: Buffer): Filechain {
    const chain = this.chains.find(c => c.chainId.toString("hex").toLocaleUpperCase() === brid.toString("hex").toLocaleUpperCase());

    if (chain == null) {
      throw new Error("Expected filechain not found in directory service");
    }

    return new Filechain(chain.url, chain.chainId.toString("hex"));
  }

}