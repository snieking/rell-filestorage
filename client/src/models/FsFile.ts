import { hashData } from '../utils/crypto';
import { ChunkIndex } from './Chunk';
import * as fs from 'fs';
import * as util from 'util';

export default class FsFile {
  public static async fromLocalFile(path: string): Promise<FsFile> {
    const readFile = util.promisify(fs.readFile);
    const data = await readFile(path);
    return new FsFile(data);
  }

  public static fromData(data: Buffer) {
    return new FsFile(data);
  }

  public static fromChunks(chunks: ChunkIndex[]) {
    const dataChunks: Buffer[] = chunks
      .sort((a: ChunkIndex, b: ChunkIndex) => a.idx - b.idx)
      .map((c: ChunkIndex) => c.data);

    const data = Buffer.concat(dataChunks);
    return new FsFile(data);
  }

  private static BYTES: number = 100000;

  private static sliceIntoChunks(data: Buffer): Buffer[] {
    const nrOfChunks = Math.ceil(data.length / FsFile.BYTES);

    const chunks: Buffer[] = [];
    for (let i = 0; i < nrOfChunks; i++) {
      chunks.push(data.slice(i * FsFile.BYTES, (i + 1) * FsFile.BYTES));
    }

    return chunks;
  }

  public readonly hash: Buffer;
  public readonly chunks: Buffer[];
  public readonly size: number;
  public readonly data: Buffer;

  private constructor(data: Buffer) {
    this.hash = hashData(data);
    this.data = data;
    this.chunks = FsFile.sliceIntoChunks(data);
    this.size = data.length;
  }

  public getChunk(index: number): Buffer {
    return this.chunks[index];
  }

  public numberOfChunks(): number {
    return Math.ceil(this.size / FsFile.BYTES);
  }
}
