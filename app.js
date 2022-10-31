import express from "express";
import logger from "morgan";

// const indexRouter = require("./routes/index");
import { router } from "./routes/index.js";
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

app.listen(3000, () => {
  console.log(`Server: http://localhost:3000`);
});
