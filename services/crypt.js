import {initVector, SecurityKey} from "../config";
import crypto from "crypto";

export function encrypt(data) {
    const cipher = crypto.createCipheriv('aes-256-cbc', SecurityKey, initVector);
    let encryptedData = cipher.update(data, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData;
}

export function decrypt(data) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', SecurityKey, initVector);
    let decryptedData = decipher.update(data, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
}