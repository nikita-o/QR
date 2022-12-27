import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";

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

  @Column({ default: false })
  acceptUsing!: boolean;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createDate!: Date;

  @Column({ default: false })
  acceptPayment!: boolean;
}
