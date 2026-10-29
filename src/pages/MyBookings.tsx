import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  CreditCard,
  Info,
  MapPin,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  XCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/ui/Badge';
import { buttonStyles } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { formatDate, inr, relativeDay } from '@/lib/utils';
import type { Booking } from '@/types';

const tabs = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All bookings' },
];

export function MyBookings() {
  const { bookings, cancelBooking, user, pushToast } = useApp();
  const [tab, setTab] = useState('upcoming');
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState<Booking | null>(null);

  const counts = {
    upcoming: bookings.filter((booking) => booking.status === 'Confirmed').length,
    completed: bookings.filter((booking) => booking.status === 'Completed').length,
    cancelled: bookings.filter((booking) => booking.status === 'Cancelled').length,
    all: bookings.length,
  };

  const filtered = useMemo(() => {
    const base = bookings.filter((booking) => {
      if (tab === 'upcoming' && booking.status !== 'Confirmed') return false;
      if (tab === 'completed' && booking.status !== 'Completed') return false;
      if (tab === 'cancelled' && booking.status !== 'Cancelled') return false;
      const text = `${booking.groundName} ${booking.reference} ${booking.city}`.toLowerCase();
      return text.includes(query.toLowerCase().trim());
    });
    return base.sort((a, b) => {
      if (tab === 'completed') return b.date.localeCompare(a.date);
      return a.date.localeCompare(b.date);
    });
  }, [bookings, query, tab]);

  const totalValue = bookings.filter((booking) => booking.status !== 'Cancelled').reduce((sum, booking) => sum + booking.amount, 0);

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden bg-forest py-10 text-white">
        <div className="absolute inset-0 hero-grid opacity-50" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-grass/10 blur-3xl" />
        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-white/45">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/80">My Bookings</span>
          </nav>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">My bookings</h1>
              <p className="mt-2 max-w-xl text-sm text-white/55">
                Manage your simulated ground reservations, review slot details and cancel demo bookings.
              </p>
            </div>
            <Link to="/grounds" className={buttonStyles('accent', 'md')}>
              Book another ground <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { label: 'Upcoming', value: counts.upcoming, icon: CalendarDays },
              { label: 'Completed', value: counts.completed, icon: ShieldCheck },
              { label: 'Cancelled', value: counts.cancelled, icon: XCircle },
              { label: 'Total value', value: inr(totalValue), icon: CreditCard },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                <Icon className="h-4 w-4 text-grass" />
                <p className="mt-2 font-display text-xl font-extrabold text-white">{value}</p>
                <p className="text-[11px] text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page py-8">
        {!user && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-matchday/25 bg-matchday/[0.08] px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-medium text-[#8A5000]">
              <Info className="h-4 w-4 shrink-0" />
              You’re browsing the shared demo bookings. Sign in to see a role-based dashboard alongside them.
            </p>
            <Link to="/login" className="text-xs font-bold text-[#8A5000] underline underline-offset-2 hover:text-forest">
              Sign in to demo
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-2xl border border-forest/[0.07] bg-white p-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            options={tabs.map((item) => ({ ...item, count: counts[item.value as keyof typeof counts] }))}
            value={tab}
            onChange={setTab}
            size="sm"
          />
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Reference or ground name"
              aria-label="Search bookings"
              className="h-9 w-full rounded-lg border border-forest/10 bg-offwhite/70 pl-9 pr-3 text-xs text-slateink placeholder:text-slateink-faint focus:border-cricket focus:bg-white focus:outline-none focus:ring-4 focus:ring-cricket/10"
            />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Ticket className="h-6 w-6" />}
              title={query ? 'No bookings match that search' : 'No bookings here yet'}
              description={
                query
                  ? 'Try a different reference or ground name, or clear your search to see all demo bookings.'
                  : tab === 'upcoming'
                    ? 'Your upcoming demo bookings will appear here once you complete a ground booking.'
                    : 'There are no bookings in this category for the demo account.'
              }
              action={
                query ? (
                  <button type="button" onClick={() => setQuery('')} className={buttonStyles('outline', 'md')}>Clear search</button>
                ) : (
                  <Link to="/grounds" className={buttonStyles('primary', 'md')}>
                    Explore grounds <ArrowRight className="h-4 w-4" />
                  </Link>
                )
              }
            />
          ) : (
            filtered.map((booking) => (
              <article key={booking.id} className="card card-hover overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-44 w-full shrink-0 overflow-hidden sm:h-auto sm:w-[220px]">
                    <img
                      src={booking.image}
                      alt={booking.groundName}
                      className={`absolute inset-0 h-full w-full object-cover ${booking.status === 'Cancelled' ? 'grayscale' : ''}`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/45 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/10" />
                    <span className="absolute left-3 top-3 sm:hidden"><StatusBadge status={booking.status} /></span>
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-forest/[0.05] px-2 py-1 font-mono text-[10.5px] font-bold tracking-wider text-forest">
                            {booking.reference}
                          </span>
                          <span className="hidden sm:inline"><StatusBadge status={booking.status} /></span>
                        </div>
                        <Link to={`/grounds/${booking.groundId}`} className="mt-2 block font-display text-lg font-bold text-forest transition hover:text-cricket">
                          {booking.groundName}
                        </Link>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-slateink-light">
                          <MapPin className="h-3.5 w-3.5 text-cricket" /> {booking.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-extrabold text-forest">{inr(booking.amount)}</p>
                        <p className="text-[10px] text-slateink-faint">Total (demo)</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2.5 text-[11.5px] sm:grid-cols-3">
                      <div className="flex items-center gap-2 rounded-lg bg-offwhite/80 px-3 py-2">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-cricket" />
                        <span>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slateink-faint">Date</span>
                          <span className="font-semibold text-forest">{relativeDay(booking.date)}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-offwhite/80 px-3 py-2">
                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-cricket" />
                        <span>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slateink-faint">Slots</span>
                          <span className="font-semibold text-forest">{booking.slots[0]}{booking.slots.length > 1 ? ` +${booking.slots.length - 1}` : ''}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-offwhite/80 px-3 py-2">
                        <Users className="h-3.5 w-3.5 shrink-0 text-cricket" />
                        <span>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slateink-faint">Players</span>
                          <span className="font-semibold text-forest">{booking.players}</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                      <p className="text-[10px] text-slateink-faint">Booked on {formatDate(booking.createdAt)} · demo reservation</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setViewing(booking)} className={buttonStyles('outline', 'sm')}>
                          View Details
                        </button>
                        {booking.status === 'Confirmed' && (
                          <button type="button" onClick={() => setCancelling(booking)} className={buttonStyles('ghost', 'sm', 'border border-red-200 text-red-600 hover:bg-red-50')}>
                            Cancel
                          </button>
                        )}
                        {booking.status === 'Completed' && (
                          <Link to={`/grounds/${booking.groundId}?book=1`} className={buttonStyles('accent', 'sm')}>
                            Book again
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-forest/[0.07] bg-white p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-cricket" />
          <p className="text-[11px] leading-relaxed text-slateink-light">
            <span className="font-bold text-forest">Demo notice:</span> all bookings on this page are simulated and stored
            in your browser’s localStorage. Cancelling a booking does not contact a ground owner and no refund is issued.
          </p>
        </div>
      </div>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Booking details"
        description={viewing ? `Reference ${viewing.reference}` : undefined}
        size="md"
        footer={
          viewing ? (
            <>
              <button type="button" onClick={() => setViewing(null)} className={buttonStyles('outline', 'md')}>Close</button>
              {viewing.status === 'Confirmed' && (
                <button
                  type="button"
                  onClick={() => {
                    const target = viewing;
                    setViewing(null);
                    setCancelling(target);
                  }}
                  className={buttonStyles('danger', 'md')}
                >
                  Cancel booking
                </button>
              )}
            </>
          ) : null
        }
      >
        {viewing && (
          <div>
            <div className="flex items-center gap-3 rounded-2xl bg-offwhite p-3">
              <img src={viewing.image} alt={viewing.groundName} className="h-16 w-20 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-bold text-forest">{viewing.groundName}</p>
                <p className="text-[11px] text-slateink-light">{viewing.city}</p>
                <StatusBadge status={viewing.status} />
              </div>
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              {[
                ['Reference', viewing.reference],
                ['Date', formatDate(viewing.date, 'long')],
                ['Time slots', viewing.slots.join(', ')],
                ['Players', String(viewing.players)],
                ['Booked on', formatDate(viewing.createdAt, 'long')],
                ['Total (demo)', inr(viewing.amount)],
                ['Booked by', viewing.userEmail],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-forest/[0.05] pb-2 last:border-0">
                  <dt className="shrink-0 text-slateink-light">{label}</dt>
                  <dd className="text-right font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            {viewing.note && (
              <div className="mt-3 rounded-xl border border-forest/[0.07] bg-offwhite/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slateink-faint">Booking note</p>
                <p className="mt-1 text-xs leading-relaxed text-slateink">{viewing.note}</p>
              </div>
            )}
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-matchday/25 bg-matchday/[0.08] p-3 text-[10.5px] leading-relaxed text-[#8A5000]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              This reservation is a frontend demonstration. No real ground, payment or owner is involved.
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={() => {
          if (!cancelling) return;
          cancelBooking(cancelling.id);
          setCancelling(null);
        }}
        title="Cancel this demo booking?"
        description={cancelling ? `${cancelling.groundName} on ${formatDate(cancelling.date)} will be marked as cancelled. This is simulated — no refund is processed.` : ''}
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep booking"
        icon={<XCircle className="h-6 w-6" />}
      />

      <button
        type="button"
        onClick={() => pushToast({ title: 'Need help?', description: 'Support is a placeholder in this demo — no real message is sent.', tone: 'info' })}
        className="fixed bottom-5 right-5 z-30 hidden h-11 items-center gap-2 rounded-full bg-forest px-4 text-xs font-bold text-white shadow-lift transition hover:bg-forest-900 sm:flex"
      >
        <Info className="h-4 w-4 text-grass" /> Demo support
      </button>
    </div>
  );
}
