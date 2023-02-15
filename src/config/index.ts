import "dotenv/config";
import fs from "fs";

const { env } = process;
export const HTTP_PORT = Number(env.HTTP_PORT) || 3000;
export const HTTP_HOST = env.HTTP_HOST || "localhost";
export const hostFront = env.HTTP_HOST_FRONT || 'http://localhost:8081';

export const email = env.EMAIL;
export const emailPass = env.EMAIL_PASS;

export const TEST = Boolean(Number(env.TEST));
export const urlSberPayment = TEST ? 'https://3dsec.sberbank.ru/payment/rest' : 'https://securepayments.sberbank.ru/payment/rest';
export const sberToken = env.SBER_TOKEN;
export const sberLogin = env.SBER_LOGIN;
export const sberPass = env.SBER_PASS;

const keys = JSON.parse(fs.readFileSync("src/config/key.json", "utf8"));
export const securityKey = Buffer.from(keys.securityKey.data);
export const initVector = Buffer.from(keys.initVector.data);
