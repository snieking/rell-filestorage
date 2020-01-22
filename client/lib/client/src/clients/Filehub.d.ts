import { User } from "ft3-lib";
import ChainConnectionInfo from "ft3-lib/dist/lib/ft3/chain-connection-info";
import FsFile from "../models/FsFile";
export default class Filehub {
    private readonly brid;
    private readonly nodeApiUrl;
    private readonly blockchain;
    private readonly chains;
    constructor(nodeApiUrl: string, brid: string, chainConnectionInfo: ChainConnectionInfo[]);
    registerAdmin(ft3User: User): Promise<void>;
    registerFilechain(user: User, brid: string): Promise<any>;
    storeFile(user: User, file: FsFile): Promise<any>;
    storeDataEncrypted(user: User, file: FsFile): Promise<void>;
    getUserData(user: User): Promise<FsFile[]>;
    private allocateChunk;
    private getChunk;
    private getChunks;
    private getFullFile;
    private getFilechain;
}
