import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'success' | 'destructive';

interface ToastItem {
  id: number;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
  }, []);

  const remove = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitives.Provider swipeDirection="right" duration={4000}>
        {children}
        {items.map((item) => (
          <ToastPrimitives.Root
            key={item.id}
            onOpenChange={(open) => !open && remove(item.id)}
            className={cn(
              'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all',
              'data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full',
              'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full',
              item.variant === 'success' && 'border-emerald-300 bg-emerald-50 text-emerald-900',
              item.variant === 'destructive' && 'border-rose-300 bg-rose-50 text-rose-900',
              (!item.variant || item.variant === 'default') && 'border bg-background text-foreground'
            )}
          >
            <div className="grid gap-1">
              {item.title && <ToastPrimitives.Title className="text-sm font-semibold">{item.title}</ToastPrimitives.Title>}
              {item.description && (
                <ToastPrimitives.Description className="text-sm opacity-90">{item.description}</ToastPrimitives.Description>
              )}
            </div>
            <ToastPrimitives.Close className="absolute right-1 top-1 rounded-md p-1 text-foreground/60 hover:text-foreground">
              <X className="h-4 w-4" />
            </ToastPrimitives.Close>
          </ToastPrimitives.Root>
        ))}
        <ToastPrimitives.Viewport className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col-reverse gap-2 sm:bottom-4 sm:right-4" />
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  );
}
