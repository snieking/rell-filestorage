import { User } from "ft3-lib";
import { IFilechainApplication } from "../models/FilechainApplication";
import AbstractAdministrator from "./AbstractAdministrator";
import Filehub from "./Filehub";
import { IFilechainLocation } from "../models/FilechainLocation";
import Filechain from "./Filechain";
export default class FilehubAdministrator extends AbstractAdministrator {
    constructor(filehub: Filehub);
    /**
     * Registers the admin user, this operation is only valid when there are no other admins.
     */
    registerAdmin(user: User): Promise<void>;
    /**
     * Registers a Filechain to persist files in.
     *
     * @param user that is an admin of the filehub.
     * @param rid of the filechain.
     */
    registerFilechain(user: User, rid: string): Promise<any>;
    /**
     * List community filechain locations.
     */
    listCommunityFilechainLocations(): Promise<Array<IFilechainLocation>>;
    /**
     * Gets a Filechain from a filechain location.
     */
    getFilechain(filechainLocation: IFilechainLocation): Filechain;
    /**
     * Returns a list of active Filechain applications.
     */
    listFilechainApplications(): Promise<IFilechainApplication[]>;
    /**
     * Approves a Filechain application.
     */
    approveCommunityFilechainApplication(user: User, brid: string): Promise<void>;
    /**
     * Rejects a Filechain application.
     */
    rejectCommunityFilechainApplication(user: User, brid: string): Promise<void>;
    /**
     * Report a Filechain as offline.
     */
    reportFilechainOffline(user: User, brid: string): Promise<void>;
    /**
     * Report a Filechain as online.
     */
    reportFilechainOnline(user: User, brid: string): Promise<void>;
    private reportFilechain;
}
