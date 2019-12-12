import {FILEHUB_BLOCKCHAIN} from "../blockchain/Postchain";
import User from "ft3-lib/dist/lib/ft3/user";
import * as config from "../blockchain/config.js";
import * as crypto from "crypto";

export const registerFilechainInFilehub = async (user: User) => {
  const bc = await FILEHUB_BLOCKCHAIN;
  return bc.call(
    user,
    "add_blockchain",
    user.authDescriptor.hash().toString("hex"),
    config.filechainRID
  );
};

export const generateRandomString = (length: number) => {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

export const hashData = (data: string): Buffer => {
  return crypto.createHash("sha256")
    .update(data, "utf8")
    .digest();
};