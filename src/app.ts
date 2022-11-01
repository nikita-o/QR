import express, {Express} from "express";
//import logger from "morgan";
import { router } from "./certificate/certificate.controller";

const app: Express = express();

//app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

app.listen(3000, () => {
  console.log(`Server: http://localhost:3000`);
});
