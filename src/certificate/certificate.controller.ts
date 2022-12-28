import { Router } from "express";
import type { Request, Response } from "express";
import { hostFront, HTTP_HOST } from "../config/index";
import {
  acceptCertificate,
  checkCertificate, acceptTransaction, buyCertificate,
} from "./certificate.service";
import { Certificate } from "../entities/certificate.entity";

export const router: Router = Router();

router
  .get('/test', async (req: Request, res: Response) => {
    console.log('test');
    console.log(req.body);
    console.log(req.query);
    console.log(req.params);
    res.send({email: 'asd@asd', price: 5000, createDate: new Date().toLocaleDateString()});
  })

  .post("/buy-certificate", async (req: Request, res: Response) => {
    try {
      const url = await buyCertificate(req.body);
      res.redirect(url); // может стоит строчку url кидать, а не редиректить
    } catch (error: any) {
      res
        .status(error.status || 500)
        .send({ message: error.message || "Ошибка!" });
    }
  })

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

  .get("/check-certificate", async (req: Request, res: Response) => {
    try {
      const certificate = await checkCertificate(String(req.query.encryptId));
      res.send(certificate);
    } catch (error: any) {
      res
        .status(error.status || 500)
        .send({ message: error.message || "Ошибка!" });
    }
  })

  .get("/close-certificate", async (req: Request, res: Response) => {
    try {
      const certificate: Certificate = await acceptCertificate(String(req.query.encryptId));
      // кидать весь сертификат наверно нет нужды, но на всякий кинул
      res.send(certificate);
    } catch (error: any) {
      res
        .status(error.status || 500)
        .send({ message: error.message || "Ошибка!" });
    }
  });
