import {
  adminUser,
  FILECHAIN_ADMINISTRATOR,
  FILEHUB,
  FILEHUB_ADMININISTRATOR,
  initFilehub
} from "../blockchain/Postchain";
import {createFt3User} from "./utils/users";
import {addBalance, generateRandomString, registerAsset} from "./utils/utils";
import {User} from "ft3-lib";
import * as crypto from "crypto";

/**
 * @group ci
 */
describe("Administration of a common filechain", () => {

  const SUFFICIENT_BALANCE = 100;
  const INSUFFICIENT_BALANCE = 99;

  let admin: User;

  beforeAll(async () => {
    await initFilehub();
    admin = await adminUser();
    await registerAsset(admin);
  });

  it("Send application, insufficient balance", async () => {
    const user = await createFt3User();
    await addBalance(user, INSUFFICIENT_BALANCE);

    const brid = createBrid();
    await FILECHAIN_ADMINISTRATOR.sendCommonFilechainApplication(user, brid, "localhost", "github.com")
      .catch(error => expect(error).toBeDefined());

    const applications = await FILEHUB_ADMININISTRATOR.listFilechainApplications();
    expect(applications.length).toEqual(0);

    expect.assertions(2);
  });

  it("Successfully rejected application", async () => {
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE);

    const brid = createBrid();
    await FILECHAIN_ADMINISTRATOR.sendCommonFilechainApplication(user, brid, "localhost", "github.com");
    let applications = await FILEHUB_ADMININISTRATOR.listFilechainApplications();
    expect(applications.length).toEqual(1);

    await FILEHUB_ADMININISTRATOR.rejectCommonFilechainApplication(admin, brid);
    applications = await FILEHUB_ADMININISTRATOR.listFilechainApplications();
    expect(applications.length).toEqual(0);

    const balancePrior = await FILEHUB.getBalance(user);
    await FILEHUB_ADMININISTRATOR.handlePayouts(admin);
    const balanceAfter = await FILEHUB.getBalance(user);

    expect(balanceAfter).toBeGreaterThan(balancePrior);
  });

  it("Only admin can approve application", async () => {
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE);

    // Send application
    const brid = createBrid();
    await FILECHAIN_ADMINISTRATOR.sendCommonFilechainApplication(user, brid, "localhost", "github.com");
    let applications = await FILEHUB_ADMININISTRATOR.listFilechainApplications();
    expect(applications.length).toEqual(1);

    // Non-user attempts to approve
    await FILEHUB_ADMININISTRATOR.approveCommonFilechainApplication(user, brid).catch(error => expect(error).toBeDefined());
    applications = await FILEHUB_ADMININISTRATOR.listFilechainApplications();
    expect(applications.length).toEqual(1);

    // Admin rejects to clean-up
    await FILEHUB_ADMININISTRATOR.rejectCommonFilechainApplication(admin, brid);
    applications = await FILEHUB_ADMININISTRATOR.listFilechainApplications();
    expect(applications.length).toEqual(0);

    expect.assertions(4);
  });

  it("Only admin can reject application", async () => {
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE);

    // Create application
    const brid = createBrid();
    await FILECHAIN_ADMINISTRATOR.sendCommonFilechainApplication(user, brid, "localhost", "github.com");
    let applications = await FILEHUB_ADMININISTRATOR.listFilechainApplications();
    expect(applications.length).toEqual(1);

    // Non-admin tries to reject
    await FILEHUB_ADMININISTRATOR.rejectCommonFilechainApplication(user, brid).catch(error => expect(error).toBeDefined());
    applications = await FILEHUB_ADMININISTRATOR.listFilechainApplications();
    expect(applications.length).toEqual(1);

    // Admin rejects to clean-up
    await FILEHUB_ADMININISTRATOR.rejectCommonFilechainApplication(admin, brid);
    applications = await FILEHUB_ADMININISTRATOR.listFilechainApplications();
    expect(applications.length).toEqual(0);

    expect.assertions(4);
  });

});

const createBrid = () => {
  return crypto.createHash("SHA256").update(generateRandomString(36)).digest().toString("hex");
};