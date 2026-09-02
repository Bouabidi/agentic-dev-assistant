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
import { DEFAULT_TASK_PRIORITY, TASK_PRIORITIES, TaskPriority } from './task';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  private validatePriorityValue(
    priority: unknown,
    fieldName = 'Task priority',
  ): TaskPriority {
    if (priority === undefined) {
      return DEFAULT_TASK_PRIORITY;
    }

    if (typeof priority !== 'string') {
      throw new BadRequestException(
        `${fieldName} must be one of: low, medium, high`,
      );
    }

    const normalizedPriority = priority.trim();

    if (normalizedPriority === '') {
      throw new BadRequestException(
        `${fieldName} must be one of: low, medium, high`,
      );
    }

    if (!TASK_PRIORITIES.includes(normalizedPriority as TaskPriority)) {
      throw new BadRequestException(
        `${fieldName} must be one of: low, medium, high`,
      );
    }

    return normalizedPriority as TaskPriority;
  }

  private validateDueDateValue(dueDate: unknown): string | undefined {
    if (dueDate === undefined) {
      return undefined;
    }

    if (typeof dueDate !== 'string') {
      throw new BadRequestException(
        'Task dueDate must be a valid ISO date or datetime',
      );
    }

    const trimmedDueDate = dueDate.trim();

    if (trimmedDueDate === '' || Number.isNaN(Date.parse(trimmedDueDate))) {
      throw new BadRequestException(
        'Task dueDate must be a valid ISO date or datetime',
      );
    }

    return trimmedDueDate;
  }

  private validateCreateTaskInput(body: {
    title?: unknown;
    description?: unknown;
    priority?: unknown;
    dueDate?: unknown;
  }): void {
    if (body.title === undefined) {
      throw new BadRequestException('Task title is required');
    }

    if (typeof body.title !== 'string') {
      throw new BadRequestException('Task title must be a string');
    }

    if (body.title.trim() === '') {
      throw new BadRequestException('Task title must be a non-empty string');
    }

    if (
      body.description !== undefined &&
      typeof body.description !== 'string'
    ) {
      throw new BadRequestException('Task description must be a string');
    }

    if (body.priority !== undefined) {
      this.validatePriorityValue(body.priority);
    }

    if (body.dueDate !== undefined) {
      this.validateDueDateValue(body.dueDate);
    }
  }

  private validateUpdateTaskInput(body: {
    title?: unknown;
    description?: unknown;
    completed?: unknown;
    priority?: unknown;
    dueDate?: unknown;
  }): void {
    if (body.title !== undefined) {
      if (typeof body.title !== 'string') {
        throw new BadRequestException('Task title must be a string');
      }

      if (body.title.trim() === '') {
        throw new BadRequestException('Task title must be a non-empty string');
      }
    }

    if (
      body.description !== undefined &&
      typeof body.description !== 'string'
    ) {
      throw new BadRequestException('Task description must be a string');
    }

    if (body.completed !== undefined && typeof body.completed !== 'boolean') {
      throw new BadRequestException('Task completed must be a boolean');
    }

    if (body.priority !== undefined) {
      this.validatePriorityValue(body.priority);
    }

    if (body.dueDate !== undefined) {
      this.validateDueDateValue(body.dueDate);
    }
  }

  private validateCompleteManyInput(body: { taskIds?: unknown }): number[] {
    if (body.taskIds === undefined) {
      throw new BadRequestException('Task IDs are required');
    }

    if (!Array.isArray(body.taskIds)) {
      throw new BadRequestException('Task IDs must be an array of numbers');
    }

    if (body.taskIds.length === 0) {
      throw new BadRequestException('Task IDs must not be empty');
    }

    const taskIds = body.taskIds.map((id) => {
      if (typeof id !== 'number' || !Number.isInteger(id)) {
        throw new BadRequestException('Task IDs must be an array of numbers');
      }

      return id;
    });

    return taskIds;
  }

  @Get('stats')
  stats() {
    return this.tasksService.stats();
  }

  @Get('summary')
  summary() {
    return this.tasksService.summary();
  }

  @Get('search')
  search(@Query('q') q?: string) {
    if (q === undefined) {
      throw new BadRequestException('Search query is required');
    }

    if (typeof q !== 'string') {
      throw new BadRequestException('Search query must be a non-empty string');
    }

    const trimmedQuery = q.trim();

    if (trimmedQuery === '') {
      throw new BadRequestException('Search query must be a non-empty string');
    }

    return this.tasksService.search(trimmedQuery);
  }

  @Get()
  findAll(
    @Query('completed') completed?: string,
    @Query('priority') priority?: string,
  ) {
    if (
      completed !== undefined &&
      completed !== 'true' &&
      completed !== 'false'
    ) {
      throw new BadRequestException(
        'The completed query parameter must be true or false',
      );
    }

    const normalizedPriority =
      priority === undefined ? undefined : this.validatePriorityValue(priority);

    return this.tasksService.findAll(
      completed === undefined ? undefined : completed === 'true',
      normalizedPriority,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(Number(id));
  }

  @Post()
  create(
    @Body()
    body: {
      title?: unknown;
      description?: unknown;
      priority?: unknown;
      dueDate?: unknown;
    },
  ) {
    this.validateCreateTaskInput(body);

    return this.tasksService.create(
      body.title as string,
      body.description as string | undefined,
      body.priority === undefined
        ? DEFAULT_TASK_PRIORITY
        : this.validatePriorityValue(body.priority),
      this.validateDueDateValue(body.dueDate),
    );
  }

  @Patch('complete')
  completeMany(
    @Body()
    body: {
      taskIds?: unknown;
    },
  ) {
    const taskIds = this.validateCompleteManyInput(body);

    return this.tasksService.completeMany(taskIds);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: unknown;
      description?: unknown;
      completed?: unknown;
      priority?: unknown;
      dueDate?: unknown;
    },
  ) {
    this.validateUpdateTaskInput(body);

    return this.tasksService.update(
      Number(id),
      body as {
        title?: string;
        description?: string;
        completed?: boolean;
        priority?: TaskPriority;
        dueDate?: string;
      },
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(Number(id));
  }
}
