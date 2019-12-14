import * as pcl from "postchain-client";
import * as config from "./config.js";
import DirectoryService from "../../client/src/clients/DirectoryService";
import {Blockchain} from "ft3-lib";
import Filehub from "fs-client/lib/clients/Filehub";

// Filehub chain
const FILEHUB_NODE_API_URL = config.filehubNodeApiUrl;
export const FILEHUB_BLOCKCHAIN_RID = config.filehubRID;
export const FILEHUB_BLOCKCHAIN = Blockchain.initialize(
  Buffer.from(FILEHUB_BLOCKCHAIN_RID, "hex"),
  new DirectoryService(FILEHUB_BLOCKCHAIN_RID, FILEHUB_NODE_API_URL)
);

export const FILEHUB = new Filehub(FILEHUB_NODE_API_URL, FILEHUB_BLOCKCHAIN_RID);

// Filechain chain
const FILECHAIN_NODE_API_URL = config.filechainNodeApiUrl;
const FILECHAIN_BLOCKCHAIN_RID = config.filechainRID;

export const FILECHAIN_REST_CLIENT = pcl.restClient.createRestClient(FILECHAIN_NODE_API_URL, FILECHAIN_BLOCKCHAIN_RID, 10);
export const FILECHAIN_GTX = pcl.gtxClient.createClient(FILECHAIN_REST_CLIENT, Buffer.from(FILECHAIN_BLOCKCHAIN_RID, "hex"), []);