import { Injectable, Inject } from '@nestjs/common';
import {
  IOrganizationRepository,
  FindOrganizationsParams,
  PaginatedOrganizations,
} from '../repositories/organizations.repository.interface';

@Injectable()
export class ListOrganizationsUseCase {
  constructor(
    @Inject(IOrganizationRepository)
    private repository: IOrganizationRepository,
  ) {}

  async execute(
    params: FindOrganizationsParams,
  ): Promise<PaginatedOrganizations> {
    return this.repository.findMany(params);
  }
}
