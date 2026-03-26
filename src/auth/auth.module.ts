import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/strategy';

@Module({
  imports: [
       JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService,JwtStrategy],
})
export class AuthModule {}