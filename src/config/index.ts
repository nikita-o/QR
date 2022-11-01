import "dotenv/config";
import crypto from "crypto";

export const HTTP_HOST = process.env.HTTP_HOST || "localhost";
export const HTTP_PORT = +process.env.HTTP_PORT || 3000;
export const initVector = Buffer.from("ggsecretparasha1");
export const SecurityKey = Buffer.from("ggsecretparashaggsecretparasha22");
