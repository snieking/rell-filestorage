import {
  adminUser,
  FILECHAIN_ADMINISTRATOR,
  FILEHUB,
  FILEHUB_ADMININISTRATOR,
  initFilehub
} from "../blockchain/Postchain";
import {createFt3User} from "./utils/users";
import * as config from "../blockchain/config";
import FsFile from "../../client/lib/models/FsFile";
import {addBalance, registerAsset} from "./utils/utils";
import {User} from "ft3-lib";
import logger from "../logger";
import {CHROMIA_PLAN, SUFFICIENT_BALANCE_FOR_CHROMIA_VOUCHER} from "./utils/constants";

jest.setTimeout(120000);

const SUITE_NAME = "Migration tests";

/**
 * @group migration
 */
describe(SUITE_NAME, () => {

  const MIGRATE_CHAIN = "Migrate chain";

  const filename = "file-to-be-migrated";

  let admin: User;

  beforeAll(async () => {
    logger.info(`[${SUITE_NAME}]: Running beforeAll`);
    await initFilehub();
    admin = await adminUser();
    await registerAsset(admin);
  });

  it(MIGRATE_CHAIN, async () => {
    logger.info(`[${SUITE_NAME}]: Running ${MIGRATE_CHAIN}`);
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE_FOR_CHROMIA_VOUCHER);
    await FILEHUB.purchaseVoucher(user, CHROMIA_PLAN);
    await FILEHUB.storeFile(user, FsFile.fromData(filename, Buffer.alloc(6)));

    logger.info("Registering filechain %s", config.newFilechainRID);
    await FILEHUB_ADMININISTRATOR.registerFilechain(user, config.newFilechainRID);

    logger.info("Disabling filechain %s", config.filechainRID);
    await FILECHAIN_ADMINISTRATOR.disableFilechain(user, config.filechainRID);

    await FILEHUB_ADMININISTRATOR.migrateFilechain(admin, config.filechainRID, config.newFilechainRID);
    const file = await FILEHUB.getFileByName(user, filename);
    expect(file.readFullData().length).toEqual(6);
  });

});