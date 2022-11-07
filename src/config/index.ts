import "dotenv/config";
import fs from "fs";

const { env } = process;
export const HTTP_PORT = Number(env.HTTP_PORT) || 3000;
export const HTTP_HOST = env.HTTP_HOST || "localhost";
export const email = env.EMAIL;
export const emailPass = env.EMAIL_PASS;

const keys = JSON.parse(fs.readFileSync("src/config/key.json", "utf8"));
export const securityKey = Buffer.from(keys.securityKey.data);
export const initVector = Buffer.from(keys.initVector.data);
