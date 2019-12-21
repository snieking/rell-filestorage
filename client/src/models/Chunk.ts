export interface ChunkHashIndex {
  hash: Buffer;
  idx: number;
}

export class ChunkIndex {

  readonly data: Buffer;
  readonly idx: number;

  public constructor(data: Buffer, idx: number) {
    this.data = data;
    this.idx = idx;
  }

}