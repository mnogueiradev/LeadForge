import {
  Contact,
  ContactEmail,
  ContactPhone,
  ContactStatus,
  ContactSource,
} from '@prisma/client';

export interface FindContactsParams {
  tenantId: string;
  status?: ContactStatus;
  source?: ContactSource;
  organizationId?: string;
  ownerUserId?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedContacts {
  data: (Contact & {
    owner?: { id: string; firstName: string; lastName: string } | null;
    organization?: { id: string; name: string } | null;
    emails?: ContactEmail[];
    phones?: ContactPhone[];
  })[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const IContactRepository = Symbol('IContactRepository');

export interface IContactRepository {
  create(
    tenantId: string,
    data: Partial<Contact>,
    emails?: Partial<ContactEmail>[],
    phones?: Partial<ContactPhone>[],
  ): Promise<Contact>;
  update(
    tenantId: string,
    id: string,
    data: Partial<Contact>,
  ): Promise<Contact>;
  findById(tenantId: string, id: string): Promise<Contact | null>;
  findByPrimaryEmail(tenantId: string, email: string): Promise<Contact | null>;
  findMany(params: FindContactsParams): Promise<PaginatedContacts>;
  archive(tenantId: string, id: string): Promise<Contact>;
  delete(tenantId: string, id: string): Promise<void>;
  updateOwner(
    tenantId: string,
    id: string,
    newOwnerId: string,
  ): Promise<Contact>;
}
