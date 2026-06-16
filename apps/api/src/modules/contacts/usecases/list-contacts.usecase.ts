import { Injectable, Inject } from '@nestjs/common';
import {
  IContactRepository,
  FindContactsParams,
  PaginatedContacts,
} from '../repositories/contacts.repository.interface';

@Injectable()
export class ListContactsUseCase {
  constructor(
    @Inject(IContactRepository) private repository: IContactRepository,
  ) {}

  async execute(params: FindContactsParams): Promise<PaginatedContacts> {
    return this.repository.findMany(params);
  }
}
