import { DataSource } from "typeorm";
import { Certificate } from "./entities/certificate.entity";

export const myDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "root",
  database: "certificate",
  entities: [Certificate],
  logging: false,
  synchronize: true,
});
