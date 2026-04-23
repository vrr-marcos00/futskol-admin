import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatCurrency(value: number | string | undefined | null): string {
  if (value == null || value === '') return brl.format(0);
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return brl.format(0);
  return brl.format(n);
}

export function formatDate(value: string | Date | undefined | null): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatMonth(value: string | undefined | null): string {
  if (!value) return '-';
  const [year, month] = value.split('-');
  return `${month}/${year}`;
}

export function formatMonthLong(value: string | undefined | null): string {
  if (!value) return '-';
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

export function currentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '-';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function formatCpf(cpf: string | undefined | null): string {
  if (!cpf) return '-';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
