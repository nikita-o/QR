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
  Payment,
  WaitPayment,
  Close,
  Expired,
}

export enum ERestaurant {
  edin, // ЕДИНЫЙ СЕРТИФИКАТ
  fame, // FAME PASTA E VINO
  hinkal, // АКАДЕМИЯ ХИНКАЛИ
  kavkaz, // АКАДЕМИЯ КАВКАЗСКОЙ КУХНИ
  koi, // IZAKAYA-KOI
  urta, // ЮРТА ЧИНГИСХАНА
}

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order)
  order!: Order;
  @Column()
  orderId!: string;

  @Column()
  price!: number;

  @Column({
    type: 'enum',
    enum: ERestaurant,
    default: ERestaurant.edin,
  })
  restaurant!: ERestaurant;

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
