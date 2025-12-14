import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { GameService } from './game.service';
import { SandboxModule } from 'src/sandbox/sandbox.module';
import { GameController } from './game.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), SandboxModule],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}



