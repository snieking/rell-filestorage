import Filehub from "./Filehub";
import AbstractAdministrator from "./AbstractAdministrator";
import {op, User} from "ft3-lib";

export default class FilechainAdministrator extends AbstractAdministrator {

  public constructor(filehub: Filehub) {
    super(filehub);
  }

  public sendCommonFilechainApplication(user: User, brid: string, nodeUrl: string, sourceCodeUrl: string) {
    return this.filehub.executeOperation(user, op(
      "add_filechain_application",
      user.authDescriptor.id,
      brid,
      nodeUrl,
      sourceCodeUrl
    ));
  }

  public disableFilechain(user: User, brid: string): Promise<any> {
    return this.filehub.executeOperation(user, op("disable_filechain", user.authDescriptor.id, brid));
  }

}