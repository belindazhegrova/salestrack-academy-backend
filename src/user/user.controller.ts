import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/auth.guard';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createUser(@Req() req: any, @Body() body: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can create users');
    }

    const hashed = await bcrypt.hash(body.password, 10);

    return this.userService.create(
      body.email,
      hashed,
      body.role || 'AGENT'
    );
  }
}