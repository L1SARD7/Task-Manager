import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppController } from '../src/app.controller';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { TasksController } from '../src/tasks/tasks.controller';
import { TasksService } from '../src/tasks/tasks.service';
import { ProjectsController } from '../src/projects/projects.controller';
import { ProjectsService } from '../src/projects/projects.service';
import { CommentsController } from '../src/comments/comments.controller';
import { CommentsService } from '../src/comments/comments.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';

describe('Actual API routes (e2e)', () => {
  let app: INestApplication;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const tasksServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    getUserStatistics: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  const projectsServiceMock = {
    create: jest.fn(),
    findAllUserProjects: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const commentsServiceMock = {
    create: jest.fn(),
    findByTask: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest
      .spyOn(JwtAuthGuard.prototype, 'canActivate')
      .mockImplementation((context: ExecutionContext) => {
        const req = context
          .switchToHttp()
          .getRequest<{ user?: { userId: string } }>();
        req.user = { userId: 'e2e-user' };
        return true;
      });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        AppController,
        AuthController,
        TasksController,
        ProjectsController,
        CommentsController,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: TasksService, useValue: tasksServiceMock },
        { provide: ProjectsService, useValue: projectsServiceMock },
        { provide: CommentsService, useValue: commentsServiceMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  it('GET /health', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('POST /auth/login', async () => {
    authServiceMock.login.mockResolvedValue({ access_token: 'login-token' });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@mail.com', password: '123456' })
      .expect(200);

    expect(response.body).toEqual({ access_token: 'login-token' });
  });

  it('GET /tasks', async () => {
    tasksServiceMock.findAll.mockResolvedValue({ data: [], total: 0 });

    const response = await request(app.getHttpServer())
      .get('/tasks')
      .expect(200);

    expect(response.body).toEqual({ data: [], total: 0 });
  });

  it('GET /projects', async () => {
    projectsServiceMock.findAllUserProjects.mockResolvedValue([
      { _id: 'project-1', title: 'demo' },
    ]);

    const response = await request(app.getHttpServer())
      .get('/projects')
      .expect(200);

    expect(response.body).toEqual([{ _id: 'project-1', title: 'demo' }]);
  });

  it('GET /comments/task/:taskId', async () => {
    commentsServiceMock.findByTask.mockResolvedValue([
      { _id: 'comment-1', taskId: 'task-1', content: 'ok' },
    ]);

    const response = await request(app.getHttpServer())
      .get('/comments/task/task-1')
      .expect(200);

    expect(response.body).toEqual([
      { _id: 'comment-1', taskId: 'task-1', content: 'ok' },
    ]);
  });
});
