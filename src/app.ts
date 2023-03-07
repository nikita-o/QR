import express, {NextFunction, Request, Response} from "express";
import type { Express } from "express";
import { config } from "dotenv";
import { router } from "./certificate/certificate.controller";
import { dataSource } from "./app-data-source";
import { HTTP_HOST, HTTP_PORT, urlSberPayment } from "./config/index";
import cors from "cors";
import crypto from "crypto";

async function start(): Promise<void> {
  config();

  const app: Express = express();

  app.set('view engine', 'ejs');

  app.use(express.static('static'));

  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} : ${req.url}`);
    console.log(`body:`);
    console.log(req.body);
    console.log(`query:`);
    console.log(req.query);
    console.log(`params:`);
    console.log(req.params);
    next()
  });

  app.use("/", router);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`error ${err.status} : ${err.message}`);
    res.render('error', {
      status: err.status || 500,
      message: err.message || "Ошибка!",
    });
  });

  dataSource
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
