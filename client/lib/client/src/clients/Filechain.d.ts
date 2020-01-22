import { User } from "ft3-lib";
export default class Filechain {
    private readonly restClient;
    private readonly gtxClient;
    constructor(nodeApiUrl: string, brid: string);
    storeChunkData(user: User, data: Buffer): Promise<any>;
    removeChunkData(user: User, data: string): Promise<any>;
    removeChunkDataByHash(user: User, hash: Buffer): Promise<any>;
    getFileByHash(user: User, hash: Buffer): Promise<Buffer>;
}
