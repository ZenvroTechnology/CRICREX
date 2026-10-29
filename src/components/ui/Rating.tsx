import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Rating({
  value,
  count,
  size = 'sm',
  className,
  showValue = true,
}: {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  className?: string;
  showValue?: boolean;
}) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, value - index));
          return (
            <span key={index} className="relative">
              <Star className={cn(starSize, 'text-slate-200')} fill="currentColor" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cn(starSize, 'text-matchday')} fill="currentColor" />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className={cn('font-bold text-forest', size === 'sm' ? 'text-xs' : 'text-sm')}>{value.toFixed(1)}</span>
      )}
      {typeof count === 'number' && (
        <span className={cn('text-slateink-light', size === 'sm' ? 'text-[11px]' : 'text-xs')}>({count})</span>
      )}
      <span className="sr-only">{`Rated ${value} out of 5${typeof count === 'number' ? ` from ${count} reviews` : ''}`}</span>
    </div>
  );
}
