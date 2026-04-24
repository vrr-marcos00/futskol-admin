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

export interface AnnualPaymentPayload {
  playerId: string;
  year: number;
  months: number[]; // 1-12
  status?: PaymentStatus;
  paymentDate?: string | null;
  amount?: number;
}

export interface AnnualPaymentResult {
  created: Payment[];
  skipped: string[]; // yyyy-MM
}

export interface GenerateMonthlyResult {
  created: number;
  skipped: number;
  createdPlayerNames: string[];
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
  createAnnual: (payload: AnnualPaymentPayload) =>
    api.post<AnnualPaymentResult>('/payments/annual', payload).then((r) => r.data),
  generateMonthly: (yearMonth: string) =>
    api.post<GenerateMonthlyResult>('/payments/generate-monthly', null, { params: { yearMonth } }).then((r) => r.data),
};
