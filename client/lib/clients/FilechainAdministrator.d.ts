import { User } from "ft3-lib";
import AbstractAdministrator from "./AbstractAdministrator";
import Filehub from "./Filehub";
export default class FilechainAdministrator extends AbstractAdministrator {
    private static FIRST_TIMESTAMP;
    constructor(filehub: Filehub);
    /**
     * Sends an application for a Filechain to join the pool of COMMUNITY Filechains.
     */
    sendCommunityFilechainApplication(user: User, brid: string, nodeUrl: string, sourceCodeUrl: string): Promise<void>;
    /**
     * Requests payment for data stored in your Filechains.
     * Data is only able to be paid out after it has been persisted for 30 days or more.
     */
    requestPayment(user: User): Promise<void>;
    /**
     * Migrates data stored in the Filechain to another one.
     */
    migrateFilechain(user: User, fromBrid: string): Promise<void>;
    /**
     * Disables a Filechain.
     */
    disableFilechain(user: User, brid: string): Promise<any>;
}
