import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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
  // Лишний раз не трогаю, чтобы не поломать БД
  koi, // hotel (раньше была IZAKAYA-KOI)
  urta, // ЮРТА ЧИНГИСХАНА
  whiskey, // Академия Виски
  wineTasting, // Винная дегустация
  DateInACC, // Свидание в АКК
  steam, // Академия Пара
}

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Order)
  order!: Order;

  @Column()
  orderId!: string;

  @Column()
  price!: number;

  @Column({
    type: "enum",
    enum: ERestaurant,
    default: ERestaurant.edin,
  })
  restaurant!: ERestaurant;

  @Column({
    type: "enum",
    enum: EStatusCertificate,
    default: EStatusCertificate.WaitPayment,
  })
  status!: EStatusCertificate;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
