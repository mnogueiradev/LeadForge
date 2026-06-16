import { Injectable, Inject } from '@nestjs/common';
import type { ILeadRepository } from '../repositories/leads.repository.interface';
import { LEAD_REPOSITORY } from '../repositories/leads.repository.interface';
import { CreateLeadDto } from '../dtos/create-lead.dto';
import { LeadStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeadCreatedEvent } from '../events/lead.events';

@Injectable()
export class CreateLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: ILeadRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, actorUserId: string, dto: CreateLeadDto) {
    const lead = await this.leadRepository.create({
      tenantId,
      ownerUserId: actorUserId, // Por padrão, quem cria é o dono
      contactId: dto.contactId,
      organizationId: dto.organizationId,
      title: dto.title,
      description: dto.description,
      status: LeadStatus.NEW,
      source: dto.source,
      temperature: dto.temperature,
      score: dto.score,
      estimatedValue: dto.estimatedValue,
    });

    this.eventEmitter.emit(
      'timeline.event.lead_created',
      new LeadCreatedEvent(tenantId, lead.id, lead.title, actorUserId, {
        source: lead.source,
        temperature: lead.temperature,
      }),
    );

    return lead;
  }
}
