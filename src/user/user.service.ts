import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService,
     private mailService: MailService,
  ) {}

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
  adminId: string | undefined ,
  name: string, 
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
      name
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      createdAt: true,
      adminId: true,
    },
  });
}


async createAgent(
  email: string,
  password: string,
  adminId: string,
  name: string,
) {
  const agent = await this.create(email, password, 'AGENT', adminId, name);

  await this.mailService.sendAgentInvite(email, name, password);

  return agent;
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