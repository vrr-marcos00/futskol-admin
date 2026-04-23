import { api } from './client';
import type { Cost, CostCategory } from '@/types/domain';

export interface CostPayload {
  name: string;
  category: CostCategory;
  amount: number;
  date: string;
  notes?: string | null;
}

export interface CostFilters {
  category?: CostCategory;
  from?: string;
  to?: string;
}

export const costsApi = {
  list: (filters: CostFilters = {}) =>
    api.get<Cost[]>('/costs', { params: filters }).then((r) => r.data),
  create: (payload: CostPayload) =>
    api.post<Cost>('/costs', payload).then((r) => r.data),
  update: (id: string, payload: CostPayload) =>
    api.put<Cost>(`/costs/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/costs/${id}`),
};
