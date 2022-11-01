import {Request, Response, Router} from "express";
import { createCertificate, acceptCertificate } from "./certificate.service";

export const router: Router = Router();

router
  .post("/create-certificate", async (req: Request, res: Response) => {
    await createCertificate(req.body);
    res.send("Create");
  })

  .get("/close-certificate/:encryptId", function (req: Request, res: Response) {
    console.log(req.params);
    res.send(acceptCertificate(req.params.encryptId));
    // res.send("True");
  });
