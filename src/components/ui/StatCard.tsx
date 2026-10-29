import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon,
  delta,
  hint,
  tone = 'green',
  className,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  delta?: number;
  hint?: string;
  tone?: 'green' | 'orange' | 'blue' | 'grass' | 'slate';
  className?: string;
}) {
  const tones = {
    green: 'bg-cricket/10 text-cricket',
    orange: 'bg-matchday/15 text-[#B25E00]',
    blue: 'bg-sky-50 text-sky-600',
    grass: 'bg-grass/20 text-cricket-dark',
    slate: 'bg-forest/[0.06] text-forest',
  };
  const positive = (delta ?? 0) >= 0;
  return (
    <div className={cn('card card-hover p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tones[tone])}>{icon}</div>
        {typeof delta === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-bold',
              positive ? 'bg-success/10 text-success' : 'bg-red-50 text-red-600',
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-[26px] font-extrabold leading-none text-forest">{value}</p>
      <p className="mt-1.5 text-[13px] font-medium text-slateink-light">{label}</p>
      {hint && <p className="mt-2 text-[11px] text-slateink-faint">{hint}</p>}
    </div>
  );
}
