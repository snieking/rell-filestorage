import Filehub from "./Filehub";
import {op, User} from "ft3-lib";
import AbstractAdministrator from "./AbstractAdministrator";
import {FilechainApplication} from "../models/FilechainApplication";

export default class FilehubAdministrator extends AbstractAdministrator {

  public constructor(filehub: Filehub) {
    super(filehub);
  }

  /**
   * Registers the admin user, this operation is only valid when there are no other admins.
   */
  public registerAdmin(user: User): Promise<void> {
    return this.filehub.executeOperation(user, op("register_admin", user.authDescriptor.id));
  };

  /**
   * Registers a filechain to persist files in.
   *
   * @param user that is an admin of the filehub.
   * @param rid of the filechain.
   */
  public registerFilechain(user: User, rid: string): Promise<any> {
    return this.filehub.executeOperation(user, op("add_chromia_filechain", user.authDescriptor.id, rid));
  };

  public listFilechainApplications(): Promise<FilechainApplication[]> {
    return this.filehub.executeQuery("list_filechain_applications", {});
  }

  public approveCommonFilechainApplication(user: User, brid: string) {
    return this.filehub.executeOperation(user, op("approve_filechain_application", user.authDescriptor.id, brid));
  }

  public rejectCommonFilechainApplication(user: User, brid: string) {
    return this.filehub.executeOperation(user, op("reject_filechain_application", user.authDescriptor.id, brid));
  }

  public handlePayouts(user: User) {
    return this.filehub.executeOperation(user, op("handle_payouts", user.authDescriptor.id));
  }

}