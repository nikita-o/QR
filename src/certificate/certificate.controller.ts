import { Router } from "express";
import type { Request, Response } from "express";
import { hostFront, HTTP_HOST } from "../config/index";
import {
  acceptCertificate,
  checkCertificate, acceptTransaction, buyCertificate, getCertificatesList,
} from "./certificate.service";
import { Certificate } from "../entities/certificate.entity";
import { registerCertificate } from "../utils/sberbank.util";

export const router: Router = Router();

router
  .get('/test', async (req: Request, res: Response) => {
    console.log('test');
    console.log(req.body);
    console.log(req.query);
    console.log(req.params);
    res.send({email: 'asd@asd', price: 5000, createDate: new Date().toLocaleDateString()});
  })

  .get('/', async (req: Request, res: Response) => {
    const k = await registerCertificate("999", 1000);
    console.log(k);
    res.send(k);

  })

  // Сюда переходит фронт, при заказе сертификата
  .post("/buy-certificate", async (req: Request, res: Response) => {
    try {
      await buyCertificate(req.body);
      res.redirect(`${hostFront}/thanks?email=${req.body.email}`);
    } catch (error: any) {
      res
        .status(error.status || 500)
        .send({ message: error.message || "Ошибка!" });
    }
  })

  // Сюда переходит сбер после оплаты (или если с заказом оплаты что то не так)
  .get("/accept-buy-certificate", async (req: Request, res: Response) => {
    try {
      const email: string = await acceptTransaction(req.query.orderId as string);
      // res.send({ email });
      res.redirect(`${hostFront}/notification-mail.html?email=${email}`);
    } catch (error: any) {
      res
        .status(error.status || 500)
        .send({ message: error.message || "Ошибка!" });
    }
  })

  // Сюда переходят через qr код
  .get("/check-certificate", async (req: Request, res: Response) => {
    try {
      const certificate: Certificate = await checkCertificate(String(req.query.encryptId));
      res.send(certificate);
    } catch (error: any) {
      res
        .status(error.status || 500)
        .send({ message: error.message || "Ошибка!" });
    }
  })

  // Сюда переходят когда закрывают сертификат
  .get("/close-certificate", async (req: Request, res: Response) => {
    try {
      const certificate: Certificate = await acceptCertificate(String(req.query.encryptId));
      // кидать весь сертификат наверно нет нужды, но на всякий кинул
      res.send(certificate);
    } catch (error: any) {
      res
        .status(error.status || 500)
        .send({ error: { message: error.message || "Ошибка!" } });
    }
  })

  // Сюда переходят для просмотра всех сертификатов
  .get("/table-certificates", async (req: Request, res: Response) => {
    const page: number = Number(req.query.page ?? 0);
    const {orders, countCertificate, totalPages } = await getCertificatesList(page);
    res.render('table-certificates', {
      title: 'Hello',
      currentPage: page,
      orders,
      countCertificate,
      totalPages,
    });
  });
