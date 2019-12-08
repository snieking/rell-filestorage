import {loginUser} from "../utils/users";

jest.setTimeout(60000);

describe("User tests", () => {

  it("Make user", async () => {
    const user = await loginUser();

    expect(user).toBeDefined();
    expect(user.authDescriptor).toBeDefined();
    expect(user.keyPair).toBeDefined();
  });

});