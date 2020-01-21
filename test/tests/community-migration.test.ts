import {
  adminUser,
  FILECHAIN_ADMINISTRATOR,
  FILEHUB,
  FILEHUB_ADMININISTRATOR,
  initFilehub
} from "../blockchain/Postchain";
import { createFt3User } from "./utils/users";
import * as config from "../blockchain/config";
import FsFile from "../../client/lib/models/FsFile";
import { addBalance, registerAsset } from "./utils/utils";
import { User } from "ft3-lib";
import logger from "../logger";
import { COMMUNITY_PLAN, SUFFICIENT_BALANCE_FOR_COMMUNITY_VOUCHER } from "./utils/constants";

jest.setTimeout(120000);

const SUITE_NAME = "COMMUNITY Migration tests";

/**
 * @group community-migration
 */
describe(SUITE_NAME, () => {
  const MIGRATE_CHAIN = "Migrate chain";

  const filename = "file-to-be-migrated";

  let communityFilechainOwner: User;
  let admin: User;

  beforeAll(async () => {
    logger.info(`[${SUITE_NAME}]: Running beforeAll`);
    await initFilehub();
    communityFilechainOwner = await createFt3User(config.communityFilechainOwnerPrivateKey);
    admin = await adminUser();
    await registerAsset(communityFilechainOwner);

    await addBalance(communityFilechainOwner, 100);
    try {
      await FILECHAIN_ADMINISTRATOR.sendCommunityFilechainApplication(
        communityFilechainOwner,
        config.communityFilechainRID,
        config.communityFilechainNodeApiUrl,
        "github.com"
      );

      await FILEHUB_ADMININISTRATOR.approveCommunityFilechainApplication(admin, config.communityFilechainRID);
    } catch (error) {
      logger.info("Error caught, perhaps filechain already was added?");
    }
  });

  it(MIGRATE_CHAIN, async () => {
    logger.info(`[${SUITE_NAME}]: Running ${MIGRATE_CHAIN}`);
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE_FOR_COMMUNITY_VOUCHER);
    await FILEHUB.purchaseVoucher(user, COMMUNITY_PLAN);
    await FILEHUB.storeFile(user, FsFile.fromData(filename, Buffer.alloc(6)));

    await addBalance(communityFilechainOwner, 100);

    await FILECHAIN_ADMINISTRATOR.sendCommunityFilechainApplication(
      communityFilechainOwner,
      config.communityMigrationFilechainRID,
      config.communityMigrationFilechainNodeApiUrl,
      "github.com"
    );

    await FILEHUB_ADMININISTRATOR.approveCommunityFilechainApplication(admin, config.communityMigrationFilechainRID);
    await FILECHAIN_ADMINISTRATOR.disableFilechain(communityFilechainOwner, config.communityFilechainRID);

    await FILECHAIN_ADMINISTRATOR.migrateFilechain(communityFilechainOwner, config.communityFilechainRID);
    const file = await FILEHUB.getFileByName(user, filename);
    expect(file.readFullData().length).toEqual(6);
  });
});
