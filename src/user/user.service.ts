import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(
    email: string,
    password: string,
    role: 'ADMIN' | 'AGENT',
    adminId?: string,
  ) {
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        adminId: role === 'AGENT' ? adminId : null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        adminId: true,
      },
    });
  }

  async createAgent(email: string, password: string, adminId: string) {
    return this.create(email, password, 'AGENT', adminId);
  }

  async findAgents(adminId: string) {
    return this.prisma.user.findMany({
      where: {
        role: 'AGENT',
        adminId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}