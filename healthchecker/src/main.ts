import FilehubAdministrator from "../../client/src/clients/FilehubAdministrator";
import Filehub from "../../client/src/clients/Filehub";

const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const NODE_URL = process.env.NODE_URL;
const BRID = process.env.FILEHUB_BRID;

console.log("Using admin key: ", ADMIN_PRIVATE_KEY);

const FILEHUB: Filehub = new Filehub(NODE_URL, BRID, []);
const FILEHUB_ADMIN: FilehubAdministrator = new FilehubAdministrator(FILEHUB);