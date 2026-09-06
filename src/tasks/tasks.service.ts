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
  TaskFilters,
  TaskPriority,
  TaskReport,
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

    if (
      typeof status !== 'string' ||
      !TASK_STATUSES.includes(status as TaskStatus)
    ) {
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

  findAll(filters?: TaskFilters): Task[];
  findAll(completed?: boolean, priority?: TaskPriority, tag?: string): Task[];
  findAll(
    filtersOrCompleted?: TaskFilters | boolean,
    priority?: TaskPriority,
    tag?: string,
  ): Task[] {
    const filters: TaskFilters =
      typeof filtersOrCompleted === 'object'
        ? filtersOrCompleted
        : { completed: filtersOrCompleted, priority, tag };

    return this.tasks.filter((task) => {
      const taskPriority = task.priority ?? DEFAULT_TASK_PRIORITY;
      const matchesStatus =
        filters.status === undefined || task.status === filters.status;
      const matchesCompleted =
        filters.completed === undefined || task.completed === filters.completed;
      const matchesPriority =
        filters.priority === undefined || taskPriority === filters.priority;
      const matchesCategory =
        filters.category === undefined || task.category === filters.category;
      const matchesTag =
        filters.tag === undefined ||
        (Array.isArray(task.tags) && task.tags.includes(filters.tag));

      return (
        matchesStatus &&
        matchesCompleted &&
        matchesPriority &&
        matchesCategory &&
        matchesTag
      );
    });
  }

  report(): TaskReport {
    const report: TaskReport = {
      total: 0,
      completed: 0,
      incomplete: 0,
      statusCounts: {
        todo: 0,
        in_progress: 0,
        done: 0,
        withoutStatus: 0,
      },
      priorityCounts: {
        low: 0,
        medium: 0,
        high: 0,
      },
      categoryCounts: {
        work: 0,
        personal: 0,
        learning: 0,
        development: 0,
        other: 0,
        uncategorized: 0,
      },
    };

    this.tasks.forEach((task) => {
      report.total += 1;

      if (task.completed) {
        report.completed += 1;
      } else {
        report.incomplete += 1;
      }

      if (task.status === undefined) {
        report.statusCounts.withoutStatus += 1;
      } else {
        report.statusCounts[task.status] += 1;
      }

      const priority = task.priority ?? DEFAULT_TASK_PRIORITY;
      report.priorityCounts[priority] += 1;

      if (task.category === undefined) {
        report.categoryCounts.uncategorized += 1;
      } else {
        report.categoryCounts[task.category] += 1;
      }
    });

    return report;
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
        ? (completed ?? false)
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
