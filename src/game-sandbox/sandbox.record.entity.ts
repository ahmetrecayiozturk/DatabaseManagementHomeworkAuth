import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SandboxRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;
}