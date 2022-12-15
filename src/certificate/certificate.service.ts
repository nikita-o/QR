import { Certificate } from "../entities/certificate.entity";
import { HTTP_HOST } from "../config/index";
import { encrypt, decrypt } from "../utils/crypt.util";
import { generateQR } from "../utils/qr.util";
import { sendQrToMail } from "../utils/mail.util";
import { myDataSource } from "../app-data-source";
import type { CreateCertificateDto } from "./dto/create-certificate.dto";
import { checkStatusCertificate, registerCertificate } from "../utils/sberbank.util";
import { Transaction } from "../entities/transaction.entity";
import { BuyCertificateDto } from "./dto/buy-certificate.dto";

export async function createCertificate(
  data: CreateCertificateDto
): Promise<void> {
  if (data.price < 0) {
    throw new Error('Нет');
  }

  await myDataSource
    .getRepository(Certificate)
    .save({
      price: data.price,
      restaurant: data.restaurant,
    });
}

export async function buyCertificate(data: BuyCertificateDto) {
  const certificate: Certificate | null = await myDataSource
    .getRepository(Certificate)
    .findOneBy({ id: data.idCertificate });

  if (!certificate) {
    throw new Error('Нет');
  }

  //  Чек email...
  await myDataSource
    .getRepository(Certificate)
    .save({ id: data.idCertificate, email: data.email });

  const order = await registerCertificate(certificate.id, certificate.price * 100);

  await myDataSource
    .getRepository(Transaction)
    .save({
      orderId: order.orderId,
      formUrl: order.formUrl,
      certificateId: certificate.id,
    });

  return order.formUrl;
}

export async function acceptTransaction(orderId: string) {
  const transaction: Transaction | null = await myDataSource
    .getRepository(Transaction)
    .findOne({
      where: { orderId },
      relations: { certificate: true },
    });

  if (!transaction) {
    throw new Error('Нет');
  }

  await checkStatusCertificate(transaction.certificate.id);

  await myDataSource
    .getRepository(Certificate)
    .save({
      id: transaction.certificateId,
      acceptPayment: true,
    });

  const encryptId = encrypt(transaction.certificateId + '');
  const url = `${HTTP_HOST}/check-certificate/?encryptId=${encryptId}`;
  const qr: Buffer = await generateQR(url);

  try {
    await sendQrToMail(transaction.certificate.email, "QR код вашего сертификата", qr);
  } catch (error) {
    throw new Error("Несуществующий email");
  }

  return transaction.certificate.email;
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

  if (certificate.acceptUsing) {
    throw new Error("Сертификат уже погашен");
  }
  certificate.acceptUsing = true;
  await myDataSource.getRepository(Certificate).save(certificate);
}