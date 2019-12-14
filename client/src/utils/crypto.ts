import * as crypto from "crypto";

export const hashData = (data: string): Buffer => {
  return crypto.createHash("sha256")
    .update(data, "utf8")
    .digest();
};