import { DataSource } from "typeorm";
import { Certificate } from "./entities/certificate.entity";
import { Order } from "./entities/order.entity";
import * as process from "process";
import { DB_pass, DB_username } from "./config";

export function connect() {
  return new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: DB_username,
    password: DB_pass,
    database: "certificate",
    entities: [Order, Certificate],
    logging: false,
    synchronize: true,
  });
}
