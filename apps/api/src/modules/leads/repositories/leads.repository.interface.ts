import { Lead, Prisma } from '@prisma/client';

export const LEAD_REPOSITORY = 'LEAD_REPOSITORY';

export interface PaginatedLeads {
  data: Lead[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ListLeadsParams {
  limit?: number;
  offset?: number;
  status?: string;
  temperature?: string;
  source?: string;
  ownerUserId?: string;
  contactId?: string;
  organizationId?: string;
  search?: string;
}

export interface ILeadRepository {
  create(data: Prisma.LeadUncheckedCreateInput): Promise<Lead>;
  update(
    id: string,
    tenantId: string,
    data: Prisma.LeadUncheckedUpdateInput,
  ): Promise<Lead>;
  findById(id: string, tenantId: string): Promise<Lead | null>;
  findAll(tenantId: string, params: ListLeadsParams): Promise<PaginatedLeads>;
}
