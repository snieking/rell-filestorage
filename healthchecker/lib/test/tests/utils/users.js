"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const secp256k1 = require("secp256k1");
const crypto = require("crypto");
const ft3_lib_1 = require("ft3-lib");
const Postchain_1 = require("../../blockchain/Postchain");
exports.createFt3User = (privkey) => __awaiter(void 0, void 0, void 0, function* () {
    const walletKeyPair = new ft3_lib_1.KeyPair(privkey ? privkey : makeKeyPair().privKey.toString("hex"));
    const walletAuthDescriptor = new ft3_lib_1.SingleSignatureAuthDescriptor(walletKeyPair.pubKey, [
        ft3_lib_1.FlagsType.Account,
        ft3_lib_1.FlagsType.Transfer
    ]);
    const walletUser = new ft3_lib_1.User(walletKeyPair, walletAuthDescriptor);
    try {
        const bc = yield Postchain_1.FILEHUB_BLOCKCHAIN;
        yield bc.registerAccount(walletAuthDescriptor, walletUser);
    }
    catch (error) {
        console.log("User already registered");
    }
    return new Promise(resolve => resolve(walletUser));
});
function makeKeyPair() {
    let privKey;
    do {
        privKey = crypto.randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privKey));
    const pubKey = secp256k1.publicKeyCreate(privKey);
    return { pubKey, privKey };
}
exports.makeKeyPair = makeKeyPair;
