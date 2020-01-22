import { User } from "ft3-lib";
export declare const createFt3User: (privkey?: string | undefined) => Promise<User>;
export declare function makeKeyPair(): {
    pubKey: Buffer;
    privKey: Buffer;
};
