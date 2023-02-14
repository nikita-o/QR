import { DataSource } from "typeorm";
import { Certificate } from "./entities/certificate.entity";
import { Order } from "./entities/order.entity";
import * as process from "process";

export const myDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "certificate",
  entities: [Order, Certificate],
  logging: false,
  synchronize: true,
});
