import {
  Organization,
  OrganizationAddress,
  OrganizationStatus,
  CompanySize,
} from '@prisma/client';

export interface FindOrganizationsParams {
  tenantId: string;
  status?: OrganizationStatus;
  industry?: string;
  companySize?: CompanySize;
  ownerUserId?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedOrganizations {
  data: (Organization & {
    owner?: { id: string; firstName: string; lastName: string } | null;
  })[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const IOrganizationRepository = Symbol('IOrganizationRepository');

export interface IOrganizationRepository {
  create(
    tenantId: string,
    data: Partial<Organization>,
    addresses?: Partial<OrganizationAddress>[],
  ): Promise<Organization>;
  update(
    tenantId: string,
    id: string,
    data: Partial<Organization>,
  ): Promise<Organization>;
  findById(tenantId: string, id: string): Promise<Organization | null>;
  findByDocument(
    tenantId: string,
    document: string,
  ): Promise<Organization | null>;
  findMany(params: FindOrganizationsParams): Promise<PaginatedOrganizations>;
  archive(tenantId: string, id: string): Promise<Organization>;
  delete(tenantId: string, id: string): Promise<void>;
  updateOwner(
    tenantId: string,
    id: string,
    newOwnerId: string,
  ): Promise<Organization>;
}
