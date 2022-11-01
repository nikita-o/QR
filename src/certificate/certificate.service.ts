import { encrypt, decrypt } from "../utils/crypt";
import { generateQR } from "../utils/qr-generate";
// import { sendMail } from "../utils/send-mail";

export async function createCertificate(data: any) {
  const encryptId = encrypt(data.id); //должна быть строка
  const url = `${encryptId}`;
  await generateQR(url);
  //   sendMail();
}

export function acceptCertificate(encryptId: string) {
  return decrypt(encryptId);
}

// attachments: [
//     {   // utf-8 string as an attachment
//         filename: 'text1.txt',
//         content: 'hello world!'
//     },
