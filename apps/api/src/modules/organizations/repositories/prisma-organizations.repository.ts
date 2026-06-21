import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  Organization,
  OrganizationAddress,
} from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import {
  IOrganizationRepository,
  FindOrganizationsParams,
  PaginatedOrganizations,
} from './organizations.repository.interface';

@Injectable()
export class PrismaOrganizationRepository implements IOrganizationRepository {
  constructor(
    private prisma: PrismaClient,
    private cls: ClsService,
  ) {}

  private getTenantId(): string {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId)
      throw new Error('Tenant Context is missing in OrganizationRepository');
    return tenantId;
  }

  async create(
    tenantId: string,
    data: Partial<Organization>,
    addresses?: Partial<OrganizationAddress>[],
  ): Promise<Organization> {
    const createData: any = {
      ...data,
      tenantId,
    };

    if (addresses && addresses.length > 0) {
      createData.addresses = {
        create: addresses,
      };
    }

    return this.prisma.organization.create({
      data: createData,
      include: { addresses: true },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<Organization>,
  ): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id, tenantId }, // tenantId added for extra safety
      data,
      include: { addresses: true },
    });
  }

  async findById(tenantId: string, id: string): Promise<Organization | null> {
    return this.prisma.organization.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
        addresses: true,
      },
    });
  }

  async findByDocument(
    tenantId: string,
    document: string,
  ): Promise<Organization | null> {
    return this.prisma.organization.findFirst({
      where: { tenantId, document, deletedAt: null },
    });
  }

  async findMany(
    params: FindOrganizationsParams,
  ): Promise<PaginatedOrganizations> {
    const {
      tenantId,
      page,
      limit,
      search,
      status,
      industry,
      companySize,
      ownerUserId,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (status) where.status = status;
    if (industry) where.industry = industry;
    if (companySize) where.companySize = companySize;
    if (ownerUserId) where.ownerUserId = ownerUserId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { legalName: { contains: search } },
        { document: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.organization.count({ where }),
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

  async archive(tenantId: string, id: string): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id, tenantId },
      data: { status: 'ARCHIVED' },
    });
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.prisma.organization.delete({
      where: { id, tenantId },
    });
  }

  async updateOwner(
    tenantId: string,
    id: string,
    newOwnerId: string,
  ): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id, tenantId },
      data: { ownerUserId: newOwnerId },
    });
  }
}
