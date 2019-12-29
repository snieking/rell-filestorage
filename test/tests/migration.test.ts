import {adminUser, FILEHUB, FILEHUB_ADMININISTRATOR, initFilehub} from "../blockchain/Postchain";
import {createFt3User} from "./utils/users";
import * as config from "../blockchain/config";
import FsFile from "../../client/lib/models/FsFile";
import {addBalance, registerAsset} from "./utils/utils";
import {User} from "ft3-lib";
import logger from "../logger";

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
    await addBalance(user, 20);
    await FILEHUB.purchaseVoucher(user);
    await FILEHUB.storeFile(user, FsFile.fromData(filename, Buffer.alloc(6)));

    await FILEHUB_ADMININISTRATOR.migrateFilechain(admin, config.filechainRID, config.newFilechainRID);
    const file = await FILEHUB.getFileByName(user, filename);
    expect(file.readFullData().length).toEqual(6);
  });

});