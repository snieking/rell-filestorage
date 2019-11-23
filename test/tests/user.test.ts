import {loginUser} from "../utils/users";

describe("User test", () => {

  it("Make user", async () => {
    const user = await loginUser();
  });

});