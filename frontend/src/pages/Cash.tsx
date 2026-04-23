import { useEffect, useMemo, useState } from 'react';
import { PiggyBank, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { dashboardApi } from '@/api/dashboard';
import { paymentsApi } from '@/api/payments';
import { costsApi } from '@/api/costs';
import type { CashSummary, Cost, Payment } from '@/types/domain';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  direction: 'IN' | 'OUT';
  meta: string;
}

export function CashPage() {
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [s, p, c] = await Promise.all([
          dashboardApi.cash(),
          paymentsApi.list({ status: 'PAGO' }),
          costsApi.list(),
        ]);
        if (cancelled) return;
        setSummary(s);
        setPayments(p);
        setCosts(c);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ledger: LedgerEntry[] = useMemo(() => {
    const entries: LedgerEntry[] = [];
    payments.forEach((p) => {
      entries.push({
        id: `p-${p.id}`,
        date: p.paymentDate ?? p.referenceMonth + '-01',
        description: `Pagamento de ${p.playerName}`,
        amount: Number(p.amount),
        direction: 'IN',
        meta: p.referenceMonth,
      });
    });
    costs.forEach((c) => {
      entries.push({
        id: `c-${c.id}`,
        date: c.date,
        description: c.name,
        amount: Number(c.amount),
        direction: 'OUT',
        meta: c.category,
      });
    });
    return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [payments, costs]);

  return (
    <>
      <PageHeader title="Caixa" description="Saldo acumulado de todas as operações" />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      )}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Total recebido</p>
                  <p className="text-2xl font-extrabold">{formatCurrency(summary.totalPaid)}</p>
                </div>
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                  <ArrowUpCircle className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Total de custos</p>
                  <p className="text-2xl font-extrabold">{formatCurrency(summary.totalCosts)}</p>
                </div>
                <div className="rounded-xl bg-rose-100 p-3 text-rose-700">
                  <ArrowDownCircle className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
            <Card className={cn('border-2', summary.currentCash >= 0 ? 'border-primary' : 'border-destructive')}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Caixa atual</p>
                  <p
                    className={cn(
                      'text-2xl font-extrabold',
                      summary.currentCash >= 0 ? 'text-primary' : 'text-destructive'
                    )}
                  >
                    {formatCurrency(summary.currentCash)}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <PiggyBank className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Extrato</CardTitle>
              <CardDescription>Entradas (pagamentos) e saídas (custos)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="p-8 text-center text-sm text-muted-foreground">
                        Sem movimentos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ledger.slice(0, 100).map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{formatDate(e.date)}</TableCell>
                        <TableCell className="font-medium">{e.description}</TableCell>
                        <TableCell>
                          {e.direction === 'IN' ? (
                            <Badge variant="success">Entrada</Badge>
                          ) : (
                            <Badge variant="danger">Saída</Badge>
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-semibold',
                            e.direction === 'IN' ? 'text-emerald-700' : 'text-rose-700'
                          )}
                        >
                          {e.direction === 'IN' ? '+ ' : '− '}
                          {formatCurrency(e.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {ledger.length > 100 && (
                <p className="p-3 text-center text-xs text-muted-foreground">
                  Exibindo 100 movimentos mais recentes de {ledger.length}.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
