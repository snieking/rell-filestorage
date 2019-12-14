import {createFt3User, registerAdmin} from "../utils/users";
import {generateRandomString, registerFilechainInFilehub, hashData, registerAsset, addBalance} from "../utils/utils";
import {FILECHAIN_GTX, FILEHUB, FILEHUB_BLOCKCHAIN} from "../blockchain/Postchain";
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

  it("Allocate chunk", async () => {
    await FILEHUB.allocateChunk(user, generateRandomString(36));
  });

  it("Allocate chunk and store data", async () => {
    const data = generateRandomString(36);

    await FILEHUB.allocateChunk(user, data);
    await addChunkData(user, data);
  });

  it("Allocate chunk, store and remove data", async () => {
    const data = generateRandomString(36);

    await FILEHUB.allocateChunk(user, data);
    await addChunkData(user, data);
    await removeChunkData(user, data);
  });

  it("Allocate chunk, store and remove data by hash", async () => {
    const data = generateRandomString(36);
    const hash = hashData(data);

    await FILEHUB.allocateChunk(user, data);
    await addChunkData(user, data);
    await removeChunkDataByHash(user, hash);
  });

  it("Allocate chunk, insufficient funds", async () => {
    const poorUser = await createFt3User();
    const data = generateRandomString(36);
    await FILEHUB.allocateChunk(poorUser, data).catch(error => expect(error).toBeDefined());
    expect.assertions(1);
  });

});

const addChunkData = (user: User, data: string): Promise<any> => {
  const tx = FILECHAIN_GTX.newTransaction([user.keyPair.pubKey]);
  tx.addOperation("add_chunk_data", Buffer.from(data, "utf8"));
  tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
  return tx.postAndWaitConfirmation();
};

const removeChunkData = (user: User, data: string): Promise<any> => {
  const tx = FILECHAIN_GTX.newTransaction([user.keyPair.pubKey]);
  tx.addOperation("remove_chunk_data", Buffer.from(data, "utf8"));
  tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
  return tx.postAndWaitConfirmation();
};

const removeChunkDataByHash = (user: User, hash: Buffer): Promise<any> => {
  const tx = FILECHAIN_GTX.newTransaction([user.keyPair.pubKey]);
  tx.addOperation("remove_chunk_data_by_hash", hash);
  tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
  return tx.postAndWaitConfirmation();
};