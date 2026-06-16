import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ILeadRepository } from '../repositories/leads.repository.interface';
import { LEAD_REPOSITORY } from '../repositories/leads.repository.interface';
import { UpdateLeadDto } from '../dtos/update-lead.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeadOwnerChangedEvent } from '../events/lead.events';

@Injectable()
export class UpdateLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: ILeadRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    leadId: string,
    actorUserId: string,
    dto: UpdateLeadDto,
  ) {
    const existing = await this.leadRepository.findById(leadId, tenantId);
    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    const lead = await this.leadRepository.update(leadId, tenantId, dto);

    // TODO: Emite evento genérico de atualização
    // Se mudou o dono, pode emitir evento específico
    // if (dto.ownerUserId && dto.ownerUserId !== existing.ownerUserId) {
    //   this.eventEmitter.emit('timeline.event.lead_owner_changed', new LeadOwnerChangedEvent(...));
    // }

    return lead;
  }
}
