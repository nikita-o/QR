import { Certificate } from "../entities/certificate.entity";
import { hostFront, HTTP_HOST } from "../config/index";
import { encrypt, decrypt } from "../utils/crypt.util";
import { generateQR } from "../utils/qr.util";
import { sendQrToMail } from "../utils/mail.util";
import { myDataSource } from "../app-data-source";
import { checkStatusCertificate, registerCertificate } from "../utils/sberbank.util";
import { BuyCertificateDto } from "./dto/buy-certificate.dto";
//import nanoid = require('nanoid');
import { nanoid } from 'nanoid'

export async function buyCertificate(data: BuyCertificateDto) {
  const id = nanoid();

  const order = await registerCertificate(id, data.price * 100);

  await myDataSource
    .getRepository(Certificate)
    .save({
      id,
      orderId: order.orderId,
      formUrl: order.formUrl,
      restaurant: data.restaurant,
      price: data.price,
      email: data.email,
    });

  return order.formUrl;
}

export async function acceptTransaction(orderId: string) {
  const certificate: Certificate | null = await myDataSource
    .getRepository(Certificate)
    .findOneBy({ orderId });

  if (!certificate) {
    throw new Error('Нет');
  }

  await checkStatusCertificate(certificate.id);

  await myDataSource
    .getRepository(Certificate)
    .save({
      id: certificate.id,
      acceptPayment: true,
    });

  const encryptId = encrypt(certificate.id);
  const url = `${hostFront}/accept-certificate.html?id=${encryptId}`;
  const qr: Buffer = await generateQR(url);

  try {
    await sendQrToMail(certificate.email, "QR код вашего сертификата", qr);
  } catch (error) {
    throw new Error("Несуществующий email");
  }

  return certificate.email;
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
    accept: certificate.acceptUsing,
  };
}

export async function acceptCertificate(encryptId: string): Promise<Certificate> {
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

  if (certificate.acceptUsing) {
    throw new Error("Сертификат уже погашен");
  }
  certificate.acceptUsing = true;
  return await myDataSource.getRepository(Certificate).save(certificate);
}