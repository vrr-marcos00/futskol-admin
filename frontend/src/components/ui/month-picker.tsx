import * as React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MonthPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
  className?: string;
  id?: string;
}

function parseYearMonth(value?: string): { year: number; month: number } | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) };
}

function toYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) =>
  format(new Date(2024, i, 1), 'MMM', { locale: ptBR }).replace('.', '')
);

export const MonthPicker = React.forwardRef<HTMLButtonElement, MonthPickerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Todos os meses',
      disabled,
      allowClear = false,
      clearLabel = 'Limpar',
      className,
      id,
    },
    ref
  ) => {
    const selected = parseYearMonth(value);
    const [open, setOpen] = React.useState(false);
    const [viewYear, setViewYear] = React.useState<number>(selected?.year ?? new Date().getFullYear());
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (open && selected) setViewYear(selected.year);
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

    const label = selected
      ? format(new Date(selected.year, selected.month - 1, 1), "MMMM 'de' yyyy", { locale: ptBR })
      : placeholder;

    function pick(month: number) {
      onChange?.(toYearMonth(viewYear, month));
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
          <span className="capitalize">{label}</span>
          <CalendarIcon className="h-4 w-4 opacity-60" />
        </button>

        {open && (
          <div
            role="dialog"
            className={cn(
              'absolute left-0 top-full z-50 mt-2 w-[16rem] rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg',
              'animate-in fade-in-0 zoom-in-95'
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewYear((y) => y - 1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Ano anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-sm font-medium">{viewYear}</div>
              <button
                type="button"
                onClick={() => setViewYear((y) => y + 1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Próximo ano"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MONTH_LABELS.map((label, idx) => {
                const month = idx + 1;
                const isSelected = selected && selected.year === viewYear && selected.month === month;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => pick(month)}
                    className={cn(
                      'inline-flex h-9 items-center justify-center rounded-md text-sm capitalize transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {allowClear && (
              <div className="mt-3 flex justify-end border-t pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange?.('');
                    setOpen(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {clearLabel}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
MonthPicker.displayName = 'MonthPicker';
