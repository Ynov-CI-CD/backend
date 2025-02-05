import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findUserByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mocked_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should return an access token for valid credentials', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
      };

      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.signIn(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({ access_token: 'mocked_token' });
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.signIn('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
      };

      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        authService.signIn('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signUp', () => {
    it('should create a user and return an access token', async () => {
      const mockUser = {
        _id: '123',
        email: 'newuser@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Doe',
        birthDate: new Date(),
        city: 'City',
        zipCode: '12345',
      };

      (usersService.findUserByEmail as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValue(mockUser);

      (usersService.create as jest.Mock).mockResolvedValue(mockUser);

      jest
        .spyOn(authService, 'signIn')
        .mockResolvedValue({ access_token: 'mocked_token' });

      const result = await authService.signUp(
        'newuser@example.com',
        'password123',
        'John',
        'Doe',
        new Date(),
        'City',
        '12345',
      );

      expect(result).toEqual({ access_token: 'mocked_token' });
      expect(usersService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email is already in use', async () => {
      (usersService.findUserByEmail as jest.Mock).mockResolvedValue({
        email: 'existing@example.com',
      });

      await expect(
        authService.signUp(
          'existing@example.com',
          'password123',
          'John',
          'Doe',
          new Date(),
          'City',
          '12345',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if MongoDB error code 11000 occurs', async () => {
      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockRejectedValue({ code: 11000 });

      await expect(
        authService.signUp(
          'newuser@example.com',
          'password123',
          'John',
          'Doe',
          new Date(),
          'City',
          '12345',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException if an unexpected error occurs while creating the user', async () => {
      (usersService.findUserByEmail as jest.Mock).mockResolvedValueOnce(null);
      (usersService.create as jest.Mock).mockRejectedValue(
        new Error('Some unexpected error'),
      );

      await expect(
        authService.signUp(
          'newuser@example.com',
          'password123',
          'John',
          'Doe',
          new Date(),
          'City',
          '12345',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
