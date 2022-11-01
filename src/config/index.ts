// @ts-nocheck
import "dotenv/config";

const { env } = process;
export const HTTP_HOST = env.HTTP_HOST || "localhost";
export const HTTP_PORT = +env.HTTP_PORT || 3000;
export const initVector = Buffer.from("ggsecretparasha1");
export const SecurityKey = Buffer.from("ggsecretparashaggsecretparasha22");
