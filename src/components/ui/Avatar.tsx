import { cn } from '@/lib/utils';

export function Avatar({
  name,
  tone = 'from-cricket to-forest',
  size = 'md',
  className,
  ring,
}: {
  name: string;
  tone?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}) {
  const sizes = {
    xs: 'h-7 w-7 text-[10px]',
    sm: 'h-9 w-9 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-20 w-20 text-2xl',
  };
  const label = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-display font-bold text-white shadow-sm',
        tone,
        sizes[size],
        ring && 'ring-2 ring-white/80',
        className,
      )}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}
