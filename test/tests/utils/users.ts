import * as secp256k1 from 'secp256k1'
import * as crypto from 'crypto'

import { FlagsType, KeyPair, SingleSignatureAuthDescriptor, User } from "ft3-lib";

import { FILEHUB_BLOCKCHAIN } from "../../blockchain/Postchain";

export const createFt3User = async (privkey?: string): Promise<User> => {
	const walletKeyPair = new KeyPair(privkey ? privkey : makeKeyPair().privKey.toString("hex"));
	const walletAuthDescriptor = new SingleSignatureAuthDescriptor(walletKeyPair.pubKey, [
		FlagsType.Account,
		FlagsType.Transfer
	]);

	const walletUser = new User(walletKeyPair, walletAuthDescriptor);

	try {
		const bc = await FILEHUB_BLOCKCHAIN;
		await bc.registerAccount(walletAuthDescriptor, walletUser);
	} catch (error) {
		console.log("User already registered");
	}

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