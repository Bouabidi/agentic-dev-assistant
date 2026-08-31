import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('stats')
  stats() {
    return this.tasksService.stats();
  }

  @Get()
  findAll(@Query('completed') completed?: string) {
    if (completed === undefined) {
      return this.tasksService.findAll();
    }

    if (completed !== 'true' && completed !== 'false') {
      throw new BadRequestException(
        'The completed query parameter must be true or false',
      );
    }

    return this.tasksService.findAll(completed === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(Number(id));
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      description?: string;
    },
  ) {
    return this.tasksService.create(body.title, body.description);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      completed?: boolean;
    },
  ) {
    return this.tasksService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(Number(id));
  }
}
