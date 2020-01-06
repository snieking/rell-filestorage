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
import {
  COMMON_PLAN,
  SUFFICIENT_BALANCE_FOR_COMMON_VOUCHER
} from "./utils/constants";

jest.setTimeout(120000);

const SUITE_NAME = "Common Migration tests";

/**
 * @group common-migration
 */
describe(SUITE_NAME, () => {

  const MIGRATE_CHAIN = "Migrate chain";

  const filename = "file-to-be-migrated";

  let commonFilechainOwner: User;
  let admin: User;

  beforeAll(async () => {
    logger.info(`[${SUITE_NAME}]: Running beforeAll`);
    await initFilehub();
    commonFilechainOwner = await createFt3User(config.commonFilechainOwnerPrivateKey);
    admin = await adminUser();
    await registerAsset(commonFilechainOwner);
  });

  it(MIGRATE_CHAIN, async () => {
    logger.info(`[${SUITE_NAME}]: Running ${MIGRATE_CHAIN}`);
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE_FOR_COMMON_VOUCHER);
    await FILEHUB.purchaseVoucher(user, COMMON_PLAN);
    await FILEHUB.storeFile(user, FsFile.fromData(filename, Buffer.alloc(6)));

    await addBalance(commonFilechainOwner, 100);
    await FILECHAIN_ADMINISTRATOR.sendCommonFilechainApplication(
      commonFilechainOwner,
      config.commonMigrationFilechainRID,
      config.commonFilechainNodeApiUrl,
      "github.com"
    );

    await FILEHUB_ADMININISTRATOR.approveCommonFilechainApplication(admin, config.commonMigrationFilechainRID);
    await FILECHAIN_ADMINISTRATOR.disableFilechain(commonFilechainOwner, config.commonFilechainRID);

    await FILEHUB_ADMININISTRATOR.migrateFilechain(commonFilechainOwner, config.commonFilechainRID, config.commonMigrationFilechainRID);
    const file = await FILEHUB.getFileByName(user, filename);
    expect(file.readFullData().length).toEqual(6);
  });

});