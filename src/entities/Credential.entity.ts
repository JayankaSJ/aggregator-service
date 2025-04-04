import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "credentials" })
export class Credential {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  source!: string;

  @Column({ type: "varchar", length: 512 })
  token!: string;

  @Column({ type: "varchar", length: 512 })
  endpoint!: string;
}
