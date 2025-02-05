import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authGuard = moduleRef.get<AuthGuard>(AuthGuard);
    jwtService = moduleRef.get<JwtService>(JwtService);
    reflector = moduleRef.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    it('should return true if route is public', async () => {
      reflector.get = jest.fn().mockReturnValue(true);

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn(),
        }),
        getHandler: jest.fn().mockReturnValue('handler'),
      } as unknown as ExecutionContext;

      const result = await authGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      reflector.get = jest.fn().mockReturnValue(false);

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
          }),
        }),
        getHandler: jest.fn().mockReturnValue('handler'),
      } as unknown as ExecutionContext;

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      reflector.get = jest.fn().mockReturnValue(false);

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { authorization: 'Bearer invalid_token' },
          }),
        }),
        getHandler: jest.fn().mockReturnValue('handler'),
      } as unknown as ExecutionContext;

      jwtService.verifyAsync = jest
        .fn()
        .mockRejectedValue(new Error('Invalid token'));

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should attach user to request if token is valid', async () => {
      reflector.get = jest.fn().mockReturnValue(false);

      const payload = { sub: 1, username: 'test' };
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { authorization: 'Bearer valid_token' },
          }),
        }),
        getHandler: jest.fn().mockReturnValue('handler'),
      } as unknown as ExecutionContext;

      jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);

      const result = await authGuard.canActivate(context);

      expect(result).toBe(true);
      expect(context.switchToHttp().getRequest().user).toEqual(payload);
    });

    it('should return undefined if authorization header is not in correct format', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { authorization: 'WrongFormat token' },
          }),
        }),
        getHandler: jest.fn().mockReturnValue('handler'),
      } as unknown as ExecutionContext;

      const token = authGuard['extractTokenFromHeader'](
        context.switchToHttp().getRequest(),
      );

      expect(token).toBeUndefined();
    });

    it('should return undefined if authorization header is missing "Bearer"', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { authorization: 'Basic token' },
          }),
        }),
        getHandler: jest.fn().mockReturnValue('handler'),
      } as unknown as ExecutionContext;

      const token = authGuard['extractTokenFromHeader'](
        context.switchToHttp().getRequest(),
      );

      expect(token).toBeUndefined();
    });
  });
});
