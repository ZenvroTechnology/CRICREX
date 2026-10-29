import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof sizes;
  hideClose?: boolean;
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md', hideClose }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-forest-950/55 backdrop-blur-[3px] animate-fade-in"
        onClick={onClose}
        aria-label="Close dialog"
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Dialog'}
        className={cn(
          'relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-lift animate-scale-in sm:rounded-3xl',
          sizes[size],
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-forest/[0.07] px-6 py-5">
            <div>
              {title && <h2 className="font-display text-xl font-bold text-forest">{title}</h2>}
              {description && <p className="mt-1 text-sm text-slateink-light">{description}</p>}
            </div>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 -mt-1 rounded-lg p-2 text-slateink-light transition hover:bg-forest/5 hover:text-forest"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-forest/[0.07] bg-offwhite/60 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  icon?: ReactNode;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep it',
  tone = 'danger',
  icon,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title={title} description={description} hideClose>
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">{icon}</div>}
      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-forest/15 bg-white px-5 text-sm font-semibold text-forest transition hover:bg-offwhite"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={cn(
            'inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition',
            tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-cricket hover:bg-cricket-dark',
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
