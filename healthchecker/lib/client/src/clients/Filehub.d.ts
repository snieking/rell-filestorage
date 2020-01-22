import { ChainConnectionInfo, Operation, User } from "ft3-lib";
import { IVoucher } from "..";
import { IChunkHashFilechain } from "../models/Chunk";
import { IFilechainLocation } from "../models/FilechainLocation";
import { IFileStoringOptions } from "../models/FileStoringOptions";
import FsFile from "../models/FsFile";
import Filechain from "./Filechain";
export default class Filehub {
    private static encrypt;
    private static decrypt;
    private static getChunkDataByHash;
    private static bufferArray;
    private readonly brid;
    private readonly nodeApiUrl;
    private readonly blockchain;
    private readonly chains;
    constructor(nodeApiUrl: string, brid: string, chainConnectionInfo: ChainConnectionInfo[]);
    /**
     * Executes a operation towards the Filehub.
     *
     * @param user to sign the operation.
     * @param operation to perform.
     */
    executeOperation(user: User, operation: Operation, addNop?: boolean): Promise<void>;
    /**
     * Queries the Filehub for data.
     *
     * @param query the identifier of the query.
     * @param data to provide in the query.
     */
    executeQuery(query: string, data: unknown): Promise<any>;
    /**
     * Purchases a new voucher if possible.
     * It is only possible to buy a new voucher when there is less than a day left on your current one.
     */
    purchaseVoucher(user: User, plan: string): Promise<any>;
    /**
     * Stores a file. Contacts the Filehub and allocates a chunk, and then persists the data in the correct filechain.
     *
     * @param passphrase optional options for storing the file.
     */
    storeFile(user: User, file: FsFile, options?: IFileStoringOptions): Promise<any>;
    /**
     * Marks a file for removal, the chunks of the file are removed at the next Filechain migration.
     */
    removeFile(user: User, name: string, options?: IFileStoringOptions): Promise<any>;
    /**
     * Get file names stored by a user.
     */
    getUserFileNames(user: User): Promise<string[]>;
    /**
     * Retrieves a file by its name.
     *
     * @param passphrase optional options for retrieving file.
     */
    getFileByName(user: User, name: string, options?: IFileStoringOptions): Promise<FsFile>;
    /**
     * Downloads a file by its name to the specified path (if provided),
     * else it will just use the filename and the current path.
     */
    downloadFileByName(user: User, name: string, path?: string, options?: IFileStoringOptions): Promise<void>;
    /**
     * Retrieves all the vouchers for the specific user.
     */
    getVouchers(user: User): Promise<IVoucher[]>;
    /**
     * Checks if the user has an active voucher.
     */
    hasActiveVoucher(user: User, plan: string): Promise<boolean>;
    /**
     * Returns how many bytes the user has allocated.
     */
    getAllocatedBytes(user: User): Promise<number>;
    /**
     * Returns the balance of the user.
     */
    getBalance(user: User): Promise<number>;
    /**
     * Store chunk in the provided BRID.
     */
    copyChunkDataToOtherBrid(user: User, chunkHash: IChunkHashFilechain): Promise<any>;
    initFilechainClient(filechainLocation: IFilechainLocation): Filechain;
    private storeChunks;
    private storeChunk;
    private persistChunkDataInFilechain;
    private getFileLocation;
    private getChunk;
    private allocateChunk;
}
