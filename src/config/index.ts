import "dotenv/config";
import fs from "fs";

const { env } = process;
export const HTTP_PORT = Number(env.HTTP_PORT) || 3000;
export const HTTP_HOST = env.HTTP_HOST || "localhost";
export const email = env.EMAIL;
export const emailPass = env.EMAIL_PASS;

export const urlSberPayment = env.URL_SBER_PAYMENT || "https://3dsec.sberbank.ru/payment/rest";
export const sberLogin = env.SBER_LOGIN || '';
export const sberPass = env.SBER_PASS || '';
export const hostFront = env.SBER_PASS || 'localhost:8081';





const keys = JSON.parse(fs.readFileSync("src/config/key.json", "utf8"));
export const securityKey = Buffer.from(keys.securityKey.data);
export const initVector = Buffer.from(keys.initVector.data);
