import { readFileSync } from 'fs';
import {ChunkIndex} from "./Chunk";

export default class FsFile {
  private static BYTES: number = 1000000;

  readonly name: string;
  readonly data: Buffer;
  readonly chunks: Buffer[];

  public constructor(name: string, data: Buffer) {
    this.name = name;
    this.data = data;
    this.chunks = FsFile.sliceIntoChunks(data);
  }

  public static fromPath(path: string) {
    return new FsFile(path, readFileSync(path));
  }

  public static fromChunks(name: string, chunks: ChunkIndex[]) {
    const dataChunks: Buffer[] = chunks.sort((a: ChunkIndex, b: ChunkIndex) => a.idx - b.idx).map((c: ChunkIndex) => c.data);
    return new FsFile(name, Buffer.concat(dataChunks));
  }

  private static sliceIntoChunks(data: Buffer): Buffer[] {
    const nrOfChunks = Math.ceil(data.length / FsFile.BYTES);

    const chunks: Buffer[] = [];
    for (let i = 0; i < nrOfChunks; i++) {
      chunks.push(data.slice(i * FsFile.BYTES, (i+1) * FsFile.BYTES));
    }

    return chunks;
  }

}