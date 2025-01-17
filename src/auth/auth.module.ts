import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from '../roles.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret:
        '886d9238995e4daaa238bc6d81576334da08968e64ebd326567fd5fca57a6cbda9433f981286b9593c1f616bf967a32e073594e78fae5ac3453e07892e8d2026cb47af257d8c748cb2ed7986fe83085d76714ed4493c779b25b6fda7322fd932f13c0d249c1ee5569af003b6ff7da570f85a5b16afb05676f8851637f8d9d19ea861951070f597612ee59b3e9ef3743dbcf11e0aae9dc37d4c561da1e87c39a7ffefa12daf0ad13d1ea8ea590e5859b4a57001fbb123d08b4fef4b0eb64232b7f9d253795a51483c8d158afd957a04d0e8cda30b56273838c8b9ff898cdad7fb1180afbce264cf1edee5be22ff2aa3cc7e032179266aae75074b88c3df8fe5a0',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AuthService,
  ],
})
export class AuthModule {}
