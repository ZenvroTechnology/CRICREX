import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Check, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldShellProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

function FieldShell({ label, error, hint, required, htmlFor, children, className }: FieldShellProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span className="ml-1 text-matchday-dark">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slateink-light">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  icon,
  rightElement,
  containerClassName,
  className,
  id,
  required,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} htmlFor={inputId} className={containerClassName}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slateink-light">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          required={required}
          className={cn(
            'field',
            Boolean(icon) && 'pl-10',
            Boolean(rightElement) && 'pr-11',
            error && 'field-error',
            className,
          )}
          {...props}
        />
        {rightElement && <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightElement}</span>}
      </div>
    </FieldShell>
  );
}

interface PasswordInputProps extends InputProps {
  label?: string;
}

export function PasswordInput({ label = 'Password', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      label={label}
      type={visible ? 'text' : 'password'}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="rounded-lg p-2 text-slateink-light transition hover:bg-forest/5 hover:text-forest"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  children: ReactNode;
}

export function Select({ label, error, hint, containerClassName, className, id, required, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} htmlFor={selectId} className={containerClassName}>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          required={required}
          className={cn('field appearance-none pr-10', error && 'field-error', className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
      </div>
    </FieldShell>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export function Textarea({ label, error, hint, containerClassName, className, id, required, ...props }: TextareaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} htmlFor={inputId} className={containerClassName}>
      <textarea
        id={inputId}
        aria-invalid={Boolean(error)}
        required={required}
        className={cn('field min-h-[110px] resize-y', error && 'field-error', className)}
        {...props}
      />
    </FieldShell>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, label, description, disabled, className }: CheckboxProps) {
  return (
    <label className={cn('group flex cursor-pointer items-start gap-2.5', disabled && 'cursor-not-allowed opacity-60', className)}>
      <span className="relative mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute h-full w-full cursor-pointer appearance-none rounded-[5px] border border-slate-300 bg-white transition checked:border-cricket checked:bg-cricket focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cricket/20 disabled:cursor-not-allowed"
        />
        <Check className="pointer-events-none h-3 w-3 text-white opacity-0 transition peer-checked:opacity-100" strokeWidth={3.5} />
      </span>
      <span className="text-sm leading-snug text-slateink">
        <span className="font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slateink-light">{description}</span>}
      </span>
    </label>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-semibold text-forest">{label}</p>}
          {description && <p className="mt-0.5 text-xs text-slateink-light">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ?? 'Toggle'}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cricket/20',
          checked ? 'bg-cricket' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  );
}
