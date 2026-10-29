import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'grass' | 'orange' | 'forest';

const tones: Record<Tone, string> = {
  success: 'bg-success/10 text-success ring-success/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200/70',
  danger: 'bg-red-50 text-red-700 ring-red-200/70',
  info: 'bg-sky-50 text-sky-700 ring-sky-200/70',
  neutral: 'bg-slate-100 text-slateink-light ring-slate-200/70',
  grass: 'bg-grass/15 text-forest-600 ring-grass/30',
  orange: 'bg-matchday/15 text-[#B25E00] ring-matchday/30',
  forest: 'bg-forest text-white ring-forest/20',
};

export function Badge({
  tone = 'neutral',
  children,
  icon,
  className,
  dot,
}: {
  tone?: Tone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {icon}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, Tone> = {
    Active: 'success',
    Confirmed: 'success',
    Completed: 'info',
    Cancelled: 'danger',
    Pending: 'warning',
    Suspended: 'danger',
    Published: 'success',
    Draft: 'neutral',
    Paused: 'warning',
    Upcoming: 'info',
    Live: 'orange',
  };
  return (
    <Badge tone={map[status] ?? 'neutral'} dot>
      {status}
    </Badge>
  );
}
