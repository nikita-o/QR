import { DataSource } from "typeorm";
import { Certificate } from "./entities/certificate.entity";
import { Transaction } from "./entities/transaction.entity";

export const myDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5433,
  username: "postgres",
  password: "postgres",
  database: "certificate",
  entities: [Certificate, Transaction],
  logging: false,
  synchronize: true,
});
