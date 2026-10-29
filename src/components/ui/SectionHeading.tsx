import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  dark = false,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <span className={dark ? 'eyebrow-dark' : 'eyebrow'}>{eyebrow}</span>}
        <h2 className={cn('mt-3 section-title', dark && 'text-white')}>{title}</h2>
        {description && (
          <p className={cn('mt-3 text-[15px] leading-relaxed text-slateink-light', dark && 'text-white/60')}>{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
