import type { Request, Response } from "express";
import { Router } from "express";
import createHttpError from "http-errors";
import expressAsyncHandler from "express-async-handler";
import { body, query, validationResult } from "express-validator";
import { godToken, hostFront } from "../config/index";
import {
  acceptCertificate,
  acceptTransaction,
  buyCertificate,
  checkCertificate,
  createFREECertificate,
  getCertificatesList,
  testEmail,
} from "./certificate.service";
import type { Certificate } from "../entities/certificate.entity";
import { onCapture } from "../utils/yookassa.util";

export const router: Router = Router();

router
  .post(
    "/test-email",
    body("email").trim().isEmail(),
    expressAsyncHandler(async (req: Request, res: Response) => {
      await testEmail(req.body.email);
      res.send("ok");
    }),
  )

  .post(
    "/test",
    body("email").trim().isEmail(),
    body("count").default(1).isInt({ max: 100 }).toInt(),
    expressAsyncHandler(async (req: Request, res: Response) => {
      if (!validationResult(req).isEmpty() || req.body.token !== godToken) {
        throw createHttpError(400, "Ошибка валидации");
      }
      res.send({
        email: "asd@asd",
        price: 5000,
        createDate: new Date().toLocaleDateString(),
      });
    }),
  )

  .post(
    "/buy-certificate-free",
    body("email").trim().isEmail(),
    body("price").isInt({ min: 1 }).toInt(),
    body("count").default(1).isInt({ max: 100 }).toInt(),
    expressAsyncHandler(async (req, res) => {
      if (req.body.token !== godToken) {
        throw createHttpError["404"]();
      }
      if (!validationResult(req).isEmpty()) {
        throw createHttpError(400, "Ошибка валидации");
      }
      await createFREECertificate(req.body);
      res.send("ok");
    }),
  )

  // Сюда переходит фронт, при заказе сертификата
  .post(
    "/buy-certificate",
    body("email").trim().isEmail(),
    body("price").isInt({ min: 1 }).toInt(),
    body("count").default(1).isInt({ max: 100 }).toInt(),
    expressAsyncHandler(async (req: Request, res: Response) => {
      if (!validationResult(req).isEmpty()) {
        throw createHttpError(400, "Ошибка валидации");
      }

      await buyCertificate(req.body);
      res.redirect(`${hostFront}/thanks?email=${req.body.email}`);
    }),
  )

  // Сюда переходит сбер после оплаты (или если с заказом оплаты что то не так)
  .post(
    "/accept-buy-certificate",
    expressAsyncHandler(async (req: Request, res: Response) => {
      // if (!validationResult(req).isEmpty()) {
      //   throw createHttpError(400, "Ошибка валидации");
      // }
      switch (req.body.payment.status) {
        case "waiting_for_capture":
          await onCapture(req.body.payment);
          res.send({});
          break;
        case "succeeded":
          // eslint-disable-next-line no-case-declarations
          const email: string = await acceptTransaction(
            req.body.object.payment,
          );
          res.send({});
          // res.redirect(`${hostFront}/notification-mail.html?email=${email}`);
          break;
        default:
          throw createHttpError(400, "Ошибка");
          break;
      }
    }),
  )

  // Сюда переходят через qr код
  .get(
    "/check-certificate",
    query("encryptId").isString(),
    expressAsyncHandler(async (req: Request, res: Response) => {
      if (!validationResult(req).isEmpty()) {
        throw createHttpError(400, "Ошибка валидации");
      }
      const certificate: Certificate = await checkCertificate(
        String(req.query.encryptId),
      );
      res.send(certificate);
    }),
  )

  // Сюда переходят когда закрывают сертификат
  .get(
    "/close-certificate",
    query("encryptId").isString(),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const certificate: Certificate = await acceptCertificate(
        String(req.query.encryptId),
      );
      // кидать весь сертификат наверно нет нужды, но на всякий кинул
      res.send(certificate);
    }),
  )

  // Сюда переходят для просмотра всех сертификатов
  .get(
    "/table-certificates",
    query("page").default(0).isInt({ min: 0 }).toInt(),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const page = Number(req.query.page ?? 0);
      const { orders, countCertificate, totalPages } =
        await getCertificatesList(page);
      res.render("table-certificates", {
        title: "Hello",
        currentPage: page,
        orders,
        countCertificate,
        totalPages,
      });
    }),
  );
