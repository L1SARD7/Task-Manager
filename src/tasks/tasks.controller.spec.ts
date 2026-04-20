import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskStatus } from './schemas/task.schema';

describe('TasksController', () => {
  let controller: TasksController;

  const tasksServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    getUserStatistics: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: tasksServiceMock,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should create task', async () => {
    const dto = { title: 'My Task' };
    const userId = 'user-1';
    const task = { _id: 'task-1', title: 'My Task' };
    tasksServiceMock.create.mockResolvedValue(task);

    const result = await controller.create(dto as any, userId);

    expect(tasksServiceMock.create).toHaveBeenCalledWith(dto, userId);
    expect(result).toEqual(task);
  });

  it('should update task status', async () => {
    const taskId = 'task-1';
    const status = TaskStatus.DONE;
    tasksServiceMock.updateStatus.mockResolvedValue({ _id: taskId, status });

    const result = await controller.updateStatus(taskId, status);

    expect(tasksServiceMock.updateStatus).toHaveBeenCalledWith(taskId, status);
    expect(result).toEqual({ _id: taskId, status });
  });
});
