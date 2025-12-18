import { Controller, Get } from '@nestjs/common';
import { SandboxService } from 'src/sandbox/sandbox.service';

@Controller('creator')
export class CreatorController {

    constructor(private readonly sandboxService: SandboxService) {}

      @Get('tables')
      async getTables(): Promise<any> {
        return this.sandboxService.getTablesFromTemplate();
      }

}
