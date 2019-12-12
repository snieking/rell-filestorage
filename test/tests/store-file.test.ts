import {createFt3User, registerAdmin} from "../utils/users";
import {generateRandomString, registerFilechainInFilehub, hashData} from "../utils/utils";
import {FILECHAIN_GTX, FILEHUB_BLOCKCHAIN} from "../blockchain/Postchain";
import {User} from "ft3-lib";

describe("Storing files tests", () => {

  let user: User;

  beforeAll(async () => {
    user = await createFt3User();
    await registerAdmin(user);
    await registerFilechainInFilehub(user);
  });

  it("Allocate chunk", async () => {
    expect(await allocateChunk(user, generateRandomString(36)));
  });

  it("Allocate chunk and store data", async () => {
    const data = generateRandomString(36);

    expect(await allocateChunk(user, data)).toReturn;
    expect(await addChunkData(user, data)).toReturn;
  });

  it("Allocate chunk, store and remove data", async () => {
    const data = generateRandomString(36);

    expect(await allocateChunk(user, data)).toReturn;
    expect(await addChunkData(user, data)).toReturn;
    expect(await removeChunkData(user, data)).toReturn;
  });

  it("Allocate chunk, store and remove data by hash", async () => {
    const data = generateRandomString(36);
    const hash = hashData(data);

    expect(await allocateChunk(user, data)).toReturn;
    expect(await addChunkData(user, data)).toReturn;
    expect(await removeChunkDataByHash(user, hash)).toReturn;
  });

});

export const allocateChunk = async (user: User, data: string): Promise<any> => {
  const hash = hashData(data);

  const bc = await FILEHUB_BLOCKCHAIN;
  return bc.call(
    user,
    "allocate_chunk",
    user.authDescriptor.hash().toString("hex"),
    hash,
    user.keyPair.pubKey
  );
};

export const addChunkData = (user: User, data: string): Promise<any> => {
  const tx = FILECHAIN_GTX.newTransaction([user.keyPair.pubKey]);
  tx.addOperation("add_chunk_data", Buffer.from(data));
  tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
  return tx.postAndWaitConfirmation();
};

export const removeChunkData = (user: User, data: string): Promise<any> => {
  const tx = FILECHAIN_GTX.newTransaction([user.keyPair.pubKey]);
  tx.addOperation("remove_chunk_data", Buffer.from(data));
  tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
  return tx.postAndWaitConfirmation();
};

export const removeChunkDataByHash = (user: User, hash: Buffer): Promise<any> => {
  const tx = FILECHAIN_GTX.newTransaction([user.keyPair.pubKey]);
  tx.addOperation("remove_chunk_data_by_hash", hash);
  tx.sign(user.keyPair.privKey, user.keyPair.pubKey);
  return tx.postAndWaitConfirmation();
};