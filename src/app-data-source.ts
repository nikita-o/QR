import { Certificate } from "./entities/certificate.entity";
import { DataSource } from "typeorm";

export const myDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "root",
  database: "qr",
  entities: [Certificate],
  logging: false,
  synchronize: true,
});
