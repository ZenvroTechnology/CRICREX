import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cricket">{eyebrow}</p>
        )}
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-forest sm:text-[30px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slateink-light">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
