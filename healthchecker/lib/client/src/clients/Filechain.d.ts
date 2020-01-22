import { User } from "ft3-lib";
export default class Filechain {
    private readonly restClient;
    private readonly gtxClient;
    private readonly brid;
    constructor(nodeApiUrl: string, brid: string);
    storeChunkData(user: User, data: Buffer): Promise<any>;
    chunkHashExists(hash: string): Promise<boolean>;
    getChunkDataByHash(hash: string): Promise<string>;
}
