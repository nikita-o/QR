import { encrypt, decrypt } from "../utils/crypt.js";
import { generateQR } from "../utils/qr-generate.js";
import { sendMail } from "../utils/send-mail.js";

export async function createCertificate(data) {
  const encryptId = encrypt(data.id); //должна быть строка
  const url = `${encryptId}`;
  await generateQR(url);
  //   sendMail();
}

export function acceptCertificate(encryptId) {
  return decrypt(encryptId);
}

// attachments: [
//     {   // utf-8 string as an attachment
//         filename: 'text1.txt',
//         content: 'hello world!'
//     },
