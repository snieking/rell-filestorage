import { createFt3User } from "./utils/users";
import { FILEHUB_ADMININISTRATOR, initFilehub } from "../blockchain/Postchain";

/**
 * @group verify-filechain-offline-report
 */
describe("Filechain reported offline tests", () => {
  beforeAll(async () => {
    await initFilehub();
    const admin = await createFt3User();
  });

  it("Filechain reported offline", async () => {
    const offlineReports = await FILEHUB_ADMININISTRATOR.getOfflineFilechainReportsSinceTimestamp(0);
    expect(offlineReports.length).toBeGreaterThanOrEqual(1);

    const offlineReport = offlineReports[0];
    expect(offlineReport.online_at).toBeGreaterThanOrEqual(offlineReport.offline_at);
  });

});
