import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ValidateStageTransitionUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(tenantId: string, dealId: string, toStageId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id: dealId, tenantId, deletedAt: null },
      include: { pipeline: true, stage: true },
    });

    if (!deal) {
      throw new BadRequestException('Deal not found');
    }

    if (deal.status !== 'OPEN') {
      throw new BadRequestException('Cannot move a deal that is not OPEN');
    }

    const toStage = await this.prisma.pipelineStage.findFirst({
      where: { id: toStageId, tenantId, deletedAt: null },
    });

    if (!toStage) {
      throw new BadRequestException('Target stage not found');
    }

    if (toStage.pipelineId !== deal.pipelineId) {
      throw new BadRequestException(
        'Target stage does not belong to the same pipeline as the deal',
      );
    }

    return { deal, toStage };
  }
}
