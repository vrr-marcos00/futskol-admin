import * as React from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  id?: string;
}

function parseIsoDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = parse(value, 'yyyy-MM-dd', new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    { value, onChange, placeholder = 'Selecione uma data', disabled, minDate, maxDate, className, id },
    ref
  ) => {
    const selected = parseIsoDate(value);
    const min = parseIsoDate(minDate);
    const max = parseIsoDate(maxDate);
    const isOutOfRange = (d: Date) =>
      (min != null && d < min) || (max != null && d > max);
    const [open, setOpen] = React.useState(false);
    const [viewMonth, setViewMonth] = React.useState<Date>(selected ?? new Date());
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (open && selected) setViewMonth(selected);
    }, [open, selected]);

    React.useEffect(() => {
      if (!open) return;
      function onClick(e: MouseEvent) {
        if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
      }
      function onKey(e: KeyboardEvent) {
        if (e.key === 'Escape') setOpen(false);
      }
      document.addEventListener('mousedown', onClick);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onClick);
        document.removeEventListener('keydown', onKey);
      };
    }, [open]);

    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    function pick(date: Date) {
      onChange?.(toIsoDate(date));
      setOpen(false);
    }

    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <button
          ref={ref}
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !selected && 'text-muted-foreground'
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span>{selected ? format(selected, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}</span>
          <CalendarIcon className="h-4 w-4 opacity-60" />
        </button>

        {open && (
          <div
            role="dialog"
            className={cn(
              'absolute left-0 top-full z-50 mt-2 w-[18rem] rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg',
              'animate-in fade-in-0 zoom-in-95'
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth((m) => subMonths(m, 1))}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-sm font-medium capitalize">
                {format(viewMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </div>
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const inMonth = isSameMonth(day, viewMonth);
                const isSelected = selected && isSameDay(day, selected);
                const today = isToday(day);
                const disabledDay = isOutOfRange(day);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => pick(day)}
                    disabled={disabledDay}
                    className={cn(
                      'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      !inMonth && 'text-muted-foreground/50',
                      today && !isSelected && 'border border-accent',
                      isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                      disabledDay && 'cursor-not-allowed text-muted-foreground/30 hover:bg-transparent hover:text-muted-foreground/30'
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t pt-2">
              <button
                type="button"
                onClick={() => pick(new Date())}
                disabled={isOutOfRange(new Date())}
                className="text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
              >
                Hoje
              </button>
              {selected && (
                <button
                  type="button"
                  onClick={() => {
                    onChange?.('');
                    setOpen(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';
