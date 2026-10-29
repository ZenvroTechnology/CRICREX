import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FormAlert({
  tone = 'error',
  title,
  children,
  className,
}: {
  tone?: 'error' | 'success' | 'info' | 'warning';
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const config = {
    error: { icon: AlertCircle, wrap: 'border-red-200 bg-red-50 text-red-700' },
    success: { icon: CheckCircle2, wrap: 'border-success/25 bg-success/[0.07] text-[#0F7A37]' },
    info: { icon: Info, wrap: 'border-sky-200 bg-sky-50 text-sky-800' },
    warning: { icon: AlertCircle, wrap: 'border-matchday/30 bg-matchday/[0.08] text-[#8A5000]' },
  }[tone];
  const Icon = config.icon;
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed', config.wrap, className)} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-bold">{title}</p>}
        <div className={title ? 'mt-0.5' : ''}>{children}</div>
      </div>
    </div>
  );
}
