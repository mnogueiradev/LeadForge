import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IContactRepository } from '../repositories/contacts.repository.interface';
import { Contact } from '@prisma/client';

@Injectable()
export class GetContactUseCase {
  constructor(
    @Inject(IContactRepository) private repository: IContactRepository,
  ) {}

  async execute(tenantId: string, id: string): Promise<Contact> {
    const contact = await this.repository.findById(tenantId, id);
    if (!contact) {
      throw new NotFoundException('Contato não encontrado.');
    }
    return contact;
  }
}
