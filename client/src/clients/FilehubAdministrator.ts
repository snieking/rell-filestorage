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
   * Registers a Filechain to persist files in.
   *
   * @param user that is an admin of the filehub.
   * @param rid of the filechain.
   */
  public registerFilechain(user: User, rid: string): Promise<any> {
    return this.filehub.executeOperation(user, op("add_chromia_filechain", user.authDescriptor.id, rid));
  };

  /**
   * Returns a list of active Filechain applications.
   */
  public listFilechainApplications(): Promise<FilechainApplication[]> {
    return this.filehub.executeQuery("list_filechain_applications", {});
  }

  /**
   * Approves a Filechain application.
   */
  public approveCommonFilechainApplication(user: User, brid: string) {
    return this.filehub.executeOperation(user, op("approve_filechain_application", user.authDescriptor.id, brid));
  }

  /**
   * Rejects a Filechain application.
   */
  public rejectCommonFilechainApplication(user: User, brid: string) {
    return this.filehub.executeOperation(user, op("reject_filechain_application", user.authDescriptor.id, brid));
  }

  /**
   * Report a Filechain as offline.
   */
  public reportFilechainOffline(user: User, brid: string) {
    return this.reportFilechain(user, "report_filechain_offline", brid);
  }

  /**
   * Report a Filechain as online.
   */
  public reportFilechainOnline(user: User, brid: string) {
    return this.reportFilechain(user, "report_filechain_online", brid);
  }

  private reportFilechain(user: User, operation: string, brid: string) {
    logger.info("Executing operation: ")
    return this.filehub.executeOperation(user, op(operation, user.authDescriptor.id, brid), true);
  }

}