import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { ILeadRepository } from '../repositories/leads.repository.interface';
import { LEAD_REPOSITORY } from '../repositories/leads.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeadConvertedEvent } from '../events/lead.events';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class ConvertLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: ILeadRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, leadId: string, actorUserId: string) {
    const existing = await this.leadRepository.findById(leadId, tenantId);
    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    if (existing.status === LeadStatus.CONVERTED) {
      throw new BadRequestException('Lead is already converted');
    }

    const lead = await this.leadRepository.update(leadId, tenantId, {
      status: LeadStatus.CONVERTED,
      convertedAt: new Date(),
    });

    this.eventEmitter.emit(
      'timeline.event.lead_converted',
      new LeadConvertedEvent(tenantId, lead.id, lead.title, actorUserId),
    );

    return lead;
  }
}
