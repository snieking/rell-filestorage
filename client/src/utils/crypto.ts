import * as crypto from "crypto";

export const hashData = (data: Buffer): Buffer => {
  return crypto.createHash("sha256")
    .update(data)
    .digest();
};