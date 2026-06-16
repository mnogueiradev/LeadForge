import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';
import { UpdatePipelineStageDto } from './dto/update-pipeline-stage.dto';
import { ReorderPipelineStagesDto } from './dto/reorder-pipeline-stages.dto';
import { PipelineStage, PrismaClient } from '@prisma/client';

@Injectable()
export class PipelineStagesService {
  constructor(private readonly prisma: PrismaClient) {}

  private async enforceUniqueFlags(
    tenantId: string,
    pipelineId: string,
    dto: CreatePipelineStageDto | UpdatePipelineStageDto,
    currentStageId?: string,
  ) {
    const updates: any[] = [];

    if ('isInitialStage' in dto && dto.isInitialStage) {
      updates.push(
        this.prisma.pipelineStage.updateMany({
          where: {
            tenantId,
            pipelineId,
            isInitialStage: true,
            id: currentStageId ? { not: currentStageId } : undefined,
          },
          data: { isInitialStage: false },
        }),
      );
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }
  }

  async create(
    tenantId: string,
    pipelineId: string,
    userId: string,
    createDto: CreatePipelineStageDto,
  ): Promise<PipelineStage> {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, tenantId },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    let displayOrder = createDto.displayOrder;
    if (displayOrder === undefined) {
      const lastStage = await this.prisma.pipelineStage.findFirst({
        where: { tenantId, pipelineId },
        orderBy: { displayOrder: 'desc' },
      });
      displayOrder = lastStage ? lastStage.displayOrder + 10 : 0;
    }

    await this.enforceUniqueFlags(tenantId, pipelineId, createDto);

    return this.prisma.pipelineStage.create({
      data: {
        ...createDto,
        displayOrder,
        tenantId,
        pipelineId,
        createdById: userId,
      },
    });
  }

  async findAll(
    tenantId: string,
    pipelineId: string,
  ): Promise<PipelineStage[]> {
    return this.prisma.pipelineStage.findMany({
      where: { tenantId, pipelineId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(
    tenantId: string,
    pipelineId: string,
    id: string,
  ): Promise<PipelineStage> {
    const stage = await this.prisma.pipelineStage.findFirst({
      where: { id, tenantId, pipelineId },
    });

    if (!stage) {
      throw new NotFoundException('Pipeline stage not found');
    }

    return stage;
  }

  async update(
    tenantId: string,
    pipelineId: string,
    id: string,
    updateDto: UpdatePipelineStageDto,
  ): Promise<PipelineStage> {
    const stage = await this.findOne(tenantId, pipelineId, id);

    await this.enforceUniqueFlags(tenantId, pipelineId, updateDto, id);

    return this.prisma.pipelineStage.update({
      where: { id: stage.id },
      data: updateDto,
    });
  }

  async remove(
    tenantId: string,
    pipelineId: string,
    id: string,
  ): Promise<PipelineStage> {
    const stage = await this.findOne(tenantId, pipelineId, id);

    return this.prisma.pipelineStage.delete({
      where: { id: stage.id },
    });
  }

  async reorder(
    tenantId: string,
    pipelineId: string,
    reorderDto: ReorderPipelineStagesDto,
  ): Promise<PipelineStage[]> {
    const transactions = reorderDto.stages.map((stage) => {
      return this.prisma.pipelineStage.update({
        where: { id: stage.id },
        data: { displayOrder: stage.displayOrder },
      });
    });

    await this.prisma.$transaction(transactions);

    return this.findAll(tenantId, pipelineId);
  }
}
