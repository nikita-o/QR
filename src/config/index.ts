// @ts-nocheck
import "dotenv/config";

const { env } = process;
// export const HTTP_HOST = env.HTTP_HOST || "localhost";
export const HTTP_PORT = +env.HTTP_PORT || 3000;
export const HTTP_HOST = env.HTTP_HOST || 'localhost';
export const email = env.EMAIL;
export const emailPass = env.EMAIL_PASS;
export let securityKey;
export let initVector;
export function initkey(keys) {
  securityKey = Buffer.from(keys.securityKey.data);
  initVector = Buffer.from(keys.initVector.data);
}
