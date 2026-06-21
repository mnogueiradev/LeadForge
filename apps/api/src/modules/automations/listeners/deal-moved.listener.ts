import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaClient, ActivityType, ActivityStatus, ActivityPriority, MovementSource } from '@prisma/client';
import { addDays } from 'date-fns';

export interface AutomationDealMovedEvent {
  tenantId: string;
  deal: any; // Deal model
  fromStageId: string;
  toStageId: string;
  source: MovementSource;
}

@Injectable()
export class DealMovedListener {
  private readonly logger = new Logger(DealMovedListener.name);

  constructor(private readonly prisma: PrismaClient) {}

  @OnEvent('automation.deal.moved')
  async handleDealMovedEvent(event: AutomationDealMovedEvent) {
    const { tenantId, deal, toStageId } = event;

    try {
      const stage = await this.prisma.pipelineStage.findUnique({
        where: { id: toStageId },
      });

      if (!stage || !stage.metadata) {
        return;
      }

      const metadata = stage.metadata as any;
      const followUpDays = metadata.autoFollowUpDays;

      if (typeof followUpDays === 'number' && followUpDays > 0) {
        const dueDate = addDays(new Date(), followUpDays);

        // Verifica se já existe um Follow-up pendente para evitar spam
        const existingFollowUp = await this.prisma.activity.findFirst({
          where: {
            tenantId,
            dealId: deal.id,
            type: ActivityType.FOLLOW_UP,
            status: ActivityStatus.PENDING,
          },
        });

        if (existingFollowUp) {
          this.logger.debug(
            `Deal ${deal.id} already has a pending follow-up. Skipping auto creation.`,
          );
          return;
        }

        // Cria o Follow-up automático
        await this.prisma.activity.create({
          data: {
            tenantId,
            ownerUserId: deal.ownerUserId,
            createdByUserId: deal.ownerUserId, // Simulando que o dono "criou" ou foi criado pelo sistema
            dealId: deal.id,
            contactId: deal.contactId,
            organizationId: deal.organizationId,
            leadId: deal.leadId,
            title: `Follow-up Automático: ${stage.name}`,
            description: `Atividade gerada automaticamente ao mover o negócio para a etapa ${stage.name}.`,
            type: ActivityType.FOLLOW_UP,
            status: ActivityStatus.PENDING,
            priority: ActivityPriority.MEDIUM,
            dueDate,
          },
        });

        this.logger.log(`Created auto follow-up for deal ${deal.id} in ${followUpDays} days.`);
      }
    } catch (error) {
      this.logger.error(`Error processing automation.deal.moved event: ${error.message}`, error.stack);
    }
  }
}
