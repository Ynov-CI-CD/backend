import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MongoRepository } from 'typeorm';
import { RoleEnum } from '../enums/role.enum';
import { ObjectId } from 'mongodb';

type ApiResponse<T> = {
  status: 'success' | 'error';
  data: T;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) {}

  private toObjectId(id: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch (error) {
      this.logger.error(`Invalid id: ${id}`);
      throw new BadRequestException(
        'Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer',
      );
    }
  }

  private async findUserById(id: string): Promise<User> {
    const objectId = this.toObjectId(id);
    try {
      return await this.userRepository.findOneOrFail({
        where: { _id: objectId },
      });
    } catch (error) {
      this.logger.error(`User with id ${id} not found`);
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({
        where: { email },
      });
    } catch (error) {
      this.logger.error(`User with email ${email} not found`);
      return null;
    }
  }

  private createUserEntity(input: CreateUserDto): User {
    const user = new User();
    user.email = input.email;
    user.password = input.password;
    user.role = RoleEnum.USER;
    user.firstName = input.firstName;
    user.lastName = input.lastName;
    user.birthDate = input.birthDate;
    user.city = input.city;
    user.zipCode = input.zipCode;
    return user;
  }

  async findAll(): Promise<ApiResponse<User[]>> {
    this.logger.log('Fetching all users');
    const users = await this.userRepository.find();
    return { status: 'success', data: users };
  }

  async findOne(id: string): Promise<ApiResponse<User>> {
    this.logger.log(`Fetching user with id: ${id}`);
    const user = await this.findUserById(id);
    return { status: 'success', data: user };
  }

  async create(input: CreateUserDto): Promise<ApiResponse<User>> {
    const user = this.createUserEntity(input);
    const createdUser = await this.userRepository.save(user);
    this.logger.log(
      `User with email ${input.email} has been created successfully.`,
    );
    return { status: 'success', data: createdUser };
  }

  async update(
    id: string,
    input: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    const user = await this.findUserById(id);
    const updatedUser = {
      ...user,
      ...input,
      role: user.role,
    };
    const savedUser = await this.userRepository.save(updatedUser);
    this.logger.log(
      `User with email ${input.email} has been updated successfully.`,
    );
    return { status: 'success', data: savedUser };
  }

  async remove(id: string): Promise<ApiResponse<User>> {
    const deletedUser = await this.findUserById(id);
    await this.userRepository.delete(deletedUser._id);
    this.logger.log(`User with id: ${id} has been deleted successfully.`);
    return { status: 'success', data: deletedUser };
  }
}
