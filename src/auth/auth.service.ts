import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    birthDate: Date,
    city: string,
    zipCode: string,
  ): Promise<{ access_token: string }> {
    const existingUser = await this.usersService.findUserByEmail(email);
    if (existingUser) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(password, 10);

    const user = {
      email,
      password: hash,
      firstName,
      lastName,
      birthDate,
      city,
      zipCode,
    };

    return await this.usersService
      .create(user)
      .then(() => {
        return this.signIn(email, hash);
      })
      .catch((error) => {
        if (error.code === 11000) {
          throw new ConflictException('User already exists');
        }
        throw new InternalServerErrorException('Could not create user');
      });
  }
}
