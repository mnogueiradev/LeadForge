import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient, MovementSource, DealStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ValidateStageTransitionUseCase } from './validate-stage-transition.usecase';

export interface MoveDealStageInput {
  tenantId: string;
  dealId: string;
  toStageId: string;
  userId?: string;
  source?: MovementSource;
  reason?: string;
  metadata?: any;
}

@Injectable()
export class MoveDealStageUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventEmitter: EventEmitter2,
    private readonly validateStageTransition: ValidateStageTransitionUseCase,
  ) {}

  async execute(input: MoveDealStageInput) {
    const {
      tenantId,
      dealId,
      toStageId,
      userId,
      source = MovementSource.USER,
      reason,
      metadata,
    } = input;

    // Validate rules
    const { deal, toStage } = await this.validateStageTransition.execute(
      tenantId,
      dealId,
      toStageId,
    );

    if (deal.stageId === toStageId) {
      return deal; // Nothing to move
    }

    // Determine target state (Won / Lost / Open)
    let newStatus: DealStatus = 'OPEN';
    let wonAt = null;
    let closedAt = null;
    let lostAt = null;
    let newProbability = toStage.probability;

    if (toStage.isWonStage) {
      newStatus = 'WON';
      wonAt = new Date();
      closedAt = new Date();
      newProbability = 100;
    } else if (toStage.isLostStage) {
      if (!reason) {
        throw new BadRequestException(
          'A reason must be provided when moving to a Lost stage',
        );
      }
      newStatus = 'LOST';
      lostAt = new Date();
      closedAt = new Date();
      newProbability = 0;
    }

    // Prepare metadata
    const movementMetadata = {
      ...metadata,
      oldProbability: deal.probability,
      newProbability,
      oldStageId: deal.stageId,
    };

    // Execute transaction
    const updatedDeal = await this.prisma.$transaction(async (tx) => {
      const movement = await tx.dealMovement.create({
        data: {
          tenantId,
          dealId: deal.id,
          pipelineId: deal.pipelineId,
          fromStageId: deal.stageId,
          toStageId: toStage.id,
          movedByUserId: userId || null,
          source,
          reason: reason || null,
          metadata: movementMetadata,
        },
      });

      return tx.deal.update({
        where: { id: deal.id },
        data: {
          stageId: toStage.id,
          probability: newProbability,
          status: newStatus,
          ...(wonAt && { wonAt }),
          ...(closedAt && { closedAt }),
          ...(lostAt && { lostAt, lostReason: reason }),
        },
      });
    });

    // Fire Domain Events
    this.eventEmitter.emit('deal.moved', {
      deal: updatedDeal,
      fromStageId: deal.stageId,
      userId,
      source,
    });

    // Timeline events
    this.eventEmitter.emit('timeline.event.deal_moved', {
      tenantId,
      eventType: 'DEAL_MOVED',
      entityType: 'DEAL',
      entityId: updatedDeal.id,
      userId,
      data: {
        fromStageId: deal.stageId,
        toStageId: toStage.id,
        source,
        reason,
      },
    });

    // Specific Status Events
    if (newStatus === 'WON') {
      this.eventEmitter.emit('deal.won', { deal: updatedDeal, userId, source });
      this.eventEmitter.emit('timeline.event.deal_won', {
        tenantId,
        eventType: 'DEAL_WON',
        entityType: 'DEAL',
        entityId: updatedDeal.id,
        userId,
        data: { source },
      });
    } else if (newStatus === 'LOST') {
      this.eventEmitter.emit('deal.lost', {
        deal: updatedDeal,
        userId,
        source,
      });
      this.eventEmitter.emit('timeline.event.deal_lost', {
        tenantId,
        eventType: 'DEAL_LOST',
        entityType: 'DEAL',
        entityId: updatedDeal.id,
        userId,
        data: { lostReason: reason, source },
      });
    }

    // Trigger for Automation/AI engines
    this.eventEmitter.emit('automation.deal.moved', {
      tenantId,
      deal: updatedDeal,
      fromStageId: deal.stageId,
      toStageId: toStage.id,
      source,
    });

    return updatedDeal;
  }
}
