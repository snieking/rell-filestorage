import {FILEHUB, FILEHUB_BLOCKCHAIN, FILEHUB_BLOCKCHAIN_RID} from "../../blockchain/Postchain";
import {Asset} from "../../domain/Asset";
import Operation from "ft3-lib/dist/lib/ft3/operation";
import {User} from "ft3-lib";
import FsFile from "../../../client/lib/models/FsFile";

const TOKEN_NAME = "CHR";

let assetId: Buffer = null;

export const registerAsset = async (user: User) => {
  if (assetId == null) {
    const bc = await FILEHUB_BLOCKCHAIN;
    const issueingChain: Buffer = Buffer.from(FILEHUB_BLOCKCHAIN_RID, "hex");

    const operation = new Operation("ft3.dev_register_asset", TOKEN_NAME, issueingChain, issueingChain);
    await bc.call(operation, user)
      .catch(() => console.info("Asset already registered"))
      .then(() => cacheAssetId());
  }
};

export const cacheAssetId = async () => {
  const bc = await FILEHUB_BLOCKCHAIN;
  await bc.query("ft3.get_asset_by_name", {name: TOKEN_NAME})
    .then((assets: Asset[]) => assetId = assets[0].id);
};

export const addBalance = async (user: User, balance: number) => {
  const bc = await FILEHUB_BLOCKCHAIN;
  const accounts = await bc.getAccountsByAuthDescriptorId(user.authDescriptor.hash(), user);

  const operation = new Operation("ft3.dev_give_balance", assetId, accounts[0].id_, balance);
  return bc.transactionBuilder().add(operation).add(new Operation("nop", Date.now())).buildAndSign(user).post();
};

export const generateRandomString = (length: number) => {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

export const storeGeneratedData = (name: string, dataLength: number, user: User) => {
  const data = Buffer.from(generateRandomString(dataLength), "utf8");
  return FILEHUB.storeFile(user, FsFile.fromData(name, data));
};

export const generateData = (length: number) => {
  return Buffer.from(generateRandomString(length), "utf8");
};

export const storeData = (name: string, data: Buffer, user: User) => {
  return FILEHUB.storeFile(user, FsFile.fromData(name, data));
};

export const bufferToHex = (buffer: Buffer) => {
  return buffer.toString("hex").toLocaleUpperCase();
};