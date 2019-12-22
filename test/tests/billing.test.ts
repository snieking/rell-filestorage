import {createFt3User} from "../utils/users";
import {registerFilechainInFilehub, registerAsset, addBalance} from "../utils/utils";
import {FILEHUB} from "../blockchain/Postchain";

describe("Billing tests", () => {

  beforeAll(async () => {
    const admin = await createFt3User();
    await FILEHUB.registerAdmin(admin);
    await registerFilechainInFilehub(admin);
    await registerAsset(admin);
  });

  it("Not enough balance to purchase voucher", async () => {
    const user = await createFt3User();
    await FILEHUB.purchaseVoucher(user).catch(error => expect(error).toBeDefined());
    expect.assertions(1);
  });

  it("Purchase a voucher", async () => {
    const user = await createFt3User();
    await addBalance(user, 20);
    await FILEHUB.purchaseVoucher(user);

    const hasActiveVoucher = await FILEHUB.hasActiveVoucher(user);
    const vouchers = await FILEHUB.getVouchers(user);

    expect(hasActiveVoucher).toBeTruthy();
    expect(vouchers.length).toBe(1);
  });

  it("Attempt to purchase multiple vouchers, only 1 purchased", async () => {
    const user = await createFt3User();
    await addBalance(user, 20);

    await FILEHUB.purchaseVoucher(user);
    await FILEHUB.purchaseVoucher(user).catch(error => expect(error).toBeDefined());
    await FILEHUB.purchaseVoucher(user).catch(error => expect(error).toBeDefined());

    const hasActiveVoucher = await FILEHUB.hasActiveVoucher(user);
    const vouchers = await FILEHUB.getVouchers(user);

    expect(hasActiveVoucher).toBeTruthy();
    expect(vouchers.length).toBe(1);
    expect.assertions(4);
  });

});