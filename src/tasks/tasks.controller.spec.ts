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

  it('should reject invalid priority filters', () => {
    expect(() => controller.findAll(undefined, 'urgent')).toThrow(
      'Task priority must be one of: low, medium, high',
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
        priority: 'medium',
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
        priority: 'medium',
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

  it('should reject creating a task with an invalid priority', () => {
    expect(() =>
      controller.create({ title: 'Study', priority: 'urgent' as any }),
    ).toThrow('Task priority must be one of: low, medium, high');
  });

  it('should accept a valid category when creating a task', () => {
    expect(controller.create({ title: 'Study', category: 'learning' })).toEqual(
      {
        id: 2,
        title: 'Study',
        description: undefined,
        completed: false,
        priority: 'medium',
        category: 'learning',
      },
    );
  });

  it('should allow creating a task without a category', () => {
    expect(controller.create({ title: 'Study' }).category).toBeUndefined();
  });

  it.each(['school', '', '   ', null, 42, [], {}])(
    'should reject invalid category %p when creating a task',
    (category) => {
      expect(() =>
        controller.create({ title: 'Study', category: category as any }),
      ).toThrow(
        'Task category must be one of: work, personal, learning, development, other',
      );
    },
  );

  it('should accept a valid category when updating a task', () => {
    expect(controller.update('1', { category: 'work' }).category).toBe('work');
  });

  it('should preserve a category when a patch omits it', () => {
    controller.update('1', { category: 'personal' });

    expect(controller.update('1', { title: 'Updated task' }).category).toBe(
      'personal',
    );
  });

  it('should replace a category when a patch supplies a valid value', () => {
    controller.update('1', { category: 'personal' });

    expect(controller.update('1', { category: 'development' }).category).toBe(
      'development',
    );
  });

  it('should reject an invalid category when updating a task', () => {
    expect(() => controller.update('1', { category: null as any })).toThrow(
      'Task category must be one of: work, personal, learning, development, other',
    );
  });

  it('should accept valid tags when creating a task', () => {
    expect(
      controller.create({
        title: 'Study tags',
        tags: ['backend', 'urgent'],
      }),
    ).toEqual({
      id: 2,
      title: 'Study tags',
      description: undefined,
      completed: false,
      priority: 'medium',
      tags: ['backend', 'urgent'],
    });
  });

  it('should reject a non-array tags payload when creating a task', () => {
    expect(() =>
      controller.create({
        title: 'Study tags',
        tags: 'backend' as any,
      }),
    ).toThrow('Task tags must be an array of strings');
  });

  it('should reject non-string tag values when creating a task', () => {
    expect(() =>
      controller.create({
        title: 'Study tags',
        tags: ['backend', 7] as any,
      }),
    ).toThrow('Task tags must be an array of strings');
  });

  it('should reject empty-string tag values when creating a task', () => {
    expect(() =>
      controller.create({
        title: 'Study tags',
        tags: ['backend', ''],
      }),
    ).toThrow('Task tags must be an array of strings');
  });

  it('should reject whitespace-only tag values when creating a task', () => {
    expect(() =>
      controller.create({
        title: 'Study tags',
        tags: ['backend', '   '],
      }),
    ).toThrow('Task tags must be an array of strings');
  });

  it('should accept a valid dueDate when creating a task', () => {
    expect(
      controller.create({
        title: 'Study due date',
        dueDate: '2026-09-02T12:00:00.000Z',
      }),
    ).toEqual({
      id: 2,
      title: 'Study due date',
      description: undefined,
      completed: false,
      priority: 'medium',
      dueDate: '2026-09-02T12:00:00.000Z',
    });
  });

  it('should reject an invalid dueDate when creating a task', () => {
    expect(() =>
      controller.create({
        title: 'Study due date',
        dueDate: 'not-a-date',
      }),
    ).toThrow('Task dueDate must be a valid ISO date or datetime');
  });

  it('should reject an empty-string dueDate when creating a task', () => {
    expect(() =>
      controller.create({
        title: 'Study due date',
        dueDate: '',
      }),
    ).toThrow('Task dueDate must be a valid ISO date or datetime');
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

  it('should reject updating a task with an invalid priority', () => {
    expect(() => controller.update('1', { priority: 'HIGH' as any })).toThrow(
      'Task priority must be one of: low, medium, high',
    );
  });

  it('should accept valid tags when updating a task', () => {
    expect(
      controller.update('1', {
        tags: ['backend', 'urgent'],
      }),
    ).toEqual({
      id: 1,
      title: 'Learn GH-600',
      description: 'Study Agentic AI Systems',
      completed: false,
      priority: 'medium',
      tags: ['backend', 'urgent'],
    });
  });

  it('should preserve existing tags when a patch omits tags', () => {
    controller.update('1', { tags: ['backend', 'urgent'] });

    expect(controller.update('1', { title: 'Updated task title' })).toEqual({
      id: 1,
      title: 'Updated task title',
      description: 'Study Agentic AI Systems',
      completed: false,
      priority: 'medium',
      tags: ['backend', 'urgent'],
    });
  });

  it('should reject invalid tag arrays when updating a task', () => {
    expect(() =>
      controller.update('1', {
        tags: 'backend' as any,
      }),
    ).toThrow('Task tags must be an array of strings');
  });

  it('should accept a valid dueDate when updating a task', () => {
    expect(
      controller.update('1', {
        dueDate: '2027-01-15T09:30:00.000Z',
      }),
    ).toEqual({
      id: 1,
      title: 'Learn GH-600',
      description: 'Study Agentic AI Systems',
      completed: false,
      priority: 'medium',
      dueDate: '2027-01-15T09:30:00.000Z',
    });
  });

  it('should reject an invalid dueDate when updating a task', () => {
    expect(() =>
      controller.update('1', {
        dueDate: 'invalid-date',
      }),
    ).toThrow('Task dueDate must be a valid ISO date or datetime');
  });

  it('should reject an empty-string dueDate when updating a task', () => {
    expect(() =>
      controller.update('1', {
        dueDate: '',
      }),
    ).toThrow('Task dueDate must be a valid ISO date or datetime');
  });

  it('should accept a valid tag query', () => {
    controller.create({ title: 'Study tags', tags: ['backend', 'urgent'] });

    expect(controller.findAll(undefined, undefined, 'backend')).toEqual([
      {
        id: 2,
        title: 'Study tags',
        description: undefined,
        completed: false,
        priority: 'medium',
        tags: ['backend', 'urgent'],
      },
    ]);
  });

  it('should reject an empty tag query', () => {
    expect(() => controller.findAll(undefined, undefined, '')).toThrow(
      'Tag query must be a non-empty string',
    );
  });

  it('should reject a whitespace-only tag query', () => {
    expect(() => controller.findAll(undefined, undefined, '   ')).toThrow(
      'Tag query must be a non-empty string',
    );
  });

  it('should delete a task', () => {
    expect(controller.remove('1')).toEqual({
      id: 1,
      title: 'Learn GH-600',
      description: 'Study Agentic AI Systems',
      completed: false,
      priority: 'medium',
    });
  });

  it('should update a task', () => {
    expect(controller.update('1', { title: 'Updated task title' })).toEqual({
      id: 1,
      title: 'Updated task title',
      description: 'Study Agentic AI Systems',
      completed: false,
      priority: 'medium',
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
