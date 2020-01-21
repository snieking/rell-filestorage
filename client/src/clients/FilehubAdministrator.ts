import {op, User} from "ft3-lib";
import {IFilechainApplication} from "../models/FilechainApplication";
import AbstractAdministrator from "./AbstractAdministrator";
import Filehub from "./Filehub";
import {IFilechainLocation} from "../models/FilechainLocation";
import Filechain from "./Filechain";

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
   * List community filechain locations.
   */
  public listCommunityFilechainLocations(): Promise<Array<IFilechainLocation>> {
    return this.filehub.executeQuery("list_community_filechain_locations", {});
  }

  /**
   * Gets a Filechain from a filechain location.
   */
  public getFilechain(filechainLocation: IFilechainLocation): Filechain {
    return this.filehub.initFilechainClient(filechainLocation);
  }

  /**
   * Returns a list of active Filechain applications.
   */
  public listFilechainApplications(): Promise<IFilechainApplication[]> {
    return this.filehub.executeQuery("list_filechain_applications", {});
  }

  /**
   * Approves a Filechain application.
   */
  public approveCommunityFilechainApplication(user: User, brid: string) {
    return this.filehub.executeOperation(user, op("approve_filechain_application", user.authDescriptor.id, brid));
  }

  /**
   * Rejects a Filechain application.
   */
  public rejectCommunityFilechainApplication(user: User, brid: string) {
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
    return this.filehub.executeOperation(user, op(operation, user.authDescriptor.id, brid), true);
  }

}