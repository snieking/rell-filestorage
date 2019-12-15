import {createFt3User, registerAdmin} from "../utils/users";
import {generateRandomString, registerFilechainInFilehub, registerAsset, addBalance} from "../utils/utils";
import {FILEHUB} from "../blockchain/Postchain";
import {User} from "ft3-lib";

describe("Storing files tests", () => {

  let user: User;

  beforeAll(async () => {
    user = await createFt3User();
    await registerAdmin(user);
    await registerFilechainInFilehub(user);
    await registerAsset(user);
    await addBalance(user, 20);
  });

  it("Store file", async () => {
    const s = generateRandomString(36);
    const data = Buffer.from(s, "utf8");

    await FILEHUB.storeFile(user, s, data);
    const files = await FILEHUB.getMyFiles(user);
    expect(files.map(data => bufferToHex(data)).includes(bufferToHex(data))).toBeTruthy();
  });

  it("Store file, insufficient funds", async () => {
    const poorUser = await createFt3User();
    const s = generateRandomString(36);
    const data = Buffer.from(s, "utf8");

    await FILEHUB.storeFile(poorUser, s, data).catch(error => expect(error).toBeDefined());
    expect.assertions(1);
  });

});

const bufferToHex = (buffer: Buffer) => {
  return buffer.toString("hex").toLocaleUpperCase();
};