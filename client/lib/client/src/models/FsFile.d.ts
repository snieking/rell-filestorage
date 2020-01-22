export default class FsFile {
    readonly path: string;
    readonly data: Buffer;
    constructor(path: string, data: Buffer);
    static fromPath(path: string): FsFile;
}
