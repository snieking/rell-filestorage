import { FILEHUB, initFilehub } from "../blockchain/Postchain";
import { User } from "ft3-lib";
import { createFt3User } from "./utils/users";
import { addBalance, bufferToHex, generateRandomString, registerAsset } from "./utils/utils";
import { COMMUNITY_PLAN, SUFFICIENT_BALANCE_FOR_COMMUNITY_VOUCHER } from "./utils/constants";
import FsFile from "../../client/lib/models/FsFile";
import * as path from "path";
import * as config from "../blockchain/config";

jest.setTimeout(60000);

/**
 * @group community-ci
 */
describe("Store files in COMMUNITY filechain", () => {
  let user: User;

  beforeAll(async () => {
    await initFilehub();

    user = await createFt3User(config.communityFilechainOwnerPrivateKey);
    await registerAsset(user);
    await addBalance(user, SUFFICIENT_BALANCE_FOR_COMMUNITY_VOUCHER);
    await FILEHUB.purchaseVoucher(user, COMMUNITY_PLAN);
  });

  it("Store simple file", async () => {
    const s = generateRandomString(36);
    const data = Buffer.from(s, "utf8");

    await FILEHUB.storeFile(user, FsFile.fromData(s, data));

    const fileNames = await FILEHUB.getUserFileNames(user);
    const found = fileNames.includes(s);
    expect(found).toBeTruthy();

    const file = await FILEHUB.getFileByName(user, s);
    expect(bufferToHex(file.readFullData())).toEqual(bufferToHex(data));
  });

  it("Store actual file", async () => {
    const filepath = path.resolve("./tests/files/small.txt");
    const file = FsFile.fromPath(filepath);

    await FILEHUB.storeFile(user, file);

    const fileNames = await FILEHUB.getUserFileNames(user);
    const found = fileNames.includes(filepath);
    expect(found).toBeTruthy();

    const readFile = await FILEHUB.getFileByName(user, filepath);
    expect(bufferToHex(readFile.readFullData())).toEqual(bufferToHex(file.readFullData()));
  });
});
