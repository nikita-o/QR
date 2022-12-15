import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Certificate } from "./certificate.entity";

@Entity()
export class Transaction {
  @PrimaryColumn()
  orderId!: string;

  @Column()
  formUrl!: string;

  @ManyToOne(() => Certificate)
  certificate!: Certificate;
  @Column()
  certificateId!: string;
}