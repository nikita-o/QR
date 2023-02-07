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
import { EStatusOrder, Order } from "../entities/order.entity";
import * as ejs from "ejs"
import fs from "fs";

const mailHTML = 'mail-html/mail.ejs';
const mailHTMLUnified = 'mail-html/mail2.ejs';

export async function buyCertificate(data: BuyCertificateDto) {
  const id = nanoid();

  if (!data.count) {
    data.count = 1;
  }

  const orderSberbank = await registerCertificate(id, data.price * data.count * 100);

  const order: Order = await myDataSource
    .getRepository(Order)
    .save({
      id,
      externalId: orderSberbank.orderId,
      formUrl: orderSberbank.formUrl,
      price: data.price * data.count,
      email: data.email,
    });

  const certificates: Certificate[] = Array.from(Array(data.count), () => ({
    restaurant: data.restaurant,
    price: data.price,
    order,
  })) as Certificate[];

  await myDataSource
    .getRepository(Certificate)
    .save(certificates)

  return order.formUrl;
}

export async function acceptTransaction(externalId: string) {
  const order: Order | null = await myDataSource
    .getRepository(Order)
    .findOne({ where: { externalId } });

  if (!order) {
    throw new Error('Нет');
  }

  await checkStatusCertificate(order.id);

  await myDataSource
    .getRepository(Order)
    .save({
      id: order.id,
      status: EStatusOrder.Payment,
    });

  const certificates: Certificate[] = await myDataSource
    .getRepository(Certificate)
    .findBy({order: {id: order.id}});

  await myDataSource
    .getRepository(Certificate)
    .save(certificates.map((certificate) => ({
      ...certificate,
      status: EStatusCertificate.Payment,
    })));

  // const qr: Buffer[] = [];
  // for await (const certificate of certificates) {
  //   const encryptId = encrypt(certificate.id);
  //   const url = `${hostFront}/accept-certificate.html?id=${encryptId}`;
  //   qr.push(await generateQR(url));
  // }

  const date: string = DateTime
    .fromJSDate(order.createdAt)
    .plus({year: 1})
    .setLocale('ru')
    .toLocaleString(DateTime.DATE_SHORT);

  for await (const certificate of certificates) {
    const encryptId = encrypt(certificate.id);
    const url = `${hostFront}/accept-certificate.html?id=${encryptId}`;
    await generateQR(url);
    const html = await ejs.renderFile(certificate.restaurant === 'ЕДИНЫЙ' ? mailHTMLUnified : mailHTML, {
      date,
      price: certificate.price,
      restaurant: certificate.restaurant,
      urlQR: `${hostFront}/qr/${encryptId}`,
    });
    await sendQrToMail(order.email, html)
      .catch((error) => {
        throw new Error("Несуществующий email");
      });
  }

  return order.email;
}

export async function checkCertificate(encryptId: string): Promise<any> {
  let id: string;
  try {
    id = decrypt(encryptId);
  } catch (error) {
    throw new Error("Данные не корректны");
  }

  let certificate: Certificate | null = await myDataSource
    .getRepository(Certificate)
    .findOneBy({ id });

  if (!certificate) {
    throw new Error("Данные не корректны");
  }

  const order: Order | null = await myDataSource
    .getRepository(Order)
    .findOneBy({id: certificate.orderId})

  if (!order) {
    throw new Error();
  }

  const date: Date = DateTime
    .fromJSDate(certificate.createdAt)
    .plus({year: 1}).toJSDate();

  if (date > new Date()) {
    certificate = await myDataSource
      .getRepository(Certificate)
      .save({ id, status: EStatusCertificate.Expired });
  }

  return {
    email: order.email,
    price: certificate.price,
    restaurant: certificate.restaurant,
    status: certificate.status,
    createDate: certificate.createdAt
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
  let certificate: Certificate | null = await myDataSource
    .getRepository(Certificate)
    .findOneBy({ id });
  if (!certificate) {
    throw new Error("Данные не корректны");
  }

  const date: Date = DateTime
    .fromJSDate(certificate.createdAt)
    .plus({year: 1}).toJSDate();

  if (date > new Date()) {
    return await myDataSource
      .getRepository(Certificate)
      .save({ id, status: EStatusCertificate.Expired });
  }

  if (certificate.status === EStatusCertificate.Close) {
    throw new Error("Сертификат уже погашен");
  }
  certificate.status = EStatusCertificate.Close;
  return await myDataSource.getRepository(Certificate).save(certificate);
}

export async function getCertificatesList(page: number): Promise<any> {
  const pageSize = 25;
  const [orders, totalCount]: [Order[], number] = await myDataSource
    .getRepository(Order)
    .findAndCount({
      skip: page * pageSize,
      take: pageSize,
      order: { createdAt: 'ASC' },
      relations: { certificates: true },
    });

  const countCertificate: number = await myDataSource
    .getRepository(Certificate)
    .count();
  return {
    orders,
    countCertificate,
    totalPages: Math.ceil(totalCount / pageSize),
  }
}
