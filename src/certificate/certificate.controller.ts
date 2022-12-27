import { Router } from "express";
import type { Request, Response } from "express";
import { HTTP_HOST } from "../config/index";
import {
  acceptCertificate,
  checkCertificate, acceptTransaction, buyCertificate,
} from "./certificate.service";

export const router: Router = Router();

router
  .get('/test', async (req: Request, res: Response) => {
    console.log(req.body);
    console.log(req.query);
    console.log(req.params);
    res.send();
  })

  .post("/buy-certificate", async (req: Request, res: Response) => {
    try {
      const url = await buyCertificate(req.body);
      //res.send(url);
      res.redirect(url);
    } catch (error) {
      res.render("error", { error });
    }
  })

  .get("/accept-buy-certificate", async (req: Request, res: Response) => {
    try {
      const email: string = await acceptTransaction(req.query.orderId as string);
      res.send(`Транзакция подтверждена, сертификат отправлен на почту ${email}`);
    } catch (error) {
      res.render("error", { error });
    }
  })

  .get("/check-certificate", async (req: Request, res: Response) => {
    try {
      const certificate = await checkCertificate(String(req.query.encryptId));
      res.render("certificate", {
        certificate,
        urlAccept: `${HTTP_HOST}/close-certificate/?encryptId=${req.query.encryptId}`,
        encryptId: req.query.encryptId,
      });
    } catch (error) {
      res.render("error", { error });
    }
  })

  .get("/close-certificate", async (req: Request, res: Response) => {
    try {
      await acceptCertificate(String(req.query.encryptId));
      res.send("ok");
    } catch (error) {
      res.render("error", { error });
    }
  });
