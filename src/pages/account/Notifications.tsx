import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  BellRing,
  CalendarCheck,
  CheckCheck,
  CheckCircle2,
  Circle,
  Info,
  Search,
  Settings2,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button, buttonStyles } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { useApp } from '@/context/AppContext';
import { cn, roleSlug } from '@/lib/utils';
import type { NotificationItem } from '@/types';

const toneStyles = {
  success: { wrap: 'bg-success/10 text-success', icon: CheckCircle2, label: 'Confirmed' },
  warning: { wrap: 'bg-matchday/15 text-[#B25E00]', icon: AlertTriangle, label: 'Action needed' },
  info: { wrap: 'bg-sky-50 text-sky-600', icon: Info, label: 'Update' },
};

export function Notifications() {
  const { user, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, pushToast } = useApp();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<NotificationItem | null>(null);

  const filtered = useMemo(
    () =>
      notifications.filter((item) => {
        if (tab === 'unread' && item.read) return false;
        if (tab === 'read' && !item.read) return false;
        const text = `${item.title} ${item.body}`.toLowerCase();
        if (query && !text.includes(query.toLowerCase())) return false;
        return true;
      }),
    [notifications, query, tab],
  );

  if (!user) return null;

  const open = (item: NotificationItem) => {
    markNotificationRead(item.id);
    setSelected(item);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Updates"
        title="Notifications"
        description="Demo alerts for bookings, fixtures and account activity. Read state is shared across the app."
        actions={
          <>
            <Link to={`/${roleSlug(user.role)}/settings`} className={buttonStyles('outline', 'md')}>
              <Settings2 className="h-4 w-4" /> Preferences
            </Link>
            <Button
              variant="primary"
              icon={<CheckCheck className="h-4 w-4" />}
              onClick={() => {
                markAllNotificationsRead();
                pushToast({ title: 'All caught up', description: 'Every demo notification is marked as read.', tone: 'success' });
              }}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              options={[
                { value: 'all', label: 'All', count: notifications.length },
                { value: 'unread', label: 'Unread', count: unreadCount },
                { value: 'read', label: 'Read', count: notifications.length - unreadCount },
              ]}
              value={tab}
              onChange={setTab}
              size="sm"
            />
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notifications"
                aria-label="Search notifications"
                className="h-9 w-full rounded-lg border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs text-slateink placeholder:text-slateink-faint focus:border-cricket focus:bg-white focus:outline-none focus:ring-4 focus:ring-cricket/10"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              className="m-5 border-0 bg-transparent"
              icon={<Bell className="h-6 w-6" />}
              title={query ? 'No notifications match' : 'Nothing here yet'}
              description={query ? 'Try a different search term or switch tabs.' : 'New demo alerts will appear here as you book grounds and manage matches.'}
              action={query ? <Button variant="outline" onClick={() => setQuery('')}>Clear search</Button> : undefined}
            />
          ) : (
            <ul className="divide-y divide-forest/[0.05]">
              {filtered.map((item) => {
                const config = toneStyles[item.tone];
                const Icon = config.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => open(item)}
                      className={cn(
                        'flex w-full items-start gap-3.5 px-4 py-4 text-left transition hover:bg-offwhite/70 sm:px-5',
                        !item.read && 'bg-cricket/[0.025]',
                      )}
                    >
                      <span className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', config.wrap)}>
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className={cn('text-[13px] font-bold', item.read ? 'text-slateink' : 'text-forest')}>{item.title}</span>
                          <span className="rounded-full bg-forest/[0.05] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slateink-light">
                            {config.label}
                          </span>
                          {!item.read && <Circle className="h-1.5 w-1.5 fill-matchday text-matchday" />}
                        </span>
                        <span className="mt-1 block text-[11.5px] leading-relaxed text-slateink-light">{item.body}</span>
                        <span className="mt-1.5 block text-[9.5px] font-medium text-slateink-faint">{item.time}</span>
                      </span>
                      <span className="shrink-0 self-center text-[10px] font-bold text-cricket">{item.read ? 'View' : 'Mark read'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-forest/[0.06] px-5 py-3 text-[10px] text-slateink-light">
            <span>Showing {filtered.length} of {notifications.length} notifications</span>
            <span className="flex items-center gap-1.5"><BellRing className="h-3 w-3 text-cricket" /> Simulated — nothing is emailed</span>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-display text-[15px] font-bold text-forest">Inbox summary</h3>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Unread', value: unreadCount, color: 'bg-matchday' },
                { label: 'Read', value: notifications.length - unreadCount, color: 'bg-cricket' },
                { label: 'Booking alerts', value: notifications.filter((item) => /booking/i.test(item.title)).length, color: 'bg-grass' },
                { label: 'Match alerts', value: notifications.filter((item) => /match|scorer/i.test(item.title)).length, color: 'bg-sky-400' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slateink-light">{row.label}</span>
                    <span className="font-bold text-forest">{row.value}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-forest/[0.06]">
                    <div className={cn('h-full rounded-full', row.color)} style={{ width: `${Math.max(6, (row.value / Math.max(1, notifications.length)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest"><CalendarCheck className="h-3.5 w-3.5 text-cricket" /> Shared read state</p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-slateink-light">
              Opening a notification here also clears the matching badge in the dashboard header. All six demo roles read
              from the same local notification store.
            </p>
          </div>
        </div>
      </div>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title} description={selected?.time} size="sm">
        {selected && (
          <div>
            <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-2xl', toneStyles[selected.tone].wrap)}>
              {(() => {
                const Icon = toneStyles[selected.tone].icon;
                return <Icon className="h-6 w-6" />;
              })()}
            </div>
            <p className="text-sm leading-relaxed text-slateink">{selected.body}</p>
            <div className="mt-5 rounded-xl bg-offwhite p-3 text-[10.5px] leading-relaxed text-slateink-light">
              This notification is sample data. No email, SMS or push message was delivered.
            </div>
            <div className="mt-5 flex justify-end">
              <Button variant="primary" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
