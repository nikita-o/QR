import { Request, Response, Router } from "express";
import { createCertificate, acceptCertificate } from "./certificate.service";

export const router: Router = Router();

router
  .post("/create-certificate", async (req: Request, res: Response) => {
    await createCertificate(req.body);
    res.send("Create");
  })

  .get("/close-certificate", (req: Request, res: Response) => {
    console.log(req.query);
    res.send(acceptCertificate(String(req.query.encryptId)));
    // res.send("True");
  });
