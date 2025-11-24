import { Module } from '@nestjs/common';
import { GameSandboxController } from './game-sandbox.controller';
import { GameSandboxService } from './game-sandbox.service';

@Module({
  controllers: [GameSandboxController],
  providers: [GameSandboxService]
})
export class GameSandboxModule {}
