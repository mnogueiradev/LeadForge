import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getDashboardData(tenantId: string) {
    const baseWhere = { tenantId, deletedAt: null };

    // 1. Total Leads
    const totalLeads = await this.prisma.lead.count({ where: baseWhere });

    // 2. Converted Leads
    const convertedLeads = await this.prisma.lead.count({
      where: { ...baseWhere, status: 'CONVERTED' },
    });

    // 3. Estimated Value (Sum)
    const sumResult = await this.prisma.lead.aggregate({
      where: baseWhere,
      _sum: { estimatedValue: true },
    });
    const totalEstimatedValue = sumResult._sum.estimatedValue?.toNumber() || 0;

    // 4. Conversion Rate
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // 5. Leads by Status (Funnel)
    const statusGroups = await this.prisma.lead.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: true,
    });
    const funnelData = statusGroups.map((g: any) => ({
      status: g.status,
      count: g._count,
    }));

    // 6. Leads by Temperature
    const tempGroups = await this.prisma.lead.groupBy({
      by: ['temperature'],
      where: baseWhere,
      _count: true,
    });
    const temperatureData = tempGroups.map((g: any) => ({
      temperature: g.temperature,
      count: g._count,
    }));

    // 7. Recent Leads (last 5)
    const recentLeads = await this.prisma.lead.findMany({
      where: baseWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        contact: { select: { firstName: true, lastName: true, primaryEmail: true } },
      },
    });

    return {
      kpis: {
        totalLeads,
        convertedLeads,
        totalEstimatedValue,
        conversionRate,
      },
      charts: {
        funnel: funnelData,
        temperature: temperatureData,
      },
      recentLeads: recentLeads.map((l: any) => ({
        id: l.id,
        title: l.title,
        status: l.status,
        createdAt: l.createdAt,
        contactName: l.contact ? `${l.contact.firstName} ${l.contact.lastName || ''}`.trim() : 'Sem contato',
        contactEmail: l.contact?.primaryEmail || '',
        value: l.estimatedValue?.toNumber() || 0,
      })),
    };
  }
}
