import 'dotenv/config';

export const HTTP_HOST = process.env.HTTP_HOST || 'localhost';
export const HTTP_PORT = +process.env.HTTP_PORT || 3000;
export const initVector = process.env.INIT_VECTOR ? Buffer.from(process.env.INIT_VECTOR) : crypto.randomBytes(16);
export const SecurityKey = process.env.SECURITY_KEY ? Buffer.from(process.env.SECURITY_KEY) : crypto.randomBytes(32);
