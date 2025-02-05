import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { LoginDto } from '../src/auth/dto/login.dto';
import { RegisterDto } from '../src/auth/dto/register.dto';

const mockAuthService = {
  signIn: jest.fn(),
  signUp: jest.fn(),
};

describe('AuthController (e2e)', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should call signIn method of AuthService and return an access token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = { access_token: 'test_token' };

      mockAuthService.signIn.mockResolvedValue(result);

      const response = await controller.signIn(loginDto);

      expect(authService.signIn).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(response).toEqual(result);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      mockAuthService.signIn.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      try {
        await controller.signIn(loginDto);
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
      }
    });
  });

  describe('signUp', () => {
    it('should call signUp method of AuthService and return success message', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: new Date(),
        city: 'City',
        zipCode: '12345',
      };
      const result = { message: 'User successfully registered' };

      mockAuthService.signUp.mockResolvedValue(result);

      const response = await controller.signUp(registerDto);

      expect(authService.signUp).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.firstName,
        registerDto.lastName,
        registerDto.birthDate,
        registerDto.city,
        registerDto.zipCode,
      );
      expect(response).toEqual(result);
    });

    it('should throw ConflictException if email already in use', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: new Date(),
        city: 'City',
        zipCode: '12345',
      };

      mockAuthService.signUp.mockRejectedValue(
        new Error('Email already in use'),
      );

      try {
        await controller.signUp(registerDto);
      } catch (error) {
        expect(error.message).toBe('Email already in use');
      }
    });
  });

  describe('getProfile', () => {
    it('should return user profile from request', () => {
      const mockRequest = { user: { id: 1, email: 'test@example.com' } };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockRequest.user);
    });
  });
});
