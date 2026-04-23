import { useEffect, useState } from 'react';
import { Plus, Pencil, Tags } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { playerTypesApi } from '@/api/playerTypes';
import type { PlayerType } from '@/types/domain';
import { formatCurrency } from '@/lib/format';
import { useToast } from '@/components/ui/toaster';
import { getApiErrorMessage } from '@/api/client';

const schema = z.object({
  name: z.string().min(2, 'Informe o nome'),
  monthlyFee: z.coerce.number().min(0, 'Valor deve ser >= 0'),
  monthlyLimit: z.union([z.coerce.number().int().positive(), z.literal('')]).optional(),
  active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function PlayerTypesPage() {
  const { toast } = useToast();
  const [types, setTypes] = useState<PlayerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlayerType | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', monthlyFee: 0, monthlyLimit: '', active: true },
  });

  async function load() {
    setLoading(true);
    try {
      setTypes(await playerTypesApi.list());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    form.reset({ name: '', monthlyFee: 0, monthlyLimit: '', active: true });
    setDialogOpen(true);
  }

  function openEdit(t: PlayerType) {
    setEditing(t);
    form.reset({
      name: t.name,
      monthlyFee: t.monthlyFee,
      monthlyLimit: t.monthlyLimit ?? '',
      active: t.active,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        name: values.name,
        monthlyFee: values.monthlyFee,
        monthlyLimit: values.monthlyLimit === '' || values.monthlyLimit == null ? null : Number(values.monthlyLimit),
        active: values.active,
      };
      if (editing) {
        await playerTypesApi.update(editing.id, payload);
        toast({ title: 'Tipo atualizado', variant: 'success' });
      } else {
        await playerTypesApi.create(payload);
        toast({ title: 'Tipo criado', variant: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast({ title: 'Erro', description: getApiErrorMessage(err), variant: 'destructive' });
    }
  }

  return (
    <>
      <PageHeader
        title="Tipos de jogador"
        description="Categorias com valores de mensalidade e limites mensais"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo tipo
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : types.length === 0 ? (
            <EmptyState
              icon={<Tags className="h-10 w-10" />}
              title="Nenhum tipo cadastrado"
              description="Crie o primeiro tipo de jogador."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor mensal</TableHead>
                  <TableHead>Limite mensal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{formatCurrency(t.monthlyFee)}</TableCell>
                    <TableCell>{t.monthlyLimit ?? 'Ilimitado'}</TableCell>
                    <TableCell>
                      {t.active ? <Badge variant="success">Ativo</Badge> : <Badge variant="outline">Inativo</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar tipo' : 'Novo tipo'}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input {...form.register('name')} />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Valor mensal (R$)</Label>
                <Input type="number" step="0.01" min="0" {...form.register('monthlyFee')} />
              </div>
              <div className="space-y-1.5">
                <Label>Limite mensal</Label>
                <Input type="number" min="1" {...form.register('monthlyLimit')} placeholder="Vazio = ilimitado" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.watch('active') ? 'true' : 'false'}
                onValueChange={(v) => form.setValue('active', v === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
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
