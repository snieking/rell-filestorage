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
    await FILEHUB.purchaseVoucher(user);
  });

  it("Store data", async () => {
    const name = generateRandomString(36);
    const data = generateData(36)

    await storeData(name, data, user);
    const files = await FILEHUB.getUserFiles(user);
    const file = files.find(f => f.name == name);
    expect(bufferToHex(file.data)).toEqual(bufferToHex(data));
  });

  it("Store file", async () => {
    const s = generateRandomString(36);
    const data = Buffer.from(s, "utf8");

    await FILEHUB.storeFile(user, new FsFile(s, data));
    const files = await FILEHUB.getUserFiles(user);

    const file = files.find(f => f.name == s);
    expect(bufferToHex(file.data)).toEqual(bufferToHex(data));
  });

  it("File name below 256 length allowewd", async () => {
    const name = generateRandomString(255);
    const data = generateData(36);

    await storeData(name, data, user);
    const files = await FILEHUB.getUserFiles(user);

    const file = files.find(f => f.name == name);
    expect(bufferToHex(file.data)).toEqual(bufferToHex(data));
  });

  it("File name with 256 length not allowewd", async () => {
    await storeGeneratedData(generateRandomString(256), 36, user)
      .catch(error => expect(error).toBeDefined());
    expect.assertions(1);
  });

  it("File name above 256 length not allowewd", async () => {
    await storeGeneratedData(generateRandomString(257), 36, user)
      .catch(error => expect(error).toBeDefined());
    expect.assertions(1);
  });

  it("Store data, no voucher", async () => {
    const userWithoutVoucher = await createFt3User();
    await storeGeneratedData(generateRandomString(36), 36, userWithoutVoucher)
      .catch(error => expect(error).toBeDefined());
    expect.assertions(1);
  });

  afterAll(async () => {
    const vouchers = await FILEHUB.getVouchers(user);
    expect(vouchers.length).toEqual(1);
  });

});

const storeGeneratedData = (name: string, dataLength: number, user: User) => {
  const data = Buffer.from(generateRandomString(dataLength), "utf8");
  return FILEHUB.storeFile(user, new FsFile(name, data));
};

const generateData = (length: number) => {
  return Buffer.from(generateRandomString(length), "utf8");
};

const storeData = (name: string, data: Buffer, user: User) => {
  return FILEHUB.storeFile(user, new FsFile(name, data));
};

const bufferToHex = (buffer: Buffer) => {
  return buffer.toString("hex").toLocaleUpperCase();
};