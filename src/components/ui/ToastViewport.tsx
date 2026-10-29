import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const toneStyles = {
  success: { icon: CheckCircle2, className: 'text-success', bg: 'bg-success/10' },
  error: { icon: XCircle, className: 'text-red-600', bg: 'bg-red-50' },
  warning: { icon: AlertCircle, className: 'text-amber-600', bg: 'bg-amber-50' },
  info: { icon: Info, className: 'text-sky-600', bg: 'bg-sky-50' },
};

export function ToastViewport() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[300] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
      {toasts.map((toast) => {
        const config = toneStyles[toast.tone];
        const Icon = config.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-forest/10 bg-white p-4 shadow-lift animate-scale-in"
          >
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', config.bg, config.className)}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-forest">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-xs leading-relaxed text-slateink-light">{toast.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-lg p-1 text-slateink-faint transition hover:bg-forest/5 hover:text-forest"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
