import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn()
  id!: string;

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
