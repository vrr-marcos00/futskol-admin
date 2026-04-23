import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { injuriesApi } from '@/api/injuries';
import { useToast } from '@/components/ui/toaster';
import { getApiErrorMessage } from '@/api/client';

interface Props {
  mode: 'start' | 'close';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string;
  playerName: string;
  injuryId?: string;
  injuryStartDate?: string;
  onDone?: () => void;
}

function today(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function InjuryDialog({
  mode,
  open,
  onOpenChange,
  playerId,
  playerName,
  injuryId,
  injuryStartDate,
  onDone,
}: Props) {
  const { toast } = useToast();
  const [date, setDate] = useState<string>(today());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDate(today());
      setNotes('');
      setError(null);
    }
  }, [open]);

  async function submit() {
    if (!date) {
      setError('Informe a data');
      return;
    }
    if (mode === 'close' && injuryStartDate && date < injuryStartDate) {
      setError('Data de fim não pode ser anterior ao início da lesão');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'start') {
        await injuriesApi.start(playerId, { startDate: date, notes: notes || null });
        toast({ title: 'Jogador marcado como lesionado', variant: 'success' });
      } else if (injuryId) {
        await injuriesApi.close(playerId, injuryId, { endDate: date, notes: notes || null });
        toast({ title: 'Jogador marcado como recuperado', variant: 'success' });
      }
      onOpenChange(false);
      onDone?.();
    } catch (err) {
      toast({ title: 'Erro', description: getApiErrorMessage(err), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === 'start' ? 'Marcar lesão' : 'Marcar recuperação';
  const description =
    mode === 'start'
      ? `Enquanto ${playerName} estiver lesionado, novos pagamentos serão registrados como ISENTO automaticamente.`
      : `Ao marcar ${playerName} como recuperado, pagamentos ISENTO futuros voltam para PENDENTE.`;
  const dateLabel = mode === 'start' ? 'Data de início' : 'Data de retorno';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>{dateLabel}</Label>
            <DatePicker value={date} onChange={setDate} />
          </div>
          <div className="space-y-1.5">
            <Label>Observações (opcional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
