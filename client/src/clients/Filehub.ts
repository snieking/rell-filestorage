import {Blockchain, User} from "ft3-lib";
import DirectoryService from "./DirectoryService";
import {hashData} from "../utils/crypto";

export default class Filehub {

  private readonly brid: string;
  private readonly nodeApiUrl: string;
  private readonly blockchain: Promise<Blockchain>;

  public constructor(nodeApiUrl: string, brid: string) {
    this.brid = brid;
    this.nodeApiUrl = nodeApiUrl;
    this.blockchain = Blockchain.initialize(
      Buffer.from(brid, "hex"),
      new DirectoryService(brid, nodeApiUrl)
    );
  }

  public registerFilechain = (user: User, brid: string): Promise<any> => {
      return this.blockchain.then(bc => bc.call(user, "add_blockchain", user.authDescriptor.hash().toString("hex"), brid));
  };

  public allocateChunk = (user: User, data: string): Promise<any> => {
    const hash = hashData(data);
    return this.blockchain.then(bc => bc.call(
      user,
      "allocate_chunk",
      user.authDescriptor.hash().toString("hex"),
      hash,
      user.keyPair.pubKey
    ));
  };

  public getFileDetails = (user: User, data: string) => {

  }

}