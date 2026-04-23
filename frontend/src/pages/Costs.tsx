import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, HandCoins } from 'lucide-react';
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
import { costsApi } from '@/api/costs';
import type { Cost, CostCategory } from '@/types/domain';
import { currentYearMonth, formatCurrency, formatDate } from '@/lib/format';
import { useToast } from '@/components/ui/toaster';
import { getApiErrorMessage } from '@/api/client';

const CATEGORY_LABEL: Record<CostCategory, string> = {
  CAMPO: 'Campo',
  ARBITRAGEM: 'Arbitragem',
  GOLEIROS: 'Goleiros',
  CHURRASCO_MENSAL: 'Churrasco Mensal',
  OUTROS: 'Outros',
};
const CATEGORIES = Object.keys(CATEGORY_LABEL) as CostCategory[];

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const schema = z.object({
  name: z.string().min(2, 'Informe o nome'),
  category: z.enum(['CAMPO', 'ARBITRAGEM', 'GOLEIROS', 'CHURRASCO_MENSAL', 'OUTROS']),
  amount: z.coerce.number().min(0),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .refine((v) => v <= todayIso(), 'Data não pode ser futura'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CostsPage() {
  const { toast } = useToast();
  const [costs, setCosts] = useState<Cost[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>(currentYearMonth());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cost | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      category: 'CAMPO',
      amount: 0,
      date: new Date().toISOString().substring(0, 10),
      notes: '',
    },
  });

  async function load() {
    setLoading(true);
    try {
      let from: string | undefined;
      let to: string | undefined;
      if (filterMonth) {
        const [y, m] = filterMonth.split('-').map(Number);
        from = `${filterMonth}-01`;
        const lastDay = new Date(y, m, 0).getDate();
        to = `${filterMonth}-${String(lastDay).padStart(2, '0')}`;
      }
      setCosts(
        await costsApi.list({
          category: filterCategory === 'all' ? undefined : (filterCategory as CostCategory),
          from,
          to,
        })
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterMonth]);

  const totalAmount = useMemo(() => costs.reduce((sum, c) => sum + Number(c.amount), 0), [costs]);

  function openCreate() {
    setEditing(null);
    form.reset({
      name: '',
      category: 'CAMPO',
      amount: 0,
      date: new Date().toISOString().substring(0, 10),
      notes: '',
    });
    setDialogOpen(true);
  }

  function openEdit(c: Cost) {
    setEditing(c);
    form.reset({
      name: c.name,
      category: c.category,
      amount: c.amount,
      date: c.date,
      notes: c.notes ?? '',
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = { ...values, notes: values.notes || null };
      if (editing) {
        await costsApi.update(editing.id, payload);
        toast({ title: 'Custo atualizado', variant: 'success' });
      } else {
        await costsApi.create(payload);
        toast({ title: 'Custo criado', variant: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast({ title: 'Erro', description: getApiErrorMessage(err), variant: 'destructive' });
    }
  }

  async function remove(c: Cost) {
    if (!confirm(`Remover custo "${c.name}"?`)) return;
    try {
      await costsApi.remove(c.id);
      toast({ title: 'Custo removido', variant: 'success' });
      load();
    } catch (err) {
      toast({ title: 'Erro', description: getApiErrorMessage(err), variant: 'destructive' });
    }
  }

  return (
    <>
      <PageHeader
        title="Custos"
        description="Despesas operacionais da pelada"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo custo
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-[minmax(0,16rem)_minmax(0,16rem)_auto] sm:items-center">
          <MonthPicker
            value={filterMonth}
            onChange={setFilterMonth}
            allowClear
            clearLabel="Todos os meses"
            placeholder="Todos os meses"
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground sm:justify-self-end">
            Total: <span className="font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : costs.length === 0 ? (
            <EmptyState
              icon={<HandCoins className="h-10 w-10" />}
              title="Nenhum custo cadastrado"
              description="Registre o primeiro custo da pelada."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Novo custo
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{formatDate(c.date)}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{CATEGORY_LABEL[c.category]}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(c.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(c)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar custo' : 'Novo custo'}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select
                  value={form.watch('category')}
                  onValueChange={(v) => form.setValue('category', v as CostCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" min="0" {...form.register('amount')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Data</Label>
              <DatePicker
                value={form.watch('date')}
                onChange={(v) => form.setValue('date', v, { shouldValidate: true })}
                maxDate={todayIso()}
              />
              {form.formState.errors.date && (
                <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
              )}
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
