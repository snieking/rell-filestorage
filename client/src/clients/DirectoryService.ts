import { DirectoryServiceBase, ChainConnectionInfo } from "ft3-lib";
import logger from "../utils/logger";

export default class DirectoryService extends DirectoryServiceBase {
  constructor(chains: ChainConnectionInfo[]) {
    super(chains);
    logger.debug("Created directory service with chains %O", chains);
  }
}