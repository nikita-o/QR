import { Certificate, ERestaurant, EStatusCertificate } from "../entities/certificate.entity";
import { HTTP_HOST, sberLogin } from "../config/index";
import { decrypt, encrypt } from "../utils/crypt.util";
import { generateQR } from "../utils/qr.util";
import { sendQrToMail, sendURLPaymentToMail } from "../utils/mail.util";
import { dataSource } from "../app-data-source";
import { checkStatusCertificate, registerCertificate } from "../utils/sberbank.util";
import { BuyCertificateDto } from "./dto/buy-certificate.dto";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { EStatusOrder, Order } from "../entities/order.entity";
import * as ejs from "ejs";

const mailHTMLUnified = 'mail-html/mail.ejs';
const mailHTML = 'mail-html/mail2.ejs';

const restaurants = [
  'ЕДИНЫЙ СЕРТИФИКАТ',
  'FAME PASTA E VINO',
  'АКАДЕМИЯ ХИНКАЛИ',
  'АКАДЕМИЯ КАВКАЗСКОЙ КУХНИ',
  'IZAKAYA-KOI',
  'ЮРТА ЧИНГИСХАНА',
]

export async function testEmail(email: string) {
  const date: string = DateTime
    .now()
    .plus({year: 1})
    .setLocale('ru')
    .toLocaleString(DateTime.DATE_SHORT);

  const html = await ejs.renderFile(mailHTMLUnified, {
    date,
    price: 100,
    restaurant: 'ЕДИНЫЙ СЕРТИФИКАТ',
    urlImg: `${HTTP_HOST}/image/restaurant-0.png`,
    urlQR: 'https://fakeimg.pl/300/',
  });
  console.log(html);
  await sendQrToMail(email, html)
    .catch((error) => {
      throw new Error("Несуществующий email");
    });
}

export async function buyCertificate(data: BuyCertificateDto) {
  const id = nanoid();

  const orderSberbank = await registerCertificate(id, data.price * data.count * 100);

  const order: Order = await dataSource
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

  await dataSource
    .getRepository(Certificate)
    .save(certificates)

  await sendURLPaymentToMail(data.email, order.formUrl);
}

export async function createFREECertificate(data: BuyCertificateDto) {
  const id = nanoid();
  const order: Order = await dataSource
    .getRepository(Order)
    .save({
      id,
      externalId: id,
      formUrl: '',
      status: EStatusOrder.Payment,
      price: data.price * data.count,
      email: data.email,
    });

  const certificates: Certificate[] = Array.from(Array(data.count), () => ({
    restaurant: data.restaurant,
    price: data.price,
    order,
    status: EStatusCertificate.Payment,
  })) as Certificate[];

  await dataSource
    .getRepository(Certificate)
    .save(certificates);

  const date: string = DateTime
    .fromJSDate(order.createdAt)
    .plus({year: 1})
    .setLocale('ru')
    .toLocaleString(DateTime.DATE_SHORT);

  for await (const certificate of certificates) {
    const encryptId = encrypt(certificate.id);
    await generateQR(encryptId);

    const html = await ejs.renderFile(certificate.restaurant === ERestaurant.edin ? mailHTMLUnified : mailHTML, {
      date,
      price: certificate.price,
      restaurant: restaurants[certificate.restaurant],
      urlImg: `${HTTP_HOST}/image/restaurant-${certificate.restaurant}.png`,
      urlQR: `${HTTP_HOST}/qr/${encryptId}.png`,
    });
    await sendQrToMail(order.email, html)
      .catch((error) => {
        throw new Error("Несуществующий email");
      });
  }
}

export async function acceptTransaction(externalId: string) {
  const order: Order | null = await dataSource
    .getRepository(Order)
    .findOne({ where: { externalId } });

  if (!order) {
    throw new Error('Нет');
  }

  await checkStatusCertificate(order.externalId);

  await dataSource
    .getRepository(Order)
    .save({
      id: order.id,
      status: EStatusOrder.Payment,
    });

  const certificates: Certificate[] = await dataSource
    .getRepository(Certificate)
    .findBy({order: {id: order.id}});

  await dataSource
    .getRepository(Certificate)
    .save(certificates.map((certificate) => ({
      ...certificate,
      status: EStatusCertificate.Payment,
    })));

  const date: string = DateTime
    .fromJSDate(order.createdAt)
    .plus({year: 1})
    .setLocale('ru')
    .toLocaleString(DateTime.DATE_SHORT);

  for await (const certificate of certificates) {
    const encryptId = encrypt(certificate.id);
    await generateQR(encryptId);

    const html = await ejs.renderFile(certificate.restaurant === ERestaurant.edin ? mailHTMLUnified : mailHTML, {
      date,
      price: certificate.price,
      restaurant: restaurants[certificate.restaurant],
      urlImg: `${HTTP_HOST}/image/restaurant-${certificate.restaurant}.png`,
      urlQR: `${HTTP_HOST}/qr/${encryptId}.png`,
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

  let certificate: Certificate | null = await dataSource
    .getRepository(Certificate)
    .findOneBy({ id });

  if (!certificate) {
    throw new Error("Данные не корректны");
  }

  const order: Order | null = await dataSource
    .getRepository(Order)
    .findOneBy({id: certificate.orderId})

  if (!order) {
    throw new Error();
  }

  const date: Date = DateTime
    .fromJSDate(certificate.createdAt)
    .plus({year: 1}).toJSDate();

  if (date < new Date()) {
    await dataSource
      .getRepository(Certificate)
      .save({ id, status: EStatusCertificate.Expired });
    certificate.status = EStatusCertificate.Expired;
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
  let certificate: Certificate | null = await dataSource
    .getRepository(Certificate)
    .findOneBy({ id });
  if (!certificate) {
    throw new Error("Данные не корректны");
  }

  const date: Date = DateTime
    .fromJSDate(certificate.createdAt)
    .plus({year: 1}).toJSDate();

  if (date < new Date()) {
    return await dataSource
      .getRepository(Certificate)
      .save({ id, status: EStatusCertificate.Expired });
  }

  if (certificate.status === EStatusCertificate.Close) {
    throw new Error("Сертификат уже погашен");
  }
  certificate.status = EStatusCertificate.Close;
  return await dataSource.getRepository(Certificate).save(certificate);
}

export async function getCertificatesList(page: number): Promise<any> {
  const pageSize = 25;
  const [orders, totalCount]: [Order[], number] = await dataSource
    .getRepository(Order)
    .findAndCount({
      skip: page * pageSize,
      take: pageSize,
      order: { createdAt: 'ASC' },
      relations: { certificates: true },
    });

  const countCertificate: number = await dataSource
    .getRepository(Certificate)
    .count();
  return {
    orders,
    countCertificate,
    totalPages: Math.ceil(totalCount / pageSize),
  }
}
