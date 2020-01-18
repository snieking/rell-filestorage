import * as config from "./config.js";
import DirectoryService from "../../client/src/clients/DirectoryService";
import {Blockchain} from "ft3-lib";
import Filehub from "fs-client/lib/clients/Filehub";
import ChainConnectionInfo from "ft3-lib/dist/lib/ft3/chain-connection-info";
import {createFt3User} from "../tests/utils/users";
import logger from "../logger";
import FilehubAdministrator from "../../client/lib/clients/FilehubAdministrator";
import FilechainAdministrator from "../../client/lib/clients/FilechainAdministrator";

// Filehub chain
const FILEHUB_NODE_API_URL = config.filehubNodeApiUrl;
export const FILEHUB_BLOCKCHAIN_RID = config.filehubRID;

const FILECHAIN_NODE_API_URL = config.filechainNodeApiUrl;
const FILECHAIN_BLOCKCHAIN_RID = config.filechainRID;

const NEW_FILECHAIN_NODE_API_URL = config.newFilechainNodeApiUrl;
const NEW_FILECHAIN_BLOCKCHAIN_RID = config.newFilechainRID;

export const CHAINS = [
  new ChainConnectionInfo(Buffer.from(FILEHUB_BLOCKCHAIN_RID, "hex"), FILEHUB_NODE_API_URL),
  new ChainConnectionInfo(Buffer.from(FILECHAIN_BLOCKCHAIN_RID, "hex"), FILECHAIN_NODE_API_URL),
  new ChainConnectionInfo(NEW_FILECHAIN_BLOCKCHAIN_RID != undefined
    ? Buffer.from(NEW_FILECHAIN_BLOCKCHAIN_RID, "hex")
    : Buffer.alloc(0), NEW_FILECHAIN_NODE_API_URL)
];

export const FILEHUB = new Filehub(FILEHUB_NODE_API_URL, FILEHUB_BLOCKCHAIN_RID, CHAINS);
export const FILEHUB_ADMININISTRATOR = new FilehubAdministrator(FILEHUB);
export const FILECHAIN_ADMINISTRATOR = new FilechainAdministrator(FILEHUB);

export const FILEHUB_BLOCKCHAIN = Blockchain.initialize(
  Buffer.from(FILEHUB_BLOCKCHAIN_RID, "hex"),
  new DirectoryService(CHAINS)
);

export const adminUser = () => {
  return createFt3User(config.adminPrivateKey);
};

let initialized: boolean;
export const initFilehub = async () => {
  if (!initialized) {
    initialized = true;
    try {
      const admin = await adminUser();
      await FILEHUB_ADMININISTRATOR.registerAdmin(admin);
      await FILEHUB_ADMININISTRATOR.registerFilechain(admin, config.filechainRID);
    } catch (error) {
      logger.info("Error initializing filehub, perhaps it already was initialized");
    }
  } else {
    logger.info("Filehub already initialized");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};