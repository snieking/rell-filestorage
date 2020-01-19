export interface IChunkHashIndex {
  hash: Buffer;
  idx: number;
}

export interface IChunkHashFilechain {
  hash: Buffer;
  brid: Buffer;
  location: string;
}

export class ChunkIndex {

  public readonly data: Buffer;
  public readonly idx: number;

  public constructor(data: Buffer, idx: number) {
    this.data = data;
    this.idx = idx;
  }

}