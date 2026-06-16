import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ListSessionsUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        familyId: true,
        deviceName: true,
        deviceType: true,
        browser: true,
        os: true,
        ipAddress: true,
        country: true,
        city: true,
        lastActivityAt: true,
        createdAt: true,
      },
      orderBy: {
        lastActivityAt: 'desc',
      },
    });
  }
}
