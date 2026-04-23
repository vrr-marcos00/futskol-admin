import { api } from './client';
import type { Payment, PaymentStatus } from '@/types/domain';

export interface PaymentPayload {
  playerId: string;
  referenceMonth: string; // yyyy-MM
  amount?: number;
  status?: PaymentStatus;
  paymentDate?: string | null;
  notes?: string | null;
}

export interface PaymentFilters {
  playerId?: string;
  status?: PaymentStatus;
  yearMonth?: string;
}

export const paymentsApi = {
  list: (filters: PaymentFilters = {}) =>
    api.get<Payment[]>('/payments', { params: filters }).then((r) => r.data),
  byMonth: (yearMonth: string) =>
    api.get<Payment[]>(`/payments/month/${yearMonth}`).then((r) => r.data),
  create: (payload: PaymentPayload) =>
    api.post<Payment>('/payments', payload).then((r) => r.data),
  update: (id: string, payload: PaymentPayload) =>
    api.put<Payment>(`/payments/${id}`, payload).then((r) => r.data),
};
