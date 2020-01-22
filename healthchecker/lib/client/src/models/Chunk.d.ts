export interface IChunkHashIndex {
    hash: Buffer;
    idx: number;
}
export interface IChunkHashFilechain {
    hash: Buffer;
    brid: Buffer;
    location: string;
}
export declare class ChunkIndex {
    readonly data: Buffer;
    readonly idx: number;
    constructor(data: Buffer, idx: number);
}
