import { useCallback, useEffect, useState } from 'react';
import { Bandage } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { InjuryDialog } from '@/components/InjuryDialog';
import { injuriesApi } from '@/api/injuries';
import type { Injury } from '@/types/domain';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

type Tab = 'active' | 'history';

export function InjuriesPage() {
  const [tab, setTab] = useState<Tab>('active');
  const [items, setItems] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(true);
  const [closeTarget, setCloseTarget] = useState<Injury | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await injuriesApi.list(tab === 'active' ? { active: true } : {});
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Lesões"
        description="Jogadores afastados e histórico de lesões"
      />

      <Card className="mb-4">
        <CardContent className="flex gap-2 p-3">
          <Button
            variant={tab === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('active')}
          >
            Ativas
          </Button>
          <Button
            variant={tab === 'history' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('history')}
          >
            Histórico
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Bandage className="h-10 w-10" />}
              title={tab === 'active' ? 'Nenhuma lesão ativa' : 'Nenhuma lesão registrada'}
              description={
                tab === 'active'
                  ? 'Todos os jogadores estão disponíveis.'
                  : 'Registros de lesões aparecerão aqui.'
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.playerName}</TableCell>
                    <TableCell>{formatDate(i.startDate)}</TableCell>
                    <TableCell>
                      {i.endDate ? (
                        formatDate(i.endDate)
                      ) : (
                        <Badge className="border-transparent bg-orange-100 text-orange-700 hover:bg-orange-100">
                          Em curso
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn('text-sm', i.active && 'font-medium text-orange-700')}>
                        {i.daysInjured} {i.daysInjured === 1 ? 'dia' : 'dias'}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground">
                      {i.notes ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {i.active && (
                        <Button size="sm" variant="outline" onClick={() => setCloseTarget(i)}>
                          Marcar recuperado
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {closeTarget && (
        <InjuryDialog
          open={!!closeTarget}
          onOpenChange={(o) => !o && setCloseTarget(null)}
          mode="close"
          playerId={closeTarget.playerId}
          playerName={closeTarget.playerName}
          injuryId={closeTarget.id}
          injuryStartDate={closeTarget.startDate}
          onDone={() => {
            setCloseTarget(null);
            load();
          }}
        />
      )}
    </>
  );
}
