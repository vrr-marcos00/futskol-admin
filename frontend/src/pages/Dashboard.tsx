import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Bandage,
  Loader2,
  PiggyBank,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardApi } from '@/api/dashboard';
import { paymentsApi } from '@/api/payments';
import { injuriesApi } from '@/api/injuries';
import type { DashboardSummary, Injury, Payment } from '@/types/domain';
import { currentYearMonth, formatCurrency, formatDate, formatMonthLong } from '@/lib/format';
import { cn } from '@/lib/utils';
import { MonthPicker } from '@/components/ui/month-picker';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: 'primary' | 'secondary' | 'danger' | 'emerald' | 'sky' | 'orange';
  hint?: string;
}

function StatCard({ label, value, icon: Icon, accent, hint }: StatCardProps) {
  const accents: Record<StatCardProps['accent'], string> = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/30 text-secondary-foreground',
    danger: 'bg-rose-100 text-rose-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    sky: 'bg-sky-100 text-sky-700',
    orange: 'bg-orange-100 text-orange-700',
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-extrabold tracking-tight">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn('rounded-xl p-3', accents[accent])}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function buildLastMonths(count: number, anchor: string): string[] {
  const [y, m] = anchor.split('-').map(Number);
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

export function DashboardPage() {
  const [month, setMonth] = useState<string>(currentYearMonth());
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [history, setHistory] = useState<{ month: string; pago: number; pendente: number }[]>([]);
  const [activeInjuries, setActiveInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [sum, injuries] = await Promise.all([
          dashboardApi.summary(month),
          injuriesApi.list({ active: true }),
        ]);
        if (cancelled) return;
        setSummary(sum);
        setActiveInjuries(injuries);

        const months = buildLastMonths(6, month);
        const responses = await Promise.all(months.map((m) => paymentsApi.byMonth(m)));
        if (cancelled) return;

        const chart = months.map((m, idx) => {
          const list: Payment[] = responses[idx];
          const pago = list.filter((p) => p.status === 'PAGO').reduce((acc, p) => acc + Number(p.amount), 0);
          const pendente = list
            .filter((p) => p.status === 'PENDENTE' || p.status === 'ATRASADO')
            .reduce((acc, p) => acc + Number(p.amount), 0);
          const [y, mm] = m.split('-');
          return { month: `${mm}/${y.slice(2)}`, pago, pendente };
        });
        setHistory(chart);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [month]);

  const paymentRate = useMemo(() => {
    if (!summary || summary.totalExpected <= 0) return 0;
    return Math.round((summary.totalPaid / summary.totalExpected) * 100);
  }, [summary]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Visão financeira de ${formatMonthLong(month)}`}
        actions={<MonthPicker value={month} onChange={setMonth} className="w-[200px]" />}
      />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      )}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total pago"
              value={formatCurrency(summary.totalPaid)}
              icon={ArrowUpCircle}
              accent="emerald"
              hint={`${summary.payingCount} pagantes • ${paymentRate}% da expectativa`}
            />
            <StatCard
              label="Total pendente"
              value={formatCurrency(summary.totalPending)}
              icon={ArrowDownCircle}
              accent="danger"
              hint={`${summary.defaultingCount} inadimplente(s)`}
            />
            <StatCard
              label="Total custos"
              value={formatCurrency(summary.totalCosts)}
              icon={ReceiptText}
              accent="sky"
              hint="Saídas do mês"
            />
            <StatCard
              label="Caixa atual"
              value={formatCurrency(summary.currentCash)}
              icon={PiggyBank}
              accent={summary.currentCash >= 0 ? 'primary' : 'danger'}
              hint="Saldo acumulado"
            />
            <StatCard
              label="Lesionados"
              value={String(summary.injuredCount)}
              icon={Bandage}
              accent="orange"
              hint={summary.injuredCount === 0 ? 'Elenco completo' : `${summary.injuredCount === 1 ? 'jogador fora' : 'jogadores fora'}`}
            />
          </div>

          {activeInjuries.length > 0 && (
            <Card className="mt-6 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bandage className="h-4 w-4 text-orange-600" /> Lesionados no momento
                  </CardTitle>
                  <CardDescription>
                    {activeInjuries.length} {activeInjuries.length === 1 ? 'jogador afastado' : 'jogadores afastados'}
                  </CardDescription>
                </div>
                <Link to="/injuries" className="text-sm font-medium text-primary hover:underline">
                  Ver todos
                </Link>
              </CardHeader>
              <CardContent>
                <ul className="divide-y text-sm">
                  {activeInjuries.slice(0, 5).map((i) => (
                    <li key={i.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">{i.playerName}</p>
                        <p className="text-xs text-muted-foreground">
                          Desde {formatDate(i.startDate)}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-orange-700">
                        {i.daysInjured} {i.daysInjured === 1 ? 'dia' : 'dias'}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Pagamentos por mês</CardTitle>
                <CardDescription>Comparativo últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="pago" name="Pago" fill="#009C3B" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="pendente" name="Pendente/Atrasado" fill="#FFDF00" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo do mês</CardTitle>
                <CardDescription>{formatMonthLong(month)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" /> Total esperado
                  </span>
                  <span className="font-semibold">{formatCurrency(summary.totalExpected)}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" /> Pagantes
                  </span>
                  <span className="font-semibold">{summary.payingCount}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <TrendingDown className="h-4 w-4" /> Inadimplentes
                  </span>
                  <span className="font-semibold">{summary.defaultingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <PiggyBank className="h-4 w-4" /> Caixa
                  </span>
                  <span
                    className={cn(
                      'font-semibold',
                      summary.currentCash >= 0 ? 'text-primary' : 'text-destructive'
                    )}
                  >
                    {formatCurrency(summary.currentCash)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
