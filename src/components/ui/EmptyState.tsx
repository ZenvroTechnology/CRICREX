import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-forest/15 bg-white/60 px-6 py-14 text-center', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/[0.06] text-cricket">{icon}</div>
      <h3 className="mt-4 font-display text-lg font-bold text-forest">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slateink-light">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
