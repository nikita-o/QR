import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  email!: string;

  @Column()
  price!: number;

  @Column()
  restaurant!: string;

  @Column({ default: false })
  accept!: boolean;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  create_date!: Date;
}
