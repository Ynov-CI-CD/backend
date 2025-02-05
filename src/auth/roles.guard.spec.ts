import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesGuard = moduleRef.get<RolesGuard>(RolesGuard);
    reflector = moduleRef.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    it('should allow access if no roles are required', async () => {
      reflector.getAllAndOverride = jest.fn().mockReturnValue(undefined);

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { role: ['user'] },
          }),
        }),
        getHandler: jest.fn().mockReturnValue('handler'),
        getClass: jest.fn().mockReturnValue('class'),
      } as unknown as ExecutionContext;

      const result = await rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access if the user has required roles', async () => {
      reflector.getAllAndOverride = jest.fn().mockReturnValue(['admin']);

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { role: ['admin', 'user'] },
          }),
        }),
        getHandler: jest.fn().mockReturnValue('handler'),
        getClass: jest.fn().mockReturnValue('class'),
      } as unknown as ExecutionContext;

      const result = await rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access if the user does not have required roles', async () => {
      reflector.getAllAndOverride = jest.fn().mockReturnValue(['admin']);

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { role: ['user'] },
          }),
        }),
        getHandler: jest.fn().mockReturnValue('handler'),
        getClass: jest.fn().mockReturnValue('class'),
      } as unknown as ExecutionContext;

      const result = await rolesGuard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should deny access if user has no roles', async () => {
      reflector.getAllAndOverride = jest.fn().mockReturnValue(['admin']);

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { role: [] },
          }),
        }),
        getHandler: jest.fn().mockReturnValue('handler'),
        getClass: jest.fn().mockReturnValue('class'),
      } as unknown as ExecutionContext;

      const result = await rolesGuard.canActivate(context);

      expect(result).toBe(false);
    });
  });
});
