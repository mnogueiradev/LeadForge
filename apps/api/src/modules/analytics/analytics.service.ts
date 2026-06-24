import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getDashboardData(tenantId: string) {
    const baseWhere = { tenantId, deletedAt: null };

    // 1. Leads Ativos (status != 'CONVERTED' and status != 'JUNK' or 'LOST' if applicable)
    // Looking at common status, let's just exclude CONVERTED and LOST
    const activeLeads = await this.prisma.lead.count({
      where: { ...baseWhere, status: { notIn: ['CONVERTED', 'LOST', 'UNQUALIFIED', 'ARCHIVED'] } },
    });

    // 2. Negócios Abertos
    const openDeals = await this.prisma.deal.count({
      where: { ...baseWhere, status: 'OPEN' },
    });

    // 3. Receita Prevista (Deals OPEN value sum)
    const sumResult = await this.prisma.deal.aggregate({
      where: { ...baseWhere, status: 'OPEN' },
      _sum: { value: true },
    });
    const expectedRevenue = sumResult._sum.value?.toNumber() || 0;

    // 4. Atividades Pendentes
    const pendingActivities = await this.prisma.activity.count({
      where: { ...baseWhere, status: { in: ['PENDING', 'IN_PROGRESS', 'OVERDUE'] } },
    });

    // 5. Recent Leads (last 5)
    const recentLeadsDb = await this.prisma.lead.findMany({
      where: baseWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        contact: { select: { firstName: true, lastName: true } },
        organization: { select: { name: true } },
      },
    });

    const recentLeads = recentLeadsDb.map((l: any) => ({
      id: l.id,
      name: l.contact ? `${l.contact.firstName} ${l.contact.lastName || ''}`.trim() : l.title,
      company: l.organization?.name || 'Sem Empresa',
      value: l.estimatedValue?.toNumber() || 0,
      status: l.status,
    }));

    // 6. Recent Activities
    const recentActivitiesDb = await this.prisma.activity.findMany({
      where: baseWhere,
      orderBy: { dueDate: 'desc' },
      take: 5,
      include: {
        deal: { select: { title: true } },
        lead: { select: { title: true } },
      },
    });

    const recentActivities = recentActivitiesDb.map((a: any) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      dueDate: a.dueDate,
      isDone: a.status === 'COMPLETED',
      relatedTo: a.deal?.title || a.lead?.title || 'Geral',
    }));

    return {
      kpis: {
        activeLeads,
        openDeals,
        expectedRevenue,
        pendingActivities,
      },
      recentLeads,
      recentActivities,
    };
  }
}
