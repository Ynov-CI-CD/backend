import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoleEnum } from '../enums/role.enum';
import { ObjectId } from 'mongodb';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findOneOrFail: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUser = {
    _id: new ObjectId(),
    email: 'test@example.com',
    password: 'password123',
    role: RoleEnum.USER,
    firstName: 'John',
    lastName: 'Doe',
    birthDate: new Date(),
    city: 'City',
    zipCode: '12345',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser._id.toHexString());

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOneOrFail.mockRejectedValue(new Error());

      await expect(service.findOne(mockUser._id.toHexString())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user by email', async () => {
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser);

      const result = await service.findUserByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      mockUserRepository.findOneOrFail.mockRejectedValue(new Error());

      const result = await service.findUserByEmail(mockUser.email);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: new Date(),
        city: 'City',
        zipCode: '12345',
      });

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        firstName: 'UpdatedFirstName',
      });

      const result = await service.update(mockUser._id.toHexString(), {
        _id: mockUser._id.toHexString(),
        firstName: 'UpdatedFirstName',
      });

      expect(result.status).toBe('success');
      expect(result.data.firstName).toBe('UpdatedFirstName');
    });

    it('should throw NotFoundException if user is not found for update', async () => {
      mockUserRepository.findOneOrFail.mockRejectedValue(new Error());

      await expect(
        service.update(mockUser._id.toHexString(), {
          _id: mockUser._id.toHexString(),
          firstName: 'UpdatedFirstName',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      const result = await service.remove(mockUser._id.toHexString());

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found for deletion', async () => {
      mockUserRepository.findOneOrFail.mockRejectedValue(new Error());

      await expect(service.remove(mockUser._id.toHexString())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toObjectId', () => {
    it('should throw BadRequestException for invalid id format', () => {
      const invalidId = 'invalidId';
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => {});

      expect(() => service['toObjectId'](invalidId)).toThrow(
        BadRequestException,
      );

      expect(loggerSpy).toHaveBeenCalledWith(`Invalid id: ${invalidId}`);
    });

    it('should return ObjectId for valid id', () => {
      const validId = new ObjectId().toHexString();

      expect(service['toObjectId'](validId)).toBeInstanceOf(ObjectId);
    });
  });
});
