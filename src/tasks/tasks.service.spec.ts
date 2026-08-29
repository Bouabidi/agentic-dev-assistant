import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should return tasks', () => {
    const tasks = service.findAll();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Learn GH-600');
  });

  it('should return completed tasks when filtered', () => {
    service.findAll()[0].completed = true;

    const tasks = service.findAll(true);

    expect(tasks).toHaveLength(1);
    expect(tasks[0].completed).toBe(true);
  });

  it('should return incomplete tasks when filtered', () => {
    const tasks = service.findAll(false);

    expect(tasks).toHaveLength(1);
    expect(tasks[0].completed).toBe(false);
  });

  it('should return task statistics', () => {
    expect(service.stats()).toEqual({
      total: 1,
      completed: 0,
      incomplete: 1,
    });
  });

  it('should update task statistics after completing a task', () => {
    service.findAll()[0].completed = true;

    expect(service.stats()).toEqual({
      total: 1,
      completed: 1,
      incomplete: 0,
    });
  });

  it('should update task statistics after creating a task', () => {
    service.create('Study MCP');

    expect(service.stats()).toEqual({
      total: 2,
      completed: 0,
      incomplete: 2,
    });
  });

  it('should delete a task', () => {
    const task = service.remove(1);

    expect(task.id).toBe(1);
    expect(service.findAll()).toHaveLength(0);
  });

  it('should throw when deleting a missing task', () => {
    expect(() => service.remove(999)).toThrow('Task 999 not found');
  });

  it('should update task statistics after deleting a task', () => {
    service.create('Study MCP');
    service.remove(1);

    expect(service.stats()).toEqual({
      total: 1,
      completed: 0,
      incomplete: 1,
    });
  });

  it('should create a task', () => {
    const task = service.create('Study MCP');

    expect(task.title).toBe('Study MCP');
    expect(task.completed).toBe(false);
  });
});
