import {ChainConnectionInfo, FlagsType, KeyPair, SingleSignatureAuthDescriptor, User} from "ft3-lib";
import logger from "./logger";
import Filehub from "../../client/lib/clients/Filehub";
import FilehubAdministrator from "../../client/lib/clients/FilehubAdministrator";
import {IFilechainLocation} from "../../client/lib/models/FilechainLocation";

const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const NODE_URL = process.env.NODE_URL;
const BRID = process.env.FILEHUB_BRID;

console.log("Using admin key: ", ADMIN_PRIVATE_KEY);

const FILEHUB: Filehub = new Filehub(NODE_URL ? NODE_URL : "", BRID ? BRID : "", [
  new ChainConnectionInfo(BRID ? Buffer.from(BRID, "hex") : Buffer.alloc(0), NODE_URL ? NODE_URL : "")
]);
const FILEHUB_ADMIN: FilehubAdministrator = new FilehubAdministrator(FILEHUB);

FILEHUB_ADMIN.listCommunityFilechainLocations()
  .then(locations => locations.every(value => checkFilechainOnline(value)));

const checkFilechainOnline = async (filechainLocation: IFilechainLocation) => {
  const brid = filechainLocation.brid.toString("hex");
  const location = filechainLocation.location;

  logger.info("Checking if %s at %s is online", brid, location);

  const user = createFt3User(ADMIN_PRIVATE_KEY ? ADMIN_PRIVATE_KEY : "");
  const filechain = FILEHUB_ADMIN.getFilechain(filechainLocation);

  return filechain.chunkHashExists("FF")
    .catch(error => {
    if (error != null) {
      logger.warn("Reporting filechain %s at location %s offline due to %O", brid, location, error);
      return FILEHUB_ADMIN.reportFilechainOffline(user, brid);
    }
  }).then(() => FILEHUB_ADMIN.reportFilechainOnline(user, brid).catch());
};

export const createFt3User = (privkey: string): User => {
  const walletKeyPair = new KeyPair(privkey);
  const walletAuthDescriptor = new SingleSignatureAuthDescriptor(walletKeyPair.pubKey, [
    FlagsType.Account,
    FlagsType.Transfer
  ]);

  return new User(walletKeyPair, walletAuthDescriptor);
};