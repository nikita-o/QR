import { initVector, ngrockHost } from "./../config/index";
import { encrypt, decrypt } from "../utils/crypt";
import { generateQR } from "../utils/qr-generate";
import { sendMail } from "../utils/send-mail";
import { randomUUID } from "crypto";
import fs from "fs";

export async function createCertificate(data: any) {
  const storage: any = JSON.parse(fs.readFileSync("storage.json", "utf8"));
  data.id = randomUUID();
  data.accept = false;
  data.createDate = Date.now();

  storage.certificate.push(data);
  fs.writeFileSync("storage.json", JSON.stringify(storage));
  const encryptId = encrypt(data.id); //должна быть строка
  const url = `${ngrockHost}/close-certificate/?encryptId=${encryptId}`;
  const qr: Buffer = await generateQR(url);
  await sendMail(data.email, "QR код вашего сертификата", qr);
  console.log(storage);
}

export function acceptCertificate(encryptId: string) {
  const storage: any = JSON.parse(fs.readFileSync("storage.json", "utf8"));
  const id = decrypt(encryptId);
  const idx = storage.certificate.findIndex((el: any) => el.id === id);
  if (idx === -1) {
    return { error: "Данные не корректны" };
  }
  const data = storage.certificate[idx];
  if (data.accept) {
    return { error: "Сертификат уже погашен" };
  }
  data.accept = true;
  console.log(storage);
  fs.writeFileSync("storage.json", JSON.stringify(storage));

  return {
    email: data.email,
    price: data.price,
    restaurant: data.restaurant,
  };
}
