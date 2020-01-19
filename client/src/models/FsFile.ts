import {ChunkIndex} from "./Chunk";
import readChunk from "read-chunk";
import * as fs from "fs";

export default class FsFile {
  private static BYTES: number = 100000;

  public readonly name: string;
  public readonly chunks?: Buffer[];
  public readonly size: number;

  private readonly data?: Buffer;

  private constructor(name: string, data?: Buffer) {
    this.name = name;

    if (data != null) {
      this.data = data;
      this.chunks = FsFile.sliceIntoChunks(data);
      this.size = data.length;
    } else {
      const stats = fs.statSync(name);
      this.size = stats.size;
    }
  }

  public getChunk(index: number): Promise<Buffer> {
    if (this.data != null) {
      return new Promise<Buffer>((resolve, error) => this.chunks != null
        ? resolve(this.chunks[index])
        : error("Chunks undefined"));
    } else {
      return readChunk(this.name, index * FsFile.BYTES, FsFile.BYTES);
    }
  }

  public readChunkSync(index: number): Buffer {
    if (this.chunks != null) {
      return this.chunks[index];
    } else {
      return readChunk.sync(this.name, index * FsFile.BYTES, FsFile.BYTES);
    }
  }

  public numberOfChunks(): number {
    return Math.ceil(this.size / FsFile.BYTES);
  }

  public readFullData(): Buffer {
    const dataChunks: Buffer[] = [];
    for (let i = 0; i < this.numberOfChunks(); i++) {
      dataChunks.push(this.readChunkSync(i));
    }

    return Buffer.concat(dataChunks);
  }

  public static fromPath(name: string) {
    return new FsFile(name, undefined);
  }

  public static fromData(name: string, data: Buffer) {
    return new FsFile(name, data);
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