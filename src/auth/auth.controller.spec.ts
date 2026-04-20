import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should call register in service', async () => {
    const dto = { email: 'test@mail.com', password: '123456', name: 'Test' };
    const tokenResult = { access_token: 'token-1' };
    authServiceMock.register.mockResolvedValue(tokenResult);

    const result = await controller.register(dto);

    expect(authServiceMock.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual(tokenResult);
  });

  it('should call login in service', async () => {
    const dto = { email: 'test@mail.com', password: '123456' };
    const tokenResult = { access_token: 'token-2' };
    authServiceMock.login.mockResolvedValue(tokenResult);

    const result = await controller.login(dto);

    expect(authServiceMock.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(tokenResult);
  });
});
