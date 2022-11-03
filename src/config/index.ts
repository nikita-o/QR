// @ts-nocheck
import "dotenv/config";
import crypto from "crypto";

const { env } = process;
export const HTTP_HOST = env.HTTP_HOST || "localhost";
export const HTTP_PORT = +env.HTTP_PORT || 3000;
export const SecurityKey = crypto.randomBytes(32);
export const initVector = crypto.randomBytes(16);
export const email = "";
export const emailpass = "";
export const ngrockHost = "f337-178-141-83-95.eu.ngrok.io";
