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
    expect(tasks[0].priority).toBe('medium');
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

  it('should return tasks by priority', () => {
    service.create('Study MCP', undefined, 'high');
    service.create('Write docs', undefined, 'low');

    expect(service.findAll(undefined, 'high')).toHaveLength(1);
    expect(service.findAll(undefined, 'high')[0].title).toBe('Study MCP');
  });

  it('should return task statistics', () => {
    expect(service.stats()).toEqual({
      total: 1,
      completed: 0,
      incomplete: 1,
    });
  });

  it('should return a task summary with completion percentage', () => {
    service.create('Study MCP');
    service.update(1, { completed: true });

    expect(service.summary()).toEqual({
      total: 2,
      completed: 1,
      incomplete: 1,
      completionPercentage: 50,
    });
  });

  it('should return a zero summary when there are no tasks', () => {
    service.remove(1);

    const summary = service.summary();

    expect(summary).toEqual({
      total: 0,
      completed: 0,
      incomplete: 0,
      completionPercentage: 0,
    });
    expect(Number.isFinite(summary.completionPercentage)).toBe(true);
    expect(Number.isNaN(summary.completionPercentage)).toBe(false);
  });

  it('should update the task summary after deleting a task', () => {
    service.create('Study MCP');
    service.update(1, { completed: true });
    service.remove(2);

    expect(service.summary()).toEqual({
      total: 1,
      completed: 1,
      incomplete: 0,
      completionPercentage: 100,
    });
  });

  it('should bulk complete multiple tasks and preserve requested order', () => {
    service.create('Study MCP');
    service.create('Write docs');

    const updated = service.completeMany([3, 1]);

    expect(updated).toEqual([
      {
        id: 3,
        title: 'Write docs',
        description: undefined,
        completed: true,
        priority: 'medium',
      },
      {
        id: 1,
        title: 'Learn GH-600',
        description: 'Study Agentic AI Systems',
        completed: true,
        priority: 'medium',
      },
    ]);
    expect(service.findAll(true)).toHaveLength(2);
  });

  it.each(['todo', 'in_progress'] as const)(
    'should transition a status-bearing %s task to done during bulk completion',
    (status) => {
      service.create(
        'Status task',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        status,
      );

      const [updated] = service.completeMany([2]);

      expect(updated).toMatchObject({
        status: 'done',
        completed: true,
      });
      expect(service.findOne(2)).toMatchObject({
        status: 'done',
        completed: true,
      });
    },
  );

  it('should keep a status-bearing done task completed during bulk completion', () => {
    service.create(
      'Done task',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'done',
    );

    const [updated] = service.completeMany([2]);

    expect(updated).toMatchObject({ status: 'done', completed: true });
  });

  it('should preserve legacy bulk completion behavior for tasks without status', () => {
    service.create('Legacy task');

    const [updated] = service.completeMany([2]);

    expect(updated).toMatchObject({ completed: true });
    expect(updated.status).toBeUndefined();
  });

  it('should throw when a bulk completion request includes a missing task ID', () => {
    service.create('Study MCP');

    expect(() => service.completeMany([1, 999])).toThrow('Task 999 not found');
    expect(service.findOne(1).completed).toBe(false);
  });

  it('should be atomic when one bulk completion ID is missing', () => {
    service.create('Study MCP');
    service.create('Write docs');

    expect(() => service.completeMany([1, 999, 2])).toThrow(
      'Task 999 not found',
    );
    expect(service.findAll(true)).toHaveLength(0);
    expect(service.findAll(false)).toHaveLength(3);
  });

  it('should reject an empty bulk completion input', () => {
    expect(() => service.completeMany([])).toThrow(
      'Task IDs must not be empty',
    );
  });

  it('should resolve duplicate IDs without changing the update semantics', () => {
    service.create('Study MCP');
    service.create('Write docs');

    const updated = service.completeMany([2, 2, 1]);

    expect(updated.map((task) => task.id)).toEqual([2, 1]);
    expect(service.findOne(1).completed).toBe(true);
    expect(service.findOne(2).completed).toBe(true);
  });

  it('should keep already-completed tasks completed during bulk completion', () => {
    service.update(1, { completed: true });
    service.create('Study MCP');

    const updated = service.completeMany([1, 2]);

    expect(updated).toEqual([
      {
        id: 1,
        title: 'Learn GH-600',
        description: 'Study Agentic AI Systems',
        completed: true,
        priority: 'medium',
      },
      {
        id: 2,
        title: 'Study MCP',
        description: undefined,
        completed: true,
        priority: 'medium',
      },
    ]);
  });

  it('should find tasks by title', () => {
    service.create('Build a demo app');

    expect(service.search('demo')).toEqual([
      {
        id: 2,
        title: 'Build a demo app',
        description: undefined,
        completed: false,
        priority: 'medium',
      },
    ]);
  });

  it('should find tasks by description', () => {
    service.create('Write docs', 'Plan onboarding and release notes');

    expect(service.search('onboarding')).toEqual([
      {
        id: 2,
        title: 'Write docs',
        description: 'Plan onboarding and release notes',
        completed: false,
        priority: 'medium',
      },
    ]);
  });

  it('should search case-insensitively', () => {
    service.create('Ship Release Candidate');

    expect(service.search('release')).toEqual([
      {
        id: 2,
        title: 'Ship Release Candidate',
        description: undefined,
        completed: false,
        priority: 'medium',
      },
    ]);
  });

  it('should return an empty array when there are no matches', () => {
    expect(service.search('zzz')).toEqual([]);
  });

  it('should return multiple matches', () => {
    service.create('Alpha plan');
    service.create('Beta plan');

    expect(service.search('plan')).toHaveLength(2);
  });

  it('should update a task and preserve unspecified fields', () => {
    const task = service.update(1, { title: 'Updated task title' });

    expect(task).toEqual({
      id: 1,
      title: 'Updated task title',
      description: 'Study Agentic AI Systems',
      completed: false,
      priority: 'medium',
    });
    expect(service.findOne(1).description).toBe('Study Agentic AI Systems');
  });

  it('should update task statistics after completing a task', () => {
    service.update(1, { completed: true });

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

  it('should throw when updating a missing task', () => {
    expect(() => service.update(999, { title: 'Ghost task' })).toThrow(
      'Task 999 not found',
    );
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

  it('should create a task without a priority as medium', () => {
    const task = service.create('Study MCP');

    expect(task.title).toBe('Study MCP');
    expect(task.completed).toBe(false);
    expect(task.priority).toBe('medium');
  });

  it.each(['work', 'personal', 'learning', 'development', 'other'] as const)(
    'should create a task with valid category %s',
    (category) => {
      const task = service.create(
        'Study MCP',
        undefined,
        undefined,
        undefined,
        undefined,
        category,
      );

      expect(task.category).toBe(category);
    },
  );

  it('should create a task without a category', () => {
    const task = service.create('Study MCP');

    expect(task.category).toBeUndefined();
  });

  it('should reject invalid categories when creating a task', () => {
    for (const category of ['school', 'urgent', '', '   ', null]) {
      expect(() =>
        service.create(
          'Study MCP',
          undefined,
          undefined,
          undefined,
          undefined,
          category as any,
        ),
      ).toThrow(
        'Task category must be one of: work, personal, learning, development, other',
      );
    }
  });

  it('should update a task category', () => {
    const task = service.update(1, { category: 'work' });

    expect(task.category).toBe('work');
  });

  it('should preserve the existing category when a patch omits it', () => {
    service.update(1, { category: 'personal' });

    expect(service.update(1, { title: 'Updated title' }).category).toBe(
      'personal',
    );
  });

  it('should replace the existing category with a valid value', () => {
    service.update(1, { category: 'personal' });

    expect(service.update(1, { category: 'development' }).category).toBe(
      'development',
    );
  });

  it('should reject invalid categories when updating a task', () => {
    expect(() => service.update(1, { category: 'urgent' as any })).toThrow(
      'Task category must be one of: work, personal, learning, development, other',
    );
  });

  it('should keep legacy tasks without a category valid', () => {
    const task = service.findOne(1);

    expect(task.category).toBeUndefined();
  });

  it.each(['todo', 'in_progress', 'done'] as const)(
    'should create a task with status %s and matching completed value',
    (status) => {
      const task = service.create(
        'Study status',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        status,
      );

      expect(task.status).toBe(status);
      expect(task.completed).toBe(status === 'done');
    },
  );

  it('should create a task without status using the existing completed default', () => {
    expect(service.create('Study status').completed).toBe(false);
  });

  it('should accept matching status and completed values on create', () => {
    const task = service.create(
      'Study status',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'done',
      true,
    );

    expect(task).toMatchObject({ status: 'done', completed: true });
  });

  it.each(['school', '', '   ', null, 42, [], {}])(
    'should reject invalid status %p on create',
    (status) => {
      expect(() =>
        service.create(
          'Study status',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          status as any,
        ),
      ).toThrow('Task status must be one of: todo, in_progress, done');
    },
  );

  it.each([
    ['done', false],
    ['todo', true],
    ['in_progress', true],
  ])('should reject inconsistent status and completed values on create', (status, completed) => {
    expect(() =>
      service.create(
        'Study status',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        status as any,
        completed as any,
      ),
    ).toThrow('Task status and completed values must be consistent');
  });

  it('should replace status and derive completed on update', () => {
    const task = service.update(1, { status: 'done' });

    expect(task).toMatchObject({
      id: 1,
      title: 'Learn GH-600',
      description: 'Study Agentic AI Systems',
      priority: 'medium',
      status: 'done',
      completed: true,
    });
  });

  it('should preserve status and completed when update omits status', () => {
    service.update(1, { status: 'in_progress' });

    expect(service.update(1, { title: 'Updated status' })).toMatchObject({
      title: 'Updated status',
      status: 'in_progress',
      completed: false,
    });
  });

  it('should reject a completed-only update that conflicts with status', () => {
    service.update(1, { status: 'todo' });

    expect(() => service.update(1, { completed: true })).toThrow(
      'Task status and completed values must be consistent',
    );
    expect(service.findOne(1)).toMatchObject({ status: 'todo', completed: false });
  });

  it('should create a task with a dueDate', () => {
    const task = service.create(
      'Study MCP',
      undefined,
      'high',
      '2026-09-02T12:00:00.000Z',
    );

    expect(task.dueDate).toBe('2026-09-02T12:00:00.000Z');
  });

  it('should create a task with tags', () => {
    const task = service.create('Study MCP', undefined, 'high', undefined, [
      'backend',
      'urgent',
    ]);

    expect(task.tags).toEqual(['backend', 'urgent']);
  });

  it('should create a task without tags', () => {
    const task = service.create('Study MCP');

    expect(task.tags).toBeUndefined();
  });

  it('should update a task dueDate without overwriting other fields', () => {
    const task = service.update(1, {
      dueDate: '2026-12-31T23:59:59.000Z',
    });

    expect(task.dueDate).toBe('2026-12-31T23:59:59.000Z');
    expect(task.title).toBe('Learn GH-600');
    expect(task.description).toBe('Study Agentic AI Systems');
  });

  it('should update task tags without overwriting other fields', () => {
    const task = service.update(1, {
      tags: ['backend', 'work'],
    });

    expect(task.tags).toEqual(['backend', 'work']);
    expect(task.title).toBe('Learn GH-600');
    expect(task.description).toBe('Study Agentic AI Systems');
    expect(task.priority).toBe('medium');
  });

  it('should preserve existing tags when patch omits tags', () => {
    service.update(1, { tags: ['backend', 'work'] });
    const task = service.update(1, { title: 'Updated title' });

    expect(task.tags).toEqual(['backend', 'work']);
    expect(task.title).toBe('Updated title');
  });

  it('should clear tags when an empty array is supplied', () => {
    service.update(1, { tags: ['backend', 'work'] });
    const task = service.update(1, { tags: [] });

    expect(task.tags).toEqual([]);
  });

  it('should filter tasks by a single tag', () => {
    service.create('Review architecture', undefined, 'medium', undefined, [
      'architecture',
    ]);

    expect(service.findAll(undefined, undefined, 'architecture')).toEqual([
      {
        id: 2,
        title: 'Review architecture',
        description: undefined,
        completed: false,
        priority: 'medium',
        dueDate: undefined,
        tags: ['architecture'],
      },
    ]);
  });

  it('should create a task with an explicit priority', () => {
    const task = service.create('Study MCP', undefined, 'high');

    expect(task.priority).toBe('high');
  });

  it('should update a task priority without overwriting other fields', () => {
    const task = service.update(1, { priority: 'high' });

    expect(task.priority).toBe('high');
    expect(task.title).toBe('Learn GH-600');
  });

  it('should treat historical tasks without priority as medium', () => {
    const legacyTask = {
      id: 99,
      title: 'Legacy task',
      description: 'Old data',
      completed: false,
    } as any;

    service['tasks'].push(legacyTask);

    expect(service.findAll(undefined, 'medium')).toHaveLength(2);
  });
});
