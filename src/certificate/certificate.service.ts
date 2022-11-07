import { Certificate } from "../entities/certificate.entity";
import { HTTP_HOST } from "../config/index";
import { encrypt, decrypt } from "../utils/crypt";
import { generateQR } from "../utils/qr";
import { sendQrToMail } from "../utils/mail";
import { myDataSource } from "../app-data-source";

export async function createCertificate(data: any): Promise<void> {
  data.accept = false;
  data.createDate = Date.now();

  await myDataSource.getRepository(Certificate).save(data);

  const encryptId = encrypt(data.id);
  const url = `${HTTP_HOST}/check-certificate/?encryptId=${encryptId}`;
  const qr: Buffer = await generateQR(url);
  try {
    await sendQrToMail(data.email, "QR код вашего сертификата", qr);
  } catch (error) {
    throw new Error("Несуществующий email");
  }
}

export async function acceptCertificate(encryptId: string): Promise<void> {
  let id: string;
  try {
    id = decrypt(encryptId);
  } catch (error) {
    throw new Error("Данные не корректны");
  }
  const certificate: Certificate | null = await myDataSource
    .getRepository(Certificate)
    .findOneBy({ id });
  if (!certificate) {
    throw new Error("Данные не корректны");
  }

  if (certificate.accept) {
    throw new Error("Сертификат уже погашен");
  }
  certificate.accept = true;
  await myDataSource.getRepository(Certificate).save(certificate);
}

export async function checkCertificate(encryptId: string): Promise<any> {
  let id: string;
  try {
    id = decrypt(encryptId);
  } catch (error) {
    throw new Error("Данные не корректны");
  }
  const certificate: Certificate | null = await myDataSource
    .getRepository(Certificate)
    .findOneBy({ id });
  if (!certificate) {
    throw new Error("Данные не корректны");
  }

  return {
    email: certificate.email,
    price: certificate.price,
    restaurant: certificate.restaurant,
    create_date: certificate.create_date
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, ""),
    accept: certificate.accept,
  };
}
