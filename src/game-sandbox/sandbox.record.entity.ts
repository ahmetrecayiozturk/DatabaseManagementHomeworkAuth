import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SandboxStatus } from './sandbox.status.enum';

@Entity()
export class SandboxRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: SandboxStatus,
    default: SandboxStatus.RECORD_CREATED,
  })
  status: SandboxStatus;
}
