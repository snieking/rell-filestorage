import { IChunkHashFilechain } from "../models/Chunk";
import { IFileTimestamp } from "../models/FileTimestamp";
import Filehub from "./Filehub";
export default class AbstractAdministrator {
    protected static PAGE_SIZE: number;
    protected readonly filehub: Filehub;
    protected constructor(filehub: Filehub);
    /**
     * Retrieves allocated number of megabytes in filechain.
     */
    getAllocatedMbInFilechain(brid: string): Promise<number>;
    /**
     * Retrieves paid-for allocated number of megabytes in filechain.
     */
    getPaidAllocatedMbInFilechain(brid: string): Promise<number>;
    protected getFileTimestamps(brid: string, storedAt: number): Promise<IFileTimestamp[]>;
    protected getMigratableChunkHashesByName(brid: string, filetimestamp: IFileTimestamp): Promise<IChunkHashFilechain[]>;
}
