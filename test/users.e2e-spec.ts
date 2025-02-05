import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { AuthService } from '../src/auth/auth.service';
import { AuthGuard } from '../src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { RoleEnum } from '../src/enums/role.enum';
import { RolesGuard } from '../src/auth/roles.guard';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([
      {
        _id: '678a38e4f4ca57177feb7c53',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    ]),
    findOne: jest.fn().mockResolvedValue({
      _id: '678a38e4f4ca57177feb7c53',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }),
    findUserByEmail: jest.fn().mockResolvedValue({
      _id: '678a38e4f4ca57177feb7c53',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'hashed_password', // Simule un mot de passe haché
    }),
    create: jest.fn().mockResolvedValue({
      status: 'success',
      data: {
        _id: '678a38e4f4ca57177feb7c53',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    }),
    update: jest.fn().mockResolvedValue({
      status: 'success',
      data: {
        _id: '678a38e4f4ca57177feb7c53',
        email: 'updateduser@example.com',
        firstName: 'Update',
        lastName: 'Update',
      },
    }),
    remove: jest.fn().mockResolvedValue({
      status: 'success',
      data: {
        _id: '678a38e4f4ca57177feb7c53',
        email: 'deleteduser@example.com',
        firstName: 'Deleted',
        lastName: 'Deleted',
      },
    }),
  };

  const mockAuthService = {
    signIn: jest.fn().mockResolvedValue({
      access_token: 'mocked_valid_token',
    }),
  };

  const mockJwtService = {
    verifyAsync: jest
      .fn()
      .mockResolvedValue({ user: { role: RoleEnum.ADMIN } }),
  };

  const mockAuthGuard = {
    canActivate: jest.fn().mockResolvedValue(true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn((context) => {
      const req = context.switchToHttp().getRequest();
      return req.user?.role === RoleEnum.ADMIN;
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('PUBLIC', () => {
    it('/users (GET)', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect([
          {
            _id: '678a38e4f4ca57177feb7c53',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
        ]);
    });

    it('GET /users/:id', () => {
      return request(app.getHttpServer())
        .get('/users/678a38e4f4ca57177feb7c53')
        .expect(200)
        .expect({
          _id: '678a38e4f4ca57177feb7c53',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        });
    });

    it('POST /users', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          _id: '678a38e4f4ca57177feb7c53',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(401)
        .expect({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'No token provided',
        });
    });

    it('PATCH /users/:id', () => {
      return request(app.getHttpServer())
        .patch('/users/678a38e4f4ca57177feb7c53')
        .send({
          _id: '678a38e4f4ca57177feb7c53',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(401)
        .expect({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'No token provided',
        });
    });

    it('DELETE /users/:id', () => {
      return request(app.getHttpServer())
        .delete('/users/678a38e4f4ca57177feb7c53')
        .expect(401)
        .expect({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'No token provided',
        });
    });
  });

  describe('IS_AUTH', () => {
    beforeEach(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });
      authToken = loginResponse.body.access_token;
    });

    it('POST /users', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'usertest56@example.com',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);
    });

    it('UPDATE /users/:id', () => {
      return request(app.getHttpServer())
        .patch('/users/678a38e4f4ca57177feb7c53')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'updateduser@example.com',
          firstName: 'Update',
          lastName: 'Update',
        })
        .expect(200)
        .expect({
          status: 'success',
          data: {
            _id: '678a38e4f4ca57177feb7c53',
            email: 'updateduser@example.com',
            firstName: 'Update',
            lastName: 'Update',
          },
        });
    });

    it('DELETE /users/:id', () => {
      return request(app.getHttpServer())
        .delete('/users/678a38e4f4ca57177feb7c53')
        .expect(401)
        .expect({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'No token provided',
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
