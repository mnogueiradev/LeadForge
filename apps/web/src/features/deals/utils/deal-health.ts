import { differenceInDays } from 'date-fns';

export type DealHealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export interface DealHealth {
  status: DealHealthStatus;
  daysSinceLastInteraction: number;
  message: string;
}

export function calculateDealHealth(dealUpdatedAt: string | Date | undefined): DealHealth {
  if (!dealUpdatedAt) {
    return {
      status: 'HEALTHY',
      daysSinceLastInteraction: 0,
      message: 'Negócio recente',
    };
  }

  const days = differenceInDays(new Date(), new Date(dealUpdatedAt));

  if (days <= 7) {
    return {
      status: 'HEALTHY',
      daysSinceLastInteraction: days,
      message: days === 0 ? 'Atualizado hoje' : `Atualizado há ${days} dia(s)`,
    };
  }

  if (days <= 14) {
    return {
      status: 'WARNING',
      daysSinceLastInteraction: days,
      message: `Atenção: Sem interação há ${days} dias`,
    };
  }

  return {
    status: 'CRITICAL',
    daysSinceLastInteraction: days,
    message: `Crítico: Parado há ${days} dias`,
  };
}

export function getDealHealthColor(status: DealHealthStatus): string {
  switch (status) {
    case 'HEALTHY':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900';
    case 'WARNING':
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900';
    case 'CRITICAL':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}
