import { Router } from "express";
import type { Request, Response } from "express";
import { hostFront, HTTP_HOST } from "../config/index";
import {
  acceptCertificate,
  checkCertificate, acceptTransaction, buyCertificate, getCertificatesList,
} from "./certificate.service";
import { Certificate } from "../entities/certificate.entity";
import { registerCertificate } from "../utils/sberbank.util";
import createHttpError from "http-errors";
import expressAsyncHandler from "express-async-handler";
import {body, query} from "express-validator";

export const router: Router = Router();

router
  .get('/test',
      expressAsyncHandler(async (req: Request, res: Response) => {
    throw createHttpError(400, `User not found`);
    res.send({email: 'asd@asd', price: 5000, createDate: new Date().toLocaleDateString()});
  }))

  // Сюда переходит фронт, при заказе сертификата
  .post("/buy-certificate",
      body('email').isEmail(),
      body('price').isInt({min: 1}),
      body('count').default(1).isInt({max: 100}),
      expressAsyncHandler(async (req: Request, res: Response) => {
      await buyCertificate(req.body);
      res.redirect(`${hostFront}/thanks?email=${req.body.email}`);
  }))

  // Сюда переходит сбер после оплаты (или если с заказом оплаты что то не так)
  .get("/accept-buy-certificate",
      query('orderId').isString(),
      expressAsyncHandler(async (req: Request, res: Response) => {
    const email: string = await acceptTransaction(req.query.orderId as string);
    // res.send({ email });
    res.redirect(`${hostFront}/notification-mail.html?email=${email}`);
  }))

  // Сюда переходят через qr код
  .get("/check-certificate",
      query('encryptId').isString(),
      expressAsyncHandler(async (req: Request, res: Response) => {
      const certificate: Certificate = await checkCertificate(String(req.query.encryptId));
      res.send(certificate);
  }))

  // Сюда переходят когда закрывают сертификат
  .get("/close-certificate",
      query('encryptId').isString(),
      expressAsyncHandler(async (req: Request, res: Response) => {
      const certificate: Certificate = await acceptCertificate(String(req.query.encryptId));
      // кидать весь сертификат наверно нет нужды, но на всякий кинул
      res.send(certificate);
  }))

  // Сюда переходят для просмотра всех сертификатов
  .get("/table-certificates",
      query('page').default(0).isInt({min: 0}),
      expressAsyncHandler(async (req: Request, res: Response) => {
    const page: number = Number(req.query.page ?? 0);
    const {orders, countCertificate, totalPages } = await getCertificatesList(page);
    res.render('table-certificates', {
      title: 'Hello',
      currentPage: page,
      orders,
      countCertificate,
      totalPages,
    });
  }));
