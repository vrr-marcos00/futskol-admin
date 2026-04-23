import { api } from './client';
import type { CashSummary, DashboardSummary } from '@/types/domain';

export const dashboardApi = {
  summary: (yearMonth?: string) =>
    api.get<DashboardSummary>('/dashboard', { params: yearMonth ? { yearMonth } : {} })
      .then((r) => r.data),
  cash: () => api.get<CashSummary>('/dashboard/cash').then((r) => r.data),
};
