import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should reject invalid completion filters', () => {
    expect(() => controller.findAll('anything')).toThrow(
      'The completed query parameter must be true or false',
    );
  });

  it('should return task statistics', () => {
    expect(controller.stats()).toEqual({
      total: 1,
      completed: 0,
      incomplete: 1,
    });
  });

  it('should delete a task', () => {
    expect(controller.remove('1')).toEqual({
      id: 1,
      title: 'Learn GH-600',
      description: 'Study Agentic AI Systems',
      completed: false,
    });
  });

  it('should throw when deleting a missing task', () => {
    expect(() => controller.remove('999')).toThrow('Task 999 not found');
  });
});
