import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  ActivityStatus,
  ActivityType,
  ActivityPriority,
  Prisma,
} from '@prisma/client';

export interface ListActivitiesFilters {
  status?: ActivityStatus;
  type?: ActivityType;
  priority?: ActivityPriority;
  ownerUserId?: string;
  contactId?: string;
  organizationId?: string;
  leadId?: string;
  dealId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ListActivitiesUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(tenantId: string, filters: ListActivitiesFilters) {
    const { limit = 50, offset = 0, search } = filters;

    const where: Prisma.ActivityWhereInput = {
      tenantId,
      deletedAt: null,
      ...(filters.status && filters.status !== '' as any && { status: filters.status }),
      ...(filters.type && filters.type !== '' as any && { type: filters.type }),
      ...(filters.priority && filters.priority !== '' as any && { priority: filters.priority }),
      ...(filters.ownerUserId && filters.ownerUserId !== '' && { ownerUserId: filters.ownerUserId }),
      ...(filters.contactId && filters.contactId !== '' && { contactId: filters.contactId }),
      ...(filters.organizationId && filters.organizationId !== '' && { organizationId: filters.organizationId }),
      ...(filters.leadId && filters.leadId !== '' && { leadId: filters.leadId }),
      ...(filters.dealId && filters.dealId !== '' && { dealId: filters.dealId }),
    };

    if (filters.fromDate || filters.toDate) {
      where.dueDate = {};
      if (filters.fromDate) where.dueDate.gte = new Date(filters.fromDate);
      if (filters.toDate) where.dueDate.lte = new Date(filters.toDate);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        orderBy: [
          { dueDate: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: offset,
        take: limit,
        include: {
          ownerUser: { select: { id: true, firstName: true, lastName: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          organization: { select: { id: true, name: true } },
          deal: { 
            select: { 
              id: true, 
              title: true,
              value: true,
              probability: true,
              updatedAt: true,
              stage: { select: { id: true, name: true, probability: true } },
              pipeline: { select: { id: true, name: true } }
            } 
          },
        },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { data, meta: { total, limit, offset } };
  }
}
