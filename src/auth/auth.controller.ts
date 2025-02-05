import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  signIn(@Body() body: LoginDto) {
    return this.authService.signIn(body.email, body.password);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('register')
  signUp(@Body() body: RegisterDto) {
    return this.authService.signUp(
      body.email,
      body.password,
      body.firstName,
      body.lastName,
      body.birthDate,
      body.city,
      body.zipCode,
    );
  }

  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() request) {
    return request.user;
  }
}
