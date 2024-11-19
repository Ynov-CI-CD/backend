import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MongoRepository } from 'typeorm';
import { Role } from '../enums/role';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new BadRequestException(
        'Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer',
      );
    }
    const user = await this.userRepository.findOne({
      where: { _id: objectId },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(input: CreateUserDto): Promise<User> {
    const user = new User();
    user.email = input.email;
    user.password = input.password;
    user.role = Role.USER;
    user.firstName = input.firstName;
    user.lastName = input.lastName;
    user.birthDate = input.birthDate;
    user.city = input.city;
    user.zipCode = input.zipCode;
    return this.userRepository.save(user);
  }

  async update(id: any, input: UpdateUserDto): Promise<User> {
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException(
        'Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer',
      );
    }
    let user = await this.userRepository.findOne({
      where: { _id: objectId },
    });
    if (!user) throw new NotFoundException('User not found');
    delete input.id;
    user = { ...user, ...input };
    return this.userRepository.save(user);
  }

  async remove(id: any): Promise<User> {
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException(
        'Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer',
      );
    }
    const user = await this.userRepository.findOne({
      where: { _id: objectId },
    });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.delete(objectId);
    return user;
  }
}
