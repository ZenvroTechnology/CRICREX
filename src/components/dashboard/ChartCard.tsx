import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn('card p-5 sm:p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[15px] font-bold text-forest">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] text-slateink-light">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={cn('mt-4', bodyClassName)}>{children}</div>
    </div>
  );
}

export const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: '1px solid rgba(18,61,42,0.1)',
    boxShadow: '0 12px 32px -12px rgba(18,61,42,0.25)',
    fontSize: 11,
    color: '#344054',
    padding: '8px 12px',
  },
  labelStyle: { fontWeight: 700, color: '#123D2A', marginBottom: 2 },
  itemStyle: { padding: 0 },
};
