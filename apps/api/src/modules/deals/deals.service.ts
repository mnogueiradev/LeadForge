import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, DealStatus } from '@prisma/client';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { MoveDealStageDto } from './dto/move-deal-stage.dto';
import { MarkDealWonDto } from './dto/mark-deal-won.dto';
import { MarkDealLostDto } from './dto/mark-deal-lost.dto';
import { AssignDealOwnerDto } from './dto/assign-deal-owner.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, userId: string, createDealDto: CreateDealDto) {
    // Validar se pipeline e stage existem e pertencem ao tenant
    const stage = await this.prisma.pipelineStage.findUnique({
      where: { id: createDealDto.stageId },
      include: { pipeline: true },
    });

    if (!stage || stage.tenantId !== tenantId) {
      throw new NotFoundException('Pipeline Stage not found');
    }

    if (stage.pipelineId !== createDealDto.pipelineId) {
      throw new BadRequestException(
        'Stage does not belong to the specified pipeline',
      );
    }

    // Se probabilidade não for passada, herdar do estágio
    const probability =
      createDealDto.probability !== undefined
        ? createDealDto.probability
        : stage.probability;

    // Criar Deal
    const deal = await this.prisma.deal.create({
      data: {
        tenantId,
        pipelineId: createDealDto.pipelineId,
        stageId: createDealDto.stageId,
        leadId: createDealDto.leadId,
        contactId: createDealDto.contactId,
        organizationId: createDealDto.organizationId,
        ownerUserId: userId, // Default to creator, can be passed if needed
        title: createDealDto.title,
        description: createDealDto.description,
        value: createDealDto.value,
        currency: createDealDto.currency || 'BRL',
        probability,
        expectedCloseDate: createDealDto.expectedCloseDate
          ? new Date(createDealDto.expectedCloseDate)
          : null,
      },
    });

    // Registrar no histórico de estágio
    await this.prisma.dealMovement.create({
      data: {
        tenantId,
        dealId: deal.id,
        pipelineId: createDealDto.pipelineId,
        fromStageId: null, // Initial creation
        toStageId: stage.id,
        movedByUserId: userId,
        source: 'USER',
        reason: 'Deal creation',
        metadata: { newProbability: probability },
      },
    });

    // Emit generic event
    this.eventEmitter.emit('deal.created', { deal, userId });

    // Auditoria
    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId,
      action: 'CREATED',
      entityName: 'Deal',
      entityId: deal.id,
      newValues: deal,
    });

    // Timeline
    this.eventEmitter.emit('timeline.event.deal_created', {
      tenantId,
      eventType: 'DEAL_CREATED',
      entityType: 'DEAL',
      entityId: deal.id,
      userId,
      data: { title: deal.title },
    });

    return deal;
  }

  async findAll(
    tenantId: string,
    pipelineId?: string,
    stageId?: string,
    status?: DealStatus,
  ) {
    return this.prisma.deal.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(pipelineId && { pipelineId }),
        ...(stageId && { stageId }),
        ...(status && { status }),
      },
      include: {
        stage: true,
        contact: true,
        organization: true,
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        stage: true,
        pipeline: true,
        contact: true,
        organization: true,
        lead: true,
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        movements: {
          orderBy: { createdAt: 'desc' },
          include: {
            movedByUser: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async update(tenantId: string, id: string, updateDealDto: UpdateDealDto) {
    const deal = await this.findOne(tenantId, id);

    // Nao permitir alteração de stageId via update genérico. Usar rota específica.
    const { stageId, pipelineId, ...safeUpdateData } = updateDealDto;

    const updated = await this.prisma.deal.update({
      where: { id },
      data: {
        ...safeUpdateData,
        expectedCloseDate: updateDealDto.expectedCloseDate
          ? new Date(updateDealDto.expectedCloseDate)
          : deal.expectedCloseDate,
      },
    });

    this.eventEmitter.emit('deal.updated', { deal: updated });

    // Auditoria
    this.eventEmitter.emit('audit.log.updated', {
      tenantId,
      userId: 'SYSTEM', // we might want to get userId in update
      action: 'UPDATED',
      entityName: 'Deal',
      entityId: updated.id,
      newValues: updated,
    });

    // Timeline
    this.eventEmitter.emit('timeline.event.deal_updated', {
      tenantId,
      eventType: 'DEAL_UPDATED',
      entityType: 'DEAL',
      entityId: updated.id,
      userId: 'SYSTEM',
      data: { title: updated.title },
    });

    return updated;
  }

  async remove(tenantId: string, id: string) {
    const deal = await this.findOne(tenantId, id);

    const deleted = await this.prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    this.eventEmitter.emit('deal.archived', { deal: deleted });

    // Timeline
    this.eventEmitter.emit('timeline.event.deal_archived', {
      tenantId,
      eventType: 'DEAL_ARCHIVED',
      entityType: 'DEAL',
      entityId: deleted.id,
      userId: 'SYSTEM',
    });

    return deleted;
  }

  async moveStage(
    tenantId: string,
    id: string,
    userId: string,
    dto: MoveDealStageDto,
  ) {
    throw new BadRequestException(
      'Use the new pipeline-movements module for this action.',
    );
  }

  async markWon(
    tenantId: string,
    id: string,
    userId: string,
    dto: MarkDealWonDto,
  ) {
    const deal = await this.findOne(tenantId, id);

    if (
      deal.status === 'WON' ||
      deal.status === 'LOST' ||
      deal.status === 'ARCHIVED'
    ) {
      throw new BadRequestException('Deal is already closed');
    }

    const updated = await this.prisma.deal.update({
      where: { id },
      data: {
        status: 'WON',
        wonAt: dto.wonAt ? new Date(dto.wonAt) : new Date(),
        closedAt: new Date(),
        probability: 100, // Quando ganho, probabilidade = 100%
        ...(dto.value !== undefined && { value: dto.value }),
      },
    });

    this.eventEmitter.emit('deal.won', { deal: updated, userId });

    // Timeline
    this.eventEmitter.emit('timeline.event.deal_won', {
      tenantId,
      eventType: 'DEAL_WON',
      entityType: 'DEAL',
      entityId: updated.id,
      userId,
    });

    return updated;
  }

  async markLost(
    tenantId: string,
    id: string,
    userId: string,
    dto: MarkDealLostDto,
  ) {
    const deal = await this.findOne(tenantId, id);

    if (
      deal.status === 'WON' ||
      deal.status === 'LOST' ||
      deal.status === 'ARCHIVED'
    ) {
      throw new BadRequestException('Deal is already closed');
    }

    const updated = await this.prisma.deal.update({
      where: { id },
      data: {
        status: 'LOST',
        lostAt: dto.lostAt ? new Date(dto.lostAt) : new Date(),
        closedAt: new Date(),
        probability: 0, // Quando perdido, probabilidade = 0%
        lostReason: dto.lostReason,
      },
    });

    this.eventEmitter.emit('deal.lost', { deal: updated, userId });

    // Timeline
    this.eventEmitter.emit('timeline.event.deal_lost', {
      tenantId,
      eventType: 'DEAL_LOST',
      entityType: 'DEAL',
      entityId: updated.id,
      userId,
      data: { lostReason: dto.lostReason },
    });

    return updated;
  }

  async assignOwner(
    tenantId: string,
    id: string,
    userId: string,
    dto: AssignDealOwnerDto,
  ) {
    const deal = await this.findOne(tenantId, id);

    const updated = await this.prisma.deal.update({
      where: { id },
      data: { ownerUserId: dto.ownerUserId },
    });

    this.eventEmitter.emit('deal.owner.changed', {
      deal: updated,
      userId,
      previousOwnerId: deal.ownerUserId,
    });

    // Timeline
    this.eventEmitter.emit('timeline.event.deal_owner_changed', {
      tenantId,
      eventType: 'DEAL_OWNER_CHANGED',
      entityType: 'DEAL',
      entityId: updated.id,
      userId,
      targetUserId: dto.ownerUserId,
    });

    return updated;
  }
}
