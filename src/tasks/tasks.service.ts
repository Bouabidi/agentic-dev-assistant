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

  stats(): { total: number; completed: number; incomplete: number } {
    const completed = this.tasks.filter((task) => task.completed).length;

    return {
      total: this.tasks.length,
      completed,
      incomplete: this.tasks.length - completed,
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
}
