import crypto from "crypto";

const SecurityKey = crypto.randomBytes(32);
const initVector = crypto.randomBytes(16);
export function encrypt(data) {
  const cipher = crypto.createCipheriv("aes-256-cbc", SecurityKey, initVector);
  let encryptedData = cipher.update(data, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return encryptedData;
}

export function decrypt(data) {
  console.log("decrypt");
  console.log(SecurityKey);
  console.log(initVector);

  console.log(data);
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    SecurityKey,
    initVector
  );
  console.log(decipher);
  let decryptedData = decipher.update(data, "hex", "utf-8");
  console.log(decryptedData);
  decryptedData += decipher.final("utf8");
  console.log(decryptedData);
  return decryptedData;
}
