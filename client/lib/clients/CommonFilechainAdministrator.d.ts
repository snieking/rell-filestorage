import Filehub from "./Filehub";
import AbstractAdministrator from "./AbstractAdministrator";
import { User } from "ft3-lib";
export default class CommonFilechainAdministrator extends AbstractAdministrator {
    constructor(filehub: Filehub);
    sendFilechainApplication(user: User, brid: string, nodeUrl: string, sourceCodeUrl: string): Promise<void>;
}
