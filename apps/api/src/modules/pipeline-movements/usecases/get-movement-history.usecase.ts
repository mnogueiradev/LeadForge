import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class GetMovementHistoryUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(tenantId: string, dealId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id: dealId, tenantId, deletedAt: null },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return this.prisma.dealMovement.findMany({
      where: { tenantId, dealId },
      orderBy: { executedAt: 'desc' },
      include: {
        fromStage: { select: { id: true, name: true, color: true } },
        toStage: { select: { id: true, name: true, color: true } },
        movedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
