import { Certificate } from "../entities/certificate.entity";
import { HTTP_HOST } from "../config/index";
import { encrypt, decrypt } from "../utils/crypt";
import { generateQR } from "../utils/qr";
import { sendQrToMail } from "../utils/mail";
import { myDataSource } from "../app-data-source";
import type { CreateCertificateDto } from "./dto/create-certificate.dto";

export async function createCertificate(
  data: CreateCertificateDto
): Promise<void> {
  const { id }: { id: string } = await myDataSource
    .getRepository(Certificate)
    .save({
      email: data.email,
      price: data.price,
      restaurant: data.restaurant,
      accept: false,
    });

  const encryptId = encrypt(id);
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
    createDate: certificate.createDate
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, ""),
    accept: certificate.accept,
  };
}
