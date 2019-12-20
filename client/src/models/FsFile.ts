import { readFileSync } from 'fs';

export default class FsFile {
  readonly name: string;
  readonly data: Buffer;

  public constructor(name: string, data: Buffer) {
    this.name = name;
    this.data = data;
  }

  public static fromPath(path: string) {
    return new FsFile(path, readFileSync(path));
  }

}