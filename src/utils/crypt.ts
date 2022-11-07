import { securityKey, initVector } from "../config/index";
import crypto from "crypto";

export function encrypt(data: string): string {
  const cipher = crypto.createCipheriv("aes-256-cbc", securityKey, initVector);
  let encryptedData = cipher.update(data, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return encryptedData;
}

export function decrypt(data: string): string {
  const decipher = crypto.createDecipheriv("aes-256-cbc", securityKey, initVector);
  let decryptedData = decipher.update(data, "hex", "utf-8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
}
