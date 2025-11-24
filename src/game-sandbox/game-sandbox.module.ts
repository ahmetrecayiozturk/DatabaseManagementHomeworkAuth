import { Module } from '@nestjs/common';
import { GameSandboxController } from './game-sandbox.controller';
import { GameSandboxService } from './game-sandbox.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SandboxRecord } from './sandbox.record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SandboxRecord])],
  controllers: [GameSandboxController],
  providers: [GameSandboxService],
  exports: [GameSandboxService],
})
export class GameSandboxModule {}
