import * as config from "./config.js";
import DirectoryService from "../../client/src/clients/DirectoryService";
import { Blockchain, KeyPair, Postchain } from "ft3-lib";
import Filehub from "fs-client/lib/clients/Filehub";
import logger from "../logger";
import FilehubAdministrator from "../../client/lib/clients/FilehubAdministrator";

// Filehub chain
const FILEHUB_NODE_API_URL = config.filehubNodeApiUrl;
export const FILEHUB_BLOCKCHAIN_RID = config.filehubRID;

export const FILECHAIN1_NODE_API_URL = config.filechain1NodeApiUrl;
export const FILECHAIN1_BLOCKCHAIN_RID = config.filechain1RID;

export const FILECHAIN2_NODE_API_URL = config.filechain2NodeApiUrl;
export const FILECHAIN2_BLOCKCHAIN_RID = config.filechain2RID;

export const filehub = new Filehub(FILEHUB_NODE_API_URL, FILEHUB_BLOCKCHAIN_RID);
export const filehubAdministrator = new FilehubAdministrator(filehub, new KeyPair(config.adminPrivateKey));

export const FILEHUB_BLOCKCHAIN = new Postchain(FILEHUB_NODE_API_URL).blockchain(FILEHUB_BLOCKCHAIN_RID);

let initialized: boolean;
export const initFilehub = async () => {
  if (!initialized) {
    initialized = true;
    try {
      await filehubAdministrator.registerFilechain(FILECHAIN1_BLOCKCHAIN_RID, FILECHAIN1_NODE_API_URL);
      await filehubAdministrator.registerFilechain(FILECHAIN2_BLOCKCHAIN_RID, FILECHAIN2_NODE_API_URL);
    } catch (error) {
      logger.info("Error initializing filehub, perhaps it already was initialized");
    }
  } else {
    logger.info("Filehub already initialized");
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
};
