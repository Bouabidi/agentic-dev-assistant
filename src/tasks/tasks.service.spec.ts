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

  it('should create a task', () => {
    const task = service.create('Study MCP');

    expect(task.title).toBe('Study MCP');
    expect(task.completed).toBe(false);
  });
});
