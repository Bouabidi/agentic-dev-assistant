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

  findAll(): Task[] {
    return this.tasks;
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
