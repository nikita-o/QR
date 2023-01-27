import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Certificate } from "./certificate.entity";

export enum EStatusOrder {
  Payment,
  WaitPayment,
}

@Entity()
export class Order {
  @PrimaryColumn()
  id!: string;

  @OneToMany(() => Certificate, (certificate) => certificate.order)
  certificates!: Certificate[];

  @Column({unique: true})
  externalId!: string;

  @Column()
  formUrl!: string;

  @Column({ nullable: true })
  email!: string;

  // сумма сертификатов
  @Column()
  price!: number;

  @Column({
    type: 'enum',
    enum: EStatusOrder,
    default: EStatusOrder.WaitPayment,
  })
  status!: EStatusOrder;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}