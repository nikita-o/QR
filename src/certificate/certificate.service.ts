import { Certificate, EStatusCertificate } from "../entities/certificate.entity";
import { hostFront } from "../config/index";
import { decrypt, encrypt } from "../utils/crypt.util";
import { generateQR } from "../utils/qr.util";
import { sendQrToMail } from "../utils/mail.util";
import { myDataSource } from "../app-data-source";
import { checkStatusCertificate, registerCertificate } from "../utils/sberbank.util";
import { BuyCertificateDto } from "./dto/buy-certificate.dto";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";

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
      status: EStatusCertificate.WaitPayment,
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
      status: EStatusCertificate.Free,
    });

  const encryptId = encrypt(certificate.id);
  const url = `${hostFront}/accept-certificate.html?id=${encryptId}`;
  const qr: Buffer = await generateQR(url);

  try {
    const message = `
    Вы приобрели сертификат в ${certificate.restaurant} на ${certificate.price}, ваш сертификат действителен до ${DateTime.fromJSDate(certificate.createDate).plus({year: 1}).toISODate()}.
    Данный QR-код предназначен только для сотрудника ресторана, пожалуйста не сканируйте его самостоятельно. Если вы погасите сертификат до посещения, он будет считаться не действительным.
    `;
    await sendQrToMail(certificate.email, message, qr);
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
    status: certificate.status,
    createDate: certificate.createDate
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "")
      .slice(0, -8),
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

  if (certificate.status === EStatusCertificate.Close) {
    throw new Error("Сертификат уже погашен");
  }
  certificate.status = EStatusCertificate.Close;
  return await myDataSource.getRepository(Certificate).save(certificate);
}

export async function getCertificatesList(page: number): Promise<any> {
  const pageSize = 25;
  const [certificates, totalCount]: [Certificate[], number] = await myDataSource.getRepository(Certificate).findAndCount({
    skip: page * pageSize,
    take: pageSize,
    order: { restaurant: 'ASC' },
    select: ['restaurant', 'status', 'price', 'email', 'createDate'],
  });
  return {
    certificates,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  }
}
