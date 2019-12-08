import * as pcl from "postchain-client";
import * as config from "./config.js";
import DirectoryService from "./DirectoryService";
import {Blockchain} from "ft3-lib";

const NODE_API_URL = config.nodeApiUrl;

// Filehub chain
const FILEHUB_BLOCKCHAIN_RID = config.filehubRID;

export const FILEHUB_REST_CLIENT = pcl.restClient.createRestClient(NODE_API_URL, FILEHUB_BLOCKCHAIN_RID, 10);
export const FILEHUB_GTX = pcl.gtxClient.createClient(FILEHUB_REST_CLIENT, Buffer.from(FILEHUB_BLOCKCHAIN_RID, "hex"), []);

export const FILEHUB_BLOCKCHAIN = Blockchain.initialize(
  Buffer.from(FILEHUB_BLOCKCHAIN_RID, "hex"),
  new DirectoryService(FILEHUB_BLOCKCHAIN_RID, NODE_API_URL)
);

// Filechain chain
const FILECHAIN_BLOCKCHAIN_RID = config.filechainRID;

export const FILECHAIN_REST_CLIENT = pcl.restClient.createRestClient(NODE_API_URL, FILECHAIN_BLOCKCHAIN_RID, 10);
export const FILECHAIN_GTX = pcl.gtxClient.createClient(FILECHAIN_REST_CLIENT, Buffer.from(FILECHAIN_BLOCKCHAIN_RID, "hex"), []);