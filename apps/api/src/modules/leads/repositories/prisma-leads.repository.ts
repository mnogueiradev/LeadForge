import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  Lead,
  Prisma,
  LeadStatus,
  LeadTemperature,
  LeadSource,
} from '@prisma/client';
import {
  ILeadRepository,
  ListLeadsParams,
  PaginatedLeads,
} from './leads.repository.interface';

@Injectable()
export class PrismaLeadRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: Prisma.LeadUncheckedCreateInput): Promise<Lead> {
    return this.prisma.lead.create({
      data,
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: Prisma.LeadUncheckedUpdateInput,
  ): Promise<Lead> {
    const existing = await this.findById(id, tenantId);
    if (!existing) throw new Error('Lead not found');

    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async findById(id: string, tenantId: string): Promise<Lead | null> {
    return this.prisma.lead.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        contact: true,
        organization: true,
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        customFields: {
          include: { customField: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });
  }

  async findAll(
    tenantId: string,
    params: ListLeadsParams,
  ): Promise<PaginatedLeads> {
    const {
      limit = 20,
      page = 1,
      status,
      temperature,
      source,
      ownerUserId,
      contactId,
      organizationId,
      search,
    } = params;

    const where: Prisma.LeadWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (status) where.status = status as LeadStatus;
    if (temperature) where.temperature = temperature as LeadTemperature;
    if (source) where.source = source as LeadSource;
    if (ownerUserId) where.ownerUserId = ownerUserId;
    if (contactId) where.contactId = contactId;
    if (organizationId) where.organizationId = organizationId;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        {
          contact: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { primaryEmail: { contains: search } },
            ],
          },
        },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
          organization: {
            select: { id: true, name: true },
          },
          owner: {
            select: { id: true, firstName: true, lastName: true },
          },
          tags: {
            include: { tag: { select: { id: true, name: true, color: true } } },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        limit,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async archive(id: string, tenantId: string): Promise<Lead> {
    return this.prisma.lead.update({
      where: { id, tenantId },
      data: { status: 'ARCHIVED' },
    });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.lead.delete({
      where: { id, tenantId },
    });
  }
}
