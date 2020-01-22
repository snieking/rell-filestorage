import { ChunkIndex } from "./Chunk";
export default class FsFile {
    static fromPath(name: string): FsFile;
    static fromData(name: string, data: Buffer): FsFile;
    static fromChunks(name: string, chunks: ChunkIndex[]): FsFile;
    private static BYTES;
    private static sliceIntoChunks;
    readonly name: string;
    readonly chunks?: Buffer[];
    readonly size: number;
    private readonly data?;
    private constructor();
    getChunk(index: number): Promise<Buffer>;
    readChunkSync(index: number): Buffer;
    numberOfChunks(): number;
    readFullData(): Buffer;
}
