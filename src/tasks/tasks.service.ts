import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './task';

@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [
    {
      id: 1,
      title: 'Learn GH-600',
      description: 'Study Agentic AI Systems',
      completed: false,
    },
  ];

  findAll(completed?: boolean): Task[] {
    if (completed === undefined) {
      return this.tasks;
    }

    return this.tasks.filter((task) => task.completed === completed);
  }

  search(query: string): Task[] {
    const normalizedQuery = query.trim().toLowerCase();

    return this.tasks.filter((task) => {
      const title = task.title.toLowerCase();
      const description = (task.description ?? '').toLowerCase();

      return (
        title.includes(normalizedQuery) || description.includes(normalizedQuery)
      );
    });
  }

  stats(): { total: number; completed: number; incomplete: number } {
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

    return task;
  }

  create(title: string, description?: string): Task {
    const task: Task = {
      id: this.tasks.length + 1,
      title,
      description,
      completed: false,
    };

    this.tasks.push(task);

    return task;
  }

  update(id: number, updates: Partial<Task>): Task {
    const task = this.findOne(id);

    Object.assign(task, updates);

    return task;
  }

  completeMany(taskIds: number[]): Task[] {
    if (taskIds.length === 0) {
      throw new NotFoundException('Task IDs must not be empty');
    }

    const uniqueTaskIds = [...new Set(taskIds)];
    const tasksToUpdate = uniqueTaskIds.map((id) => this.findOne(id));

    tasksToUpdate.forEach((task) => {
      task.completed = true;
    });

    return tasksToUpdate;
  }

  remove(id: number): Task {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    const [removedTask] = this.tasks.splice(taskIndex, 1);
    return removedTask;
  }
}
