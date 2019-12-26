import {createFt3User} from "../utils/users";
import {FILEHUB} from "../blockchain/Postchain";
import {User} from "ft3-lib";
import {addBalance, generateRandomString, registerAsset, registerFilechainInFilehub} from "../utils/utils";
import FsFile from "../../client/lib/models/FsFile";
import * as path from "path";
import * as fs from "fs";

jest.setTimeout(30000);

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

  it("Create file", async () => {
    const data = generateData(12);
    const file = FsFile.fromData(generateRandomString(36), data);
    expect(file.numberOfChunks()).toEqual(1);
    expect(bufferToHex(file.readFullData())).toEqual(bufferToHex(data));
  });

  it("Store file", async () => {
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
    expect(bufferToHex(file.readFullData())).toEqual(bufferToHex(file.readFullData()));
  });

  it("Store actual file, delete and re-create from blockchain", async () => {
    const srcFile = path.resolve("./tests/files/large.txt");
    const filepath = path.resolve("./tests/files/large-to-be-recreated.txt");
    fs.copyFileSync(srcFile, filepath);

    const file = FsFile.fromPath(filepath);

    await FILEHUB.storeFile(user, file);
    const dataBeforeDelete = file.readFullData();

    fs.unlinkSync(filepath);

    const fileNames = await FILEHUB.getUserFileNames(user);
    const found = fileNames.includes(filepath);
    expect(found).toBeTruthy();

    await FILEHUB.downloadFileByName(user, filepath, undefined);

    const fileAfterDownload = FsFile.fromPath(filepath);
    const dataAfterDownload = fileAfterDownload.readFullData();

    expect(bufferToHex(dataAfterDownload)).toEqual(bufferToHex(dataBeforeDelete));
  });

  it("Store actual file, delete and re-create on new path from blockchain", async () => {
    const user = await createFt3User();
    await addBalance(user, 20);
    await FILEHUB.purchaseVoucher(user);

    const srcPath = path.resolve("./tests/files/small.txt");

    const file = FsFile.fromPath(srcPath);

    await FILEHUB.storeFile(user, file);
    const dataBeforeDelete = file.readFullData();

    const fileNames = await FILEHUB.getUserFileNames(user);
    const found = fileNames.includes(srcPath);
    expect(found).toBeTruthy();

    const filepath = path.resolve("./tests/files/small-on-other-path.txt");
    await FILEHUB.downloadFileByName(user, srcPath, filepath);

    const fileAfterDownload = FsFile.fromPath(srcPath);
    const dataAfterDownload = fileAfterDownload.readFullData();

    expect(bufferToHex(dataAfterDownload)).toEqual(bufferToHex(dataBeforeDelete));
  });

  it("Store actual file, encrypted & delete and re-create from blockchain", async () => {
    const user = await createFt3User();
    await addBalance(user, 20);
    await FILEHUB.purchaseVoucher(user);

    const srcFile = path.resolve("./tests/files/large.txt");
    const filepath = path.resolve("./tests/files/large-to-be-recreated.txt");
    fs.copyFileSync(srcFile, filepath);

    const file = FsFile.fromPath(filepath);

    await FILEHUB.storeFile(user, file, { passphrase: "password" });
    const dataBeforeDelete = file.readFullData();

    fs.unlinkSync(filepath);

    const fileNames = await FILEHUB.getUserFileNames(user);
    const found = fileNames.includes(filepath);
    expect(found).toBeTruthy();

    await FILEHUB.downloadFileByName(user, fileNames[0], undefined, { passphrase: "password" });

    const fileAfterDownload = FsFile.fromPath(filepath);
    const dataAfterDownload = fileAfterDownload.readFullData();

    expect(bufferToHex(dataAfterDownload)).toEqual(bufferToHex(dataBeforeDelete));
  });

  it("Store actual file, large", async () => {
    const filepath = path.resolve("./tests/files/large.txt");
    const file = FsFile.fromPath(filepath);

    await FILEHUB.storeFile(user, file);

    const fileNames = await FILEHUB.getUserFileNames(user);
    const found = fileNames.includes(filepath);
    expect(found).toBeTruthy();

    const readFile = await FILEHUB.getFileByName(user, filepath);
    expect(bufferToHex(file.readFullData())).toEqual(bufferToHex(file.readFullData()));
  });

  it("Store file, encrypted", async () => {
    const user2 = await createFt3User();
    await addBalance(user2, 20);
    await FILEHUB.purchaseVoucher(user2);

    const s = generateRandomString(36);
    const data = Buffer.from(s, "utf8");

    await FILEHUB.storeFile(user2, FsFile.fromData(s, data), { passphrase: "test" });

    const fileNames = await FILEHUB.getUserFileNames(user2);
    const found = fileNames.includes(s);
    expect(found).toBeTruthy();

    const file = await FILEHUB.getFileByName(user2, s, { passphrase: "test" });
    expect(bufferToHex(file.readFullData())).toEqual(bufferToHex(data));
  });

  it("Store file & path, encrypted", async () => {
    const user2 = await createFt3User();
    await addBalance(user2, 20);
    await FILEHUB.purchaseVoucher(user2);

    const s = generateRandomString(36);
    const data = Buffer.from(s, "utf8");

    await FILEHUB.storeFile(user2, FsFile.fromData(s, data), { passphrase: "test", filenameEncrypted: true });

    const fileNames = await FILEHUB.getUserFileNames(user2);
    const found = fileNames.includes(s);
    expect(found).toBeFalsy();

    const file = await FILEHUB.getFileByName(user2, fileNames[0], { passphrase: "test", filenameEncrypted: true });
    expect(bufferToHex(file.readFullData())).toEqual(bufferToHex(data));
    expect(file.name).toEqual(s);
  });

  it("File name below 256 length allowed", async () => {
    const name = generateRandomString(255);
    const data = generateData(36);

    await storeData(name, data, user);
    const fileNames = await FILEHUB.getUserFileNames(user);
    const found = fileNames.includes(name);
    expect(found).toBeTruthy();

    const file = await FILEHUB.getFileByName(user, name);
    expect(bufferToHex(file.readFullData())).toEqual(bufferToHex(data));
  });

  it("File name with 256 length not allowed", async () => {
    await storeGeneratedData(generateRandomString(256), 36, user)
      .catch(error => expect(error).toBeDefined());
    expect.assertions(1);
  });

  it("File name above 256 length not allowed", async () => {
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

  it("Store file, large file split into multiple chunks", async () => {
    const user2 = await createFt3User();
    await addBalance(user2, 20);
    await FILEHUB.purchaseVoucher(user2);

    const name = generateRandomString(36);

    const dataSize = 1024 * 1024 * 2;
    const data = generateData(dataSize);

    await storeData(name, data, user2);

    const allocatedBytes = await FILEHUB.getAllocatedBytes(user2);
    expect(allocatedBytes).toBe(dataSize);

    const file = await FILEHUB.getFileByName(user2, name);
    expect(bufferToHex(file.readFullData())).toEqual(bufferToHex(data));
  });

  it("Store file, by two users", async () => {
    const user2 = await createFt3User();
    await addBalance(user2, 20);
    await FILEHUB.purchaseVoucher(user2);

    const name = generateRandomString(16);
    const data = generateData(1024);

    await storeData(name, data, user);
    await storeData(name, data, user2);

    const user1File = await FILEHUB.getFileByName(user, name);
    const user2File = await FILEHUB.getFileByName(user2, name);

    expect(bufferToHex(user1File.readFullData())).toEqual(bufferToHex(data));
    expect(bufferToHex(user2File.readFullData())).toEqual(bufferToHex(data));
    expect(bufferToHex(user1File.readFullData())).toEqual(bufferToHex(user2File.readFullData()));
  });

});

const storeGeneratedData = (name: string, dataLength: number, user: User) => {
  const data = Buffer.from(generateRandomString(dataLength), "utf8");
  return FILEHUB.storeFile(user, FsFile.fromData(name, data));
};

const generateData = (length: number) => {
  return Buffer.from(generateRandomString(length), "utf8");
};

const storeData = (name: string, data: Buffer, user: User) => {
  return FILEHUB.storeFile(user, FsFile.fromData(name, data));
};

const bufferToHex = (buffer: Buffer) => {
  return buffer.toString("hex").toLocaleUpperCase();
};