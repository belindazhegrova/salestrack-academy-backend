import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/auth.guard';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post('agents')
  async createAgent(
    @Req() req: any,
    @Body() body: { email: string; password: string, name: string },
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can create agents');
    }

    return this.userService.createAgent(
      body.email,
      body.password,
      req.user.userId,
      body.name,
    );
  }

  @Get('agents')
  async getAgents(@Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can view agents');
    }

    return this.userService.findAgents(req.user.userId);
  }
}