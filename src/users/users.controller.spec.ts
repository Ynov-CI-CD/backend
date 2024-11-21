import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Role } from '../enums/role';

describe('UsersController', () => {
  let usersController: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        birthDate: new Date('1990-01-01'),
        city: 'Paris',
        zipCode: '75001',
      };

      const user: User = {
        _id: new ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        birthDate: new Date('1990-01-01'),
        city: 'Paris',
        zipCode: '75001',
        role: Role.USER,
      };

      mockUsersService.create.mockResolvedValue({
        status: 'success',
        data: { user },
      });

      const result = await usersController.create(createUserDto);
      expect(result.status).toBe('success');
      expect(result.data.user).toEqual(user);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users: User[] = [
        {
          _id: new ObjectId(),
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          birthDate: new Date('1990-01-01'),
          city: 'Paris',
          zipCode: '75001',
          role: Role.USER,
        },
        {
          _id: new ObjectId(),
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          password: 'password123',
          birthDate: new Date('1992-02-02'),
          city: 'Lyon',
          zipCode: '69001',
          role: Role.USER,
        },
      ];

      mockUsersService.findAll.mockResolvedValue({
        status: 'success',
        data: { users },
      });

      const result = await usersController.findAll();
      expect(result.status).toBe('success');
      expect(result.data.users).toEqual(users);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user: User = {
        _id: new ObjectId('507f191e810c19729de860ea'),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        birthDate: new Date('1990-01-01'),
        city: 'Paris',
        zipCode: '75001',
        role: Role.USER,
      };

      mockUsersService.findOne.mockResolvedValue({
        status: 'success',
        data: { user },
      });

      const result = await usersController.findOne('507f191e810c19729de860ea');
      expect(result.status).toBe('success');
      expect(result.data.user).toEqual(user);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(
        '507f191e810c19729de860ea',
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(usersController.findOne('nonexistentId')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith('nonexistentId');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        _id: '507f191e810c19729de860ea',
        firstName: 'Updated',
        lastName: 'Doe',
        email: 'updated.email@example.com',
        password: 'newpassword123',
        birthDate: new Date('1991-02-02'),
        city: 'Berlin',
        zipCode: '10115',
      };

      const user: User = {
        _id: new ObjectId('507f191e810c19729de860ea'),
        firstName: 'Updated',
        lastName: 'Doe',
        email: 'updated.email@example.com',
        password: 'newpassword123',
        birthDate: new Date('1991-02-02'),
        city: 'Berlin',
        zipCode: '10115',
        role: Role.ADMIN,
      };

      mockUsersService.update.mockResolvedValue({
        status: 'success',
        data: { user },
      });

      const result = await usersController.update(
        '507f191e810c19729de860ea',
        updateUserDto,
      );
      expect(result.status).toBe('success');
      expect(result.data.user).toEqual(user);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        '507f191e810c19729de860ea',
        updateUserDto,
      );
    });

    it('should throw NotFoundException if user not found for update', async () => {
      const updateUserDto: UpdateUserDto = {
        _id: 'nonexistentId',
        firstName: 'Updated',
        lastName: 'Doe',
        email: 'updated.email@example.com',
        password: 'newpassword123',
        birthDate: new Date('1991-02-02'),
        city: 'Berlin',
        zipCode: '10115',
      };

      mockUsersService.update.mockRejectedValue(new NotFoundException());

      await expect(
        usersController.update('nonexistentId', updateUserDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'nonexistentId',
        updateUserDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const user: User = {
        _id: new ObjectId('507f191e810c19729de860ea'),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        birthDate: new Date('1990-01-01'),
        city: 'Paris',
        zipCode: '75001',
        role: Role.USER,
      };

      mockUsersService.remove.mockResolvedValue({
        status: 'success',
        data: { user },
      });

      const result = await usersController.remove('507f191e810c19729de860ea');
      expect(result.status).toBe('success');
      expect(result.data.user).toEqual(user);
      expect(mockUsersService.remove).toHaveBeenCalledWith(
        '507f191e810c19729de860ea',
      );
    });

    it('should throw NotFoundException if user not found for removal', async () => {
      mockUsersService.remove.mockRejectedValue(new NotFoundException());

      await expect(usersController.remove('nonexistentId')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.remove).toHaveBeenCalledWith('nonexistentId');
    });
  });
});
