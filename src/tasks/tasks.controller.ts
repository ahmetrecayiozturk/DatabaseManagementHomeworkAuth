import { Controller, Get } from '@nestjs/common';

@Controller('tasks')
export class TasksController {

    @Get()
    async getTaks(): Promise<any> {
      

        return "Tasks endpoint is working.";
    }


}
