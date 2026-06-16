import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  Contact,
  ContactEmail,
  ContactPhone,
} from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import {
  IContactRepository,
  FindContactsParams,
  PaginatedContacts,
} from './contacts.repository.interface';

@Injectable()
export class PrismaContactRepository implements IContactRepository {
  constructor(
    private prisma: PrismaClient,
    private cls: ClsService,
  ) {}

  private getTenantId(): string {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId)
      throw new Error('Tenant Context is missing in PrismaContactRepository');
    return tenantId;
  }

  async create(
    tenantId: string,
    data: Partial<Contact>,
    emails?: Partial<ContactEmail>[],
    phones?: Partial<ContactPhone>[],
  ): Promise<Contact> {
    const createData: any = {
      ...data,
      tenantId,
    };

    if (emails && emails.length > 0) {
      createData.emails = {
        create: emails,
      };
    }

    if (phones && phones.length > 0) {
      createData.phones = {
        create: phones,
      };
    }

    return this.prisma.contact.create({
      data: createData,
      include: { emails: true, phones: true },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<Contact>,
  ): Promise<Contact> {
    return this.prisma.contact.update({
      where: { id, tenantId },
      data,
      include: { emails: true, phones: true },
    });
  }

  async findById(tenantId: string, id: string): Promise<Contact | null> {
    return this.prisma.contact.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        emails: true,
        phones: true,
      },
    });
  }

  async findByPrimaryEmail(
    tenantId: string,
    email: string,
  ): Promise<Contact | null> {
    return this.prisma.contact.findFirst({
      where: { tenantId, primaryEmail: email, deletedAt: null },
    });
  }

  async findMany(params: FindContactsParams): Promise<PaginatedContacts> {
    const {
      tenantId,
      page,
      limit,
      search,
      status,
      source,
      organizationId,
      ownerUserId,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (status) where.status = status;
    if (source) where.source = source;
    if (organizationId) where.organizationId = organizationId;
    if (ownerUserId) where.ownerUserId = ownerUserId;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { primaryEmail: { contains: search } },
        { primaryPhone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true },
          },
          organization: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async archive(tenantId: string, id: string): Promise<Contact> {
    return this.prisma.contact.update({
      where: { id, tenantId },
      data: { status: 'ARCHIVED' },
    });
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.prisma.contact.update({
      where: { id, tenantId },
      data: { deletedAt: new Date() },
    });
  }

  async updateOwner(
    tenantId: string,
    id: string,
    newOwnerId: string,
  ): Promise<Contact> {
    return this.prisma.contact.update({
      where: { id, tenantId },
      data: { ownerUserId: newOwnerId },
    });
  }
}
