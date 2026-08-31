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
      })
      .expect(201)
      .expect({
        id: 2,
        title: 'Write tests',
        description: 'Add validation coverage',
        completed: false,
      });
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
      })
      .expect(200)
      .expect({
        id: 1,
        title: 'Updated GH-600',
        description: 'Study Agentic AI Systems',
        completed: true,
      });
  });

  it('/tasks/:id (PATCH) rejects invalid completed value', () => {
    return request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ completed: 'yes' })
      .expect(400);
  });

  it('/tasks/:id (DELETE)', () => {
    return request(app.getHttpServer()).delete('/tasks/1').expect(200).expect({
      id: 1,
      title: 'Learn GH-600',
      description: 'Study Agentic AI Systems',
      completed: false,
    });
  });
});
