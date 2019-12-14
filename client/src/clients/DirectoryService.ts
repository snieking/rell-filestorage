import { DirectoryServiceBase, ChainConnectionInfo } from "ft3-lib";

export default class DirectoryService extends DirectoryServiceBase {
  constructor(brid: string, nodeApiUrl: string) {
    const chainList = [
      new ChainConnectionInfo(
        Buffer.from(brid, "hex"),
        nodeApiUrl
      )
    ];
    super(chainList);
  }
}