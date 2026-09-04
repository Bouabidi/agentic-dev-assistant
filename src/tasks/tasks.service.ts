import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DEFAULT_TASK_PRIORITY,
  TASK_CATEGORIES,
  TASK_STATUSES,
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from './task';

@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [
    {
      id: 1,
      title: 'Learn GH-600',
      description: 'Study Agentic AI Systems',
      completed: false,
      priority: DEFAULT_TASK_PRIORITY,
    },
  ];

  private ensureTaskPriority(task: Partial<Task>): Task {
    if (task.priority === undefined) {
      task.priority = DEFAULT_TASK_PRIORITY;
    }

    return task as Task;
  }

  private validateCategoryValue(
    category: TaskCategory | undefined,
  ): TaskCategory | undefined {
    if (
      category !== undefined &&
      !TASK_CATEGORIES.includes(category as TaskCategory)
    ) {
      throw new BadRequestException(
        'Task category must be one of: work, personal, learning, development, other',
      );
    }

    return category;
  }

  private getCompletedForStatus(status: TaskStatus): boolean {
    return status === 'done';
  }

  private validateStatusValue(status: unknown): TaskStatus | undefined {
    if (status === undefined) {
      return undefined;
    }

    if (typeof status !== 'string' || !TASK_STATUSES.includes(status as TaskStatus)) {
      throw new BadRequestException(
        'Task status must be one of: todo, in_progress, done',
      );
    }

    return status as TaskStatus;
  }

  private validateStatusCompletedConsistency(
    status: TaskStatus | undefined,
    completed: boolean | undefined,
  ): void {
    if (status === undefined || completed === undefined) {
      return;
    }

    if (this.getCompletedForStatus(status) !== completed) {
      throw new BadRequestException(
        'Task status and completed values must be consistent',
      );
    }
  }

  findAll(completed?: boolean, priority?: TaskPriority, tag?: string): Task[] {
    return this.tasks.filter((task) => {
      const ensuredTask = this.ensureTaskPriority(task);
      const matchesCompleted =
        completed === undefined || ensuredTask.completed === completed;
      const matchesPriority =
        priority === undefined || ensuredTask.priority === priority;
      const matchesTag =
        tag === undefined ||
        (Array.isArray(ensuredTask.tags) && ensuredTask.tags.includes(tag));

      return matchesCompleted && matchesPriority && matchesTag;
    });
  }

  search(query: string): Task[] {
    const normalizedQuery = query.trim().toLowerCase();

    return this.tasks.filter((task) => {
      this.ensureTaskPriority(task);
      const title = task.title.toLowerCase();
      const description = (task.description ?? '').toLowerCase();

      return (
        title.includes(normalizedQuery) || description.includes(normalizedQuery)
      );
    });
  }

  stats(): { total: number; completed: number; incomplete: number } {
    this.tasks.forEach((task) => this.ensureTaskPriority(task));
    const completed = this.tasks.filter((task) => task.completed).length;

    return {
      total: this.tasks.length,
      completed,
      incomplete: this.tasks.length - completed,
    };
  }

  summary(): {
    total: number;
    completed: number;
    incomplete: number;
    completionPercentage: number;
  } {
    const { total, completed, incomplete } = this.stats();
    const completionPercentage =
      total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      incomplete,
      completionPercentage,
    };
  }

  findOne(id: number): Task {
    const task = this.tasks.find((task) => task.id === id);

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return this.ensureTaskPriority(task);
  }

  create(
    title: string,
    description?: string,
    priority: TaskPriority = DEFAULT_TASK_PRIORITY,
    dueDate?: string,
    tags?: string[],
    category?: TaskCategory,
    status?: TaskStatus,
    completed?: boolean,
  ): Task {
    this.validateCategoryValue(category);
    const validatedStatus = this.validateStatusValue(status);
    this.validateStatusCompletedConsistency(validatedStatus, completed);
    const resolvedCompleted =
      validatedStatus === undefined
        ? completed ?? false
        : this.getCompletedForStatus(validatedStatus);

    const task: Task = {
      id: this.tasks.length + 1,
      title,
      description,
      completed: resolvedCompleted,
      priority,
      dueDate,
      tags,
      category,
      status: validatedStatus,
    };

    this.tasks.push(task);

    return this.ensureTaskPriority(task);
  }

  update(id: number, updates: Partial<Task>): Task {
    const task = this.findOne(id);

    this.validateCategoryValue(updates.category);
    const validatedStatus = this.validateStatusValue(updates.status);

    if (
      updates.completed !== undefined &&
      typeof updates.completed !== 'boolean'
    ) {
      throw new BadRequestException('Task completed must be a boolean');
    }

    this.validateStatusCompletedConsistency(
      validatedStatus ?? task.status,
      updates.completed,
    );

    const validatedUpdates = { ...updates };

    if (validatedStatus !== undefined && updates.completed === undefined) {
      validatedUpdates.completed = this.getCompletedForStatus(validatedStatus);
    }

    Object.assign(task, validatedUpdates);
    const storedTask = this.tasks.find((entry) => entry.id === id);

    if (storedTask) {
      Object.assign(storedTask, validatedUpdates);
      if (storedTask.priority === undefined) {
        storedTask.priority = DEFAULT_TASK_PRIORITY;
      }
    }

    return this.ensureTaskPriority(task);
  }

  completeMany(taskIds: number[]): Task[] {
    if (taskIds.length === 0) {
      throw new NotFoundException('Task IDs must not be empty');
    }

    const uniqueTaskIds = [...new Set(taskIds)];
    const tasksToUpdate = uniqueTaskIds.map((id) => this.findOne(id));

    tasksToUpdate.forEach((task) => {
      const storedTask = this.tasks.find((entry) => entry.id === task.id);
      if (storedTask) {
        storedTask.completed = true;
        if (storedTask.status !== undefined) {
          storedTask.status = 'done';
        }
      }
      task.completed = true;
      if (task.status !== undefined) {
        task.status = 'done';
      }
    });

    return tasksToUpdate.map((task) => this.ensureTaskPriority(task));
  }

  remove(id: number): Task {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    const [removedTask] = this.tasks.splice(taskIndex, 1);
    return this.ensureTaskPriority(removedTask);
  }
}
