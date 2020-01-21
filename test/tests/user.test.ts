import { createFt3User } from "./utils/users";

jest.setTimeout(60000);

/**
 * @group ci
 */
describe("User tests", () => {
  it("Make user", async () => {
    const user = await createFt3User();

    expect(user).toBeDefined();
    expect(user.authDescriptor).toBeDefined();
    expect(user.keyPair).toBeDefined();
  });
});
