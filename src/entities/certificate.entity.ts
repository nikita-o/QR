import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";

export enum EStatusCertificate {
  Free,
  Close,
  WaitPayment,
  Expired,
}

@Entity()
export class Certificate {
  @PrimaryColumn()
  id!: string;

  @Column()
  orderId!: string;

  @Column()
  formUrl!: string;

  @Column({ nullable: true })
  email!: string;

  @Column()
  price!: number;

  @Column()
  restaurant!: string;

  @Column({
    type: 'enum',
    enum: EStatusCertificate,
    default: EStatusCertificate.WaitPayment,
  })
  status!: EStatusCertificate;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createDate!: Date;
}
