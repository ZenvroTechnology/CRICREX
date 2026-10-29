import { useEffect, useRef, useState } from 'react';
import { CheckCheck, Bell, Circle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export function NotificationsMenu() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, pushToast } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toneClasses = {
    success: 'bg-success/10 text-success',
    warning: 'bg-matchday/15 text-[#B25E00]',
    info: 'bg-sky-50 text-sky-600',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-forest/10 bg-white text-slateink transition hover:border-cricket/30 hover:text-cricket"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-matchday px-1 text-[9px] font-extrabold text-forest ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[330px] origin-top-right overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-lift animate-slide-down">
          <div className="flex items-center justify-between border-b border-forest/[0.07] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-forest">Notifications</p>
              <p className="text-[10px] text-slateink-light">{unreadCount} unread · demo activity</p>
            </div>
            <button
              type="button"
              onClick={() => {
                markAllNotificationsRead();
                pushToast({ title: 'All caught up', description: 'Every notification is marked as read.', tone: 'success' });
              }}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-cricket transition hover:bg-cricket/5"
            >
              <CheckCheck className="h-3 w-3" /> Mark all
            </button>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  markNotificationRead(item.id);
                  pushToast({ title: item.title, description: item.body, tone: item.tone });
                }}
                className={cn(
                  'flex w-full items-start gap-3 border-b border-forest/[0.04] px-4 py-3 text-left transition hover:bg-offwhite/70',
                  !item.read && 'bg-cricket/[0.025]',
                )}
              >
                <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', toneClasses[item.tone])}>
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className={cn('text-[12px] font-bold', item.read ? 'text-slateink' : 'text-forest')}>{item.title}</span>
                    {!item.read && <Circle className="h-1.5 w-1.5 shrink-0 fill-matchday text-matchday" />}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] leading-relaxed text-slateink-light">{item.body}</span>
                  <span className="mt-1 block text-[9.5px] text-slateink-faint">{item.time}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="bg-offwhite/60 px-4 py-2.5 text-center text-[9.5px] text-slateink-faint">
            Notifications are simulated for this demo.
          </div>
        </div>
      )}
    </div>
  );
}
