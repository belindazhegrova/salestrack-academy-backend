import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
         where: { email }
    });
  }

async create(email: string,
     password: string,
      role: 'ADMIN' | 'AGENT') {
    return this.prisma.user.create({
      data: { email, password, role },
    });
  }
}