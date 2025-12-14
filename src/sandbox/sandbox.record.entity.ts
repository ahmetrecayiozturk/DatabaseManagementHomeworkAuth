import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class SandboxRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  dbUsername: string;

  @Column({ nullable: true })
  dbPassword: string;
}
