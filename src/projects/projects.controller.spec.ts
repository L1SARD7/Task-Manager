import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;

  const projectsServiceMock = {
    create: jest.fn(),
    findAllUserProjects: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: projectsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should return user projects list', async () => {
    const userId = 'user-42';
    const list = [{ _id: 'p1', title: 'proj' }];
    projectsServiceMock.findAllUserProjects.mockResolvedValue(list);

    const result = await controller.findAll(userId);

    expect(projectsServiceMock.findAllUserProjects).toHaveBeenCalledWith(
      userId,
    );
    expect(result).toEqual(list);
  });

  it('should call remove project', async () => {
    const projectId = 'p1';
    const userId = 'user-42';
    projectsServiceMock.remove.mockResolvedValue(undefined);

    const result = await controller.remove(projectId, userId);

    expect(projectsServiceMock.remove).toHaveBeenCalledWith(projectId, userId);
    expect(result).toBeUndefined();
  });
});
