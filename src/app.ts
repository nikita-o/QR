import express, { NextFunction } from "express";
import type { Express } from "express";
import path from "path";
import { config } from "dotenv";
import { router } from "./certificate/certificate.controller";
import { myDataSource } from "./app-data-source";
import { HTTP_HOST, HTTP_PORT } from "./config/index";
import cors from "cors";
import * as https from "https";
import fs from "fs";

async function start(): Promise<void> {
  config();

  // For https
  const options = {
    key: fs.readFileSync('./ssl/privatekey.pem'),
    cert: fs.readFileSync('./ssl/certificate.pem'),
  };

  const app: Express = express();

  app.set('view engine', 'ejs');

  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/", router);

  const server = https.createServer(options, app);

  myDataSource
    .initialize()
    .then(() => {
      server.listen(HTTP_PORT, () => {
        console.log(`Server: ${HTTP_HOST}`);
      });
    })
    .catch((err: any) => {
      console.error("Error during Data Source initialization:", err);
    });
}

start();
