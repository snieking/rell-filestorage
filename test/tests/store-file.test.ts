import {createFt3User} from "../utils/users";
import {FILEHUB} from "../blockchain/Postchain";
import {User} from "ft3-lib";
import {addBalance, generateRandomString, registerAsset, registerFilechainInFilehub} from "../utils/utils";
import FsFile from "../../client/lib/models/FsFile";

jest.setTimeout(60000);

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
    const data = generateData(36);

    await storeData(name, data, user);

    const fileNames = await FILEHUB.getUserFileNames(user);
    const found = fileNames.includes(name);
    expect(found).toBeTruthy();

    const file = await FILEHUB.getFileByName(user, name);
    expect(bufferToHex(file.data)).toEqual(bufferToHex(data));
  });

  it("Store file", async () => {
    const s = generateRandomString(36);
    const data = Buffer.from(s, "utf8");

    await FILEHUB.storeFile(user, new FsFile(s, data));

    const fileNames = await FILEHUB.getUserFileNames(user);
    const found = fileNames.includes(s);
    expect(found).toBeTruthy();

    const file = await FILEHUB.getFileByName(user, s);
    expect(bufferToHex(file.data)).toEqual(bufferToHex(data));
  });

  it("File name below 256 length allowewd", async () => {
    const name = generateRandomString(255);
    const data = generateData(36);

    await storeData(name, data, user);
    const fileNames = await FILEHUB.getUserFileNames(user);
    const found = fileNames.includes(name);
    expect(found).toBeTruthy();

    const file = await FILEHUB.getFileByName(user, name);
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

  it("Store file, correct amount of allocated bytes", async () => {
    const user2 = await createFt3User();
    await addBalance(user2, 20);
    await FILEHUB.purchaseVoucher(user2);

    const dataSize = 1000;
    await storeGeneratedData(generateRandomString(36), dataSize, user2);
    const allocatedBytes = await FILEHUB.getAllocatedBytes(user2);

    expect(allocatedBytes).toBe(dataSize);
  });

  // it("Store file, large file split into multiple chunks", async () => {
  //   const user2 = await createFt3User();
  //   await addBalance(user2, 20);
  //   await FILEHUB.purchaseVoucher(user2);
  //
  //   const name = generateRandomString(36);
  //
  //   const dataSize = 1024 * 1024 * 2;
  //   const data = generateData(dataSize);
  //
  //   await storeData(name, data, user2);
  //
  //   const allocatedBytes = await FILEHUB.getAllocatedBytes(user2);
  //   expect(allocatedBytes).toBe(dataSize);
  //
  //   const file = await FILEHUB.getFileByName(user2, name);
  //   expect(bufferToHex(file.data)).toEqual(bufferToHex(data));
  // });

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