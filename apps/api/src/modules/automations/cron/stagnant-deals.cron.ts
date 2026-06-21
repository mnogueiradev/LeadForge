import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient, ActivityType, ActivityStatus, ActivityPriority } from '@prisma/client';
import { subDays, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class StagnantDealsCron {
  private readonly logger = new Logger(StagnantDealsCron.name);

  constructor(private readonly prisma: PrismaClient) {}

  // Roda todos os dias à meia-noite (pode ser ajustado para horários específicos)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleStagnantDeals() {
    this.logger.log('Iniciando verificação de negócios parados...');

    try {
      await this.checkDealsForDays(7, 'Atenção: Negócio sem interação há 7 dias', ActivityPriority.MEDIUM);
      await this.checkDealsForDays(14, 'Aviso: Negócio parado há 14 dias', ActivityPriority.HIGH);
      await this.checkDealsForDays(30, 'Crítico: Negócio estagnado há 30 dias', ActivityPriority.URGENT);
      
      this.logger.log('Verificação de negócios parados concluída.');
    } catch (error) {
      this.logger.error('Erro ao verificar negócios parados', error.stack);
    }
  }

  private async checkDealsForDays(days: number, title: string, priority: ActivityPriority) {
    const targetDateStart = startOfDay(subDays(new Date(), days));
    const targetDateEnd = endOfDay(subDays(new Date(), days));

    // Busca negócios abertos que foram atualizados exatamente "days" atrás
    const stagnantDeals = await this.prisma.deal.findMany({
      where: {
        status: 'OPEN',
        updatedAt: {
          gte: targetDateStart,
          lte: targetDateEnd,
        },
      },
    });

    if (stagnantDeals.length === 0) {
      return;
    }

    this.logger.log(`Encontrados ${stagnantDeals.length} negócios parados há exatos ${days} dias.`);

    let createdCount = 0;

    for (const deal of stagnantDeals) {
      // Verifica se já existe atividade pendente de follow-up/task
      const hasPendingActivity = await this.prisma.activity.findFirst({
        where: {
          tenantId: deal.tenantId,
          dealId: deal.id,
          status: ActivityStatus.PENDING,
        },
      });

      if (!hasPendingActivity) {
        await this.prisma.activity.create({
          data: {
            tenantId: deal.tenantId,
            ownerUserId: deal.ownerUserId,
            createdByUserId: deal.ownerUserId, // Sistema/Dono
            dealId: deal.id,
            contactId: deal.contactId,
            organizationId: deal.organizationId,
            leadId: deal.leadId,
            title,
            description: `Este negócio não sofre nenhuma alteração ou atividade há ${days} dias. Por favor, verifique a situação e entre em contato com o cliente.`,
            type: ActivityType.TASK,
            status: ActivityStatus.PENDING,
            priority,
            dueDate: startOfDay(new Date()), // Para fazer hoje
          },
        });
        createdCount++;
      }
    }

    if (createdCount > 0) {
      this.logger.log(`Foram criadas ${createdCount} atividades para negócios parados há ${days} dias.`);
    }
  }
}
