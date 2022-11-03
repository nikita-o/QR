import { Request, Response, Router } from "express";
import { createCertificate, acceptCertificate } from "./certificate.service";

export const router: Router = Router();

router
  .post("/create-certificate", async (req: Request, res: Response) => {
    await createCertificate(req.body);
    res.send("Create");
  })

  .get("/close-certificate", async (req: Request, res: Response) => {
    console.log(req.query);
    const certificate = await acceptCertificate(String(req.query.encryptId));
    // res.send(certificate);
    res.render("certificate", { certificate });
    // res.send("True");
  });
