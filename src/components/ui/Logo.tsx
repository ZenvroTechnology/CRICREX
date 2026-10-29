import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-cricket via-cricket-dark to-forest-900 ring-1 ring-white/15',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" className="h-[70%] w-[70%]" fill="none">
        <path d="M14 36c1.2-8.8 6.8-18 17.6-22.4" stroke="#F5F7F2" strokeWidth="4.4" strokeLinecap="round" />
        <path d="M16.5 39.5l-3.2-1.2c-1.3-.5-2-2-1.5-3.3l1.1-3c.5-1.3 2-2 3.3-1.5l3.2 1.2c1.3.5 2 2 1.5 3.3l-1.1 3c-.5 1.3-2 2-3.3 1.5z" fill="#8BCB75" />
        <circle cx="32" cy="13" r="6.2" fill="#FF9F43" />
        <path d="M32 5.5v2.2M39.5 13h-2.2M37.3 7.7l-1.6 1.6M26.7 7.7l1.6 1.6" stroke="#FFCD9E" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Logo({
  variant = 'light',
  compact = false,
  className,
  to = '/',
}: {
  variant?: 'light' | 'dark';
  compact?: boolean;
  className?: string;
  to?: string;
}) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label="CRICREX home">
      <LogoMark className={cn('h-9 w-9 transition group-hover:rotate-3', compact && 'h-8 w-8')} />
      <span className="leading-none">
        <span
          className={cn(
            'block font-display text-[19px] font-extrabold tracking-[0.16em]',
            variant === 'light' ? 'text-white' : 'text-forest',
            compact && 'text-[17px]',
          )}
        >
          CRICREX
        </span>
        {!compact && (
          <span
            className={cn(
              'mt-1 block text-[8px] font-bold uppercase tracking-[0.3em]',
              variant === 'light' ? 'text-grass/80' : 'text-cricket/70',
            )}
          >
            Grounds · Game On
          </span>
        )}
      </span>
    </Link>
  );
}
