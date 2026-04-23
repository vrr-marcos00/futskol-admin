export type UserRole = 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface PlayerType {
  id: string;
  name: string;
  monthlyFee: number;
  monthlyLimit: number | null;
  active: boolean;
}

export interface InjurySummary {
  id: string;
  startDate: string;
  notes?: string | null;
}

export interface Player {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  type: PlayerType;
  active: boolean;
  notes?: string | null;
  injury?: InjurySummary | null;
}

export type PaymentStatus = 'PAGO' | 'PENDENTE' | 'ATRASADO' | 'ISENTO';

export interface Payment {
  id: string;
  playerId: string;
  playerName: string;
  referenceMonth: string; // "yyyy-MM"
  amount: number;
  status: PaymentStatus;
  paymentDate?: string | null;
  notes?: string | null;
  injuryId?: string | null;
}

export interface Injury {
  id: string;
  playerId: string;
  playerName: string;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  daysInjured: number;
  active: boolean;
}

export type CostCategory = 'CAMPO' | 'ARBITRAGEM' | 'GOLEIROS' | 'CHURRASCO_MENSAL' | 'OUTROS';

export interface Cost {
  id: string;
  name: string;
  category: CostCategory;
  amount: number;
  date: string;
  notes?: string | null;
}

export interface DashboardSummary {
  month: string;
  totalExpected: number;
  totalPaid: number;
  totalPending: number;
  payingCount: number;
  defaultingCount: number;
  injuredCount: number;
  totalCosts: number;
  currentCash: number;
}

export interface CashSummary {
  totalPaid: number;
  totalCosts: number;
  currentCash: number;
}
