import { ChainConnectionInfo, DirectoryServiceBase } from "ft3-lib";

export default class DirectoryService extends DirectoryServiceBase {
  constructor(chains: ChainConnectionInfo[]) {
    super(chains);
  }
}
