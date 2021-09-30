import { createFt3User } from "./utils/users";
import { filehub, initFilehub } from "../blockchain/Postchain";
import { User } from "ft3-lib";
import { bufferToHex, generateData, generateRandomString } from "./utils/utils";
import { FsFile } from "fs-client";
import * as path from "path";

jest.setTimeout(60000);

/**
 * @group ci
 */
describe("Storing files tests", () => {
  let user: User;

  beforeAll(async () => {
    await initFilehub();

    user = await createFt3User();
  });

  it("Create file", async () => {
    const data = generateData(12);
    const file = FsFile.fromData(data);

    expect(file.numberOfChunks()).toEqual(1);
    expect(bufferToHex(file.data)).toEqual(bufferToHex(data));
  });

  it("Store file", async () => {
    const s = generateRandomString(36);
    const data = Buffer.from(s, "utf8");
    const file = FsFile.fromData(data);

    await filehub.storeFile(user, file);

    const storedFile = await filehub.getFile(file.hash);
    expect(storedFile.data).toEqual(data);
  });

  it("Store actual file", async () => {
    const filepath = path.resolve("./tests/files/small.txt");
    const file = await FsFile.fromLocalFile(filepath);
    console.log("Storing file with hash: ", file.hash.toString("hex"));

    await filehub.storeFile(user, file);

    const storedFile = await filehub.getFile(file.hash);
    expect(storedFile.data).toEqual(file.data);
  });

  it("Store actual file, large", async () => {
    const filepath = path.resolve("./tests/files/large.txt");
    const file = await FsFile.fromLocalFile(filepath);

    await filehub.storeFile(user, file);

    const storedFile = await filehub.getFile(file.hash);
    expect(storedFile.data.length).toEqual(file.data.length);
    expect(bufferToHex(storedFile.data)).toEqual(bufferToHex(file.data));
  });

  it("Store file, large file split into multiple chunks", async () => {
    const dataSize = 1024 * 1024 * 2;
    const data = generateData(dataSize);
    const file = FsFile.fromData(data);

    await filehub.storeFile(user, file);

    const storedFile = await filehub.getFile(file.hash);
    expect(storedFile.numberOfChunks()).toEqual(21);
    expect(storedFile.numberOfChunks()).toEqual(file.numberOfChunks());
  });
});
