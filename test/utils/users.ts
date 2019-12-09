import * as secp256k1 from 'secp256k1'
import * as crypto from 'crypto'

import { FlagsType, KeyPair, SingleSignatureAuthDescriptor, User } from "ft3-lib";

import { FILEHUB_BLOCKCHAIN } from "../blockchain/Postchain";

export const registerAdmin = async (ft3User: User): Promise<void> => {
	const bc = await FILEHUB_BLOCKCHAIN;
	await bc.call(ft3User, "register_admin", ft3User.authDescriptor.hash().toString("hex"));
};

export const createFt3User = async (): Promise<User> => {
	const walletKeyPair = new KeyPair(makeKeyPair().privKey.toString("hex"));
	const walletAuthDescriptor = new SingleSignatureAuthDescriptor(walletKeyPair.pubKey, [
		FlagsType.Account,
		FlagsType.Transfer
	]);

	const walletUser = new User(walletKeyPair, walletAuthDescriptor);

	const bc = await FILEHUB_BLOCKCHAIN;
	await bc.registerAccount(walletAuthDescriptor, walletUser);

	return new Promise<User>(resolve => resolve(walletUser));
};

export function makeKeyPair() {
	let privKey;
	do {
		privKey = crypto.randomBytes(32)
	} while (!secp256k1.privateKeyVerify(privKey));
	const pubKey = secp256k1.publicKeyCreate(privKey);
	return { pubKey, privKey }
}