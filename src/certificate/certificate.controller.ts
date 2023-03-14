import { Router } from "express";
import type { Request, Response } from "express";
import { godToken, hostFront, HTTP_HOST } from "../config/index";
import {
  acceptCertificate,
  checkCertificate, acceptTransaction, buyCertificate, getCertificatesList, createFREECertificate,
} from "./certificate.service";
import { Certificate } from "../entities/certificate.entity";
import { registerCertificate } from "../utils/sberbank.util";
import createHttpError, { HttpError } from "http-errors";
import expressAsyncHandler from "express-async-handler";
import { body, query, validationResult } from "express-validator";

export const router: Router = Router();

router
  .post('/test',
    body('email').trim().isEmail(),
    body('count').default(1).isInt({max: 100}).toInt(),
    expressAsyncHandler(async (req: Request, res: Response) => {
      if (!validationResult(req).isEmpty() || req.body.token !== godToken) {
        throw createHttpError(400, 'Ошибка валидации');
      }
      res.send({email: 'asd@asd', price: 5000, createDate: new Date().toLocaleDateString()});
  }))

  .post("/buy-certificate-free",
    body('email').trim().isEmail(),
    body('price').isInt({min: 1}).toInt(),
    body('count').default(1).isInt({max: 100}).toInt(),
    expressAsyncHandler(async (req, res) => {
      if (req.body.token !== godToken) {
        throw createHttpError["404"]();
      }
      if (!validationResult(req).isEmpty()) {
        throw createHttpError(400, 'Ошибка валидации');
      }
      await createFREECertificate(req.body);
      res.send("ok");
  }))

  // Сюда переходит фронт, при заказе сертификата
  .post("/buy-certificate",
      body('email').trim().isEmail(),
      body('price').isInt({min: 1}).toInt(),
      body('count').default(1).isInt({max: 100}).toInt(),
      expressAsyncHandler(async (req: Request, res: Response) => {
        if (!validationResult(req).isEmpty()) {
          throw createHttpError(400, 'Ошибка валидации');
        }

      await buyCertificate(req.body);
      res.redirect(`${hostFront}/thanks?email=${req.body.email}`);
  }))

  // Сюда переходит сбер после оплаты (или если с заказом оплаты что то не так)
  .get("/accept-buy-certificate",
    query('orderId').isString(),
    expressAsyncHandler(async (req: Request, res: Response) => {
        if (!validationResult(req).isEmpty()) {
          throw createHttpError(400, 'Ошибка валидации');
        }
      const email: string = await acceptTransaction(req.query.orderId as string);
      res.redirect(`${hostFront}/notification-mail.html?email=${email}`);
  }))

  // Сюда переходят через qr код
  .get("/check-certificate",
    query('encryptId').isString(),
    expressAsyncHandler(async (req: Request, res: Response) => {
      if (!validationResult(req).isEmpty()) {
        throw createHttpError(400, 'Ошибка валидации');
      }
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
    query('page').default(0).isInt({min: 0}).toInt(),
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
