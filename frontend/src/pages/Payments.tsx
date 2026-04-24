import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Receipt, CheckCircle2, CalendarDays, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { DatePicker } from '@/components/ui/date-picker';
import { MonthPicker } from '@/components/ui/month-picker';
import { paymentsApi } from '@/api/payments';
import { playersApi } from '@/api/players';
import type { Payment, PaymentStatus, Player } from '@/types/domain';
import { currentYearMonth, formatCurrency, formatDate, formatMonthLong } from '@/lib/format';
import { useToast } from '@/components/ui/toaster';
import { getApiErrorMessage } from '@/api/client';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PAGO: 'Pago',
  PENDENTE: 'Pendente',
  ATRASADO: 'Atrasado',
  ISENTO: 'Isento',
};

function statusBadge(status: PaymentStatus, injuryId?: string | null) {
  switch (status) {
    case 'PAGO':
      return <Badge variant="success">Pago</Badge>;
    case 'PENDENTE':
      return <Badge variant="warning">Pendente</Badge>;
    case 'ATRASADO':
      return <Badge variant="danger">Atrasado</Badge>;
    case 'ISENTO':
      return (
        <Badge variant="info" title={injuryId ? 'Isento por lesão' : undefined}>
          {injuryId ? 'Isento (lesão)' : 'Isento'}
        </Badge>
      );
  }
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const schema = z.object({
  playerId: z.string().min(1, 'Selecione o jogador'),
  referenceMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Use formato yyyy-MM'),
  amount: z.coerce.number().min(0),
  status: z.enum(['PAGO', 'PENDENTE', 'ATRASADO', 'ISENTO']),
  paymentDate: z
    .string()
    .optional()
    .refine((v) => !v || v <= todayIso(), 'Data de pagamento não pode ser futura'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function PaymentsPage() {
  const { toast } = useToast();
  const [month, setMonth] = useState<string>(currentYearMonth());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [annualOpen, setAnnualOpen] = useState(false);
  const [annualLoading, setAnnualLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [annualForm, setAnnualForm] = useState({
    playerId: '',
    year: new Date().getFullYear(),
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    status: 'PAGO' as PaymentStatus,
    paymentDate: new Date().toISOString().substring(0, 10),
    amount: undefined as number | undefined,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      playerId: '',
      referenceMonth: month,
      amount: 0,
      status: 'PAGO',
      paymentDate: new Date().toISOString().substring(0, 10),
      notes: '',
    },
  });

  async function load() {
    setLoading(true);
    try {
      const [list, pls] = await Promise.all([
        paymentsApi.byMonth(month),
        playersApi.list({ active: true }),
      ]);
      setPayments(list);
      setPlayers(pls);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  function openCreate() {
    setEditing(null);
    form.reset({
      playerId: players[0]?.id ?? '',
      referenceMonth: month,
      amount: players[0]?.type.monthlyFee ?? 0,
      status: 'PAGO',
      paymentDate: new Date().toISOString().substring(0, 10),
      notes: '',
    });
    setDialogOpen(true);
  }

  function openEdit(p: Payment) {
    setEditing(p);
    form.reset({
      playerId: p.playerId,
      referenceMonth: p.referenceMonth,
      amount: p.amount,
      status: p.status,
      paymentDate: p.paymentDate ?? '',
      notes: p.notes ?? '',
    });
    setDialogOpen(true);
  }

  async function markPaid(p: Payment) {
    try {
      await paymentsApi.update(p.id, {
        playerId: p.playerId,
        referenceMonth: p.referenceMonth,
        amount: p.amount,
        status: 'PAGO',
        paymentDate: new Date().toISOString().substring(0, 10),
        notes: p.notes,
      });
      toast({ title: 'Pagamento confirmado', variant: 'success' });
      load();
    } catch (err) {
      toast({ title: 'Erro', description: getApiErrorMessage(err), variant: 'destructive' });
    }
  }

  async function handleGenerateMonthly() {
    setGenerateLoading(true);
    try {
      const result = await paymentsApi.generateMonthly(month);
      if (result.created === 0) {
        toast({ title: 'Nenhuma mensalidade criada', description: `Todos os ${result.skipped} mensalistas/plantonistas já têm pagamento nesse mês.`, variant: 'default' });
      } else {
        toast({
          title: `${result.created} mensalidade${result.created > 1 ? 's' : ''} criada${result.created > 1 ? 's' : ''}`,
          description: result.skipped > 0 ? `${result.skipped} já existiam.` : undefined,
          variant: 'success',
        });
      }
      load();
    } catch (err) {
      toast({ title: 'Erro ao gerar mensalidades', description: getApiErrorMessage(err), variant: 'destructive' });
    } finally {
      setGenerateLoading(false);
    }
  }

  function openAnnual() {
    const eligible = players.filter((p) => p.type.generatesMonthlyPayment);
    setAnnualForm({
      playerId: eligible[0]?.id ?? '',
      year: new Date().getFullYear(),
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      status: 'PAGO',
      paymentDate: new Date().toISOString().substring(0, 10),
      amount: eligible[0]?.type.monthlyFee,
    });
    setAnnualOpen(true);
  }

  async function handleAnnualSubmit() {
    if (!annualForm.playerId) {
      toast({ title: 'Selecione um jogador', variant: 'destructive' });
      return;
    }
    if (annualForm.months.length === 0) {
      toast({ title: 'Selecione ao menos um mês', variant: 'destructive' });
      return;
    }
    setAnnualLoading(true);
    try {
      const result = await paymentsApi.createAnnual({
        playerId: annualForm.playerId,
        year: annualForm.year,
        months: annualForm.months,
        status: annualForm.status,
        paymentDate: annualForm.status === 'PAGO' ? annualForm.paymentDate : null,
        amount: annualForm.amount,
      });
      const msg = result.skipped.length > 0
        ? `${result.created.length} criado(s). Ignorados (já existiam): ${result.skipped.join(', ')}`
        : `${result.created.length} pagamento${result.created.length > 1 ? 's' : ''} criado${result.created.length > 1 ? 's' : ''}.`;
      toast({ title: 'Pagamento anual registrado', description: msg, variant: 'success' });
      setAnnualOpen(false);
      load();
    } catch (err) {
      toast({ title: 'Erro ao registrar pagamento anual', description: getApiErrorMessage(err), variant: 'destructive' });
    } finally {
      setAnnualLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        playerId: values.playerId,
        referenceMonth: values.referenceMonth,
        amount: values.amount,
        status: values.status,
        paymentDate: values.paymentDate || null,
        notes: values.notes || null,
      };
      if (editing) {
        await paymentsApi.update(editing.id, payload);
        toast({ title: 'Pagamento atualizado', variant: 'success' });
      } else {
        await paymentsApi.create(payload);
        toast({ title: 'Pagamento criado', variant: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast({ title: 'Erro ao salvar', description: getApiErrorMessage(err), variant: 'destructive' });
    }
  }

  const totals = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'PAGO').reduce((a, p) => a + Number(p.amount), 0);
    const pending = payments
      .filter((p) => p.status === 'PENDENTE' || p.status === 'ATRASADO')
      .reduce((a, p) => a + Number(p.amount), 0);
    return { paid, pending };
  }, [payments]);

  const selectedPlayer = players.find((p) => p.id === form.watch('playerId'));
  useEffect(() => {
    if (!editing && selectedPlayer) {
      form.setValue('amount', selectedPlayer.type.monthlyFee);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('playerId')]);

  return (
    <>
      <PageHeader
        title="Pagamentos"
        description={formatMonthLong(month)}
        actions={
          <>
            <MonthPicker value={month} onChange={setMonth} className="w-[200px]" />
            <Button variant="outline" onClick={handleGenerateMonthly} disabled={generateLoading}>
              <Zap className="h-4 w-4" /> {generateLoading ? 'Gerando...' : 'Gerar mensalidades'}
            </Button>
            <Button variant="outline" onClick={openAnnual}>
              <CalendarDays className="h-4 w-4" /> Pgto. anual
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Novo pagamento
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Recebido no mês</p>
              <p className="text-2xl font-extrabold">{formatCurrency(totals.paid)}</p>
            </div>
            <Badge variant="success">PAGO</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Em aberto</p>
              <p className="text-2xl font-extrabold">{formatCurrency(totals.pending)}</p>
            </div>
            <Badge variant="warning">PENDENTE + ATRASADO</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : payments.length === 0 ? (
            <EmptyState
              icon={<Receipt className="h-10 w-10" />}
              title={`Nenhum pagamento em ${formatMonthLong(month)}`}
              description="Crie pagamentos para esse mês."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Novo pagamento
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.playerName}</TableCell>
                    <TableCell>{statusBadge(p.status, p.injuryId)}</TableCell>
                    <TableCell>{formatCurrency(p.amount)}</TableCell>
                    <TableCell>{formatDate(p.paymentDate)}</TableCell>
                    <TableCell className="flex justify-end gap-1">
                      {p.status !== 'PAGO' && p.status !== 'ISENTO' && (
                        <Button variant="ghost" size="icon" onClick={() => markPaid(p)} aria-label="Marcar como pago">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog pagamento anual */}
      <Dialog open={annualOpen} onOpenChange={setAnnualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagamento anual</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Jogador</Label>
              <Select
                value={annualForm.playerId}
                onValueChange={(v) => {
                  const player = players.find((p) => p.id === v);
                  setAnnualForm((f) => ({ ...f, playerId: v, amount: player?.type.monthlyFee }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {players
                    .filter((p) => p.type.generatesMonthlyPayment)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.type.name})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Ano</Label>
                <Input
                  type="number"
                  min={2000}
                  max={2100}
                  value={annualForm.year}
                  onChange={(e) => setAnnualForm((f) => ({ ...f, year: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={annualForm.amount ?? ''}
                  onChange={(e) => setAnnualForm((f) => ({ ...f, amount: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Meses</Label>
                <button
                  type="button"
                  className="text-xs text-primary underline"
                  onClick={() =>
                    setAnnualForm((f) => ({
                      ...f,
                      months: f.months.length === 12 ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                    }))
                  }
                >
                  {annualForm.months.length === 12 ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {MONTH_NAMES.map((name, i) => {
                  const m = i + 1;
                  const checked = annualForm.months.includes(m);
                  return (
                    <label
                      key={m}
                      className={`flex cursor-pointer items-center justify-center rounded border px-2 py-1 text-xs font-medium transition-colors ${
                        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() =>
                          setAnnualForm((f) => ({
                            ...f,
                            months: checked ? f.months.filter((x) => x !== m) : [...f.months, m].sort((a, b) => a - b),
                          }))
                        }
                      />
                      {name}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={annualForm.status}
                  onValueChange={(v) => setAnnualForm((f) => ({ ...f, status: v as PaymentStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABEL) as PaymentStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {annualForm.status === 'PAGO' && (
                <div className="space-y-1.5">
                  <Label>Data do pagamento</Label>
                  <DatePicker
                    value={annualForm.paymentDate}
                    onChange={(v) => setAnnualForm((f) => ({ ...f, paymentDate: v || f.paymentDate }))}
                    maxDate={todayIso()}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAnnualOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAnnualSubmit} disabled={annualLoading}>
              {annualLoading ? 'Registrando...' : `Registrar ${annualForm.months.length} mês(es)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar pagamento' : 'Novo pagamento'}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label>Jogador</Label>
              <Select
                value={form.watch('playerId')}
                onValueChange={(v) => form.setValue('playerId', v, { shouldValidate: true })}
                disabled={Boolean(editing)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.type.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.playerId && (
                <p className="text-xs text-destructive">{form.formState.errors.playerId.message}</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Mês referência</Label>
                <MonthPicker
                  value={form.watch('referenceMonth')}
                  onChange={(v) => form.setValue('referenceMonth', v, { shouldValidate: true })}
                />
                {form.formState.errors.referenceMonth && (
                  <p className="text-xs text-destructive">{form.formState.errors.referenceMonth.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" min="0" {...form.register('amount')} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(v) => form.setValue('status', v as PaymentStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABEL) as PaymentStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Data do pagamento</Label>
                <DatePicker
                  value={form.watch('paymentDate') ?? ''}
                  onChange={(v) => form.setValue('paymentDate', v || undefined, { shouldValidate: true })}
                  maxDate={todayIso()}
                />
                {form.formState.errors.paymentDate && (
                  <p className="text-xs text-destructive">{form.formState.errors.paymentDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea {...form.register('notes')} rows={2} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
