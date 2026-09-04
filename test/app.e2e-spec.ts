import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
  it('/tasks/stats (GET)', () => {
    return request(app.getHttpServer()).get('/tasks/stats').expect(200).expect({
      total: 1,
      completed: 0,
      incomplete: 1,
    });
  });

  it('/tasks/summary (GET)', () => {
    return request(app.getHttpServer())
      .get('/tasks/summary')
      .expect(200)
      .expect({
        total: 1,
        completed: 0,
        incomplete: 1,
        completionPercentage: 0,
      });
  });

  it('/tasks/summary (GET) reflects task creation', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Write tests' })
      .expect(201);

    return request(app.getHttpServer())
      .get('/tasks/summary')
      .expect(200)
      .expect({
        total: 2,
        completed: 0,
        incomplete: 2,
        completionPercentage: 0,
      });
  });

  it('/tasks/summary (GET) reflects completion updates', async () => {
    await request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ completed: true })
      .expect(200);

    return request(app.getHttpServer())
      .get('/tasks/summary')
      .expect(200)
      .expect({
        total: 1,
        completed: 1,
        incomplete: 0,
        completionPercentage: 100,
      });
  });

  it('/tasks/summary (GET) reflects task deletion', async () => {
    await request(app.getHttpServer()).delete('/tasks/1').expect(200);

    return request(app.getHttpServer())
      .get('/tasks/summary')
      .expect(200)
      .expect({
        total: 0,
        completed: 0,
        incomplete: 0,
        completionPercentage: 0,
      });
  });

  it('/tasks/complete (PATCH) marks multiple tasks completed', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Write tests' })
      .expect(201);

    return request(app.getHttpServer())
      .patch('/tasks/complete')
      .send({ taskIds: [1, 2] })
      .expect(200)
      .expect([
        {
          id: 1,
          title: 'Learn GH-600',
          description: 'Study Agentic AI Systems',
          completed: true,
          priority: 'medium',
        },
        {
          id: 2,
          title: 'Write tests',
          completed: true,
          priority: 'medium',
        },
      ]);
  });

  it('/tasks/complete (PATCH) rejects a missing ID without mutating valid tasks', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Write tests' })
      .expect(201);

    await request(app.getHttpServer())
      .patch('/tasks/complete')
      .send({ taskIds: [1, 999] })
      .expect(404);

    return request(app.getHttpServer()).get('/tasks/1').expect(200).expect({
      id: 1,
      title: 'Learn GH-600',
      description: 'Study Agentic AI Systems',
      completed: false,
      priority: 'medium',
    });
  });

  it('/tasks/search (GET) returns matching tasks', () => {
    return request(app.getHttpServer())
      .get('/tasks/search?q=GH-600')
      .expect(200)
      .expect([
        {
          id: 1,
          title: 'Learn GH-600',
          description: 'Study Agentic AI Systems',
          completed: false,
          priority: 'medium',
        },
      ]);
  });

  it('/tasks/search (GET) returns no results', () => {
    return request(app.getHttpServer())
      .get('/tasks/search?q=xyz')
      .expect(200)
      .expect([]);
  });

  it('/tasks/search (GET) rejects invalid query', () => {
    return request(app.getHttpServer()).get('/tasks/search').expect(400);
  });

  it('/tasks (POST) creates a valid task', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Write tests',
        description: 'Add validation coverage',
        priority: 'high',
      })
      .expect(201)
      .expect({
        id: 2,
        title: 'Write tests',
        description: 'Add validation coverage',
        completed: false,
        priority: 'high',
      });
  });

  it('/tasks (POST) defaults priority to medium when omitted', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Write tests' })
      .expect(201)
      .expect({
        id: 2,
        title: 'Write tests',
        completed: false,
        priority: 'medium',
      });
  });

  it('/tasks (POST) accepts a valid dueDate', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Write tests',
        dueDate: '2026-09-02T12:00:00.000Z',
      })
      .expect(201)
      .expect({
        id: 2,
        title: 'Write tests',
        completed: false,
        priority: 'medium',
        dueDate: '2026-09-02T12:00:00.000Z',
      });
  });

  it('/tasks (POST) accepts estimateMinutes', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Write tests',
        estimateMinutes: 90,
      })
      .expect(201)
      .expect({
        id: 2,
        title: 'Write tests',
        completed: false,
        priority: 'medium',
        estimateMinutes: 90,
      });
  });

  it('/tasks (POST) rejects invalid estimateMinutes values', () => {
    return Promise.all([
      request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Write tests', estimateMinutes: 0 })
        .expect(400),
      request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Write tests', estimateMinutes: -30 })
        .expect(400),
      request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Write tests', estimateMinutes: 12.5 })
        .expect(400),
      request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Write tests', estimateMinutes: '90' })
        .expect(400),
    ]);
  });

  it('/tasks (POST) accepts tags', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Write tests',
        tags: ['backend', 'urgent'],
      })
      .expect(201)
      .expect({
        id: 2,
        title: 'Write tests',
        completed: false,
        priority: 'medium',
        tags: ['backend', 'urgent'],
      });
  });

  it('/tasks (POST) accepts no tags and preserves legacy behavior', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Write tests' })
      .expect(201)
      .expect({
        id: 2,
        title: 'Write tests',
        completed: false,
        priority: 'medium',
      });
  });

  it('/tasks (POST) rejects invalid dueDate', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Write tests', dueDate: 'not-a-date' })
      .expect(400);
  });

  it('/tasks (POST) rejects empty-string dueDate', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Write tests', dueDate: '' })
      .expect(400);
  });

  it('/tasks/:id (PATCH) supports dueDate updates', () => {
    return request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ dueDate: '2027-01-15T09:30:00.000Z' })
      .expect(200)
      .expect({
        id: 1,
        title: 'Learn GH-600',
        description: 'Study Agentic AI Systems',
        completed: false,
        priority: 'medium',
        dueDate: '2027-01-15T09:30:00.000Z',
      });
  });

  it('/tasks/:id (PATCH) supports tags updates', () => {
    return request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ tags: ['backend', 'urgent'] })
      .expect(200)
      .expect({
        id: 1,
        title: 'Learn GH-600',
        description: 'Study Agentic AI Systems',
        completed: false,
        priority: 'medium',
        tags: ['backend', 'urgent'],
      });
  });

  it('/tasks/:id (PATCH) accepts estimateMinutes updates', () => {
    return request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ estimateMinutes: 90 })
      .expect(200)
      .expect({
        id: 1,
        title: 'Learn GH-600',
        description: 'Study Agentic AI Systems',
        completed: false,
        priority: 'medium',
        estimateMinutes: 90,
      });
  });

  it('/tasks/:id (PATCH) preserves existing estimateMinutes when omitted', async () => {
    await request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ estimateMinutes: 90 })
      .expect(200);

    return request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ title: 'Updated title' })
      .expect(200)
      .expect({
        id: 1,
        title: 'Updated title',
        description: 'Study Agentic AI Systems',
        completed: false,
        priority: 'medium',
        estimateMinutes: 90,
      });
  });

  it('/tasks/:id (PATCH) rejects invalid estimateMinutes values', () => {
    return Promise.all([
      request(app.getHttpServer())
        .patch('/tasks/1')
        .send({ estimateMinutes: 0 })
        .expect(400),
      request(app.getHttpServer())
        .patch('/tasks/1')
        .send({ estimateMinutes: -30 })
        .expect(400),
      request(app.getHttpServer())
        .patch('/tasks/1')
        .send({ estimateMinutes: 12.5 })
        .expect(400),
      request(app.getHttpServer())
        .patch('/tasks/1')
        .send({ estimateMinutes: '90' })
        .expect(400),
    ]);
  });

  it('/tasks/:id (PATCH) preserves existing tags when omitted', async () => {
    await request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ tags: ['backend', 'urgent'] })
      .expect(200);

    return request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ title: 'Updated title' })
      .expect(200)
      .expect({
        id: 1,
        title: 'Updated title',
        description: 'Study Agentic AI Systems',
        completed: false,
        priority: 'medium',
        tags: ['backend', 'urgent'],
      });
  });

  it('/tasks/:id (PATCH) clears tags when empty array is supplied', async () => {
    await request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ tags: ['backend', 'urgent'] })
      .expect(200);

    return request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ tags: [] })
      .expect(200)
      .expect({
        id: 1,
        title: 'Learn GH-600',
        description: 'Study Agentic AI Systems',
        completed: false,
        priority: 'medium',
        tags: [],
      });
  });

  it('/tasks/:id (PATCH) rejects invalid dueDate', () => {
    return request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ dueDate: 'invalid-date' })
      .expect(400);
  });

  it('/tasks (POST) rejects missing title', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ description: 'Missing title' })
      .expect(400);
  });

  it('/tasks (POST) rejects empty title', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: '   ' })
      .expect(400);
  });

  it('/tasks/:id (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/tasks/1')
      .send({
        title: 'Updated GH-600',
        completed: true,
        priority: 'high',
      })
      .expect(200)
      .expect({
        id: 1,
        title: 'Updated GH-600',
        description: 'Study Agentic AI Systems',
        completed: true,
        priority: 'high',
      });
  });

  it('/tasks/:id (PATCH) rejects invalid completed value', () => {
    return request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ completed: 'yes' })
      .expect(400);
  });

  it('/tasks?priority=high (GET) filters by priority', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'High priority task', priority: 'high' })
      .expect(201)
      .then(() =>
        request(app.getHttpServer()).get('/tasks?priority=high').expect(200),
      );
  });

  it('/tasks?priority=urgent (GET) rejects invalid priority query', () => {
    return request(app.getHttpServer())
      .get('/tasks?priority=urgent')
      .expect(400);
  });

  it('/tasks?tag=backend (GET) filters by tag', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Tagged task', tags: ['backend', 'urgent'] })
      .expect(201);

    return request(app.getHttpServer())
      .get('/tasks?tag=backend')
      .expect(200)
      .expect([
        {
          id: 2,
          title: 'Tagged task',
          completed: false,
          priority: 'medium',
          tags: ['backend', 'urgent'],
        },
      ]);
  });

  it('/tasks?tag= (GET) rejects empty tag query', () => {
    return request(app.getHttpServer()).get('/tasks?tag=').expect(400);
  });

  it('/tasks/:id (DELETE)', () => {
    return request(app.getHttpServer()).delete('/tasks/1').expect(200).expect({
      id: 1,
      title: 'Learn GH-600',
      description: 'Study Agentic AI Systems',
      completed: false,
      priority: 'medium',
    });
  });
});
