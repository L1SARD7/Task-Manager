import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;

  const commentsServiceMock = {
    create: jest.fn(),
    findByTask: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: commentsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('should create comment', async () => {
    const dto = { taskId: 'task-1', content: 'hello' };
    const userId = 'user-2';
    const created = { _id: 'c1', ...dto, authorId: userId };
    commentsServiceMock.create.mockResolvedValue(created);

    const result = await controller.create(dto as any, userId);

    expect(commentsServiceMock.create).toHaveBeenCalledWith(dto, userId);
    expect(result).toEqual(created);
  });

  it('should get comments by task id', async () => {
    const taskId = 'task-99';
    const items = [{ _id: 'c2', taskId, content: 'yo' }];
    commentsServiceMock.findByTask.mockResolvedValue(items);

    const result = await controller.findByTask(taskId);

    expect(commentsServiceMock.findByTask).toHaveBeenCalledWith(taskId);
    expect(result).toEqual(items);
  });
});
