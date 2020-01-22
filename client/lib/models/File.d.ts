export default class File {
    readonly path: string;
    readonly data: Buffer;
    constructor(path: string, data: Buffer);
    static fromPath(path: string): File;
}
