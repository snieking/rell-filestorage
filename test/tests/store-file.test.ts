import {createFt3User, registerAdmin} from "../utils/users";
import {generateRandomString, registerFilechainInFilehub} from "../utils/utils";
import {FILEHUB_BLOCKCHAIN} from "../blockchain/Postchain";
import * as secp256k1 from 'secp256k1'
import * as crypto from 'crypto'
import {User} from "ft3-lib";

describe("Storing files tests", () => {

  let user: User;

  beforeAll(async () => {
    user = await createFt3User();
    await registerAdmin(user);
    await registerFilechainInFilehub(user);
  });

  it("Allocate chunk", async () => {
    const hash = crypto.createHash("sha256")
      .update(generateRandomString(36), "utf8")
      .digest();

    const bc = await FILEHUB_BLOCKCHAIN;
    await bc.call(
      user,
      "allocate_chunk",
      user.authDescriptor.hash().toString("hex"),
      hash,
      user.keyPair.pubKey
    );
  });

});