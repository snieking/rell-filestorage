import {createFt3User} from "../utils/users";
import {generateRandomString, registerFilechainInFilehub, registerAsset, addBalance} from "../utils/utils";
import {FILEHUB} from "../blockchain/Postchain";
import {User} from "ft3-lib";
import FsFile from "../../client/src/models/FsFile";

describe("Storing files tests", () => {

  let user: User;

  beforeAll(async () => {
    user = await createFt3User();
    await FILEHUB.registerAdmin(user);
    await registerFilechainInFilehub(user);
    await registerAsset(user);
    await addBalance(user, 20);
  });

  it("Store data", async () => {
    const s = generateRandomString(36);
    const data = Buffer.from(s, "utf8");

    await FILEHUB.storeFile(user, new FsFile(s, data));
    const files = await FILEHUB.getUserData(user);
    console.log("Found files: ", files);
    const file = files.find(f => f.path == s);
    expect(bufferToHex(file.data)).toEqual(bufferToHex(data));
  });

  it("Store file", async () => {
    const s = generateRandomString(36);
    const data = Buffer.from(s, "utf8");

    await FILEHUB.storeFile(user, new FsFile(s, data));
    const files = await FILEHUB.getUserData(user);

    const file = files.find(f => f.path == s);
    expect(bufferToHex(file.data)).toEqual(bufferToHex(data));
  });

  it("Store data, insufficient funds", async () => {
    const poorUser = await createFt3User();
    const s = generateRandomString(36);
    const data = Buffer.from(s, "utf8");

    await FILEHUB.storeFile(poorUser, new FsFile(s, data)).catch(error => expect(error).toBeDefined());
    expect.assertions(1);
  });

});

const bufferToHex = (buffer: Buffer) => {
  return buffer.toString("hex").toLocaleUpperCase();
};