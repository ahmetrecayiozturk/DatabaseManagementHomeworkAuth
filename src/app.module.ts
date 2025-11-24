import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameSandboxModule } from './game-sandbox/game-sandbox.module';

@Module({
  imports: [GameSandboxModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
