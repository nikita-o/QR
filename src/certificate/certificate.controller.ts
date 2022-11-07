import { HTTP_HOST } from "../config/index";
import { Request, Response, Router } from "express";
import {
  createCertificate,
  acceptCertificate,
  checkCertificate,
} from "./certificate.service";

export const router: Router = Router();

router
  .post("/create-certificate", async (req: Request, res: Response) => {
    try {
      await createCertificate(req.body);
      res.send("Create");
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
