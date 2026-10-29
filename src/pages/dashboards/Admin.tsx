import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  CalendarCheck,
  CalendarX2,
  CheckCircle2,
  Clock3,
  Download,
  IndianRupee,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '@/context/AppContext';
import { adminActivity, grounds } from '@/data/mock';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ChartCard, tooltipStyle } from '@/components/dashboard/ChartCard';
import { StatCard } from '@/components/ui/StatCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { formatDate, inr } from '@/lib/utils';
import type { User } from '@/types';

const bookingTrend = [
  { week: 'W1', bookings: 34, revenue: 42800 },
  { week: 'W2', bookings: 41, revenue: 51200 },
  { week: 'W3', bookings: 38, revenue: 47600 },
  { week: 'W4', bookings: 52, revenue: 64100 },
  { week: 'W5', bookings: 47, revenue: 58800 },
  { week: 'W6', bookings: 61, revenue: 72400 },
  { week: 'W7', bookings: 58, revenue: 69300 },
  { week: 'W8', bookings: 72, revenue: 84600 },
];

const roleColors: Record<string, string> = {
  'Ground Owner': '#217346',
  Player: '#8BCB75',
  Captain: '#FF9F43',
  Scorer: '#4A8F6C',
  Umpire: '#98A2B3',
};

const activityTone = {
  success: { color: 'bg-success', icon: BadgeCheck },
  warning: { color: 'bg-matchday', icon: CalendarX2 },
  info: { color: 'bg-cricket', icon: Activity },
};

const activityIcons = [UserPlus, CalendarX2, MapPin, BadgeCheck, ShieldCheck, Ban];

export function AdminHome() {
  const { users, bookings, notifications, pushToast } = useApp();
  const roleCounts = ['Ground Owner', 'Player', 'Captain', 'Scorer', 'Umpire'].map((role) => ({
    role,
    count: users.filter((user) => user.role === role).length,
    color: roleColors[role],
  }));
  const revenue = bookings.filter((booking) => booking.status !== 'Cancelled').reduce((sum, booking) => sum + booking.amount, 0);
  const confirmed = bookings.filter((booking) => booking.status === 'Confirmed').length;
  const cancelled = bookings.filter((booking) => booking.status === 'Cancelled').length;

  const exportReport = () => {
    pushToast({
      title: 'Report generated (demo)',
      description: 'A CSV export would download here. No file was created in this demo.',
      tone: 'info',
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin workspace"
        title="Platform overview"
        description="A live snapshot of the CRICREX demo ecosystem — users, grounds and simulated booking activity."
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={exportReport}>Export report</Button>
            <Link to="/admin/users" className={buttonStyles('primary', 'md')}>
              Manage users <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={users.length} icon={<Users className="h-5 w-5" />} delta={12} hint={`${users.filter((user) => user.status === 'Pending').length} pending review`} />
        <StatCard label="Total grounds" value={grounds.length} icon={<MapPin className="h-5 w-5" />} delta={8} tone="grass" hint={`${grounds.filter((ground) => ground.availableToday).length} open today`} />
        <StatCard label="Total bookings" value={bookings.length} icon={<CalendarCheck className="h-5 w-5" />} delta={18} tone="orange" hint={`${confirmed} confirmed · ${cancelled} cancelled`} />
        <StatCard label="Demo booking value" value={inr(revenue)} icon={<Wallet className="h-5 w-5" />} delta={16} tone="blue" hint="Simulated — no real payments" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <ChartCard
          title="Booking activity"
          subtitle="Simulated bookings over the last eight weeks"
          className="xl:col-span-2"
          action={<Badge tone="success" dot>+18% vs last period</Badge>}
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingTrend} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="bookingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#217346" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#217346" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF9F43" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#FF9F43" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value, name) => [name === 'revenue' ? inr(Number(value)) : Number(value), name === 'revenue' ? 'Revenue' : 'Bookings']} />
                <Area type="monotone" dataKey="bookings" stroke="#217346" strokeWidth={2.4} fill="url(#bookingFill)" />
                <Area type="monotone" dataKey="revenue" stroke="#FF9F43" strokeWidth={1.8} fill="url(#revenueFill)" hide />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-5 text-[10.5px] text-slateink-light">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cricket" /> Bookings</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-matchday" /> Demo revenue tracked separately</span>
          </div>
        </ChartCard>

        <ChartCard title="Community breakdown" subtitle={`${users.length} total demo accounts`}>
          <div className="relative h-[188px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleCounts} dataKey="count" nameKey="role" innerRadius={58} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                  {roleCounts.map((entry) => <Cell key={entry.role} fill={entry.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-2xl font-extrabold text-forest">{users.length}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slateink-faint">accounts</p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {roleCounts.map((entry) => (
              <div key={entry.role} className="flex items-center gap-1.5 text-[10.5px] text-slateink-light">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
                <span className="truncate">{entry.role}</span>
                <span className="ml-auto font-bold text-forest">{entry.count}</span>
              </div>
            ))}
          </div>
          <Link to="/admin/users" className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-offwhite py-2 text-[10.5px] font-bold text-cricket transition hover:bg-cricket/10">
            Review all accounts <ArrowUpRight className="h-3 w-3" />
          </Link>
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[15px] font-bold text-forest">Recent activity</h3>
            <Link to="/admin/activity" className="text-[10.5px] font-bold text-cricket hover:text-forest">View all</Link>
          </div>
          <div className="mt-4 space-y-3.5">
            {adminActivity.slice(0, 5).map((item, index) => {
              const tone = activityTone[item.tone];
              const Icon = activityIcons[index % activityIcons.length];
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.tone === 'success' ? 'bg-success/10 text-success' : item.tone === 'warning' ? 'bg-matchday/15 text-[#B25E00]' : 'bg-cricket/10 text-cricket'}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] font-semibold leading-snug text-forest">{item.text}</p>
                    <p className="truncate text-[10px] text-slateink-light">{item.detail}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-[9px] text-slateink-faint">
                    <span className={`h-1 w-1 rounded-full ${tone.color}`} /> {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between px-5 pb-3 pt-5 sm:px-6">
            <div>
              <h3 className="font-display text-[15px] font-bold text-forest">Booking overview</h3>
              <p className="mt-0.5 text-[11px] text-slateink-light">Latest demo reservations across all grounds</p>
            </div>
            <Link to="/admin/bookings" className="text-[10.5px] font-bold text-cricket hover:text-forest">Manage</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead className="border-y border-forest/[0.06] bg-offwhite/60">
                <tr>
                  <th className="table-th">Reference</th>
                  <th className="table-th">Ground</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/[0.05]">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id} className="transition hover:bg-offwhite/50">
                    <td className="table-td font-mono text-[11px] font-bold text-forest">{booking.reference}</td>
                    <td className="table-td">
                      <p className="text-[12px] font-semibold text-forest">{booking.groundName}</p>
                      <p className="text-[10px] text-slateink-light">{booking.city}</p>
                    </td>
                    <td className="table-td text-[11.5px]">{formatDate(booking.date)}</td>
                    <td className="table-td text-[12px] font-bold text-forest">{inr(booking.amount)}</td>
                    <td className="table-td"><StatusBadge status={booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        {[
          { title: 'Review new users', desc: `${users.filter((user) => user.status === 'Pending').length} accounts awaiting approval`, to: '/admin/users', icon: UserPlus },
          { title: 'Ground management', desc: `${grounds.length} listings across ${new Set(grounds.map((ground) => ground.city)).size} cities`, to: '/admin/grounds', icon: MapPin },
          { title: 'Notifications', desc: `${notifications.filter((item) => !item.read).length} unread platform updates`, to: '/admin/notifications', icon: Activity },
        ].map(({ title, desc, to, icon: Icon }) => (
          <Link key={title} to={to} className="card card-hover group flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cricket/10 text-cricket">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-forest">{title}</p>
              <p className="mt-0.5 truncate text-[11px] text-slateink-light">{desc}</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slateink-faint transition group-hover:translate-x-0.5 group-hover:text-cricket" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AdminUsers() {
  const { users, setUserStatus, pushToast } = useApp();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState(params.get('role') ?? '');
  const [status, setStatus] = useState('');
  const [viewing, setViewing] = useState<User | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Player');
  const [inviteError, setInviteError] = useState('');

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const text = `${user.name} ${user.email} ${user.username} ${user.team ?? ''}`.toLowerCase();
        if (query && !text.includes(query.toLowerCase())) return false;
        if (role && user.role !== role) return false;
        if (status && user.status !== status) return false;
        return true;
      }),
    [users, query, role, status],
  );

  const invite = (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setInviteError('Enter a valid email address to simulate an invite.');
      return;
    }
    setInviteOpen(false);
    setInviteEmail('');
    setInviteError('');
    pushToast({
      title: 'Invite simulated',
      description: `No email was sent to ${inviteEmail}. Use the demo registration page instead.`,
      tone: 'success',
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="User management"
        title="Users & roles"
        description="Search, review and simulate account status changes across every CRICREX role."
        actions={<Button variant="primary" icon={<UserPlus className="h-4 w-4" />} onClick={() => setInviteOpen(true)}>Invite user</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All accounts" value={users.length} icon={<Users className="h-5 w-5" />} hint="Across six roles" />
        <StatCard label="Active" value={users.filter((user) => user.status === 'Active').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="grass" hint="Full demo access" />
        <StatCard label="Pending review" value={users.filter((user) => user.status === 'Pending').length} icon={<Clock3 className="h-5 w-5" />} tone="orange" hint="Awaiting verification" />
        <StatCard label="Suspended" value={users.filter((user) => user.status === 'Suspended').length} icon={<Ban className="h-5 w-5" />} tone="slate" hint="Access restricted" />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email or team"
              aria-label="Search users"
              className="h-10 w-full rounded-xl border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs text-slateink placeholder:text-slateink-faint focus:border-cricket focus:bg-white focus:outline-none focus:ring-4 focus:ring-cricket/10"
            />
          </div>
          <div className="flex gap-2">
            <select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Filter by role" className="h-10 flex-1 rounded-xl border border-forest/10 bg-white px-3 text-xs font-semibold text-forest focus:border-cricket focus:outline-none focus:ring-4 focus:ring-cricket/10 lg:w-40">
              <option value="">All roles</option>
              {['Admin', 'Ground Owner', 'Scorer', 'Umpire', 'Player', 'Captain'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status" className="h-10 flex-1 rounded-xl border border-forest/10 bg-white px-3 text-xs font-semibold text-forest focus:border-cricket focus:outline-none focus:ring-4 focus:ring-cricket/10 lg:w-36">
              <option value="">Any status</option>
              {['Active', 'Pending', 'Suspended'].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {(query || role || status) && (
              <button type="button" onClick={() => { setQuery(''); setRole(''); setStatus(''); }} className="h-10 shrink-0 rounded-xl border border-forest/10 px-3 text-[11px] font-bold text-slateink transition hover:text-cricket">
                Clear
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState className="m-5 border-0 bg-transparent" icon={<Users className="h-6 w-6" />} title="No users match those filters" description="Try a different search term or clear the role and status filters." action={<Button variant="outline" onClick={() => { setQuery(''); setRole(''); setStatus(''); }}>Clear filters</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px]">
              <thead className="border-b border-forest/[0.06] bg-offwhite/60">
                <tr>
                  <th className="table-th">User</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Contact</th>
                  <th className="table-th">Joined</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/[0.05]">
                {filtered.map((user) => (
                  <tr key={user.id} className="transition hover:bg-offwhite/50">
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={user.name} tone={user.avatarTone} size="sm" />
                        <div>
                          <p className="text-[12.5px] font-bold text-forest">{user.name}</p>
                          <p className="text-[10px] text-slateink-light">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <Badge tone={user.role === 'Admin' ? 'forest' : 'grass'}>{user.role}</Badge>
                    </td>
                    <td className="table-td"><StatusBadge status={user.status} /></td>
                    <td className="table-td text-[11px]">{user.phone}</td>
                    <td className="table-td text-[11px]">{formatDate(user.joinedAt)}</td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" onClick={() => setViewing(user)} className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket">
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserStatus(user.id, user.status === 'Suspended' ? 'Active' : 'Suspended')}
                          className={`rounded-lg px-2.5 py-1.5 text-[10.5px] font-bold transition ${user.status === 'Suspended' ? 'bg-success/10 text-success hover:bg-success/15' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        >
                          {user.status === 'Suspended' ? 'Activate' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-forest/[0.06] px-5 py-3 text-[10.5px] text-slateink-light">
          <span>Showing {filtered.length} of {users.length} demo accounts</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-cricket" /> Admin actions are simulated</span>
        </div>
      </div>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title="User profile" description="Read-only demo account details" size="md">
        {viewing && (
          <div>
            <div className="flex items-center gap-4 rounded-2xl bg-offwhite p-4">
              <Avatar name={viewing.name} tone={viewing.avatarTone} size="xl" />
              <div>
                <h3 className="font-display text-xl font-bold text-forest">{viewing.name}</h3>
                <p className="text-xs text-slateink-light">@{viewing.username} · {viewing.role}</p>
                <div className="mt-2 flex gap-2"><StatusBadge status={viewing.status} /><Badge tone="neutral">ID {viewing.id.slice(-6)}</Badge></div>
              </div>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ['Email', viewing.email],
                ['Phone', viewing.phone],
                ['Location', viewing.location],
                ['Joined', formatDate(viewing.joinedAt, 'long')],
                ...(viewing.team ? [['Team', viewing.team]] : []),
                ...(viewing.groundName ? [['Ground', viewing.groundName]] : []),
                ...(viewing.playingRole ? [['Playing role', viewing.playingRole]] : []),
                ...(viewing.certification ? [['Certification', viewing.certification]] : []),
                ...(viewing.scoringExpertise ? [['Expertise', viewing.scoringExpertise]] : []),
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-forest/[0.07] bg-white p-3">
                  <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{label}</dt>
                  <dd className="mt-0.5 break-words text-[12px] font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setViewing(null)} className={buttonStyles('outline', 'md')}>Close</button>
              <button
                type="button"
                onClick={() => { setUserStatus(viewing.id, viewing.status === 'Suspended' ? 'Active' : 'Suspended'); setViewing({ ...viewing, status: viewing.status === 'Suspended' ? 'Active' : 'Suspended' }); }}
                className={buttonStyles(viewing.status === 'Suspended' ? 'primary' : 'danger', 'md')}
              >
                {viewing.status === 'Suspended' ? 'Activate account' : 'Suspend account'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite a demo user" description="This simulates sending an invitation — no email is delivered." size="sm">
        <form onSubmit={invite} className="space-y-4">
          <Input label="Email address" type="email" placeholder="new.user@example.com" icon={<Mail className="h-4 w-4" />} value={inviteEmail} onChange={(event) => { setInviteEmail(event.target.value); setInviteError(''); }} error={inviteError} required />
          <Select label="Role" value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}>
            {['Ground Owner', 'Scorer', 'Umpire', 'Player', 'Captain'].map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Send demo invite</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function AdminGrounds() {
  const { pushToast } = useApp();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});

  const filtered = grounds.filter((ground) => {
    const text = `${ground.name} ${ground.city} ${ground.locality}`.toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (type && ground.type !== type) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Ground management"
        title="Ground listings"
        description="Review the CRICREX catalogue, check performance and simulate pausing a listing."
        actions={<Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ title: 'Ground report (demo)', description: 'No file was downloaded.', tone: 'info' })}>Export list</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Listed grounds" value={grounds.length} icon={<MapPin className="h-5 w-5" />} hint="All demo listings" />
        <StatCard label="Published" value={Object.values(statusOverrides).filter((status) => status === 'Published').length + grounds.filter((ground) => !statusOverrides[ground.id]).length} icon={<CheckCircle2 className="h-5 w-5" />} tone="grass" hint="Visible to players" />
        <StatCard label="Average rating" value={(grounds.reduce((sum, ground) => sum + ground.rating, 0) / grounds.length).toFixed(2)} icon={<BadgeCheck className="h-5 w-5" />} tone="orange" hint="Across all listings" />
        <StatCard label="Avg. hourly price" value={inr(Math.round(grounds.reduce((sum, ground) => sum + ground.price, 0) / grounds.length))} icon={<IndianRupee className="h-5 w-5" />} tone="blue" hint="Simulated pricing" />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ground or city" aria-label="Search grounds" className="h-10 w-full rounded-xl border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs text-slateink placeholder:text-slateink-faint focus:border-cricket focus:bg-white focus:outline-none focus:ring-4 focus:ring-cricket/10" />
          </div>
          <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter by surface" className="h-10 rounded-xl border border-forest/10 bg-white px-3 text-xs font-semibold text-forest focus:border-cricket focus:outline-none focus:ring-4 focus:ring-cricket/10 sm:w-44">
            <option value="">All surfaces</option>
            {['Outdoor Turf', 'Artificial Turf', 'Indoor Nets'].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-forest/[0.06] bg-offwhite/60">
              <tr>
                <th className="table-th">Ground</th>
                <th className="table-th">Type</th>
                <th className="table-th">Price / hr</th>
                <th className="table-th">Rating</th>
                <th className="table-th">Availability</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/[0.05]">
              {filtered.map((ground) => {
                const status = statusOverrides[ground.id] ?? 'Published';
                return (
                  <tr key={ground.id} className="transition hover:bg-offwhite/50">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <img src={ground.image} alt={ground.name} className="h-10 w-14 rounded-lg object-cover" loading="lazy" />
                        <div>
                          <p className="text-[12.5px] font-bold text-forest">{ground.name}</p>
                          <p className="flex items-center gap-1 text-[10px] text-slateink-light"><MapPin className="h-2.5 w-2.5" /> {ground.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-[11px]">{ground.type}</td>
                    <td className="table-td text-[12px] font-bold text-forest">{inr(ground.price)}</td>
                    <td className="table-td">
                      <span className="flex items-center gap-1 text-[11.5px] font-semibold">{ground.rating.toFixed(1)} <span className="text-matchday">★</span></span>
                    </td>
                    <td className="table-td"><Badge tone={ground.availableToday ? 'success' : 'warning'} dot>{ground.availableToday ? 'Open today' : 'Limited'}</Badge></td>
                    <td className="table-td"><StatusBadge status={status} /></td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/grounds/${ground.id}`} className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket">View</Link>
                        <button
                          type="button"
                          onClick={() => {
                            const next = status === 'Published' ? 'Paused' : 'Published';
                            setStatusOverrides((current) => ({ ...current, [ground.id]: next }));
                            pushToast({ title: `Listing ${next.toLowerCase()} (demo)`, description: `${ground.name} is now ${next.toLowerCase()} in this demo view.`, tone: 'info' });
                          }}
                          className={`rounded-lg px-2.5 py-1.5 text-[10.5px] font-bold transition ${status === 'Published' ? 'bg-matchday/10 text-[#B25E00] hover:bg-matchday/20' : 'bg-success/10 text-success hover:bg-success/15'}`}
                        >
                          {status === 'Published' ? 'Pause' : 'Publish'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <EmptyState className="m-5 border-0 bg-transparent" icon={<MapPin className="h-6 w-6" />} title="No grounds match" description="Adjust the search or surface filter to find a listing." />
        )}
      </div>
    </div>
  );
}

export function AdminBookings() {
  const { bookings, pushToast } = useApp();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [viewing, setViewing] = useState<(typeof bookings)[number] | null>(null);

  const filtered = bookings.filter((booking) => {
    const text = `${booking.reference} ${booking.groundName} ${booking.city}`.toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (status && booking.status !== status) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Booking overview"
        title="All bookings"
        description="Every simulated reservation across the platform. No real payments or ground holds are involved."
        actions={<Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ title: 'CSV export simulated', description: `${filtered.length} demo bookings would be exported.`, tone: 'info' })}>Export CSV</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total bookings" value={bookings.length} icon={<CalendarCheck className="h-5 w-5" />} hint="All time (demo)" />
        <StatCard label="Confirmed" value={bookings.filter((booking) => booking.status === 'Confirmed').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="grass" hint="Upcoming reservations" />
        <StatCard label="Completed" value={bookings.filter((booking) => booking.status === 'Completed').length} icon={<BadgeCheck className="h-5 w-5" />} tone="blue" hint="Past sessions" />
        <StatCard label="Cancelled" value={bookings.filter((booking) => booking.status === 'Cancelled').length} icon={<XCircle className="h-5 w-5" />} tone="orange" hint="Simulated cancellations" />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reference, ground or city" aria-label="Search bookings" className="h-10 w-full rounded-xl border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs text-slateink placeholder:text-slateink-faint focus:border-cricket focus:bg-white focus:outline-none focus:ring-4 focus:ring-cricket/10" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter booking status" className="h-10 rounded-xl border border-forest/10 bg-white px-3 text-xs font-semibold text-forest focus:border-cricket focus:outline-none focus:ring-4 focus:ring-cricket/10 sm:w-44">
            <option value="">All statuses</option>
            {['Confirmed', 'Completed', 'Cancelled'].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="border-b border-forest/[0.06] bg-offwhite/60">
              <tr>
                <th className="table-th">Reference</th>
                <th className="table-th">Ground</th>
                <th className="table-th">Date & slots</th>
                <th className="table-th">Booked by</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/[0.05]">
              {filtered.map((booking) => (
                <tr key={booking.id} className="transition hover:bg-offwhite/50">
                  <td className="table-td font-mono text-[11px] font-bold text-forest">{booking.reference}</td>
                  <td className="table-td">
                    <p className="text-[12px] font-semibold text-forest">{booking.groundName}</p>
                    <p className="text-[10px] text-slateink-light">{booking.city}</p>
                  </td>
                  <td className="table-td">
                    <p className="text-[11.5px] font-medium">{formatDate(booking.date)}</p>
                    <p className="text-[10px] text-slateink-light">{booking.slots.length} slot{booking.slots.length > 1 ? 's' : ''}</p>
                  </td>
                  <td className="table-td text-[10.5px]">{booking.userEmail}</td>
                  <td className="table-td text-[12px] font-bold text-forest">{inr(booking.amount)}</td>
                  <td className="table-td"><StatusBadge status={booking.status} /></td>
                  <td className="table-td text-right">
                    <button type="button" onClick={() => setViewing(booking)} className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState className="m-5 border-0 bg-transparent" icon={<CalendarX2 className="h-6 w-6" />} title="No bookings found" description="Try a different reference, ground or status filter." />}
      </div>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title="Booking record" description={viewing?.reference} size="md">
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
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
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
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              <Button variant="danger" onClick={() => { pushToast({ title: 'Cancellation simulated', description: `${viewing.reference} would be cancelled by an admin.`, tone: 'warning' }); setViewing(null); }}>Cancel booking</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function AdminActivity() {
  const { pushToast } = useApp();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('7');

  const categories = [
    { value: 'all', label: 'All activity' },
    { value: 'accounts', label: 'Accounts' },
    { value: 'bookings', label: 'Bookings' },
    { value: 'grounds', label: 'Grounds' },
  ];

  const filtered = adminActivity.filter((item, index) => {
    const text = `${item.text} ${item.detail}`.toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (category === 'accounts' && !/user|captain|scorer|umpire|account/i.test(item.text)) return false;
    if (category === 'bookings' && !/booking|payout/i.test(item.text)) return false;
    if (category === 'grounds' && !/ground/i.test(item.text)) return false;
    return category === 'all' || index >= 0;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Audit trail"
        title="Recent activity"
        description="Simulated platform events from across CRICREX — useful for demoing an admin audit view."
        actions={<Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ title: 'Audit export simulated', description: 'No file was generated.', tone: 'info' })}>Export log</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Tabs options={categories} value={category} onChange={setCategory} size="sm" />
              <select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Activity range" className="h-9 rounded-lg border border-forest/10 bg-white px-2.5 text-[11px] font-semibold text-forest focus:border-cricket focus:outline-none">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activity" aria-label="Search activity" className="h-9 w-full rounded-lg border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs focus:border-cricket focus:bg-white focus:outline-none" />
            </div>
          </div>

          <div className="p-5">
            {filtered.length === 0 ? (
              <EmptyState icon={<Activity className="h-6 w-6" />} title="No activity found" description="Try a different category or search term." />
            ) : (
              <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-forest/10">
                {filtered.map((item, index) => {
                  const Icon = activityIcons[index % activityIcons.length];
                  const tone = item.tone;
                  return (
                    <li key={item.id} className="relative flex gap-4 pl-0">
                      <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${tone === 'success' ? 'bg-success/10 text-success' : tone === 'warning' ? 'bg-matchday/15 text-[#B25E00]' : 'bg-cricket/10 text-cricket'}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1 rounded-xl border border-forest/[0.06] bg-white p-3.5 transition hover:border-cricket/20">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-[12.5px] font-bold text-forest">{item.text}</p>
                          <span className="text-[9.5px] text-slateink-faint">{item.time}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slateink-light">{item.detail}</p>
                        <button type="button" onClick={() => pushToast({ title: item.text, description: item.detail, tone: 'info' })} className="mt-2 text-[10px] font-bold text-cricket hover:text-forest">
                          View details →
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
          <div className="border-t border-forest/[0.06] px-5 py-3 text-[10px] text-slateink-light">
            Showing {filtered.length} events · {range === '7' ? 'last 7 days' : range === '30' ? 'last 30 days' : 'last 90 days'} (demo)
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-display text-[15px] font-bold text-forest">Activity summary</h3>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Account events', value: 3, color: 'bg-cricket' },
                { label: 'Booking events', value: 1, color: 'bg-matchday' },
                { label: 'Ground updates', value: 1, color: 'bg-grass' },
                { label: 'Security flags', value: 1, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slateink-light">{item.label}</span>
                    <span className="font-bold text-forest">{item.value}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-forest/[0.06]">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.value / 6) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-4">
            <h3 className="text-xs font-bold text-[#8A5000]">Demo audit notice</h3>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#9A6A2A]">
              These activity entries are sample data. No real users are moderated and no audit log is stored on a server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
