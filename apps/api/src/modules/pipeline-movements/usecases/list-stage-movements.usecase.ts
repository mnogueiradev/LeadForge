import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ListStageMovementsUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(
    tenantId: string,
    stageId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const stage = await this.prisma.pipelineStage.findFirst({
      where: { id: stageId, tenantId, deletedAt: null },
    });

    if (!stage) {
      throw new NotFoundException('Pipeline Stage not found');
    }

    const movements = await this.prisma.dealMovement.findMany({
      where: { tenantId, toStageId: stageId },
      orderBy: { executedAt: 'desc' },
      skip: offset,
      take: limit,
      include: {
        deal: {
          select: { id: true, title: true, value: true, currency: true },
        },
        fromStage: { select: { id: true, name: true, color: true } },
        movedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const total = await this.prisma.dealMovement.count({
      where: { tenantId, toStageId: stageId },
    });

    return { data: movements, meta: { total, limit, offset } };
  }
}
