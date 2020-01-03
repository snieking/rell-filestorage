import Filehub from "./Filehub";
import AbstractAdministrator from "./AbstractAdministrator";
import {op, User} from "ft3-lib";

export default class CommonFilechainAdministrator extends AbstractAdministrator {

  public constructor(filehub: Filehub) {
    super(filehub);
  }

  public sendFilechainApplication(user: User, brid: string, nodeUrl: string, sourceCodeUrl: string) {
    return this.filehub.executeOperation(user, op(
      "add_filechain_application",
      user.authDescriptor.id,
      brid,
      nodeUrl,
      sourceCodeUrl
    ));
  }

}