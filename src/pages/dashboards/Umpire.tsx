import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  Flag,
  History as HistoryIcon,
  ListChecks,
  MapPin,
  Radio,
  Search,
  ShieldCheck,
  Star,
  Timer,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { Toggle } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { useApp } from '@/context/AppContext';
import { matches } from '@/data/mock';
import {
  cn,
  formatDate,
  getUpcomingDays,
  readStore,
  relativeDay,
  toIso,
  writeStore,
} from '@/lib/utils';
import type { Match } from '@/types';

const officiatingMonths = [
  { month: 'May', matches: 4, overs: 80 },
  { month: 'Jun', matches: 6, overs: 120 },
  { month: 'Jul', matches: 5, overs: 100 },
  { month: 'Aug', matches: 8, overs: 152 },
  { month: 'Sep', matches: 7, overs: 138 },
  { month: 'Oct', matches: 9, overs: 174 },
];

const matchdayChecklist = [
  'Check both team sheets and player eligibility 30 minutes before the toss.',
  'Inspect the pitch, creases, boundary markers and sight screens.',
  'Confirm the ball count, over rate and DLS sheet with the scorer.',
  'Record the toss, playing XI and any player injuries in the match log.',
  'Submit the signed result sheet within an hour of the final ball.',
];

function umpireMatches(name?: string) {
  return matches.filter((match) => match.umpire === name);
}

function MatchRow({
  match,
  onOpen,
  confirmed,
  onToggle,
}: {
  match: Match;
  onOpen: () => void;
  confirmed: boolean;
  onToggle: () => void;
}) {
  const live = match.status === 'Live';
  return (
    <div className="flex flex-col gap-3 p-4 transition hover:bg-offwhite/40 sm:flex-row sm:items-center sm:px-5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            live ? 'bg-red-50 text-red-600' : 'bg-cricket/10 text-cricket',
          )}
        >
          {live ? <Radio className="h-5 w-5" /> : <Flag className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-bold text-forest">
              {match.teamA} vs {match.teamB}
            </p>
            <StatusBadge status={match.status} />
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10.5px] text-slateink-light">
            <span>{match.tournament}</span>
            <span>•</span>
            <span>{relativeDay(match.date)} · {match.time}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" /> {match.ground}
            </span>
          </p>
          <p className="mt-1 text-[10px] text-slateink-faint">
            Scorer: {match.scorer} · {match.overs} overs · {match.scoreA ?? 'Yet to start'}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'rounded-lg px-2.5 py-1.5 text-[10.5px] font-bold transition',
            confirmed
              ? 'bg-success/10 text-success'
              : 'border border-forest/10 text-slateink hover:border-cricket/30 hover:text-cricket',
          )}
        >
          {confirmed ? 'Available' : 'Set available'}
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket"
        >
          Details
        </button>
        {live && (
          <Link to="/umpire/matches" className={buttonStyles('primary', 'sm')}>
            Match day
          </Link>
        )}
      </div>
    </div>
  );
}

export function UmpireHome() {
  const { user, pushToast, notifications } = useApp();
  const assigned = useMemo(() => umpireMatches(user?.name), [user?.name]);
  const live = assigned.find((match) => match.status === 'Live');
  const upcoming = assigned.filter((match) => match.status === 'Upcoming');
  const completed = assigned.filter((match) => match.status === 'Completed');
  const next = upcoming[0] ?? assigned[0];
  const featured = live ?? next;

  return (
    <div>
      <PageHeader
        eyebrow="Umpire workspace"
        title="Match officiating"
        description="Your assigned fixtures, availability, matchday checks and filed reports — all in one calm workspace."
        actions={
          <>
            <Button
              variant="outline"
              icon={<Download className="h-4 w-4" />}
              onClick={() =>
                pushToast({
                  title: 'Assignment sheet simulated',
                  description: 'No document was downloaded in this frontend demo.',
                  tone: 'info',
                })
              }
            >
              Export sheet
            </Button>
            <Link to="/umpire/schedule" className={buttonStyles('primary', 'md')}>
              <CalendarDays className="h-4 w-4" /> View schedule
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assigned matches"
          value={assigned.length}
          icon={<Flag className="h-5 w-5" />}
          hint={`${upcoming.length} upcoming · ${completed.length} filed`}
        />
        <StatCard
          label="Upcoming"
          value={upcoming.length}
          icon={<CalendarCheck className="h-5 w-5" />}
          tone="blue"
          hint="Confirmed by the demo admin"
        />
        <StatCard
          label="Live now"
          value={live ? 1 : 0}
          icon={<Radio className="h-5 w-5" />}
          tone="orange"
          hint={live ? `${live.teamA} vs ${live.teamB}` : 'No match in progress'}
        />
        <StatCard
          label="Reports filed"
          value={completed.length + 9}
          icon={<ClipboardCheck className="h-5 w-5" />}
          tone="grass"
          hint="Including historical demo records"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          {featured ? (
            <div className="relative overflow-hidden rounded-2xl bg-forest p-5 text-white shadow-card sm:p-6">
              <div className="absolute inset-0 hero-grid opacity-40" />
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-grass/15 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                      featured.status === 'Live'
                        ? 'bg-red-500/15 text-red-200'
                        : 'bg-grass/15 text-grass',
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        featured.status === 'Live' ? 'animate-pulse-soft bg-red-400' : 'bg-grass',
                      )}
                    />
                    {featured.status === 'Live' ? 'Live now' : 'Next assignment'}
                  </span>
                  <span className="text-[10.5px] text-white/50">
                    {featured.tournament} · {featured.overs} overs
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl font-extrabold text-white">
                      {featured.teamA} <span className="text-white/40">vs</span> {featured.teamB}
                    </p>
                    <p className="mt-1 text-[11px] text-white/55">
                      {featured.ground} · {relativeDay(featured.date)} · {featured.time}
                    </p>
                    <p className="mt-1 text-[10.5px] text-white/40">
                      Scorer {featured.scorer} · {featured.scoreA ?? 'Yet to start'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Match status</p>
                    <p className="font-display text-xl font-extrabold text-matchday">{featured.status}</p>
                    <p className="text-[10px] text-white/40">Toss 30 min before start</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  <Link to="/umpire/matches" className={buttonStyles('accent', 'md')}>
                    <Flag className="h-4 w-4" /> Open assignment
                  </Link>
                  <Link
                    to="/umpire/schedule"
                    className={buttonStyles(
                      'ghost',
                      'md',
                      'border border-white/20 text-white hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <CalendarDays className="h-4 w-4" /> Plan the week
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <EmptyState
                icon={<Flag className="h-6 w-6" />}
                title="No assignments yet"
                description="A demo admin can assign fixtures to your umpire profile. Check the schedule page for your declared availability."
                action={
                  <Link to="/umpire/schedule" className={buttonStyles('primary', 'md')}>
                    Set availability
                  </Link>
                }
              />
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Upcoming assignments</h3>
                <p className="mt-0.5 text-[11px] text-slateink-light">Fixtures waiting for your confirmation.</p>
              </div>
              <Link to="/umpire/matches" className="text-[10.5px] font-bold text-cricket hover:text-forest">
                View all
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState
                className="m-5 border-0 bg-transparent"
                icon={<CalendarCheck className="h-6 w-6" />}
                title="No upcoming fixtures"
                description="You are all caught up. Filed matches live in your scoring history."
                action={
                  <Link to="/umpire/history" className={buttonStyles('outline', 'sm')}>
                    Open match history
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-forest/[0.05] border-t border-forest/[0.06]">
                {upcoming.slice(0, 3).map((match) => (
                  <div key={match.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-cricket/10 text-cricket">
                      <CalendarCheck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold text-forest">
                        {match.teamA} vs {match.teamB}
                      </p>
                      <p className="flex flex-wrap items-center gap-1 text-[10px] text-slateink-light">
                        <MapPin className="h-2.5 w-2.5" /> {match.ground} · {relativeDay(match.date)} · {match.time}
                      </p>
                    </div>
                    <Badge tone="info">{match.tournament}</Badge>
                    <Link to="/umpire/matches" className={buttonStyles('outline', 'sm')}>
                      Prepare
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <ChartCard title="Officiating load" subtitle="Matches and overs, last six months">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={officiatingMonths} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} formatter={(value) => [`${value} matches`, 'Officiated']} />
                  <Bar dataKey="matches" fill="#217346" radius={[5, 5, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10.5px] text-slateink-light">
              <span>174 overs this month</span>
              <Badge tone="success" dot>98% on time</Badge>
            </div>
          </ChartCard>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[15px] font-bold text-forest">Credentials</h3>
              <Badge tone="grass" icon={<ShieldCheck className="h-3 w-3" />}>
                Verified
              </Badge>
            </div>
            <dl className="mt-4 space-y-3 text-[11.5px]">
              {[
                ['Certification', user?.certification ?? 'BCCI Level 2'],
                ['Experience', user?.umpireExperience ?? '9 years'],
                ['Highest level', user?.matchLevel ?? 'District & State A'],
                ['Home base', user?.location ?? 'Chennai, Tamil Nadu'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <dt className="text-slateink-light">{label}</dt>
                  <dd className="text-right font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            <Link
              to="/umpire/profile"
              className="mt-4 flex items-center justify-center gap-1 rounded-lg bg-offwhite py-2 text-[10.5px] font-bold text-cricket transition hover:bg-cricket/10"
            >
              Update umpire profile <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A5000]">
              <Timer className="h-3.5 w-3.5" /> Matchday note
            </p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#9A6A2A]">
              {notifications.filter((item) => !item.read).length} unread demo alerts. Toss and over-rate reminders appear
              here before each assigned fixture.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-forest">
            <ListChecks className="h-4 w-4 text-cricket" /> Pre-match checklist
          </h3>
          <ul className="mt-3 space-y-2.5">
            {matchdayChecklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-slateink-light">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
            <Star className="h-3.5 w-3.5 text-cricket" /> Neutral umpiring, always
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slateink-light">
            This workspace is a simulation. Assignments, reports and decisions are seeded demo data stored only in your
            browser — no match result is ever submitted to a real league.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/umpire/history" className={buttonStyles('outline', 'sm')}>
              <HistoryIcon className="h-3.5 w-3.5" /> Match history
            </Link>
            <Link to="/umpire/schedule" className={buttonStyles('primary', 'sm')}>
              <CalendarDays className="h-3.5 w-3.5" /> Schedule
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UmpireMatches() {
  const { user, pushToast } = useApp();
  const assigned = useMemo(() => umpireMatches(user?.name), [user?.name]);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState<Match | null>(null);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  const filtered = assigned.filter((match) => {
    if (tab !== 'all' && match.status.toLowerCase() !== tab) return false;
    const text = `${match.teamA} ${match.teamB} ${match.tournament} ${match.ground}`.toLowerCase();
    return !query || text.includes(query.toLowerCase());
  });

  const toggle = (match: Match) => {
    const next = !confirmed[match.id];
    setConfirmed((current) => ({ ...current, [match.id]: next }));
    pushToast({
      title: next ? 'Availability confirmed' : 'Availability withdrawn',
      description: `${match.teamA} vs ${match.teamB} · ${formatDate(match.date)} · demo only.`,
      tone: next ? 'success' : 'info',
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Assignments"
        title="Your fixtures"
        description="Confirm availability, review the match brief and keep every officiating detail in one place."
        actions={
          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={() =>
              pushToast({
                title: 'Fixture list simulated',
                description: `${filtered.length} assignments would be exported.`,
                tone: 'info',
              })
            }
          >
            Export list
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total assignments" value={assigned.length} icon={<Flag className="h-5 w-5" />} hint="Across all demo tournaments" />
        <StatCard
          label="Upcoming"
          value={assigned.filter((match) => match.status === 'Upcoming').length}
          icon={<CalendarCheck className="h-5 w-5" />}
          tone="blue"
          hint="Awaiting first ball"
        />
        <StatCard
          label="Live"
          value={assigned.filter((match) => match.status === 'Live').length}
          icon={<Radio className="h-5 w-5" />}
          tone="orange"
          hint="In progress now"
        />
        <StatCard
          label="Completed"
          value={assigned.filter((match) => match.status === 'Completed').length}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="grass"
          hint="Reports filed"
        />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            options={[
              { value: 'all', label: 'All', count: assigned.length },
              { value: 'upcoming', label: 'Upcoming', count: assigned.filter((match) => match.status === 'Upcoming').length },
              { value: 'live', label: 'Live', count: assigned.filter((match) => match.status === 'Live').length },
              { value: 'completed', label: 'Completed', count: assigned.filter((match) => match.status === 'Completed').length },
            ]}
            value={tab}
            onChange={setTab}
            size="sm"
          />
          <div className="relative lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teams, venue or cup"
              aria-label="Search umpire assignments"
              className="h-9 w-full rounded-lg border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs focus:border-cricket focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            className="m-5 border-0 bg-transparent"
            icon={<Flag className="h-6 w-6" />}
            title="No matches in this view"
            description="Try another tab or clear the search to see your officiating assignments."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('');
                  setTab('all');
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-forest/[0.05]">
            {filtered.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                confirmed={Boolean(confirmed[match.id])}
                onToggle={() => toggle(match)}
                onOpen={() => setViewing(match)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-forest">
            <Users className="h-4 w-4 text-cricket" /> Before you accept
          </h3>
          <ul className="mt-3 space-y-2.5 text-[11.5px] leading-relaxed text-slateink-light">
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Check travel time between back-to-back
              fixtures.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Confirm the format and whether a DLS
              sheet is needed.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Flag conflicts with your declared weekly
              availability.
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A5000]">
            <Clock3 className="h-3.5 w-3.5" /> Availability is a demo signal
          </p>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#9A6A2A]">
            Confirming a fixture here does not notify the admin or send an email. It changes this browser session only and
            is reset when you reload the page.
          </p>
        </div>
      </div>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Assignment brief"
        description={viewing ? `${viewing.teamA} vs ${viewing.teamB}` : ''}
        size="md"
      >
        {viewing && (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={viewing.status} />
              <Badge tone="info">{viewing.tournament}</Badge>
              <Badge tone="neutral">{viewing.overs} overs</Badge>
            </div>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ['Date', formatDate(viewing.date, 'long')],
                ['Start time', viewing.time],
                ['Ground', viewing.ground],
                ['Scorer', viewing.scorer],
                ['Score', viewing.scoreA ?? 'Yet to start'],
                ['Match ID', viewing.id.toUpperCase()],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-forest/[0.07] p-3">
                  <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{label}</dt>
                  <dd className="mt-0.5 text-[12px] font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            {viewing.result && (
              <p className="mt-3 rounded-xl bg-success/[0.07] p-3 text-[11.5px] font-semibold text-success">
                {viewing.result}
              </p>
            )}
            <div className="mt-4 rounded-xl bg-offwhite p-3 text-[10.5px] leading-relaxed text-slateink-light">
              Arrive 45 minutes early for pitch inspection and the toss. Bring your certification card and a printed
              result sheet. This is simulated data only.
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>
                Close
              </Button>
              <Button
                variant={confirmed[viewing.id] ? 'ghost' : 'primary'}
                onClick={() => toggle(viewing)}
              >
                {confirmed[viewing.id] ? 'Withdraw availability' : 'Confirm availability'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

interface DayAvailability {
  available: boolean;
  note: string;
}

export function UmpireSchedule() {
  const { user, pushToast } = useApp();
  const assigned = useMemo(() => umpireMatches(user?.name), [user?.name]);
  const upcoming = assigned.filter((match) => match.status !== 'Completed');
  const days = getUpcomingDays(7);
  const today = toIso(new Date());
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>(() =>
    readStore<Record<string, DayAvailability>>(
      'cricrex.umpire.availability.v1',
      Object.fromEntries(
        days.map((date) => [
          date,
          { available: true, note: date === today ? 'Available from 4 PM' : '' },
        ]),
      ),
    ),
  );

  const save = () => {
    writeStore('cricrex.umpire.availability.v1', availability);
    pushToast({
      title: 'Availability saved',
      description: 'Your declared windows are stored in this browser only.',
      tone: 'success',
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Schedule"
        title="Availability & fixtures"
        description="Plan the week around your assigned fixtures, declare windows and catch scheduling conflicts early."
        actions={
          <>
            <Button
              variant="outline"
              icon={<Download className="h-4 w-4" />}
              onClick={() =>
                pushToast({
                  title: 'Calendar export simulated',
                  description: 'An .ics calendar would download here in a real product.',
                  tone: 'info',
                })
              }
            >
              Export calendar
            </Button>
            <Button variant="primary" icon={<CheckCircle2 className="h-4 w-4" />} onClick={save}>
              Save availability
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cricket/10 text-cricket">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Next seven days</h3>
                <p className="text-[10.5px] text-slateink-light">Declare when you can officiate.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              {days.map((date) => {
                const day = availability[date] ?? { available: true, note: '' };
                const count = upcoming.filter((match) => match.date === date).length;
                return (
                  <div key={date} className="rounded-xl border border-forest/[0.07] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11.5px] font-bold text-forest">{relativeDay(date)}</p>
                        <p className="text-[9.5px] text-slateink-light">
                          {formatDate(date)} · {count} fixture{count === 1 ? '' : 's'}
                        </p>
                      </div>
                      <Toggle
                        checked={day.available}
                        onChange={(value) =>
                          setAvailability((current) => ({
                            ...current,
                            [date]: { ...(current[date] ?? day), available: value },
                          }))
                        }
                        label="Available"
                      />
                    </div>
                    {day.available && (
                      <input
                        value={day.note}
                        onChange={(event) =>
                          setAvailability((current) => ({
                            ...current,
                            [date]: { ...(current[date] ?? day), note: event.target.value },
                          }))
                        }
                        placeholder="Optional note, e.g. available after 3 PM"
                        aria-label={`Availability note for ${formatDate(date)}`}
                        className="mt-2 h-9 w-full rounded-lg border border-forest/10 px-2.5 text-[11px] focus:border-cricket focus:outline-none focus:ring-2 focus:ring-cricket/10"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-success/[0.07] p-2.5 text-[10px] font-semibold text-success">
              <ShieldCheck className="h-3.5 w-3.5" /> Saved locally · no calendar sync
            </div>
          </div>

          <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
              <Timer className="h-3.5 w-3.5 text-cricket" /> Travel buffer
            </p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-slateink-light">
              Keep at least 90 minutes between fixtures at different grounds. The schedule flags same-day double headers
              so you can plan travel.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Fixture calendar</h3>
                <p className="mt-0.5 text-[11px] text-slateink-light">
                  {upcoming.length} active assignments across the next two weeks.
                </p>
              </div>
              <Badge tone="info" icon={<CalendarCheck className="h-3 w-3" />}>
                {upcoming.filter((match) => match.status === 'Live').length} live
              </Badge>
            </div>

            {upcoming.length === 0 ? (
              <EmptyState
                className="m-5 border-0 bg-transparent"
                icon={<CalendarDays className="h-6 w-6" />}
                title="No active fixtures"
                description="Once the demo admin assigns a match, it will appear in this calendar."
              />
            ) : (
              <div className="divide-y divide-forest/[0.05] border-t border-forest/[0.06]">
                {[...upcoming]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((match) => (
                    <div key={match.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5">
                      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-offwhite py-2">
                        <span className="text-[9px] font-bold uppercase tracking-wide text-slateink-faint">
                          {formatDate(match.date, 'day')}
                        </span>
                        <span className="font-display text-lg font-extrabold text-forest">
                          {formatDate(match.date).split(' ')[0]}
                        </span>
                        <span className="text-[8.5px] font-semibold uppercase text-slateink-faint">
                          {formatDate(match.date).split(' ')[1]}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[12.5px] font-bold text-forest">
                            {match.teamA} vs {match.teamB}
                          </p>
                          <StatusBadge status={match.status} />
                        </div>
                        <p className="mt-0.5 text-[10.5px] text-slateink-light">
                          {match.time} · {match.ground} · {match.tournament}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slateink-faint">
                          Scorer {match.scorer} · {match.overs} overs
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          pushToast({
                            title: 'Directions simulated',
                            description: `${match.ground} — maps are not connected in this demo.`,
                            tone: 'info',
                          })
                        }
                        className="shrink-0 rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket"
                      >
                        {match.status === 'Live' ? 'Match day' : 'Directions'}
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slateink-faint">Days available</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-forest">
                {Object.values(availability).filter((day) => day.available).length}
                <span className="text-sm text-slateink-faint">/7</span>
              </p>
            </div>
            <div className="card p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slateink-faint">Fixture days</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-forest">
                {new Set(upcoming.map((match) => match.date)).size}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slateink-faint">Live fixtures</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-forest">
                {upcoming.filter((match) => match.status === 'Live').length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A5000]">
              <XCircle className="h-3.5 w-3.5" /> Conflict watch
            </p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#9A6A2A]">
              {upcoming.filter((match) => match.date === today).length > 1
                ? 'You have more than one fixture today. Confirm travel time with the demo admin.'
                : 'No same-day clashes detected in your current assignment list.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UmpireHistory() {
  const { user, pushToast } = useApp();
  const assigned = useMemo(() => umpireMatches(user?.name), [user?.name]);
  const completed = assigned.filter((match) => match.status === 'Completed');
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState<Match | null>(null);
  const [notes, setNotes] = useState('');

  const filtered = assigned.filter((match) => {
    const text = `${match.teamA} ${match.teamB} ${match.ground} ${match.tournament}`.toLowerCase();
    return !query || text.includes(query.toLowerCase());
  });

  const oversOfficiated = completed.reduce((sum, match) => sum + match.overs, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Records"
        title="Match history"
        description="Every fixture you have officiated, with final scores and filed reports. Exports are simulated."
        actions={
          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={() =>
              pushToast({
                title: 'Report bundle simulated',
                description: `${completed.length} match reports would be exported.`,
                tone: 'info',
              })
            }
          >
            Export reports
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Matches officiated" value={assigned.length} icon={<Flag className="h-5 w-5" />} hint="In the demo season" />
        <StatCard label="Completed" value={completed.length} icon={<CheckCircle2 className="h-5 w-5" />} tone="grass" hint="Final results filed" />
        <StatCard label="Overs" value={oversOfficiated + 138} icon={<Timer className="h-5 w-5" />} tone="blue" hint="Including historical records" />
        <StatCard label="Reports filed" value="100%" icon={<ClipboardCheck className="h-5 w-5" />} tone="orange" hint="Simulated compliance metric" />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teams, ground or tournament"
              aria-label="Search umpire history"
              className="h-10 w-full rounded-xl border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs focus:border-cricket focus:bg-white focus:outline-none"
            />
          </div>
          <Badge tone="success" icon={<Trophy className="h-3 w-3" />}>
            {completed.length} completed
          </Badge>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            className="m-5 border-0 bg-transparent"
            icon={<HistoryIcon className="h-6 w-6" />}
            title="No match records found"
            description="Try another search term, or wait for your first assignment to be completed."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead className="border-b border-forest/[0.06] bg-offwhite/60">
                <tr>
                  <th className="table-th">Match</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Venue</th>
                  <th className="table-th">Scores</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/[0.05]">
                {filtered.map((match) => (
                  <tr key={match.id} className="transition hover:bg-offwhite/50">
                    <td className="table-td">
                      <p className="text-[12px] font-bold text-forest">
                        {match.teamA} vs {match.teamB}
                      </p>
                      <p className="text-[10px] text-slateink-light">{match.tournament}</p>
                    </td>
                    <td className="table-td text-[11.5px]">
                      {formatDate(match.date)}
                      <p className="text-[10px] text-slateink-light">{match.time}</p>
                    </td>
                    <td className="table-td text-[11px]">{match.ground}</td>
                    <td className="table-td text-[11px]">
                      <p>{match.scoreA ?? '—'}</p>
                      <p>{match.scoreB ?? '—'}</p>
                    </td>
                    <td className="table-td">
                      <StatusBadge status={match.status} />
                    </td>
                    <td className="table-td text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setViewing(match);
                          setNotes('');
                        }}
                        className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-forest/[0.06] px-5 py-3 text-[10px] text-slateink-light">
          Showing {filtered.length} of {assigned.length} records · reports are simulated
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-display text-[15px] font-bold text-forest">Season summary</h3>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Matches completed', value: completed.length + 9, max: 16, color: 'bg-cricket' },
              { label: 'Overs officiated', value: Math.round((oversOfficiated + 138) / 4), max: 60, color: 'bg-grass' },
              { label: 'Reports on time', value: 98, max: 100, color: 'bg-matchday' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slateink-light">{row.label}</span>
                  <span className="font-bold text-forest">{row.value}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-forest/[0.06]">
                  <div className={cn('h-full rounded-full', row.color)} style={{ width: `${Math.min(100, (row.value / row.max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
            <ArrowRight className="h-3.5 w-3.5 text-cricket" /> Keep a clean record
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slateink-light">
            Filing the report within an hour of the last ball keeps the league table accurate. Use the report modal to
            capture notes, then download a demo copy from the export button.
          </p>
          <Link to="/umpire/matches" className={buttonStyles('outline', 'sm', 'mt-4')}>
            <ListChecks className="h-3.5 w-3.5" /> Open assignments
          </Link>
        </div>
      </div>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Umpire match report"
        description={viewing ? `${viewing.teamA} vs ${viewing.teamB}` : ''}
        size="md"
      >
        {viewing && (
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={viewing.status} />
              <Badge tone="info">{viewing.tournament}</Badge>
              <Badge tone="neutral">{viewing.overs} overs</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-offwhite p-3">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{viewing.teamA}</p>
                <p className="mt-1 font-display text-lg font-extrabold text-forest">{viewing.scoreA ?? '—'}</p>
              </div>
              <div className="rounded-xl bg-offwhite p-3">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{viewing.teamB}</p>
                <p className="mt-1 font-display text-lg font-extrabold text-forest">{viewing.scoreB ?? '—'}</p>
              </div>
            </div>
            {viewing.result && (
              <p className="mt-3 rounded-xl bg-success/[0.07] p-3 text-[11.5px] font-semibold text-success">
                {viewing.result}
              </p>
            )}
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ['Date', formatDate(viewing.date, 'long')],
                ['Start time', viewing.time],
                ['Ground', viewing.ground],
                ['Scorer', viewing.scorer],
                ['Match ID', viewing.id.toUpperCase()],
                ['Status', viewing.status],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-forest/[0.07] p-3">
                  <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{label}</dt>
                  <dd className="mt-0.5 text-[11.5px] font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            <label className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-slateink-faint">
              Report note
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add a note about over rate, pitch behaviour or incidents…"
                className="mt-1.5 min-h-[86px] w-full rounded-xl border border-forest/10 bg-offwhite/60 p-3 text-xs text-slateink placeholder:text-slateink-faint focus:border-cricket focus:bg-white focus:outline-none focus:ring-4 focus:ring-cricket/10"
              />
            </label>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  pushToast({
                    title: notes.trim() ? 'Demo report note saved' : 'Report viewed',
                    description: notes.trim()
                      ? 'Your note was captured in this browser session only.'
                      : 'Add a note next time to capture matchday context.',
                    tone: notes.trim() ? 'success' : 'info',
                  });
                  setViewing(null);
                }}
              >
                File report
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
