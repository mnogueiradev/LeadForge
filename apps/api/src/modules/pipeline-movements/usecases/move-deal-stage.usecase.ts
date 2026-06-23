import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient, MovementSource, DealStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ValidateStageTransitionUseCase } from './validate-stage-transition.usecase';
import { SettingsService } from '../../settings/settings.service';

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
    private readonly settingsService: SettingsService,
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

    // Check settings for automation
    const settings = await this.settingsService.getSettings(tenantId);
    const autoProbabilitySetting = settings.find(s => s.key === 'crm_auto_probability');
    const autoActivitySetting = settings.find(s => s.key === 'crm_auto_activity');
    
    const isAutoProbabilityEnabled = autoProbabilitySetting?.value === 'true' || autoProbabilitySetting?.value === true;
    const isAutoActivityEnabled = autoActivitySetting?.value === 'true' || autoActivitySetting?.value === true;

    // Determine target state (Won / Lost / Open)
    let newStatus: DealStatus = 'OPEN';
    let wonAt = null;
    let closedAt = null;
    let lostAt = null;
    
    // Auto probability logic
    let newProbability = isAutoProbabilityEnabled ? toStage.probability : deal.probability;

    if (toStage.isWonStage) {
      newStatus = 'WON';
      wonAt = new Date();
      closedAt = new Date();
      if (isAutoProbabilityEnabled) newProbability = 100;
    } else if (toStage.isLostStage) {
      if (!reason) {
        throw new BadRequestException(
          'A reason must be provided when moving to a Lost stage',
        );
      }
      newStatus = 'LOST';
      lostAt = new Date();
      closedAt = new Date();
      if (isAutoProbabilityEnabled) newProbability = 0;
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

      const updated = await tx.deal.update({
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

      // Auto activity logic
      if (isAutoActivityEnabled) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1); // D+1
        
        await tx.activity.create({
          data: {
            tenantId,
            title: `Follow-up - ${deal.title} - ${toStage.name}`,
            type: 'CALL', // Generic follow-up type
            priority: 'HIGH',
            status: 'PENDING',
            dueDate,
            dealId: deal.id,
            contactId: deal.contactId || null,
            organizationId: deal.organizationId || null,
            ownerUserId: deal.ownerUserId || userId, // Keep same owner as deal, fallback to user
          }
        });
      }

      return updated;
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
