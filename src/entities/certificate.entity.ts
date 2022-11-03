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

  @Column()
  accept!: boolean;

  @Column()
  create_date!: Date;
}
