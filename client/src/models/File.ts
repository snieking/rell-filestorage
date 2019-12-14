export default class File {
  readonly name: string;
  readonly data: Buffer;

  public constructor(name: string, data: Buffer) {
    this.name = name;
    this.data = data;
  }
}