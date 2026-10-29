import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Flame,
  History as HistoryIcon,
  MapPin,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
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
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { useApp } from '@/context/AppContext';
import { grounds, matches, teams } from '@/data/mock';
import { cn, formatDate, inr, relativeDay } from '@/lib/utils';
import type { Match, PlayerPerformance } from '@/types';

const fallbackPerf: Omit<PlayerPerformance, 'name'> = {
  id: 'pl-new',
  role: 'Top-order Batter',
  jersey: 18,
  runs: 286,
  balls: 231,
  wickets: 3,
  economy: 8.6,
  catches: 6,
  matches: 12,
  avg: 26.0,
  strikeRate: 123.8,
  form: [24, 41, 12, 55, 30, 48],
};

function findPlayer(name?: string): PlayerPerformance {
  const found = teams.flatMap((team) => team.players).find((player) => player.name === name);
  if (found) return found;
  return { ...fallbackPerf, name: name ?? 'Player' };
}

function teamMatches(team?: string): Match[] {
  if (!team) return [];
  return matches.filter((match) => match.teamA === team || match.teamB === team);
}

function opponentOf(match: Match, team: string): string {
  return match.teamA === team ? match.teamB : match.teamA;
}

function scoreFor(match: Match, team: string): string {
  return match.teamA === team ? match.scoreA ?? '—' : match.scoreB ?? '—';
}

const phaseRuns = [
  { phase: 'Powerplay', runs: 212, color: '#8BCB75' },
  { phase: 'Middle', runs: 341, color: '#217346' },
  { phase: 'Death', runs: 181, color: '#FF9F43' },
];

const skillProfile = [
  { skill: 'Batting', value: 88 },
  { skill: 'Consistency', value: 74 },
  { skill: 'Boundary play', value: 82 },
  { skill: 'Running', value: 79 },
  { skill: 'Fielding', value: 71 },
  { skill: 'Bowling', value: 46 },
];

function InningsTable({ perf }: { perf: PlayerPerformance }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px]">
        <thead className="border-y border-forest/[0.06] bg-offwhite/60">
          <tr>
            <th className="table-th">Innings</th>
            <th className="table-th">Opponent</th>
            <th className="table-th text-right">R</th>
            <th className="table-th text-right">B</th>
            <th className="table-th text-right">4s</th>
            <th className="table-th text-right">6s</th>
            <th className="table-th text-right">SR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-forest/[0.05]">
          {perf.form.map((runs, index) => {
            const balls = Math.max(1, Math.round(runs / (perf.strikeRate / 100)));
            const notOut = index === perf.form.length - 1 || index === 2;
            return (
              <tr key={`${runs}-${index}`}>
                <td className="table-td text-[11.5px] font-semibold text-forest">
                  Innings {index + 1}
                  {index === perf.form.length - 1 && (
                    <span className="ml-1.5 rounded bg-cricket/10 px-1.5 py-0.5 text-[8.5px] font-bold uppercase text-cricket">
                      Latest
                    </span>
                  )}
                </td>
                <td className="table-td text-[11px] text-slateink-light">Demo opposition {index + 1}</td>
                <td className="table-td text-right text-[12px] font-bold">
                  {runs}
                  {notOut ? '*' : ''}
                </td>
                <td className="table-td text-right text-[11.5px]">{balls}</td>
                <td className="table-td text-right text-[11.5px]">{Math.floor(runs / 14)}</td>
                <td className="table-td text-right text-[11.5px]">{Math.floor(runs / 32)}</td>
                <td className="table-td text-right text-[11.5px]">{(runs / balls * 100).toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PlayerHome() {
  const { user, pushToast } = useApp();
  const perf = useMemo(() => findPlayer(user?.name), [user?.name]);
  const fixtures = useMemo(() => teamMatches(user?.team), [user?.team]);
  const upcoming = fixtures.filter((match) => match.status !== 'Completed');
  const completed = fixtures.filter((match) => match.status === 'Completed');
  const next = upcoming[0];
  const featuredGround = grounds[0];
  const highest = Math.max(...perf.form);

  const formData = perf.form.map((runs, index) => ({
    innings: `Inn ${index + 1}`,
    runs,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Player workspace"
        title={`Welcome back, ${user?.name.split(' ')[0] ?? 'player'}`}
        description="Your form, fixtures and season goals. Everything here is seeded demo data stored in this browser."
        actions={
          <>
            <Button
              variant="outline"
              icon={<Download className="h-4 w-4" />}
              onClick={() =>
                pushToast({
                  title: 'Player card simulated',
                  description: 'No PDF was generated in this frontend demo.',
                  tone: 'info',
                })
              }
            >
              Export card
            </Button>
            <Link to="/grounds" className={buttonStyles('primary', 'md')}>
              <MapPin className="h-4 w-4" /> Book a ground
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Matches" value={perf.matches} icon={<CalendarCheck className="h-5 w-5" />} hint="Across the demo season" />
        <StatCard label="Runs" value={perf.runs} icon={<TrendingUp className="h-5 w-5" />} tone="grass" delta={12} hint={`Highest ${highest} in a knock`} />
        <StatCard label="Batting average" value={perf.avg.toFixed(1)} icon={<BarChart3 className="h-5 w-5" />} tone="blue" hint="Runs per dismissal" />
        <StatCard label="Strike rate" value={perf.strikeRate.toFixed(1)} icon={<Zap className="h-5 w-5" />} tone="orange" hint="Runs per 100 balls" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <ChartCard
          title="Recent form"
          subtitle="Runs in your last six innings"
          className="xl:col-span-2"
          action={<Badge tone="success" dot>3 scores above 40</Badge>}
        >
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="playerForm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#217346" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#217346" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="innings" tick={{ fontSize: 10, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value} runs`, 'Score']} />
                <Area type="monotone" dataKey="runs" stroke="#217346" strokeWidth={2.4} fill="url(#playerForm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[10.5px] text-slateink-light">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cricket" /> Runs per innings
            </span>
            <span>Average so far: {Math.round(perf.form.reduce((sum, run) => sum + run, 0) / perf.form.length)}</span>
          </div>
        </ChartCard>

        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="relative bg-forest px-5 pb-4 pt-5 text-white">
              <div className="absolute inset-0 hero-grid opacity-40" />
              <div className="relative">
                <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-grass">
                  <Flame className="h-3 w-3" /> Next fixture
                </p>
                {next ? (
                  <>
                    <p className="mt-2 font-display text-lg font-extrabold text-white">
                      {user?.team ?? 'Your team'} <span className="text-white/40">vs</span> {opponentOf(next, user?.team ?? '')}
                    </p>
                    <p className="mt-1 text-[10.5px] text-white/55">
                      {relativeDay(next.date)} · {next.time} · {next.ground}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-white/70">No fixture scheduled yet.</p>
                )}
              </div>
            </div>
            <div className="p-4">
              {next ? (
                <>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slateink-light">{next.tournament}</span>
                    <StatusBadge status={next.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-offwhite p-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slateink-faint">Overs</p>
                      <p className="text-sm font-bold text-forest">{next.overs}</p>
                    </div>
                    <div className="rounded-lg bg-offwhite p-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slateink-faint">Venue</p>
                      <p className="truncate text-[11px] font-bold text-forest">{next.ground}</p>
                    </div>
                  </div>
                  <Link to="/player/matches" className={buttonStyles('primary', 'sm', 'mt-3 w-full')}>
                    Match details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : (
                <Link to="/grounds" className={buttonStyles('primary', 'sm', 'w-full')}>
                  Find a ground
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A5000]">
              <Sparkles className="h-3.5 w-3.5" /> Form note
            </p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#9A6A2A]">
              You have {perf.form.filter((run) => run >= 40).length} scores above 40 in your last
              {' '}{perf.form.length} innings. Keep the tempo through the middle overs.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <ChartCard title="Runs by phase" subtitle="Where your season runs come from">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phaseRuns} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="phase" tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value} runs`, 'Runs']} />
                <Bar dataKey="runs" radius={[6, 6, 0, 0]} maxBarSize={38}>
                  {phaseRuns.map((phase) => (
                    <Cell key={phase.phase} fill={phase.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px] text-slateink-light">
            <span>Powerplay 29%</span>
            <span className="font-bold text-forest">Middle overs 46%</span>
            <span>Death 25%</span>
          </div>
        </ChartCard>

        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-forest">
            <Target className="h-4 w-4 text-cricket" /> Season goals
          </h3>
          <p className="mt-0.5 text-[10.5px] text-slateink-light">Demo targets for the current season.</p>
          <div className="mt-4 space-y-4">
            {[
              { label: 'Runs', value: perf.runs, target: 800, color: 'bg-cricket' },
              { label: 'Fifties', value: perf.form.filter((run) => run >= 50).length + 2, target: 8, color: 'bg-grass' },
              { label: 'Catches', value: perf.catches, target: 15, color: 'bg-matchday' },
            ].map((goal) => (
              <div key={goal.label}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slateink-light">{goal.label}</span>
                  <span className="font-bold text-forest">
                    {goal.value} <span className="text-slateink-faint">/ {goal.target}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-forest/[0.06]">
                  <div
                    className={cn('h-full rounded-full', goal.color)}
                    style={{ width: `${Math.min(100, (goal.value / goal.target) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/player/stats"
            className="mt-4 flex items-center justify-center gap-1 rounded-lg bg-offwhite py-2 text-[10.5px] font-bold text-cricket transition hover:bg-cricket/10"
          >
            Full performance report <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h3 className="font-display text-[15px] font-bold text-forest">Team results</h3>
              <p className="mt-0.5 text-[10.5px] text-slateink-light">Completed fixtures for {user?.team ?? 'your team'}</p>
            </div>
            <Trophy className="h-4 w-4 text-matchday" />
          </div>
          {completed.length === 0 ? (
            <EmptyState
              className="m-4 border-0 bg-transparent"
              icon={<Trophy className="h-6 w-6" />}
              title="No results yet"
              description="Completed fixtures will appear here after the first match."
            />
          ) : (
            <div className="divide-y divide-forest/[0.05] border-t border-forest/[0.06]">
              {completed.slice(0, 3).map((match) => (
                <div key={match.id} className="px-5 py-3">
                  <p className="text-[11.5px] font-bold text-forest">
                    vs {opponentOf(match, user?.team ?? '')}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slateink-light">
                    {formatDate(match.date)} · {match.result}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-cricket">
                    {user?.team ?? 'Team'} {scoreFor(match, user?.team ?? '')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h3 className="font-display text-[15px] font-bold text-forest">Recommended ground</h3>
              <p className="mt-0.5 text-[10.5px] text-slateink-light">A practice venue near your home base.</p>
            </div>
            <Badge tone="orange">Featured</Badge>
          </div>
          <div className="flex flex-col sm:flex-row">
            <img
              src={featuredGround.image}
              alt={featuredGround.name}
              className="h-40 w-full object-cover sm:h-auto sm:w-44"
            />
            <div className="flex flex-1 flex-col p-4">
              <p className="text-sm font-bold text-forest">{featuredGround.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[10.5px] text-slateink-light">
                <MapPin className="h-3 w-3" /> {featuredGround.locality}, {featuredGround.city}
              </p>
              <p className="mt-2 flex-1 text-[11px] leading-relaxed text-slateink-light line-clamp-3">
                {featuredGround.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[12px] font-bold text-forest">
                  {inr(featuredGround.price)}<span className="text-[10px] font-medium text-slateink-faint">/hr</span>
                </p>
                <Link to={`/grounds/${featuredGround.id}`} className={buttonStyles('outline', 'sm')}>
                  View ground <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
            <UserRound className="h-3.5 w-3.5 text-cricket" /> Your cricket profile
          </p>
          <dl className="mt-3 space-y-2.5 text-[11.5px]">
            {[
              ['Team', user?.team ?? 'Not set'],
              ['Playing role', user?.playingRole ?? 'Not set'],
              ['Jersey', user?.jerseyNumber ? `#${user.jerseyNumber}` : 'Not set'],
              ['Home base', user?.location ?? 'Not set'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <dt className="text-slateink-light">{label}</dt>
                <dd className="text-right font-semibold text-forest">{value}</dd>
              </div>
            ))}
          </dl>
          <Link to="/player/profile" className={buttonStyles('outline', 'sm', 'mt-4 w-full')}>
            Edit player profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PlayerMatches() {
  const { user, pushToast } = useApp();
  const fixtures = useMemo(() => teamMatches(user?.team), [user?.team]);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState<Match | null>(null);
  const [available, setAvailable] = useState<Record<string, boolean>>({});

  const filtered = fixtures.filter((match) => {
    if (tab === 'upcoming' && match.status !== 'Upcoming') return false;
    if (tab === 'completed' && match.status !== 'Completed') return false;
    if (tab === 'live' && match.status !== 'Live') return false;
    const text = `${match.teamA} ${match.teamB} ${match.tournament} ${match.ground}`.toLowerCase();
    return !query || text.includes(query.toLowerCase());
  });

  const toggle = (match: Match) => {
    const next = !available[match.id];
    setAvailable((current) => ({ ...current, [match.id]: next }));
    pushToast({
      title: next ? 'Availability shared with captain' : 'Availability withdrawn',
      description: `${match.teamA} vs ${match.teamB} · demo only, the captain is not notified.`,
      tone: next ? 'success' : 'info',
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Fixtures"
        title="My matches"
        description={`Every match involving ${user?.team ?? 'your team'}, with availability and travel details.`}
        actions={
          <Link to="/grounds" className={buttonStyles('primary', 'md')}>
            <MapPin className="h-4 w-4" /> Book practice ground
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Team fixtures" value={fixtures.length} icon={<CalendarDays className="h-5 w-5" />} hint={user?.team ?? 'Your team'} />
        <StatCard label="Upcoming" value={fixtures.filter((match) => match.status === 'Upcoming').length} icon={<CalendarCheck className="h-5 w-5" />} tone="blue" hint="Next two weeks" />
        <StatCard label="Live" value={fixtures.filter((match) => match.status === 'Live').length} icon={<Flame className="h-5 w-5" />} tone="orange" hint="In progress" />
        <StatCard label="Completed" value={fixtures.filter((match) => match.status === 'Completed').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="grass" hint="Results available" />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            options={[
              { value: 'all', label: 'All', count: fixtures.length },
              { value: 'upcoming', label: 'Upcoming', count: fixtures.filter((match) => match.status === 'Upcoming').length },
              { value: 'live', label: 'Live', count: fixtures.filter((match) => match.status === 'Live').length },
              { value: 'completed', label: 'Completed', count: fixtures.filter((match) => match.status === 'Completed').length },
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
              placeholder="Search opponent or venue"
              aria-label="Search player matches"
              className="h-9 w-full rounded-lg border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs focus:border-cricket focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            className="m-5 border-0 bg-transparent"
            icon={<CalendarDays className="h-6 w-6" />}
            title="No fixtures in this view"
            description="Try another tab, clear the search, or book a ground to arrange a practice match."
            action={
              <Link to="/grounds" className={buttonStyles('primary', 'sm')}>
                Explore grounds
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-forest/[0.05]">
            {filtered.map((match) => (
              <div key={match.id} className="flex flex-col gap-3 p-4 transition hover:bg-offwhite/40 sm:flex-row sm:items-center sm:px-5">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                      match.status === 'Live' ? 'bg-red-50 text-red-600' : 'bg-cricket/10 text-cricket',
                    )}
                  >
                    {match.status === 'Live' ? <Flame className="h-5 w-5" /> : <CalendarCheck className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-bold text-forest">
                        {user?.team ?? 'Team'} vs {opponentOf(match, user?.team ?? '')}
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
                      {match.scoreA ?? 'Yet to start'} · {match.overs} overs
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {match.status === 'Completed' ? (
                    <Link to="/player/history" className={buttonStyles('outline', 'sm')}>
                      Result
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggle(match)}
                      className={cn(
                        'rounded-lg px-2.5 py-1.5 text-[10.5px] font-bold transition',
                        available[match.id]
                          ? 'bg-success/10 text-success'
                          : 'border border-forest/10 text-slateink hover:border-cricket/30 hover:text-cricket',
                      )}
                    >
                      {available[match.id] ? 'Available' : 'Set available'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewing(match)}
                    className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-forest">
            <Clock3 className="h-4 w-4 text-cricket" /> Matchday routine
          </h3>
          <ul className="mt-3 space-y-2.5 text-[11.5px] leading-relaxed text-slateink-light">
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Reach the venue 45 minutes before the start.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Carry your own kit, whites and a spare pair of spikes.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Confirm availability with the captain two days out.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
            <Sparkles className="h-3.5 w-3.5 text-cricket" /> Looking for extra practice?
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slateink-light">
            Book a net session or a full ground for a scratch match. Availability and pricing are simulated, so you can
            test the entire booking flow safely.
          </p>
          <Link to="/grounds" className={buttonStyles('primary', 'sm', 'mt-4')}>
            Explore grounds <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Match details"
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
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ['Date', formatDate(viewing.date, 'long')],
                ['Start time', viewing.time],
                ['Ground', viewing.ground],
                ['Umpire', viewing.umpire],
                ['Scorer', viewing.scorer],
                ['Your team score', scoreFor(viewing, user?.team ?? '')],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-forest/[0.07] p-3">
                  <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{label}</dt>
                  <dd className="mt-0.5 text-[11.5px] font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            {viewing.result && (
              <p className="mt-3 rounded-xl bg-success/[0.07] p-3 text-[11.5px] font-semibold text-success">
                {viewing.result}
              </p>
            )}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              <Link to="/grounds" className={buttonStyles('primary', 'md')}>
                Book a ground
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function PlayerStats() {
  const { user } = useApp();
  const perf = useMemo(() => findPlayer(user?.name), [user?.name]);
  const innings = perf.form.map((runs, index) => ({ innings: `Inn ${index + 1}`, runs }));
  const fifties = perf.form.filter((run) => run >= 50).length;

  return (
    <div>
      <PageHeader
        eyebrow="Performance"
        title="Season statistics"
        description="A detailed look at your batting, bowling and fielding numbers. All values are simulated demo data."
        actions={
          <Link to="/player/history" className={buttonStyles('outline', 'md')}>
            <HistoryIcon className="h-4 w-4" /> Match history
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Batting average" value={perf.avg.toFixed(1)} icon={<BarChart3 className="h-5 w-5" />} hint={`${perf.runs} runs in ${perf.matches} matches`} />
        <StatCard label="Strike rate" value={perf.strikeRate.toFixed(1)} icon={<Zap className="h-5 w-5" />} tone="orange" hint={`${perf.balls} balls faced`} />
        <StatCard label="Highest score" value={Math.max(...perf.form)} icon={<Flame className="h-5 w-5" />} tone="grass" hint={`${fifties} scores of 50+`} />
        <StatCard label="Wickets" value={perf.wickets} icon={<Target className="h-5 w-5" />} tone="blue" hint={`Economy ${perf.economy.toFixed(1)}`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <ChartCard title="Runs per innings" subtitle="Last six innings" className="xl:col-span-2">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={innings} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="innings" tick={{ fontSize: 10, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value} runs`, 'Score']} />
                <Bar dataKey="runs" fill="#217346" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Skill profile" subtitle="Out of 100, simulated">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillProfile} outerRadius="72%">
                <PolarGrid stroke="#123D2A" strokeOpacity={0.12} />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 8.5, fill: '#667085' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#217346" fill="#8BCB75" fillOpacity={0.45} strokeWidth={2} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value}/100`, 'Rating']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h3 className="font-display text-[15px] font-bold text-forest">Innings log</h3>
              <p className="mt-0.5 text-[10.5px] text-slateink-light">Recent batting returns and boundary counts.</p>
            </div>
            <Badge tone="grass">{perf.form.length} innings</Badge>
          </div>
          <InningsTable perf={perf} />
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-display text-[15px] font-bold text-forest">Bowling & fielding</h3>
            <div className="mt-4 space-y-4">
              {[
                { label: 'Wickets', value: perf.wickets, max: 40, color: 'bg-cricket' },
                { label: 'Catches', value: perf.catches, max: 25, color: 'bg-grass' },
                { label: 'Economy', value: perf.economy, max: 12, color: 'bg-matchday' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slateink-light">{row.label}</span>
                    <span className="font-bold text-forest">
                      {row.label === 'Economy' ? row.value.toFixed(1) : row.value}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-forest/[0.06]">
                    <div
                      className={cn('h-full rounded-full', row.color)}
                      style={{ width: `${Math.min(100, (row.value / row.max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
              <TrendingUp className="h-3.5 w-3.5 text-cricket" /> Coach's note
            </p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-slateink-light">
              Your boundary rate is strong, but rotating strike in the middle overs could add another 12–15 runs per
              innings. This note is generated demo copy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlayerHistory() {
  const { user, pushToast } = useApp();
  const perf = useMemo(() => findPlayer(user?.name), [user?.name]);
  const fixtures = useMemo(() => teamMatches(user?.team), [user?.team]);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState<Match | null>(null);

  const filtered = fixtures.filter((match) => {
    if (tab === 'completed' && match.status !== 'Completed') return false;
    if (tab === 'upcoming' && match.status === 'Completed') return false;
    const text = `${match.teamA} ${match.teamB} ${match.tournament} ${match.ground}`.toLowerCase();
    return !query || text.includes(query.toLowerCase());
  });

  const completed = fixtures.filter((match) => match.status === 'Completed');

  return (
    <div>
      <PageHeader
        eyebrow="Records"
        title="Match history"
        description="Every fixture, your personal return and the team result. Export is simulated in this demo."
        actions={
          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={() =>
              pushToast({
                title: 'History export simulated',
                description: `${filtered.length} match records would be included.`,
                tone: 'info',
              })
            }
          >
            Export history
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Matches played" value={perf.matches} icon={<CalendarCheck className="h-5 w-5" />} hint="Across the demo season" />
        <StatCard label="Runs scored" value={perf.runs} icon={<TrendingUp className="h-5 w-5" />} tone="grass" hint="All formats" />
        <StatCard label="Fifties" value={perf.form.filter((run) => run >= 50).length + 2} icon={<Trophy className="h-5 w-5" />} tone="orange" hint="Including historical records" />
        <StatCard label="Catches" value={perf.catches} icon={<Target className="h-5 w-5" />} tone="blue" hint="Fielding contributions" />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            options={[
              { value: 'all', label: 'All', count: fixtures.length },
              { value: 'completed', label: 'Results', count: completed.length },
              { value: 'upcoming', label: 'Fixtures', count: fixtures.length - completed.length },
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
              placeholder="Search opponent or venue"
              aria-label="Search player history"
              className="h-9 w-full rounded-lg border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs focus:border-cricket focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            className="m-5 border-0 bg-transparent"
            icon={<HistoryIcon className="h-6 w-6" />}
            title="No match records"
            description="Try another tab or search term, or book a ground to create your first fixture."
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="border-b border-forest/[0.06] bg-offwhite/60">
                <tr>
                  <th className="table-th">Match</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Venue</th>
                  <th className="table-th">My return</th>
                  <th className="table-th">Result</th>
                  <th className="table-th text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/[0.05]">
                {filtered.map((match, index) => {
                  const runs = perf.form[index % perf.form.length];
                  const balls = Math.max(1, Math.round(runs / (perf.strikeRate / 100)));
                  return (
                    <tr key={match.id} className="transition hover:bg-offwhite/50">
                      <td className="table-td">
                        <p className="text-[12px] font-bold text-forest">
                          vs {opponentOf(match, user?.team ?? '')}
                        </p>
                        <p className="text-[10px] text-slateink-light">{match.tournament}</p>
                      </td>
                      <td className="table-td text-[11.5px]">
                        {formatDate(match.date)}
                        <p className="text-[10px] text-slateink-light">{match.time}</p>
                      </td>
                      <td className="table-td text-[11px]">{match.ground}</td>
                      <td className="table-td text-[11.5px]">
                        <span className="font-bold text-forest">{runs}</span> ({balls})
                        <p className="text-[9.5px] text-slateink-light">
                          {Math.floor(runs / 14)} fours · {Math.floor(runs / 32)} sixes
                        </p>
                      </td>
                      <td className="table-td">
                        <StatusBadge status={match.status} />
                        {match.result && <p className="mt-1 text-[10px] text-slateink-light">{match.result}</p>}
                      </td>
                      <td className="table-td text-right">
                        <button
                          type="button"
                          onClick={() => setViewing(match)}
                          className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Match record"
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
                ['Ground', viewing.ground],
                ['Umpire', viewing.umpire],
                ['Scorer', viewing.scorer],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-forest/[0.07] p-3">
                  <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{label}</dt>
                  <dd className="mt-0.5 text-[11.5px] font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              <Button
                variant="primary"
                onClick={() => {
                  pushToast({
                    title: 'Scorecard opened (demo)',
                    description: 'Detailed scorecards are available in the scorer workspace.',
                    tone: 'info',
                  });
                  setViewing(null);
                }}
              >
                Open scorecard
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
