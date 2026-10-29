import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'white' | 'danger' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-cricket text-white shadow-[0_8px_20px_-8px_rgba(33,115,70,0.65)] hover:bg-cricket-dark focus-visible:ring-cricket/30',
  accent:
    'bg-matchday text-forest shadow-[0_10px_24px_-10px_rgba(255,159,67,0.9)] hover:bg-matchday-dark focus-visible:ring-matchday/40',
  outline:
    'border border-forest/15 bg-white text-forest hover:border-cricket/40 hover:bg-cricket/[0.04] focus-visible:ring-cricket/20',
  ghost: 'bg-transparent text-slateink hover:bg-forest/[0.05] hover:text-forest focus-visible:ring-cricket/20',
  white: 'bg-white text-forest shadow-sm hover:bg-offwhite focus-visible:ring-white/40',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/30',
  dark: 'bg-forest text-white hover:bg-forest-900 focus-visible:ring-white/30',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[12.5px] gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-[52px] px-6 text-[15px] gap-2.5 rounded-xl',
};

export function buttonStyles(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string): string {
  return cn(
    'inline-flex select-none items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985]',
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles(variant, size, cn(fullWidth && 'w-full', className))}
      {...props}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
