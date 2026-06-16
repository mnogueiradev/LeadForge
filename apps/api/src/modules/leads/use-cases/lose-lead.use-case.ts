import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { ILeadRepository } from '../repositories/leads.repository.interface';
import { LEAD_REPOSITORY } from '../repositories/leads.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeadLostEvent } from '../events/lead.events';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class LoseLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: ILeadRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    leadId: string,
    actorUserId: string,
    reason?: string,
  ) {
    const existing = await this.leadRepository.findById(leadId, tenantId);
    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    if (
      existing.status === LeadStatus.LOST ||
      existing.status === LeadStatus.CONVERTED
    ) {
      throw new BadRequestException(
        'Lead cannot be marked as lost from its current status',
      );
    }

    const lead = await this.leadRepository.update(leadId, tenantId, {
      status: LeadStatus.LOST,
      // Se houvesse um campo reason, atualizaríamos aqui.
    });

    this.eventEmitter.emit(
      'timeline.event.lead_lost',
      new LeadLostEvent(tenantId, lead.id, lead.title, actorUserId, { reason }),
    );

    return lead;
  }
}
