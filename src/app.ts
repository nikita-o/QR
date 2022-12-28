import express from "express";
import type { Express } from "express";
import path from "path";
import { config } from "dotenv";
import cors from "cors";
import { router } from "./certificate/certificate.controller";
import { myDataSource } from "./app-data-source";
import { HTTP_HOST, HTTP_PORT } from "./config/index";

async function start(): Promise<void> {
  config();

  const app: Express = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.set("view engine", "ejs");
  app.set("views", path.join("src", "views"));
  app.use(cors());

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
