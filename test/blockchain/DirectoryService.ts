import { DirectoryServiceBase, ChainConnectionInfo } from "ft3-lib";
import * as config from "./config.js";

const chainList = [
  new ChainConnectionInfo(
    Buffer.from(config.filehubRID, "hex"),
    config.nodeApiUrl
  )
];

export default class DirectoryService extends DirectoryServiceBase {
  constructor() {
    super(chainList);
  }
}