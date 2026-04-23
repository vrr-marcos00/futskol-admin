import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users, Bandage } from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { InjuryDialog } from '@/components/InjuryDialog';
import { playersApi } from '@/api/players';
import { playerTypesApi } from '@/api/playerTypes';
import type { Player, PlayerType } from '@/types/domain';
import { formatCpf, formatPhone } from '@/lib/format';
import { useToast } from '@/components/ui/toaster';
import { getApiErrorMessage } from '@/api/client';

const schema = z.object({
  name: z.string().min(2, 'Informe o nome'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos'),
  phone: z.string().min(10, 'Telefone inválido'),
  playerTypeId: z.string().min(1, 'Selecione um tipo'),
  active: z.boolean(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function PlayersPage() {
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [types, setTypes] = useState<PlayerType[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [injuryTarget, setInjuryTarget] = useState<Player | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', cpf: '', phone: '', playerTypeId: '', active: true, notes: '' },
  });

  async function load() {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([
        playersApi.list({
          search: search || undefined,
          typeId: filterType === 'all' ? undefined : filterType,
          active: filterActive === 'all' ? undefined : filterActive === 'active',
        }),
        playerTypesApi.list(),
      ]);
      setPlayers(p);
      setTypes(t);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterActive]);

  function openCreate() {
    setEditing(null);
    form.reset({ name: '', cpf: '', phone: '', playerTypeId: types[0]?.id ?? '', active: true, notes: '' });
    setDialogOpen(true);
  }

  function openEdit(player: Player) {
    setEditing(player);
    form.reset({
      name: player.name,
      cpf: player.cpf,
      phone: player.phone,
      playerTypeId: player.type.id,
      active: player.active,
      notes: player.notes ?? '',
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = { ...values, notes: values.notes || null };
      if (editing) {
        await playersApi.update(editing.id, payload);
        toast({ title: 'Jogador atualizado', variant: 'success' });
      } else {
        await playersApi.create(payload);
        toast({ title: 'Jogador criado', variant: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast({ title: 'Erro ao salvar', description: getApiErrorMessage(err), variant: 'destructive' });
    }
  }

  async function remove(player: Player) {
    if (!confirm(`Desativar ${player.name}? O histórico é preservado.`)) return;
    try {
      await playersApi.remove(player.id);
      toast({ title: 'Jogador desativado', variant: 'success' });
      load();
    } catch (err) {
      toast({ title: 'Erro', description: getApiErrorMessage(err), variant: 'destructive' });
    }
  }

  return (
    <>
      <PageHeader
        title="Jogadores"
        description="Gerencie o elenco da pelada"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo jogador
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CPF"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {types.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterActive} onValueChange={setFilterActive}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : players.length === 0 ? (
            <EmptyState
              icon={<Users className="h-10 w-10" />}
              title="Nenhum jogador encontrado"
              description="Cadastre o primeiro jogador do elenco."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Novo jogador
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{formatCpf(p.cpf)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.type.name}</Badge>
                    </TableCell>
                    <TableCell>{formatPhone(p.phone)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {p.active ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                        {p.injury && (
                          <Badge className="border-transparent bg-orange-100 text-orange-700 hover:bg-orange-100">
                            Lesionado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setInjuryTarget(p)}
                        aria-label={p.injury ? 'Marcar recuperado' : 'Marcar lesão'}
                        title={p.injury ? 'Marcar recuperado' : 'Marcar lesão'}
                        className={p.injury ? 'text-orange-600 hover:text-orange-700' : undefined}
                      >
                        <Bandage className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(p)} aria-label="Desativar">
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

      {injuryTarget && (
        <InjuryDialog
          open={!!injuryTarget}
          onOpenChange={(o) => !o && setInjuryTarget(null)}
          mode={injuryTarget.injury ? 'close' : 'start'}
          playerId={injuryTarget.id}
          playerName={injuryTarget.name}
          injuryId={injuryTarget.injury?.id}
          injuryStartDate={injuryTarget.injury?.startDate}
          onDone={() => {
            setInjuryTarget(null);
            load();
          }}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar jogador' : 'Novo jogador'}</DialogTitle>
            <DialogDescription>Preencha os dados do jogador.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input {...form.register('name')} />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>CPF (somente números)</Label>
                <Input {...form.register('cpf')} maxLength={11} placeholder="12345678909" />
                {form.formState.errors.cpf && <p className="text-xs text-destructive">{form.formState.errors.cpf.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input {...form.register('phone')} placeholder="11987654321" />
                {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={form.watch('playerTypeId')}
                  onValueChange={(v) => form.setValue('playerTypeId', v, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.playerTypeId && (
                  <p className="text-xs text-destructive">{form.formState.errors.playerTypeId.message}</p>
                )}
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
