import { Module } from '@nestjs/common';
import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';
import { SandboxModule } from 'src/sandbox/sandbox.module';

@Module({
  imports: [SandboxModule],
  controllers: [CreatorController],
  providers: [CreatorService]
})
export class CreatorModule {}
