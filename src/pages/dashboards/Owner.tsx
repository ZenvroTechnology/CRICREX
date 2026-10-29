import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  IndianRupee,
  MapPin,
  Percent,
  Plus,
  Save,
  Star,
  Ticket,
  TrendingUp,
  Wallet,
  XCircle,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ChartCard, tooltipStyle } from '@/components/dashboard/ChartCard';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Checkbox, Input, Select, Textarea, Toggle } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useApp } from '@/context/AppContext';
import { grounds } from '@/data/mock';
import {
  cn,
  formatDate,
  getSlotsFor,
  getUpcomingDays,
  inr,
  readStore,
  relativeDay,
  toIso,
  writeStore,
} from '@/lib/utils';
import type { Booking, BookingStatus, Ground } from '@/types';

const revenueWeeks = [
  { week: 'W1', revenue: 18400, bookings: 9 },
  { week: 'W2', revenue: 22100, bookings: 11 },
  { week: 'W3', revenue: 19800, bookings: 10 },
  { week: 'W4', revenue: 26400, bookings: 13 },
  { week: 'W5', revenue: 24100, bookings: 12 },
  { week: 'W6', revenue: 29700, bookings: 15 },
  { week: 'W7', revenue: 27300, bookings: 14 },
  { week: 'W8', revenue: 32600, bookings: 16 },
];

const payoutHistory = [
  { id: 'PO-2041', date: '2026-10-22', amount: 22400, status: 'Paid', method: 'Bank transfer' },
  { id: 'PO-2032', date: '2026-10-15', amount: 19800, status: 'Paid', method: 'Bank transfer' },
  { id: 'PO-2024', date: '2026-10-08', amount: 26100, status: 'Paid', method: 'UPI' },
  { id: 'PO-2016', date: '2026-10-01', amount: 17200, status: 'Paid', method: 'Bank transfer' },
];

const amenityOptions = [
  'Floodlights',
  'Parking',
  'Changing Rooms',
  'Washrooms',
  'Pavilion',
  'Scoreboard',
  'Drinking Water',
  'First Aid',
  'Cafeteria',
  'Seating',
  'Equipment Rental',
  'Wi-Fi',
  'Air Conditioning',
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function ownerGround(userId?: string): Ground {
  return grounds.find((ground) => ground.ownerId === userId) ?? grounds[0];
}

export function OwnerHome() {
  const { user, bookings, pushToast, notifications } = useApp();
  const ground = ownerGround(user?.id);
  const ownerBookings = useMemo(() => bookings.filter((booking) => booking.groundName === ground.name), [bookings, ground.name]);
  const active = ownerBookings.filter((booking) => booking.status !== 'Cancelled');
  const revenue = active.reduce((sum, booking) => sum + booking.amount, 0);
  const upcoming = ownerBookings.filter((booking) => booking.status === 'Confirmed');
  const today = toIso(new Date());

  const slotMix = [
    { name: 'Morning', value: ownerBookings.filter((b) => b.slots.some((s) => /0[6-9]:00 AM|1[01]:00 AM/.test(s))).length, color: '#8BCB75' },
    { name: 'Afternoon', value: ownerBookings.filter((b) => b.slots.some((s) => /12:00 PM|0[1-4]:00 PM/.test(s))).length, color: '#FF9F43' },
    { name: 'Evening', value: ownerBookings.filter((b) => b.slots.some((s) => /0[5-9]:00 PM|10:00 PM/.test(s))).length, color: '#217346' },
  ].map((entry) => ({ ...entry, value: Math.max(entry.value, entry.name === 'Evening' ? 4 : 2) }));

  return (
    <div>
      <PageHeader
        eyebrow="Owner workspace"
        title="Ground operations"
        description={`A live snapshot for ${ground.name} — bookings, earnings and availability at a glance.`}
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ title: 'Owner report (demo)', description: 'No file was downloaded in this frontend demo.', tone: 'info' })}>Export summary</Button>
            <Link to="/owner/availability" className={buttonStyles('primary', 'md')}>
              Manage availability <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ground bookings" value={ownerBookings.length} icon={<Ticket className="h-5 w-5" />} delta={14} hint={`${upcoming.length} confirmed upcoming`} />
        <StatCard label="Demo revenue" value={inr(revenue)} icon={<Wallet className="h-5 w-5" />} delta={11} tone="orange" hint="Simulated — no payouts made" />
        <StatCard label="Occupancy" value="68%" icon={<TrendingUp className="h-5 w-5" />} delta={6} tone="grass" hint="7-day rolling average" />
        <StatCard label="Ground rating" value={ground.rating.toFixed(1)} icon={<Star className="h-5 w-5" />} hint={`${ground.reviewCount} simulated reviews`} tone="blue" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <ChartCard
          title="Revenue trend"
          subtitle="Simulated weekly earnings for this ground"
          className="xl:col-span-2"
          action={<Badge tone="success" dot>+18% vs last month</Badge>}
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueWeeks} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="ownerRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#217346" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#217346" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#98A2B3' }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} />
                <Tooltip {...tooltipStyle} formatter={(value, name) => [name === 'revenue' ? inr(Number(value)) : Number(value), name === 'revenue' ? 'Revenue' : 'Bookings']} />
                <Area type="monotone" dataKey="revenue" stroke="#217346" strokeWidth={2.4} fill="url(#ownerRevenue)" />
                <Bar dataKey="bookings" fill="#FF9F43" barSize={10} opacity={0.55} hide />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[10.5px] text-slateink-light">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cricket" /> Demo revenue</span>
            <span>Peak evening slots contribute 46% of bookings</span>
          </div>
        </ChartCard>

        <ChartCard title="Slot mix" subtitle="When teams book your ground">
          <div className="relative h-[188px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slotMix} dataKey="value" nameKey="name" innerRadius={54} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                  {slotMix.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-2xl font-extrabold text-forest">{ownerBookings.length}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slateink-faint">bookings</p>
            </div>
          </div>
          <div className="mt-2 space-y-1.5">
            {slotMix.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-[10.5px] text-slateink-light">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
                {entry.name}
                <span className="ml-auto font-bold text-forest">{entry.value}</span>
              </div>
            ))}
          </div>
          <Link to="/owner/bookings" className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-offwhite py-2 text-[10.5px] font-bold text-cricket transition hover:bg-cricket/10">
            Open booking desk <ArrowUpRight className="h-3 w-3" />
          </Link>
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between px-5 pb-3 pt-5 sm:px-6">
            <div>
              <h3 className="font-display text-[15px] font-bold text-forest">Upcoming bookings</h3>
              <p className="mt-0.5 text-[11px] text-slateink-light">Confirmed reservations for {ground.name}</p>
            </div>
            <Link to="/owner/bookings" className="text-[10.5px] font-bold text-cricket hover:text-forest">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState className="m-5 border-0 bg-transparent" icon={<CalendarX2 className="h-6 w-6" />} title="No upcoming bookings" description="New simulated reservations will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead className="border-y border-forest/[0.06] bg-offwhite/60">
                  <tr>
                    <th className="table-th">Reference</th>
                    <th className="table-th">Date</th>
                    <th className="table-th">Slots</th>
                    <th className="table-th">Amount</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/[0.05]">
                  {upcoming.slice(0, 5).map((booking) => (
                    <tr key={booking.id} className="transition hover:bg-offwhite/50">
                      <td className="table-td font-mono text-[11px] font-bold text-forest">{booking.reference}</td>
                      <td className="table-td">
                        <p className="text-[11.5px] font-semibold">{relativeDay(booking.date)}</p>
                        <p className="text-[10px] text-slateink-light">{formatDate(booking.date)}</p>
                      </td>
                      <td className="table-td text-[11px]">{booking.slots.length} slot{booking.slots.length > 1 ? 's' : ''}</td>
                      <td className="table-td text-[12px] font-bold text-forest">{inr(booking.amount)}</td>
                      <td className="table-td"><StatusBadge status={booking.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[15px] font-bold text-forest">Ground health</h3>
              <Badge tone="grass">Published</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Profile completeness', value: 92, color: 'bg-cricket' },
                { label: 'Response rate', value: 98, color: 'bg-success' },
                { label: 'Slot utilisation', value: 68, color: 'bg-matchday' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slateink-light">{row.label}</span>
                    <span className="font-bold text-forest">{row.value}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-forest/[0.06]">
                    <div className={cn('h-full rounded-full', row.color)} style={{ width: `${row.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <Link to="/owner/ground" className="mt-4 inline-flex items-center gap-1 text-[10.5px] font-bold text-cricket hover:text-forest">
              Improve ground profile <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A5000]"><Clock3 className="h-3.5 w-3.5" /> Today at a glance</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-[#8A5000]">
              {ownerBookings.filter((booking) => booking.date === today && booking.status !== 'Cancelled').length}
            </p>
            <p className="text-[10.5px] text-[#9A6A2A]">booked sessions for {formatDate(today)}</p>
            <p className="mt-2 text-[10.5px] leading-relaxed text-[#9A6A2A]">
              {notifications.filter((item) => !item.read).length} unread demo notifications across the workspace.
            </p>
          </div>

          <Link to="/owner/earnings" className="card card-hover group flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cricket/10 text-cricket">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-forest">Payout centre</p>
              <p className="mt-0.5 text-[11px] text-slateink-light">Next demo payout in 3 days</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-slateink-faint transition group-hover:text-cricket" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function OwnerBookings() {
  const { user, bookings, cancelBooking, pushToast } = useApp();
  const ground = ownerGround(user?.id);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [viewing, setViewing] = useState<Booking | null>(null);
  const [overrides, setOverrides] = useState<Record<string, BookingStatus>>({});

  const scoped = bookings.filter((booking) => booking.groundName === ground.name);
  const filtered = scoped.filter((booking) => {
    const text = `${booking.reference} ${booking.userEmail} ${booking.date}`.toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (status && (overrides[booking.id] ?? booking.status) !== status) return false;
    return true;
  });

  const complete = (booking: Booking) => {
    setOverrides((current) => ({ ...current, [booking.id]: 'Completed' }));
    pushToast({ title: 'Booking marked completed', description: `${booking.reference} is now in the completed ledger.`, tone: 'success' });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Booking desk"
        title="Ground bookings"
        description={`Every simulated reservation for ${ground.name}. Approve the day, complete sessions or cancel with a reason.`}
        actions={<Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ title: 'Bookings export simulated', description: `${filtered.length} records would be included.`, tone: 'info' })}>Export CSV</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total bookings" value={scoped.length} icon={<CalendarCheck className="h-5 w-5" />} hint="All demo reservations" />
        <StatCard label="Confirmed" value={scoped.filter((booking) => (overrides[booking.id] ?? booking.status) === 'Confirmed').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="grass" hint="Upcoming sessions" />
        <StatCard label="Completed" value={scoped.filter((booking) => (overrides[booking.id] ?? booking.status) === 'Completed').length} icon={<BadgeCheck className="h-5 w-5" />} tone="blue" hint="Settled in demo" />
        <StatCard label="Cancelled" value={scoped.filter((booking) => (overrides[booking.id] ?? booking.status) === 'Cancelled').length} icon={<XCircle className="h-5 w-5" />} tone="orange" hint="No refunds processed" />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reference, email or date"
            aria-label="Search owner bookings"
            className="h-10 flex-1 rounded-xl border border-forest/10 bg-offwhite/60 px-3.5 text-xs text-slateink placeholder:text-slateink-faint focus:border-cricket focus:bg-white focus:outline-none focus:ring-4 focus:ring-cricket/10"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter booking status"
            className="h-10 rounded-xl border border-forest/10 bg-white px-3 text-xs font-semibold text-forest focus:border-cricket focus:outline-none focus:ring-4 focus:ring-cricket/10 sm:w-44"
          >
            <option value="">All statuses</option>
            {['Confirmed', 'Completed', 'Cancelled'].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState className="m-5 border-0 bg-transparent" icon={<Ticket className="h-6 w-6" />} title="No bookings found" description="Adjust the search or status filter to see reservations." action={<Button variant="outline" onClick={() => { setQuery(''); setStatus(''); }}>Clear filters</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px]">
              <thead className="border-b border-forest/[0.06] bg-offwhite/60">
                <tr>
                  <th className="table-th">Reference</th>
                  <th className="table-th">Player</th>
                  <th className="table-th">Date & slots</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/[0.05]">
                {filtered.map((booking) => {
                  const current = overrides[booking.id] ?? booking.status;
                  return (
                    <tr key={booking.id} className="transition hover:bg-offwhite/50">
                      <td className="table-td font-mono text-[11px] font-bold text-forest">{booking.reference}</td>
                      <td className="table-td">
                        <p className="text-[11.5px] font-semibold text-forest">{booking.userEmail}</p>
                        <p className="text-[10px] text-slateink-light">{booking.players} players</p>
                      </td>
                      <td className="table-td">
                        <p className="text-[11.5px]">{formatDate(booking.date)}</p>
                        <p className="text-[10px] text-slateink-light">{booking.slots.join(' · ')}</p>
                      </td>
                      <td className="table-td text-[12px] font-bold text-forest">{inr(booking.amount)}</td>
                      <td className="table-td"><StatusBadge status={current} /></td>
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-1.5">
                          <button type="button" onClick={() => setViewing(booking)} className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket">View</button>
                          {current === 'Confirmed' && (
                            <button type="button" onClick={() => complete(booking)} className="rounded-lg bg-success/10 px-2.5 py-1.5 text-[10.5px] font-bold text-success transition hover:bg-success/15">Complete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-forest/[0.06] px-5 py-3 text-[10px] text-slateink-light">
          Showing {filtered.length} of {scoped.length} reservations · status updates are simulated
        </div>
      </div>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title="Booking details" description={viewing?.reference} size="md">
        {viewing && (
          <div>
            <div className="flex items-center gap-3 rounded-2xl bg-offwhite p-3">
              <img src={viewing.image} alt={viewing.groundName} className="h-16 w-20 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-bold text-forest">{viewing.groundName}</p>
                <p className="flex items-center gap-1 text-[11px] text-slateink-light"><MapPin className="h-3 w-3" /> {viewing.city}</p>
                <div className="mt-1"><StatusBadge status={overrides[viewing.id] ?? viewing.status} /></div>
              </div>
            </div>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ['Date', formatDate(viewing.date, 'long')],
                ['Slots', viewing.slots.join(', ')],
                ['Players', String(viewing.players)],
                ['Amount', inr(viewing.amount)],
                ['Booked by', viewing.userEmail],
                ['Created', formatDate(viewing.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-forest/[0.07] p-3">
                  <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{label}</dt>
                  <dd className="mt-0.5 text-[12px] font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            {viewing.note && <p className="mt-3 rounded-xl bg-offwhite p-3 text-xs leading-relaxed text-slateink-light">{viewing.note}</p>}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              {(overrides[viewing.id] ?? viewing.status) === 'Confirmed' && (
                <>
                  <Button variant="danger" onClick={() => { cancelBooking(viewing.id); setOverrides((current) => ({ ...current, [viewing.id]: 'Cancelled' })); setViewing(null); }}>
                    Cancel booking
                  </Button>
                  <Button variant="primary" onClick={() => { complete(viewing); setViewing(null); }}>Mark completed</Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function OwnerEarnings() {
  const { user, bookings, pushToast } = useApp();
  const ground = ownerGround(user?.id);
  const scoped = bookings.filter((booking) => booking.groundName === ground.name && booking.status !== 'Cancelled');
  const gross = scoped.reduce((sum, booking) => sum + booking.amount, 0);
  const fee = Math.round(gross * 0.1);
  const net = gross - fee;
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [amount, setAmount] = useState('15000');
  const [method, setMethod] = useState('Bank transfer');
  const [error, setError] = useState('');

  const requestPayout = (event: FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!value || value < 500) {
      setError('The minimum demo payout is ₹500.');
      return;
    }
    if (value > net) {
      setError(`Available balance is ${inr(net)}. Choose a smaller amount.`);
      return;
    }
    setError('');
    setPayoutOpen(false);
    pushToast({ title: 'Payout requested (demo)', description: `${inr(value)} via ${method} — no money moves in this demo.`, tone: 'success' });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Earnings"
        title="Payouts & revenue"
        description="A simulated view of ground revenue, platform fees and payout history. No real payments are processed."
        actions={<Button variant="primary" icon={<IndianRupee className="h-4 w-4" />} onClick={() => setPayoutOpen(true)}>Request payout</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross revenue" value={inr(gross)} icon={<Wallet className="h-5 w-5" />} delta={16} hint="Confirmed + completed demo bookings" />
        <StatCard label="Platform fee" value={inr(fee)} icon={<Percent className="h-5 w-5" />} tone="orange" hint="10% simulated commission" />
        <StatCard label="Net earnings" value={inr(net)} icon={<IndianRupee className="h-5 w-5" />} tone="grass" hint="After demo commission" />
        <StatCard label="Next payout" value={inr(22400)} icon={<CreditCard className="h-5 w-5" />} tone="blue" hint="Scheduled in 3 days" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <ChartCard title="Weekly revenue" subtitle="Simulated ground earnings, last eight weeks" className="xl:col-span-2">
          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueWeeks} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#98A2B3' }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} />
                <Tooltip {...tooltipStyle} formatter={(value) => [inr(Number(value)), 'Revenue']} />
                <Bar dataKey="revenue" fill="#217346" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="card p-5 sm:p-6">
          <h3 className="font-display text-[15px] font-bold text-forest">Revenue split</h3>
          <p className="mt-0.5 text-[11px] text-slateink-light">How the demo ledger breaks down.</p>
          <div className="mt-4 space-y-4">
            {[
              { label: 'Ground hire', value: Math.round(gross * 0.82), color: 'bg-cricket' },
              { label: 'Equipment & nets', value: Math.round(gross * 0.12), color: 'bg-grass' },
              { label: 'Tournament surcharge', value: Math.round(gross * 0.06), color: 'bg-matchday' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slateink-light">{row.label}</span>
                  <span className="font-bold text-forest">{inr(row.value)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-forest/[0.06]">
                  <div className={cn('h-full rounded-full', row.color)} style={{ width: `${(row.value / Math.max(1, gross)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-forest/[0.07] bg-offwhite p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slateink-faint">Available to request</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-forest">{inr(Math.max(0, Math.round(net * 0.45)))}</p>
            <button type="button" onClick={() => setPayoutOpen(true)} className="mt-2 text-[10.5px] font-bold text-cricket hover:text-forest">Request a payout →</button>
          </div>
        </div>
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
          <div>
            <h3 className="font-display text-[15px] font-bold text-forest">Payout history</h3>
            <p className="mt-0.5 text-[11px] text-slateink-light">Sample settlements for the demo ground.</p>
          </div>
          <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />} onClick={() => pushToast({ title: 'Statement simulated', description: 'A payout statement would download here.', tone: 'info' })}>Statement</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead className="border-y border-forest/[0.06] bg-offwhite/60">
              <tr>
                <th className="table-th">Payout ID</th>
                <th className="table-th">Date</th>
                <th className="table-th">Method</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/[0.05]">
              {payoutHistory.map((payout) => (
                <tr key={payout.id} className="transition hover:bg-offwhite/50">
                  <td className="table-td font-mono text-[11px] font-bold text-forest">{payout.id}</td>
                  <td className="table-td text-[11.5px]">{formatDate(payout.date)}</td>
                  <td className="table-td text-[11px]">{payout.method}</td>
                  <td className="table-td text-[12px] font-bold text-forest">{inr(payout.amount)}</td>
                  <td className="table-td"><Badge tone="success" dot>Paid</Badge></td>
                  <td className="table-td text-right">
                    <button type="button" onClick={() => pushToast({ title: `Receipt ${payout.id}`, description: `${inr(payout.amount)} · ${payout.method} · simulated`, tone: 'info' })} className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket">Receipt</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={payoutOpen} onClose={() => setPayoutOpen(false)} title="Request a demo payout" description="No money moves — this simulates the owner payout flow." size="sm">
        <form onSubmit={requestPayout} className="space-y-4">
          <div className="rounded-xl bg-offwhite p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slateink-faint">Available balance</p>
            <p className="font-display text-xl font-extrabold text-forest">{inr(net)}</p>
          </div>
          <Input label="Amount (INR)" type="number" min={500} max={net} value={amount} onChange={(event) => { setAmount(event.target.value); setError(''); }} error={error} required />
          <Select label="Payout method" value={method} onChange={(event) => setMethod(event.target.value)}>
            {['Bank transfer', 'UPI', 'Demo wallet'].map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPayoutOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Request payout</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function OwnerGroundProfile() {
  const { user, pushToast } = useApp();
  const base = ownerGround(user?.id);
  const [form, setForm] = useState<Ground>(() => readStore<Ground>('cricrex.owner.ground.v1', base));
  const [saved, setSaved] = useState<Ground>(form);

  const setField = <K extends keyof Ground>(key: K, value: Ground[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 3 || form.city.trim().length < 2) {
      pushToast({ title: 'Ground name and city are required', description: 'Add those details before saving the listing.', tone: 'warning' });
      return;
    }
    writeStore('cricrex.owner.ground.v1', form);
    setSaved(form);
    pushToast({ title: 'Ground profile saved', description: 'Changes are stored in this browser only.', tone: 'success' });
  };

  const toggleAmenity = (amenity: string) => {
    setField(
      'amenities',
      form.amenities.includes(amenity) ? form.amenities.filter((item) => item !== amenity) : [...form.amenities, amenity],
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Ground profile"
        title="Your public listing"
        description="Edit the details players see when they discover your ground. Photos are fixed demo assets."
        actions={<Link to={`/grounds/${form.id}`} className={buttonStyles('outline', 'md')}>Preview listing <ArrowUpRight className="h-4 w-4" /></Link>}
      />

      <form onSubmit={save} className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cricket/10 text-cricket"><Building2 className="h-4 w-4" /></span>
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Ground details</h3>
                <p className="text-[10.5px] text-slateink-light">Core listing information.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Ground name" value={form.name} onChange={(event) => setField('name', event.target.value)} containerClassName="sm:col-span-2" required />
              <Input label="City" value={form.city} onChange={(event) => setField('city', event.target.value)} required />
              <Input label="Locality" value={form.locality} onChange={(event) => setField('locality', event.target.value)} />
              <Select label="Surface type" value={form.type} onChange={(event) => setField('type', event.target.value as Ground['type'])}>
                {['Outdoor Turf', 'Artificial Turf', 'Indoor Nets'].map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
              <Input label="Player capacity" type="number" min={2} max={60} value={form.capacity} onChange={(event) => setField('capacity', Number(event.target.value))} />
              <Input label="Opening hours" value={form.openHours} onChange={(event) => setField('openHours', event.target.value)} />
              <Select label="Listing status" value={form.status} onChange={(event) => setField('status', event.target.value as Ground['status'])}>
                {['Published', 'Draft', 'Paused'].map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
              <Textarea label="Description" value={form.description} onChange={(event) => setField('description', event.target.value)} containerClassName="sm:col-span-2" className="min-h-[130px]" hint="Describe the pitch, outfield and matchday experience." />
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-forest/[0.07] pt-4 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => { setForm(saved); pushToast({ title: 'Unsaved changes discarded', description: 'The listing is back to its last saved state.', tone: 'info' }); }}>Discard changes</Button>
              <Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />}>Save ground profile</Button>
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Amenities</h3>
                <p className="mt-0.5 text-[10.5px] text-slateink-light">Tick everything available on matchday.</p>
              </div>
              <Badge tone="grass">{form.amenities.length} selected</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {amenityOptions.map((amenity) => (
                <Checkbox
                  key={amenity}
                  checked={form.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  label={amenity}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="relative h-40">
              <img src={form.image} alt={form.name} className="h-full w-full object-cover" />
              <div className="absolute left-3 top-3 flex gap-1.5">
                <Badge tone="forest">{form.type}</Badge>
                {form.featured && <Badge tone="orange">Featured</Badge>}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-display text-base font-bold text-forest">{form.name || 'Untitled ground'}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slateink-light"><MapPin className="h-3 w-3" /> {form.locality ? `${form.locality}, ` : ''}{form.city || 'City'}</p>
              <div className="mt-2 flex items-center gap-2 text-[11.5px]">
                <span className="flex items-center gap-1 font-bold text-forest"><Star className="h-3 w-3 fill-matchday text-matchday" /> {form.rating}</span>
                <span className="text-slateink-faint">({form.reviewCount} reviews)</span>
                <span className="ml-auto font-bold text-forest">{inr(form.price)}/hr</span>
              </div>
              <p className="mt-3 line-clamp-4 text-[11px] leading-relaxed text-slateink-light">{form.description}</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-[15px] font-bold text-forest">Photo gallery</h3>
            <p className="mt-0.5 text-[10.5px] text-slateink-light">Three demo photos are attached to this listing.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {form.gallery.map((image, index) => (
                <div key={image} className="relative overflow-hidden rounded-lg">
                  <img src={image} alt={`Ground gallery ${index + 1}`} className="h-16 w-full object-cover" />
                  <span className="absolute bottom-1 left-1 rounded bg-forest-950/70 px-1.5 py-0.5 text-[8px] font-bold text-white">{index === 0 ? 'Cover' : `Photo ${index + 1}`}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => pushToast({ title: 'Uploads are simulated', description: 'Image upload is disabled in this frontend demo.', tone: 'info' })}>
              <Plus className="h-3.5 w-3.5" /> Add photo
            </Button>
          </div>

          <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest"><CalendarDays className="h-3.5 w-3.5 text-cricket" /> Save separately</p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-slateink-light">
              Ground details are saved with the button on the left. Pricing and availability live on their own pages so
              each change has a clear audit trail.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

interface PricingConfig {
  base: number;
  peak: number;
  weekend: number;
  tournament: number;
  slotMinutes: number;
  advanceDays: number;
}

export function OwnerPricing() {
  const { user, pushToast } = useApp();
  const ground = ownerGround(user?.id);
  const [config, setConfig] = useState<PricingConfig>(() =>
    readStore<PricingConfig>('cricrex.owner.pricing.v1', {
      base: ground.price,
      peak: ground.price + 400,
      weekend: ground.price + 200,
      tournament: Math.round(ground.price * 1.4),
      slotMinutes: 60,
      advanceDays: 30,
    }),
  );

  const setField = (key: keyof PricingConfig, value: number) => setConfig((current) => ({ ...current, [key]: value }));

  const save = () => {
    if (config.base < 100 || config.peak < config.base || config.weekend < config.base) {
      pushToast({ title: 'Check the pricing rules', description: 'Peak and weekend rates should be at or above the base rate.', tone: 'warning' });
      return;
    }
    writeStore('cricrex.owner.pricing.v1', config);
    pushToast({ title: 'Pricing saved', description: 'New rates are stored locally for this demo ground.', tone: 'success' });
  };

  const applySuggested = () => {
    setConfig({ base: 1800, peak: 2300, weekend: 2100, tournament: 2700, slotMinutes: 60, advanceDays: 30 });
    pushToast({ title: 'Suggested rates applied', description: 'Review the figures, then save to keep them.', tone: 'info' });
  };

  const rules = [
    { label: 'Weekday morning (6 AM – 12 PM)', price: config.base, note: 'Base rate' },
    { label: 'Weekday afternoon (12 PM – 5 PM)', price: config.base, note: 'Base rate' },
    { label: 'Weekday evening (5 PM – 10 PM)', price: config.peak, note: 'Peak rate' },
    { label: 'Weekend any slot', price: config.weekend, note: 'Weekend rate' },
    { label: 'Tournament full-day hire', price: config.tournament, note: 'Tournament rate' },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Pricing"
        title="Rates & booking rules"
        description="Set transparent hourly rates, peak pricing and how far ahead teams can book."
        actions={<Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={save}>Save pricing</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-matchday/15 text-[#B25E00]"><IndianRupee className="h-4 w-4" /></span>
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Rate card</h3>
                <p className="text-[10.5px] text-slateink-light">All values are in INR and simulated.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Base hourly rate" type="number" min={100} step={50} value={config.base} onChange={(event) => setField('base', Number(event.target.value))} hint="Standard weekday daytime rate." />
              <Input label="Peak hourly rate" type="number" min={100} step={50} value={config.peak} onChange={(event) => setField('peak', Number(event.target.value))} hint="Evening slots under floodlights." />
              <Input label="Weekend hourly rate" type="number" min={100} step={50} value={config.weekend} onChange={(event) => setField('weekend', Number(event.target.value))} hint="Saturday and Sunday." />
              <Input label="Tournament day rate" type="number" min={100} step={50} value={config.tournament} onChange={(event) => setField('tournament', Number(event.target.value))} hint="Full-day hire estimate." />
              <Select label="Slot length" value={String(config.slotMinutes)} onChange={(event) => setField('slotMinutes', Number(event.target.value))}>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </Select>
              <Select label="Booking window" value={String(config.advanceDays)} onChange={(event) => setField('advanceDays', Number(event.target.value))}>
                <option value="14">14 days ahead</option>
                <option value="30">30 days ahead</option>
                <option value="60">60 days ahead</option>
                <option value="90">90 days ahead</option>
              </Select>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-forest/[0.07] pt-4">
              <Button variant="outline" onClick={applySuggested}>Use suggested rates</Button>
              <Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={save}>Save pricing</Button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-4">
              <h3 className="font-display text-[15px] font-bold text-forest">Live rate preview</h3>
              <p className="mt-0.5 text-[11px] text-slateink-light">How these rules appear to a booking player.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className="border-y border-forest/[0.06] bg-offwhite/60">
                  <tr>
                    <th className="table-th">Window</th>
                    <th className="table-th">Rule</th>
                    <th className="table-th text-right">Per hour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/[0.05]">
                  {rules.map((rule) => (
                    <tr key={rule.label} className="transition hover:bg-offwhite/50">
                      <td className="table-td text-[11.5px] font-medium">{rule.label}</td>
                      <td className="table-td"><Badge tone={rule.note === 'Peak rate' ? 'orange' : rule.note === 'Weekend rate' ? 'info' : 'neutral'}>{rule.note}</Badge></td>
                      <td className="table-td text-right text-[12px] font-bold text-forest">{inr(rule.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl bg-forest p-5 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-grass">Suggested benchmark</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-white">{inr(config.base)}<span className="text-sm font-semibold text-white/50">/hr</span></p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/60">
              Comparable {ground.type.toLowerCase()} grounds in {ground.city} average {inr(ground.price)} per hour.
            </p>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-[10.5px] text-white/60">
              <p className="flex items-center justify-between"><span>Advance window</span><span className="font-bold text-white">{config.advanceDays} days</span></p>
              <p className="flex items-center justify-between"><span>Slot length</span><span className="font-bold text-white">{config.slotMinutes} min</span></p>
              <p className="flex items-center justify-between"><span>Platform fee</span><span className="font-bold text-white">10%</span></p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-[15px] font-bold text-forest">Pricing tips</h3>
            <ul className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-slateink-light">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Keep evening rates 20–30% above daytime.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Offer tournament day pricing for larger bookings.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> A 30-day window balances early bookings and flexibility.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-4">
            <p className="text-[11px] font-bold text-[#8A5000]">No billing engine</p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#9A6A2A]">
              Rate changes never affect existing bookings in this demo and no invoices are generated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DayHours {
  open: boolean;
  from: string;
  to: string;
}

export function OwnerAvailability() {
  const { user, pushToast } = useApp();
  const ground = ownerGround(user?.id);
  const days = getUpcomingDays(7);
  const [schedule, setSchedule] = useState<Record<string, DayHours>>(() =>
    readStore('cricrex.owner.hours.v1', Object.fromEntries(WEEKDAYS.map((day) => [day, { open: day !== 'Monday', from: '06:00', to: '22:00' }]))),
  );
  const [blocked, setBlocked] = useState<string[]>(() => readStore<string[]>('cricrex.owner.blocked.v1', []));
  const [blackouts, setBlackouts] = useState<string[]>(() => readStore<string[]>('cricrex.owner.blackouts.v1', []));
  const [blackoutDate, setBlackoutDate] = useState('');
  const today = toIso(new Date());

  const toggleSlot = (date: string, slot: string, available: boolean) => {
    if (!available) {
      pushToast({ title: 'Slot already booked', description: 'Booked demo slots cannot be blocked from this view.', tone: 'warning' });
      return;
    }
    const key = `${date}|${slot}`;
    setBlocked((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

  const save = () => {
    writeStore('cricrex.owner.hours.v1', schedule);
    writeStore('cricrex.owner.blocked.v1', blocked);
    writeStore('cricrex.owner.blackouts.v1', blackouts);
    pushToast({ title: 'Availability saved', description: 'Opening hours and blocked slots are stored in this browser.', tone: 'success' });
  };

  const addBlackout = () => {
    if (!blackoutDate) {
      pushToast({ title: 'Pick a date first', description: 'Choose a date to mark the ground closed.', tone: 'warning' });
      return;
    }
    if (blackouts.includes(blackoutDate)) {
      pushToast({ title: 'Already blocked', description: `${formatDate(blackoutDate)} is already a blackout date.`, tone: 'info' });
      return;
    }
    setBlackouts((current) => [...current, blackoutDate].sort());
    pushToast({ title: 'Blackout added', description: `${formatDate(blackoutDate, 'long')} is now closed in the demo.`, tone: 'success' });
    setBlackoutDate('');
  };

  return (
    <div>
      <PageHeader
        eyebrow="Availability"
        title="Opening hours & slots"
        description="Control when the ground is open, block individual slots and add closed dates."
        actions={<Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={save}>Save availability</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cricket/10 text-cricket"><Clock3 className="h-4 w-4" /></span>
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Weekly hours</h3>
                <p className="text-[10.5px] text-slateink-light">Set the standard opening window.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {WEEKDAYS.map((day) => {
                const hours = schedule[day];
                return (
                  <div key={day} className="rounded-xl border border-forest/[0.07] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11.5px] font-bold text-forest">{day}</p>
                      <Toggle
                        checked={hours.open}
                        onChange={(value) => setSchedule((current) => ({ ...current, [day]: { ...current[day], open: value } }))}
                        label="Open"
                      />
                    </div>
                    {hours.open && (
                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        <label className="text-[9.5px] font-semibold uppercase tracking-wide text-slateink-faint">
                          Open
                          <input type="time" value={hours.from} onChange={(event) => setSchedule((current) => ({ ...current, [day]: { ...current[day], from: event.target.value } }))} className="mt-1 h-9 w-full rounded-lg border border-forest/10 px-2 text-[11px] text-forest focus:border-cricket focus:outline-none focus:ring-2 focus:ring-cricket/10" />
                        </label>
                        <label className="text-[9.5px] font-semibold uppercase tracking-wide text-slateink-faint">
                          Close
                          <input type="time" value={hours.to} onChange={(event) => setSchedule((current) => ({ ...current, [day]: { ...current[day], to: event.target.value } }))} className="mt-1 h-9 w-full rounded-lg border border-forest/10 px-2 text-[11px] text-forest focus:border-cricket focus:outline-none focus:ring-2 focus:ring-cricket/10" />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-[15px] font-bold text-forest">Blackout dates</h3>
            <p className="mt-0.5 text-[10.5px] text-slateink-light">Close the whole ground for maintenance or events.</p>
            <div className="mt-3 flex gap-2">
              <input type="date" value={blackoutDate} min={today} onChange={(event) => setBlackoutDate(event.target.value)} aria-label="Blackout date" className="h-10 min-w-0 flex-1 rounded-xl border border-forest/10 px-3 text-xs text-forest focus:border-cricket focus:outline-none focus:ring-4 focus:ring-cricket/10" />
              <Button variant="outline" icon={<Plus className="h-4 w-4" />} onClick={addBlackout}>Add</Button>
            </div>
            <div className="mt-3 space-y-2">
              {blackouts.length === 0 ? (
                <p className="rounded-xl bg-offwhite p-3 text-[10.5px] text-slateink-light">No blackout dates. The ground follows weekly hours.</p>
              ) : (
                blackouts.map((date) => (
                  <div key={date} className="flex items-center justify-between rounded-xl border border-forest/[0.07] px-3 py-2">
                    <span className="text-[11px] font-semibold text-forest">{formatDate(date, 'long')}</span>
                    <button type="button" onClick={() => setBlackouts((current) => current.filter((item) => item !== date))} className="text-[10px] font-bold text-red-600 hover:underline">Remove</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Next seven days</h3>
                <p className="mt-0.5 text-[10.5px] text-slateink-light">Click a free slot to block or unblock it. Red means blocked, grey means already booked.</p>
              </div>
              <div className="flex items-center gap-3 text-[9.5px] font-semibold text-slateink-light">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-grass" /> Open</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-forest/20" /> Booked</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-red-400" /> Blocked</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {days.map((date) => {
                const weekday = dayMap[new Date(`${date}T00:00:00`).getDay()];
                const hours = schedule[weekday];
                const isBlackout = blackouts.includes(date);
                const slots = getSlotsFor(ground.id, date);
                return (
                  <div key={date} className={cn('rounded-2xl border p-3', isBlackout ? 'border-red-200 bg-red-50/60' : 'border-forest/[0.07] bg-white')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11.5px] font-bold text-forest">{relativeDay(date)}</p>
                        <p className="text-[9.5px] text-slateink-light">{weekday} · {hours?.open ? `${hours.from}–${hours.to}` : 'Closed'}</p>
                      </div>
                      {isBlackout ? <Badge tone="danger">Closed</Badge> : <Badge tone={hours?.open ? 'success' : 'neutral'} dot>{hours?.open ? 'Open' : 'Closed'}</Badge>}
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-1">
                      {slots.map((slot) => {
                        const key = `${date}|${slot.time}`;
                        const isBlocked = blocked.includes(key);
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!hours?.open || isBlackout}
                            onClick={() => toggleSlot(date, slot.time, slot.available)}
                            aria-pressed={isBlocked}
                            aria-label={`${slot.time} on ${formatDate(date)} — ${isBlocked ? 'blocked' : slot.available ? 'open' : 'booked'}`}
                            className={cn(
                              'rounded-md py-1 text-[8.5px] font-bold transition',
                              !hours?.open || isBlackout
                                ? 'cursor-not-allowed bg-forest/[0.04] text-slateink-faint/50'
                                : isBlocked
                                  ? 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200'
                                  : slot.available
                                    ? 'bg-grass/20 text-forest hover:bg-grass/35'
                                    : 'cursor-not-allowed bg-forest/[0.08] text-slateink-faint',
                            )}
                          >
                            {slot.time.replace(':00', '')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slateink-faint">Open days</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-forest">{Object.values(schedule).filter((day) => day.open).length}<span className="text-sm text-slateink-faint">/7</span></p>
            </div>
            <div className="card p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slateink-faint">Blocked slots</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-forest">{blocked.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slateink-faint">Blackout dates</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-forest">{blackouts.length}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A5000]"><CalendarX2 className="h-3.5 w-3.5" /> Demo availability</p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#9A6A2A]">
              Green slots are generated deterministically for the demo. Blocking one changes this owner view only; the
              public ground page continues to use its own sample availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
