import { readFileSync } from 'fs';

export default class FsFile {
  readonly path: string;
  readonly data: Buffer;

  public constructor(path: string, data: Buffer) {
    this.path = path;
    this.data = data;
  }

  public static fromPath(path: string) {
    return new FsFile(path, readFileSync(path));
  }

}