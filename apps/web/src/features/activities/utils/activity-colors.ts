import { ActivityType } from '../api/use-activities';

export const getActivityColorClass = (type: ActivityType | string) => {
  switch (type) {
    case 'call': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'meeting': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800';
    case 'email': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'whatsapp': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'follow_up': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    case 'task': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  }
};

export const getActivityHexColor = (type: ActivityType | string) => {
  // Cores sólidas para uso no FullCalendar que precisam de hex ou rgb/hsl
  switch (type) {
    case 'call': return '#10b981'; // emerald-500
    case 'meeting': return '#f97316'; // orange-500
    case 'email': return '#3b82f6'; // blue-500
    case 'whatsapp': return '#10b981'; // emerald-500
    case 'follow_up': return '#f59e0b'; // amber-500
    case 'task': return '#a855f7'; // purple-500
    default: return '#6b7280'; // gray-500
  }
};
