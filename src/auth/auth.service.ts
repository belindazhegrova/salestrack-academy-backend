import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async register(email: string, password: string) {
    const existing = await this.userService.findByEmail(email);

    if (existing) {
      throw new ConflictException('User already exists');
    }

    const user = await this.userService.create(
      email,
      password,
      'ADMIN',
    );

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}