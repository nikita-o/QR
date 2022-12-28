import express, { NextFunction } from "express";
import type { Express } from "express";
import path from "path";
import { config } from "dotenv";
import { router } from "./certificate/certificate.controller";
import { myDataSource } from "./app-data-source";
import { HTTP_HOST, HTTP_PORT } from "./config/index";
import cors from "cors";

async function start(): Promise<void> {
  config();

  const app: Express = express();

  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/", router);

  myDataSource
    .initialize()
    .then(() => {
      app.listen(HTTP_PORT, () => {
        console.log(`Server: ${HTTP_HOST}`);
      });
    })
    .catch((err: any) => {
      console.error("Error during Data Source initialization:", err);
    });
}

start();
