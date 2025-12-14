import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Sandbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: number;

  @Column({ nullable: true })
  dbUsername: string;

  @Column({ nullable: true })
  dbPassword: string;
}
