import * as config from "./config.js";
import DirectoryService from "../../client/src/clients/DirectoryService";
import {Blockchain} from "ft3-lib";
import Filehub from "fs-client/lib/clients/Filehub";
import ChainConnectionInfo from "ft3-lib/dist/lib/ft3/chain-connection-info";

// Filehub chain
const FILEHUB_NODE_API_URL = config.filehubNodeApiUrl;
export const FILEHUB_BLOCKCHAIN_RID = config.filehubRID;

const FILECHAIN_NODE_API_URL = config.filechainNodeApiUrl;
const FILECHAIN_BLOCKCHAIN_RID = config.filechainRID;

export const CHAINS = [
  new ChainConnectionInfo(Buffer.from(FILEHUB_BLOCKCHAIN_RID, "hex"), FILEHUB_NODE_API_URL),
  new ChainConnectionInfo(Buffer.from(FILECHAIN_BLOCKCHAIN_RID, "hex"), FILECHAIN_NODE_API_URL)
];

export const FILEHUB = new Filehub(FILEHUB_NODE_API_URL, FILEHUB_BLOCKCHAIN_RID, CHAINS);

export const FILEHUB_BLOCKCHAIN = Blockchain.initialize(
  Buffer.from(FILEHUB_BLOCKCHAIN_RID, "hex"),
  new DirectoryService(CHAINS)
);