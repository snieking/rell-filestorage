import * as secp256k1 from 'secp256k1'
import * as crypto from 'crypto'

import { FlagsType, KeyPair, SingleSignatureAuthDescriptor, User } from "ft3-lib";

import { FILEHUB_BLOCKCHAIN } from "../blockchain/Postchain";

export const loginUser = async (): Promise<User> => {
	const walletKeyPair = new KeyPair(makeKeyPair().privKey.toString("hex"));
  	const walletAuthDescriptor = new SingleSignatureAuthDescriptor(walletKeyPair.pubKey, [
    	FlagsType.Account,
    	FlagsType.Transfer
  	]);
  	const walletUser = new User(walletKeyPair, walletAuthDescriptor);

  	const userKeyPair = new KeyPair(makeKeyPair().privKey.toString("hex"));

  	const authDescriptor = new SingleSignatureAuthDescriptor(userKeyPair.pubKey, [
    	FlagsType.Account,
    	FlagsType.Transfer
  	]);

  	const bc = await FILEHUB_BLOCKCHAIN;
  	const account = await bc.registerAccount(walletAuthDescriptor, walletUser);

  	const ft3User = new User(userKeyPair, authDescriptor);
		return new Promise<User>(resolve => resolve(ft3User));
};

export function makeKeyPair() {
	let privKey;
	do {
		privKey = crypto.randomBytes(32)
	} while (!secp256k1.privateKeyVerify(privKey));
	const pubKey = secp256k1.publicKeyCreate(privKey);
	return { pubKey, privKey }
}