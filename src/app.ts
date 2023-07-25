import express, {NextFunction, Request, Response} from "express";
import type { Express } from "express";
import { config } from "dotenv";
import { router } from "./certificate/certificate.controller";
import { dataSource } from "./app-data-source";
import { HTTP_HOST, HTTP_PORT, urlSberPayment } from "./config/index";
import cors from "cors";
import { initMail } from "./utils/mail.util";

async function start(): Promise<void> {
  config();
  await initMail();

  const app: Express = express();

  app.set('view engine', 'ejs');

  app.use(express.static('static'));

  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const date = new Date();
    console.log(`${date.toLocaleDateString()}, ${date.toLocaleTimeString()} | ${req.method} | ${req.url}`);
    console.group();
      console.log(`body:`);
      console.group();
        console.log(req.body);
      console.groupEnd();
      console.log(`query:`);
      console.group();
        console.log(req.query);
      console.groupEnd();
      console.log(`params:`);
      console.group();
        console.log(req.params);
      console.groupEnd();
    console.groupEnd();
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
