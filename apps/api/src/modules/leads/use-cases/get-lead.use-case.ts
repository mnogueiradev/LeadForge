import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class GetLeadUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        organization: true,
        contact: true,
        deals: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
          include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    return lead;
  }
}
