import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { Order } from "./order.entity";

export enum EStatusCertificate {
  Free,
  Close,
  WaitPayment,
  Expired,
}

@Entity()
export class Certificate {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => Order)
  order!: Order;
  @Column()
  orderId!: string;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
