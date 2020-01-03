import Filehub from "./Filehub";
import ChainConnectionInfo from "ft3-lib/dist/lib/ft3/chain-connection-info";
import AbstractAdministrator from "./AbstractAdministrator";
import {op, User} from "ft3-lib";

export default class CommonFilechainAdministrator extends AbstractAdministrator {

  public constructor(filehubNodeApiUrl: string, filehubBrid: string, chainConnectionInfo: ChainConnectionInfo[]) {
    super(new Filehub(filehubNodeApiUrl, filehubBrid, chainConnectionInfo));
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