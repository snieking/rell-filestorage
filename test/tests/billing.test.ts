import {createFt3User} from "../utils/users";
import {generateRandomString, registerFilechainInFilehub, registerAsset, addBalance} from "../utils/utils";
import {FILEHUB} from "../blockchain/Postchain";
import {User} from "ft3-lib";

describe("Billing tests", () => {

  let user: User;

  beforeAll(async () => {
    user = await createFt3User();
    await FILEHUB.registerAdmin(user);
    await registerFilechainInFilehub(user);
    await registerAsset(user);
  });

  it("Not enough balance to purchase voucher", async () => {
    await FILEHUB.purchaseVoucher(user).catch(error => expect(error).toBeDefined());
    expect.assertions(1);
  });

  it("Purchase a voucher", async () => {
    await addBalance(user, 20);
    await FILEHUB.purchaseVoucher(user);

    const hasActiveVoucher = await FILEHUB.hasActiveVoucher(user);
    const vouchers = await FILEHUB.getVouchers(user);

    expect(hasActiveVoucher).toBeTruthy();
    expect(vouchers.length).toBe(1);
  });

  it("Attempt to purchase multiple vouchers, only 1 went purchased", async () => {
    await addBalance(user, 20);
    await FILEHUB.purchaseVoucher(user);
    await FILEHUB.purchaseVoucher(user);
    await FILEHUB.purchaseVoucher(user);

    const hasActiveVoucher = await FILEHUB.hasActiveVoucher(user);
    const vouchers = await FILEHUB.getVouchers(user);

    expect(hasActiveVoucher).toBeTruthy();
    expect(vouchers.length).toBe(1);
  });

});