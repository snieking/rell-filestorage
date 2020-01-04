import {createFt3User} from "./utils/users";
import {registerAsset, addBalance} from "./utils/utils";
import {FILEHUB, initFilehub} from "../blockchain/Postchain";

/**
 * @group ci
 */
describe("Billing tests", () => {

  const SUFFICIENT_BALANCE_FOR_CHROMIA_VOUCHER = 40;
  const SUFFICIENT_BALANCE_FOR_COMMON_VOUCHER = 10;
  const CHROMIA_VOUCHER = "CHROMIA";
  const COMMON_VOUCHER = "COMMON";

  beforeAll(async () => {
    await initFilehub();
    const admin = await createFt3User();
    await registerAsset(admin);
  });

  it("Not enough balance to purchase CHROMIA voucher", async () => {
    const user = await createFt3User();
    await FILEHUB.purchaseVoucher(user, CHROMIA_VOUCHER).catch(error => expect(error).toBeDefined());
    expect.assertions(1);
  });

  it("Not enough balance to purchase COMMON voucher", async () => {
    const user = await createFt3User();
    await FILEHUB.purchaseVoucher(user, COMMON_VOUCHER).catch(error => expect(error).toBeDefined());
    expect.assertions(1);
  });

  it("Purchase a CHROMIA voucher", async () => {
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE_FOR_CHROMIA_VOUCHER);
    await FILEHUB.purchaseVoucher(user, CHROMIA_VOUCHER);

    const hasActiveVoucher = await FILEHUB.hasActiveVoucher(user, CHROMIA_VOUCHER);
    const vouchers = await FILEHUB.getVouchers(user);

    expect(hasActiveVoucher).toBeTruthy();
    expect(vouchers.length).toBe(1);
  });

  it("Purchase a COMMON voucher", async () => {
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE_FOR_COMMON_VOUCHER);
    await FILEHUB.purchaseVoucher(user, COMMON_VOUCHER);

    const hasActiveVoucher = await FILEHUB.hasActiveVoucher(user, COMMON_VOUCHER);
    const vouchers = await FILEHUB.getVouchers(user);

    expect(hasActiveVoucher).toBeTruthy();
    expect(vouchers.length).toBe(1);
  });

  it("Attempt to purchase multiple CHROMIA vouchers, only 1 purchased", async () => {
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE_FOR_CHROMIA_VOUCHER);

    await FILEHUB.purchaseVoucher(user, CHROMIA_VOUCHER);
    await FILEHUB.purchaseVoucher(user, CHROMIA_VOUCHER).catch(error => expect(error).toBeDefined());
    await FILEHUB.purchaseVoucher(user, CHROMIA_VOUCHER).catch(error => expect(error).toBeDefined());

    const hasActiveVoucher = await FILEHUB.hasActiveVoucher(user, CHROMIA_VOUCHER);
    const vouchers = await FILEHUB.getVouchers(user);

    expect(hasActiveVoucher).toBeTruthy();
    expect(vouchers.length).toBe(1);
    expect.assertions(4);
  });

  it("Attempt to purchase multiple COMMON vouchers, only 1 purchased", async () => {
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE_FOR_COMMON_VOUCHER);

    await FILEHUB.purchaseVoucher(user, COMMON_VOUCHER);
    await FILEHUB.purchaseVoucher(user, COMMON_VOUCHER).catch(error => expect(error).toBeDefined());
    await FILEHUB.purchaseVoucher(user, COMMON_VOUCHER).catch(error => expect(error).toBeDefined());

    const hasActiveVoucher = await FILEHUB.hasActiveVoucher(user, COMMON_VOUCHER);
    const vouchers = await FILEHUB.getVouchers(user);

    expect(hasActiveVoucher).toBeTruthy();
    expect(vouchers.length).toBe(1);
    expect.assertions(4);
  });

  it("Purchase both COMMON and CHROMIA voucher", async () => {
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE_FOR_CHROMIA_VOUCHER + SUFFICIENT_BALANCE_FOR_COMMON_VOUCHER);

    await FILEHUB.purchaseVoucher(user, CHROMIA_VOUCHER);
    await FILEHUB.purchaseVoucher(user, COMMON_VOUCHER);

    const hasActiveChromiaVoucher = await FILEHUB.hasActiveVoucher(user, CHROMIA_VOUCHER);
    const hasActiveCommonVoucher = await FILEHUB.hasActiveVoucher(user, CHROMIA_VOUCHER);
    expect(hasActiveChromiaVoucher).toBeTruthy();
    expect(hasActiveCommonVoucher).toBeTruthy();

    const vouchers = await FILEHUB.getVouchers(user);
    expect(vouchers.length).toBe(2);
  });

  it("Purchase both COMMON and CHROMIA voucher, only sufficient balance for first one", async () => {
    const user = await createFt3User();
    await addBalance(user, SUFFICIENT_BALANCE_FOR_CHROMIA_VOUCHER);

    await FILEHUB.purchaseVoucher(user, CHROMIA_VOUCHER);
    await FILEHUB.purchaseVoucher(user, COMMON_VOUCHER).catch(error => expect(error).toBeDefined());

    const hasActiveChromiaVoucher = await FILEHUB.hasActiveVoucher(user, CHROMIA_VOUCHER);
    const hasActiveCommonVoucher = await FILEHUB.hasActiveVoucher(user, COMMON_VOUCHER);
    expect(hasActiveChromiaVoucher).toBeTruthy();
    expect(hasActiveCommonVoucher).toBeFalsy();

    const vouchers = await FILEHUB.getVouchers(user);
    expect(vouchers.length).toBe(1);

    expect.assertions(4);
  });

});