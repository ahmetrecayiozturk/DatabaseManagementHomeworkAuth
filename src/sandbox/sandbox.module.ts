import { Module } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sandbox } from './sandbox.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sandbox])],
  providers: [SandboxService],
  exports: [SandboxService],
})
export class SandboxModule {}
