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

  it('should return a task summary', () => {
    expect(controller.summary()).toEqual({
      total: 1,
      completed: 0,
      incomplete: 1,
      completionPercentage: 0,
    });
  });

  it('should delegate a valid bulk completion request', () => {
    expect(controller.completeMany({ taskIds: [1] })).toEqual([
      {
        id: 1,
        title: 'Learn GH-600',
        description: 'Study Agentic AI Systems',
        completed: true,
      },
    ]);
  });

  it('should reject a bulk completion request without taskIds', () => {
    expect(() => controller.completeMany({} as any)).toThrow(
      'Task IDs are required',
    );
  });

  it('should reject a bulk completion request with non-array taskIds', () => {
    expect(() => controller.completeMany({ taskIds: '1' as any })).toThrow(
      'Task IDs must be an array of numbers',
    );
  });

  it('should reject a bulk completion request with invalid IDs', () => {
    expect(() => controller.completeMany({ taskIds: [1, '2'] as any })).toThrow(
      'Task IDs must be an array of numbers',
    );
  });

  it('should reject an empty bulk completion array', () => {
    expect(() => controller.completeMany({ taskIds: [] })).toThrow(
      'Task IDs must not be empty',
    );
  });

  it('should search tasks with a valid query', () => {
    expect(controller.search('GH-600')).toEqual([
      {
        id: 1,
        title: 'Learn GH-600',
        description: 'Study Agentic AI Systems',
        completed: false,
      },
    ]);
  });

  it('should reject a missing search query', () => {
    expect(() => controller.search(undefined as any)).toThrow(
      'Search query is required',
    );
  });

  it('should reject an empty search query', () => {
    expect(() => controller.search('')).toThrow(
      'Search query must be a non-empty string',
    );
  });

  it('should reject a whitespace-only search query', () => {
    expect(() => controller.search('   ')).toThrow(
      'Search query must be a non-empty string',
    );
  });

  it('should reject creating a task without a title', () => {
    expect(() => controller.create({} as any)).toThrow(
      'Task title is required',
    );
  });

  it('should reject creating a task with an empty title', () => {
    expect(() => controller.create({ title: '' })).toThrow(
      'Task title must be a non-empty string',
    );
  });

  it('should reject creating a task with a whitespace-only title', () => {
    expect(() => controller.create({ title: '   ' })).toThrow(
      'Task title must be a non-empty string',
    );
  });

  it('should reject creating a task with a non-string title', () => {
    expect(() => controller.create({ title: 123 as any })).toThrow(
      'Task title must be a string',
    );
  });

  it('should reject creating a task with a non-string description', () => {
    expect(() =>
      controller.create({ title: 'Study', description: 42 as any }),
    ).toThrow('Task description must be a string');
  });

  it('should reject updating a task with a non-string title', () => {
    expect(() => controller.update('1', { title: 123 as any })).toThrow(
      'Task title must be a string',
    );
  });

  it('should reject updating a task with an empty title', () => {
    expect(() => controller.update('1', { title: '' })).toThrow(
      'Task title must be a non-empty string',
    );
  });

  it('should reject updating a task with a non-string description', () => {
    expect(() => controller.update('1', { description: 123 as any })).toThrow(
      'Task description must be a string',
    );
  });

  it('should reject updating a task with a non-boolean completed value', () => {
    expect(() => controller.update('1', { completed: 'yes' as any })).toThrow(
      'Task completed must be a boolean',
    );
  });

  it('should delete a task', () => {
    expect(controller.remove('1')).toEqual({
      id: 1,
      title: 'Learn GH-600',
      description: 'Study Agentic AI Systems',
      completed: false,
    });
  });

  it('should update a task', () => {
    expect(controller.update('1', { title: 'Updated task title' })).toEqual({
      id: 1,
      title: 'Updated task title',
      description: 'Study Agentic AI Systems',
      completed: false,
    });
  });

  it('should throw when deleting a missing task', () => {
    expect(() => controller.remove('999')).toThrow('Task 999 not found');
  });

  it('should throw when updating a missing task', () => {
    expect(() => controller.update('999', { completed: true })).toThrow(
      'Task 999 not found',
    );
  });
});
