import { DataSource } from "typeorm";
import { Certificate } from "./entities/certificate.entity";

export const myDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5433,
  username: "postgres",
  password: "postgres",
  database: "certificate",
  entities: [Certificate],
  logging: false,
  synchronize: true,
});
