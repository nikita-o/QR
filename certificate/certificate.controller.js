import express from "express";
import { createCertificate, acceptCertificate } from "./certificate.service.js";
export const router = express.Router();

/* GET home page. */
router
  .post("/create-certificate", function (req, res) {
    createCertificate(req.body);
    res.send("Create");
  })

  .get("/close-certificate/:encryptId", function (req, res) {
    console.log(req.params);
    res.send(acceptCertificate(req.params.encryptId));
    // res.send("True");
  });
