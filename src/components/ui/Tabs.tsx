import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabOption {
  value: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export function Tabs({
  options,
  value,
  onChange,
  variant = 'pill',
  className,
  size = 'md',
}: {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'pill' | 'underline' | 'dark';
  className?: string;
  size?: 'sm' | 'md';
}) {
  if (variant === 'underline') {
    return (
      <div className={cn('flex gap-1 overflow-x-auto border-b border-forest/10 no-scrollbar', className)} role="tablist">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(option.value)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-semibold transition',
                active ? 'text-forest' : 'text-slateink-light hover:text-forest',
              )}
            >
              {option.icon}
              {option.label}
              {typeof option.count === 'number' && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    active ? 'bg-cricket/10 text-cricket' : 'bg-slate-100 text-slateink-light',
                  )}
                >
                  {option.count}
                </span>
              )}
              {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-cricket" />}
            </button>
          );
        })}
      </div>
    );
  }

  const dark = variant === 'dark';
  return (
    <div
      className={cn(
        'inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl p-1 no-scrollbar',
        dark ? 'bg-white/[0.07] ring-1 ring-inset ring-white/10' : 'bg-forest/[0.055]',
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg font-semibold transition',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-[13px]',
              active
                ? dark
                  ? 'bg-white text-forest shadow-sm'
                  : 'bg-white text-forest shadow-sm'
                : dark
                  ? 'text-white/65 hover:text-white'
                  : 'text-slateink-light hover:text-forest',
            )}
          >
            {option.icon}
            {option.label}
            {typeof option.count === 'number' && (
              <span className={cn('text-[10px] font-bold', active ? 'text-cricket' : 'text-slateink-faint')}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
