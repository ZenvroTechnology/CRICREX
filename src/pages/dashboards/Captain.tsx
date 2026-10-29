import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Crown,
  Download,
  Flame,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
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
import { Checkbox, Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { useApp } from '@/context/AppContext';
import { grounds, matches, teams } from '@/data/mock';
import { cn, formatDate, relativeDay, toIso } from '@/lib/utils';
import type { Match, PlayerPerformance, Team } from '@/types';

const teamTrend = [
  { match: 'M1', scored: 148, conceded: 152 },
  { match: 'M2', scored: 163, conceded: 147 },
  { match: 'M3', scored: 139, conceded: 144 },
  { match: 'M4', scored: 171, conceded: 158 },
  { match: 'M5', scored: 155, conceded: 149 },
  { match: 'M6', scored: 168, conceded: 146 },
];

const playingRoles = [
  'All-rounder',
  'Opening Batter',
  'Top-order Batter',
  'Middle-order Batter',
  'Wicketkeeper Batter',
  'Fast Bowler',
  'Spin Bowler',
];

function resolveTeam(name?: string): Team {
  return teams.find((team) => team.name === name) ?? teams[0];
}

function opponentOf(match: Match, teamName: string): string {
  return match.teamA === teamName ? match.teamB : match.teamA;
}

function scoreFor(match: Match, teamName: string): string {
  return match.teamA === teamName ? match.scoreA ?? '—' : match.scoreB ?? '—';
}

function resultFor(match: Match, teamName: string): 'Won' | 'Lost' | 'Tied' {
  if (!match.result) return 'Tied';
  if (match.result.toLowerCase().includes('tied')) return 'Tied';
  const winner = match.result.split(' won')[0]?.trim();
  return winner === teamName ? 'Won' : 'Lost';
}

function teamFixtures(name: string): Match[] {
  return matches.filter((match) => match.teamA === name || match.teamB === name);
}

function FormBars({ form }: { form: number[] }) {
  const max = Math.max(...form, 1);
  return (
    <div className="flex items-end gap-0.5" aria-hidden="true">
      {form.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className={cn('w-1.5 rounded-sm', value >= 50 ? 'bg-success' : value >= 30 ? 'bg-cricket' : 'bg-forest/20')}
          style={{ height: `${Math.max(4, (value / max) * 24)}px` }}
        />
      ))}
    </div>
  );
}

function PlayerCardDetails({ player, available }: { player: PlayerPerformance; available: boolean }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="grass">{player.role}</Badge>
        <Badge tone="neutral">#{player.jersey}</Badge>
        <Badge tone={available ? 'success' : 'warning'} dot>
          {available ? 'Available' : 'Unavailable'}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['Matches', String(player.matches)],
          ['Runs', String(player.runs)],
          ['Average', player.avg.toFixed(1)],
          ['Strike rate', player.strikeRate.toFixed(1)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-offwhite p-3">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slateink-faint">{label}</p>
            <p className="mt-0.5 font-display text-lg font-extrabold text-forest">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-forest/[0.07] p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[11.5px] font-bold text-forest">Recent form</h4>
          <FormBars form={player.form} />
        </div>
        <div className="mt-3 h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={player.form.map((runs, index) => ({ innings: `Inn ${index + 1}`, runs }))}
              margin={{ top: 4, right: 4, left: -26, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
              <XAxis dataKey="innings" tick={{ fontSize: 8.5, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8.5, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(value) => [`${value} runs`, 'Score']} />
              <Bar dataKey="runs" fill="#217346" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          ['Wickets', String(player.wickets)],
          ['Economy', player.economy ? player.economy.toFixed(1) : '—'],
          ['Catches', String(player.catches)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-forest/[0.07] p-3">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slateink-faint">{label}</p>
            <p className="mt-0.5 text-[12.5px] font-bold text-forest">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CaptainHome() {
  const { user, pushToast, notifications } = useApp();
  const team = useMemo(() => resolveTeam(user?.team), [user?.team]);
  const fixtures = useMemo(() => teamFixtures(team.name), [team.name]);
  const upcoming = fixtures.filter((match) => match.status !== 'Completed');
  const completed = fixtures.filter((match) => match.status === 'Completed');
  const next = upcoming[0];
  const wins = completed.filter((match) => resultFor(match, team.name) === 'Won').length;
  const winRate = completed.length ? Math.round((wins / completed.length) * 100) : 0;
  const topPerformers = [...team.players].sort((a, b) => b.runs - a.runs).slice(0, 4);

  return (
    <div>
      <PageHeader
        eyebrow="Captain workspace"
        title={`${team.name} command centre`}
        description="Squad, fixtures, results and performance in one place. All team data is seeded demo data."
        actions={
          <>
            <Button
              variant="outline"
              icon={<Download className="h-4 w-4" />}
              onClick={() =>
                pushToast({
                  title: 'Team sheet simulated',
                  description: 'No document was downloaded in this frontend demo.',
                  tone: 'info',
                })
              }
            >
              Export team sheet
            </Button>
            <Link to="/captain/matches" className={buttonStyles('primary', 'md')}>
              <CalendarDays className="h-4 w-4" /> Plan next fixture
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Squad size" value={team.players.length} icon={<Users className="h-5 w-5" />} hint="Registered players" />
        <StatCard label="Matches" value={completed.length} icon={<CalendarCheck className="h-5 w-5" />} tone="blue" hint="Completed in the demo season" />
        <StatCard label="Wins" value={wins} icon={<Trophy className="h-5 w-5" />} tone="grass" hint={`${completed.length - wins} other results`} />
        <StatCard label="Win rate" value={`${winRate}%`} icon={<TrendingUp className="h-5 w-5" />} tone="orange" hint="From completed fixtures" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-forest p-5 text-white shadow-card sm:p-6 xl:col-span-2">
          <div className="absolute inset-0 hero-grid opacity-40" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-grass/15 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-grass/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-grass">
                <Crown className="h-3 w-3" /> Next fixture
              </span>
              <span className="text-[10.5px] text-white/50">
                {next ? `${next.tournament} · ${next.overs} overs` : 'No fixture scheduled'}
              </span>
            </div>

            {next ? (
              <>
                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl font-extrabold text-white">
                      {team.name} <span className="text-white/40">vs</span> {opponentOf(next, team.name)}
                    </p>
                    <p className="mt-1 text-[11px] text-white/55">
                      {relativeDay(next.date)} · {next.time} · {next.ground}
                    </p>
                    <p className="mt-1 text-[10.5px] text-white/40">
                      Umpire {next.umpire} · Scorer {next.scorer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Squad available</p>
                    <p className="font-display text-xl font-extrabold text-matchday">{team.players.length}</p>
                    <p className="text-[10px] text-white/40">players registered</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  <Link to="/captain/matches" className={buttonStyles('accent', 'md')}>
                    <CalendarCheck className="h-4 w-4" /> Manage line-up
                  </Link>
                  <Link
                    to="/captain/team"
                    className={buttonStyles(
                      'ghost',
                      'md',
                      'border border-white/20 text-white hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Users className="h-4 w-4" /> Squad
                  </Link>
                </div>
              </>
            ) : (
              <div className="mt-6">
                <p className="text-sm text-white/65">No upcoming fixture. Add one from the fixtures page.</p>
                <Link to="/captain/matches" className={buttonStyles('accent', 'md', 'mt-4')}>
                  Add fixture <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        <ChartCard title="Scoring trend" subtitle="Runs scored and conceded, last six matches">
          <div className="h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={teamTrend} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="captainScored" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#217346" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#217346" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="match" tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="conceded" stroke="#FF9F43" strokeWidth={1.8} fill="none" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="scored" stroke="#217346" strokeWidth={2.2} fill="url(#captainScored)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[10px] text-slateink-light">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cricket" /> Scored</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-matchday" /> Conceded</span>
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h3 className="font-display text-[15px] font-bold text-forest">Recent results</h3>
              <p className="mt-0.5 text-[11px] text-slateink-light">Completed fixtures for {team.name}</p>
            </div>
            <Link to="/captain/results" className="text-[10.5px] font-bold text-cricket hover:text-forest">
              View all
            </Link>
          </div>
          {completed.length === 0 ? (
            <EmptyState
              className="m-5 border-0 bg-transparent"
              icon={<Trophy className="h-6 w-6" />}
              title="No results yet"
              description="Completed matches will appear here once the first fixture is played."
            />
          ) : (
            <div className="divide-y divide-forest/[0.05] border-t border-forest/[0.06]">
              {completed.slice(0, 4).map((match) => {
                const result = resultFor(match, team.name);
                return (
                  <div key={match.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        result === 'Won' ? 'bg-success/10 text-success' : result === 'Lost' ? 'bg-red-50 text-red-600' : 'bg-matchday/15 text-[#B25E00]',
                      )}
                    >
                      <Trophy className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold text-forest">vs {opponentOf(match, team.name)}</p>
                      <p className="flex flex-wrap items-center gap-1 text-[10px] text-slateink-light">
                        <MapPin className="h-2.5 w-2.5" /> {match.ground} · {formatDate(match.date)}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold text-cricket">
                        {scoreFor(match, team.name)} vs {match.teamA === team.name ? match.scoreB ?? '—' : match.scoreA ?? '—'}
                      </p>
                    </div>
                    <Badge tone={result === 'Won' ? 'success' : result === 'Lost' ? 'danger' : 'warning'}>{result}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[15px] font-bold text-forest">Top performers</h3>
            <Badge tone="grass" icon={<Flame className="h-3 w-3" />}>Runs</Badge>
          </div>
          <div className="mt-3 space-y-3">
            {topPerformers.map((player, index) => (
              <div key={player.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest/[0.05] text-[10px] font-extrabold text-cricket">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11.5px] font-bold text-forest">{player.name}</p>
                  <p className="text-[9.5px] text-slateink-light">{player.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold text-forest">{player.runs}</p>
                  <p className="text-[9px] text-slateink-faint">runs</p>
                </div>
                <FormBars form={player.form} />
              </div>
            ))}
          </div>
          <Link
            to="/captain/performance"
            className="mt-4 flex items-center justify-center gap-1 rounded-lg bg-offwhite py-2 text-[10.5px] font-bold text-cricket transition hover:bg-cricket/10"
          >
            Full performance report <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-forest">
            <ShieldCheck className="h-4 w-4 text-cricket" /> Captain's notes
          </h3>
          <p className="mt-2 text-[11.5px] leading-relaxed text-slateink-light">
            {user?.name} has {user?.captaincyExperience ?? '4 years'} of captaincy experience and plays as an{' '}
            {user?.playingRole ?? 'all-rounder'}. Keep the top order patient through the powerplay and back the spinners
            in the middle overs.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ['Home ground', team.homeGround],
              ['Coach', team.coach],
              ['City', team.city],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-offwhite p-2.5">
                <p className="text-[8.5px] font-bold uppercase tracking-wide text-slateink-faint">{label}</p>
                <p className="mt-0.5 truncate text-[10.5px] font-bold text-forest">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A5000]">
            <Sparkles className="h-3.5 w-3.5" /> Matchday reminder
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-[#9A6A2A]">
            {notifications.filter((item) => !item.read).length} unread demo alerts. Confirm your XI, share the venue pin
            and remind the squad to arrive 45 minutes before the toss.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/captain/team" className={buttonStyles('outline', 'sm')}>
              <Users className="h-3.5 w-3.5" /> Manage squad
            </Link>
            <Link to="/captain/matches" className={buttonStyles('primary', 'sm')}>
              <CalendarCheck className="h-3.5 w-3.5" /> Fixtures
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CaptainTeam() {
  const { user, pushToast } = useApp();
  const team = useMemo(() => resolveTeam(user?.team), [user?.team]);
  const [players, setPlayers] = useState<PlayerPerformance[]>(team.players);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [viewing, setViewing] = useState<PlayerPerformance | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', role: playingRoles[0], jersey: '' });
  const [formError, setFormError] = useState('');
  const [availability, setAvailability] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(team.players.map((player) => [player.id, true])),
  );

  const filtered = players.filter((player) => {
    if (role !== 'all' && player.role !== role) return false;
    const text = `${player.name} ${player.role} ${player.jersey}`.toLowerCase();
    return !search || text.includes(search.toLowerCase());
  });

  const batters = players.filter((player) => player.role.includes('Batter') || player.role.includes('Wicketkeeper')).length;
  const bowlers = players.filter((player) => player.role.includes('Bowler')).length;
  const allRounders = players.filter((player) => player.role === 'All-rounder').length;

  const toggleAvailability = (player: PlayerPerformance) => {
    const next = !availability[player.id];
    setAvailability((current) => ({ ...current, [player.id]: next }));
    pushToast({
      title: next ? `${player.name} marked available` : `${player.name} marked unavailable`,
      description: 'Availability is a demo signal shared with the captain only.',
      tone: next ? 'success' : 'info',
    });
  };

  const addPlayer = (event: FormEvent) => {
    event.preventDefault();
    const jersey = Number(form.jersey);
    if (form.name.trim().length < 3) {
      setFormError('Enter the player’s full name (at least 3 characters).');
      return;
    }
    if (!jersey || jersey < 1 || jersey > 99) {
      setFormError('Jersey numbers must be between 1 and 99.');
      return;
    }
    if (players.some((player) => player.jersey === jersey)) {
      setFormError(`Jersey #${jersey} is already taken in this squad.`);
      return;
    }
    const player: PlayerPerformance = {
      id: `pl-local-${players.length + 1}`,
      name: form.name.trim(),
      role: form.role,
      jersey,
      matches: 0,
      runs: 0,
      balls: 0,
      wickets: 0,
      economy: 0,
      catches: 0,
      avg: 0,
      strikeRate: 0,
      form: [0, 0, 0, 0, 0, 0],
    };
    setPlayers((current) => [...current, player]);
    setAvailability((current) => ({ ...current, [player.id]: true }));
    setForm({ name: '', role: playingRoles[0], jersey: '' });
    setFormError('');
    setAddOpen(false);
    pushToast({ title: 'Player added to demo squad', description: `${player.name} · #${player.jersey} · ${player.role}`, tone: 'success' });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Squad"
        title={`${team.name} roster`}
        description="Review the squad, track availability and add players to your demo roster."
        actions={
          <>
            <Button
              variant="outline"
              icon={<Download className="h-4 w-4" />}
              onClick={() =>
                pushToast({
                  title: 'Squad export simulated',
                  description: `${players.length} players would be included in the sheet.`,
                  tone: 'info',
                })
              }
            >
              Export squad
            </Button>
            <Button variant="primary" icon={<UserPlus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
              Add player
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Squad size" value={players.length} icon={<Users className="h-5 w-5" />} hint="Registered in this demo" />
        <StatCard label="Batters" value={batters} icon={<Target className="h-5 w-5" />} tone="grass" hint="Including wicketkeepers" />
        <StatCard label="Bowlers" value={bowlers} icon={<Zap className="h-5 w-5" />} tone="orange" hint="Pace and spin" />
        <StatCard label="All-rounders" value={allRounders} icon={<BarChart3 className="h-5 w-5" />} tone="blue" hint="Batting and bowling" />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search player or jersey"
              aria-label="Search squad"
              className="h-9 w-full rounded-lg border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs focus:border-cricket focus:bg-white focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              aria-label="Filter squad by role"
              className="h-9 rounded-lg border border-forest/10 bg-white px-3 text-[11px] font-semibold text-forest focus:border-cricket focus:outline-none"
            >
              <option value="all">All roles</option>
              {playingRoles.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <Badge tone="grass">{filtered.length} shown</Badge>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            className="m-5 border-0 bg-transparent"
            icon={<Users className="h-6 w-6" />}
            title="No players match"
            description="Try another role or clear the search to see the full squad."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setRole('all');
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-forest/[0.06] bg-offwhite/60">
                <tr>
                  <th className="table-th">Player</th>
                  <th className="table-th">Role</th>
                  <th className="table-th text-center">#</th>
                  <th className="table-th text-right">Mat</th>
                  <th className="table-th text-right">Runs</th>
                  <th className="table-th text-right">Wkts</th>
                  <th className="table-th text-right">SR</th>
                  <th className="table-th">Form</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/[0.05]">
                {filtered.map((player) => (
                  <tr key={player.id} className="transition hover:bg-offwhite/50">
                    <td className="table-td">
                      <p className="text-[12px] font-bold text-forest">{player.name}</p>
                      <p className="text-[9.5px] text-slateink-light">{team.name}</p>
                    </td>
                    <td className="table-td text-[10.5px]">
                      <Badge tone={player.role.includes('Bowler') ? 'info' : player.role === 'All-rounder' ? 'grass' : 'neutral'}>
                        {player.role}
                      </Badge>
                    </td>
                    <td className="table-td text-center text-[11.5px] font-bold text-forest">#{player.jersey}</td>
                    <td className="table-td text-right text-[11.5px]">{player.matches}</td>
                    <td className="table-td text-right text-[12px] font-bold text-forest">{player.runs}</td>
                    <td className="table-td text-right text-[11.5px]">{player.wickets}</td>
                    <td className="table-td text-right text-[11.5px]">{player.strikeRate.toFixed(1)}</td>
                    <td className="table-td"><FormBars form={player.form} /></td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleAvailability(player)}
                          aria-label={`${availability[player.id] ? 'Mark' : 'Mark'} ${player.name} ${availability[player.id] ? 'unavailable' : 'available'}`}
                          className={cn(
                            'rounded-lg px-2 py-1.5 text-[9.5px] font-bold transition',
                            availability[player.id]
                              ? 'bg-success/10 text-success'
                              : 'bg-red-50 text-red-600',
                          )}
                        >
                          {availability[player.id] ? (
                            <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Available</span>
                          ) : (
                            <span className="inline-flex items-center gap-1"><XCircle className="h-3 w-3" /> Out</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewing(player)}
                          className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-forest/[0.06] px-5 py-3 text-[10px] text-slateink-light">
          Showing {filtered.length} of {players.length} players · stats are simulated
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-display text-[15px] font-bold text-forest">Availability snapshot</h3>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-success/[0.07] p-3 text-center">
              <p className="font-display text-2xl font-extrabold text-success">
                {Object.values(availability).filter(Boolean).length}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wide text-success/70">Available</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-center">
              <p className="font-display text-2xl font-extrabold text-red-600">
                {Object.values(availability).filter((value) => !value).length}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wide text-red-500">Unavailable</p>
            </div>
            <div className="rounded-xl bg-offwhite p-3 text-center">
              <p className="font-display text-2xl font-extrabold text-forest">{players.length}</p>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slateink-faint">Total</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
            <Sparkles className="h-3.5 w-3.5 text-cricket" /> Building a matchday squad
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slateink-light">
            Pick eleven players with at least five bowling options and a wicketkeeper. New players added here live only in
            this session and reset on reload.
          </p>
          <Link to="/captain/matches" className={buttonStyles('outline', 'sm', 'mt-4')}>
            Pick a line-up <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name}
        description={viewing ? `${viewing.role} · #${viewing.jersey}` : ''}
        size="md"
      >
        {viewing && (
          <div>
            <PlayerCardDetails player={viewing} available={Boolean(availability[viewing.id])} />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              <Button
                variant={availability[viewing.id] ? 'ghost' : 'primary'}
                onClick={() => toggleAvailability(viewing)}
              >
                {availability[viewing.id] ? 'Mark unavailable' : 'Mark available'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setFormError('');
        }}
        title="Add a player"
        description="Add a demo player to this squad. Nothing is saved to a server."
        size="sm"
      >
        <form onSubmit={addPlayer} className="space-y-4">
          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => {
              setForm((current) => ({ ...current, name: event.target.value }));
              setFormError('');
            }}
            placeholder="Player name"
            error={formError}
            required
          />
          <Select
            label="Playing role"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            {playingRoles.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
          <Input
            label="Jersey number"
            type="number"
            min={1}
            max={99}
            value={form.jersey}
            onChange={(event) => {
              setForm((current) => ({ ...current, jersey: event.target.value }));
              setFormError('');
            }}
            placeholder="e.g. 24"
            required
          />
          <div className="rounded-xl bg-offwhite p-3 text-[10.5px] leading-relaxed text-slateink-light">
            New players start with empty career stats. Add them to a line-up from the fixtures page.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" icon={<Plus className="h-4 w-4" />}>Add player</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function CaptainMatches() {
  const { user, pushToast } = useApp();
  const team = useMemo(() => resolveTeam(user?.team), [user?.team]);
  const baseFixtures = useMemo(() => teamFixtures(team.name), [team.name]);
  const [extras, setExtras] = useState<Match[]>([]);
  const [tab, setTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState<Match | null>(null);
  const [lineupFor, setLineupFor] = useState<Match | null>(null);
  const [lineup, setLineup] = useState<string[]>([]);
  const [lineupError, setLineupError] = useState('');
  const [form, setForm] = useState({
    opponent: '',
    date: toIso(new Date()),
    time: '09:00 AM',
    ground: grounds[0].name,
    tournament: 'Friendly',
    overs: '20',
  });
  const [formError, setFormError] = useState('');

  const fixtures = [...baseFixtures, ...extras];

  const filtered = fixtures.filter((match) => {
    if (tab === 'upcoming' && match.status === 'Completed') return false;
    if (tab === 'completed' && match.status !== 'Completed') return false;
    const text = `${match.teamA} ${match.teamB} ${match.ground} ${match.tournament}`.toLowerCase();
    return !search || text.includes(search.toLowerCase());
  });

  const addFixture = (event: FormEvent) => {
    event.preventDefault();
    if (form.opponent.trim().length < 3) {
      setFormError('Enter the opposition team name (at least 3 characters).');
      return;
    }
    if (!form.date) {
      setFormError('Choose a fixture date.');
      return;
    }
    const fixture: Match = {
      id: `mt-local-${extras.length + 1}`,
      teamA: team.name,
      teamB: form.opponent.trim(),
      ground: form.ground,
      date: form.date,
      time: form.time,
      tournament: form.tournament.trim() || 'Friendly',
      status: 'Upcoming',
      overs: Number(form.overs),
      umpire: 'To be assigned',
      scorer: 'To be assigned',
    };
    setExtras((current) => [...current, fixture]);
    setForm({ opponent: '', date: toIso(new Date()), time: '09:00 AM', ground: grounds[0].name, tournament: 'Friendly', overs: '20' });
    setFormError('');
    setAddOpen(false);
    setTab('upcoming');
    pushToast({
      title: 'Fixture added (demo)',
      description: `${team.name} vs ${fixture.teamB} · ${formatDate(fixture.date)} · not saved after reload.`,
      tone: 'success',
    });
  };

  const openLineup = (match: Match) => {
    setLineup(team.players.slice(0, 11).map((player) => player.name));
    setLineupError('');
    setLineupFor(match);
  };

  const saveLineup = () => {
    if (lineup.length !== 11) {
      setLineupError('Select exactly 11 players for the matchday XI.');
      return;
    }
    pushToast({
      title: 'Playing XI confirmed',
      description: lineupFor ? `${lineup.length} players locked in for ${lineupFor.teamA} vs ${lineupFor.teamB}.` : 'Line-up saved.',
      tone: 'success',
    });
    setLineupFor(null);
    setLineupError('');
  };

  return (
    <div>
      <PageHeader
        eyebrow="Fixtures"
        title="Matches & line-ups"
        description="Plan the schedule, confirm your XI and keep every fixture detail in one place."
        actions={
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            Add fixture
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total fixtures" value={fixtures.length} icon={<CalendarDays className="h-5 w-5" />} hint={team.name} />
        <StatCard label="Upcoming" value={fixtures.filter((match) => match.status === 'Upcoming').length} icon={<CalendarCheck className="h-5 w-5" />} tone="blue" hint="Awaiting first ball" />
        <StatCard label="Live" value={fixtures.filter((match) => match.status === 'Live').length} icon={<Flame className="h-5 w-5" />} tone="orange" hint="In progress" />
        <StatCard label="Completed" value={fixtures.filter((match) => match.status === 'Completed').length} icon={<Trophy className="h-5 w-5" />} tone="grass" hint="Results filed" />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            options={[
              { value: 'upcoming', label: 'Upcoming & live', count: fixtures.filter((match) => match.status !== 'Completed').length },
              { value: 'completed', label: 'Completed', count: fixtures.filter((match) => match.status === 'Completed').length },
              { value: 'all', label: 'All fixtures', count: fixtures.length },
            ]}
            value={tab}
            onChange={setTab}
            size="sm"
          />
          <div className="relative lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search opponent or venue"
              aria-label="Search captain fixtures"
              className="h-9 w-full rounded-lg border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs focus:border-cricket focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            className="m-5 border-0 bg-transparent"
            icon={<CalendarDays className="h-6 w-6" />}
            title="No fixtures in this view"
            description="Add a demo fixture or switch tabs to see the rest of the schedule."
            action={<Button variant="primary" onClick={() => setAddOpen(true)}>Add fixture</Button>}
          />
        ) : (
          <div className="divide-y divide-forest/[0.05]">
            {filtered.map((match) => (
              <div key={match.id} className="flex flex-col gap-3 p-4 transition hover:bg-offwhite/40 sm:flex-row sm:items-center sm:px-5">
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
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[12.5px] font-bold text-forest">
                        {team.name} vs {opponentOf(match, team.name)}
                      </p>
                      <StatusBadge status={match.status} />
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10.5px] text-slateink-light">
                      <span>{match.time}</span>
                      <span>•</span>
                      <span>{match.ground}</span>
                      <span>•</span>
                      <span>{match.tournament}</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-slateink-faint">
                      {match.overs} overs · Umpire {match.umpire} · Scorer {match.scorer}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {match.status !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => openLineup(match)}
                      className="rounded-lg bg-cricket/10 px-2.5 py-1.5 text-[10.5px] font-bold text-cricket transition hover:bg-cricket/15"
                    >
                      Manage XI
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewing(match)}
                    className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket"
                  >
                    Details
                  </button>
                  {match.status === 'Completed' && (
                    <Link to="/captain/results" className={buttonStyles('outline', 'sm')}>
                      Result
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-display text-[15px] font-bold text-forest">Selection principles</h3>
          <ul className="mt-3 space-y-2.5 text-[11.5px] leading-relaxed text-slateink-light">
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Balance the XI with at least five bowling options.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Keep a specialist wicketkeeper and two finishers.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Check availability before locking the line-up.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A5000]">
            <ShieldCheck className="h-3.5 w-3.5" /> Demo fixtures only
          </p>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#9A6A2A]">
            New fixtures and line-ups live in this browser session. Refreshing the page restores the seeded schedule.
          </p>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a demo fixture" description="Create a friendly fixture for your squad." size="md">
        <form onSubmit={addFixture} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Opposition team"
              value={form.opponent}
              onChange={(event) => {
                setForm((current) => ({ ...current, opponent: event.target.value }));
                setFormError('');
              }}
              placeholder="e.g. Chennai Chargers"
              error={formError}
              containerClassName="sm:col-span-2"
              required
            />
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              required
            />
            <Select label="Start time" value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}>
              {['07:00 AM', '09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '06:30 PM', '07:00 PM'].map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </Select>
            <Select label="Ground" value={form.ground} onChange={(event) => setForm((current) => ({ ...current, ground: event.target.value }))}>
              {grounds.map((ground) => (
                <option key={ground.id} value={ground.name}>{ground.name}</option>
              ))}
            </Select>
            <Select label="Overs" value={form.overs} onChange={(event) => setForm((current) => ({ ...current, overs: event.target.value }))}>
              {['10', '15', '20', '25', '30', '40', '50'].map((overs) => (
                <option key={overs} value={overs}>{overs} overs</option>
              ))}
            </Select>
            <Input
              label="Tournament"
              value={form.tournament}
              onChange={(event) => setForm((current) => ({ ...current, tournament: event.target.value }))}
              placeholder="Friendly, league or cup"
              containerClassName="sm:col-span-2"
            />
          </div>
          <div className="rounded-xl bg-offwhite p-3 text-[10.5px] leading-relaxed text-slateink-light">
            Umpire and scorer are unassigned for new fixtures. Nothing is sent to the demo admin.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" icon={<Plus className="h-4 w-4" />}>Create fixture</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Fixture details"
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
                ['Your score', scoreFor(viewing, team.name)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-forest/[0.07] p-3">
                  <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{label}</dt>
                  <dd className="mt-0.5 text-[11.5px] font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            {viewing.result && (
              <p className="mt-3 rounded-xl bg-success/[0.07] p-3 text-[11.5px] font-semibold text-success">{viewing.result}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              {viewing.status !== 'Completed' && (
                <Button variant="primary" onClick={() => { setViewing(null); openLineup(viewing); }}>
                  Manage XI
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(lineupFor)}
        onClose={() => setLineupFor(null)}
        title="Confirm playing XI"
        description={lineupFor ? `${lineupFor.teamA} vs ${lineupFor.teamB}` : ''}
        size="lg"
      >
        {lineupFor && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11.5px] font-bold text-forest">Select 11 players from the squad</p>
              <Badge tone={lineup.length === 11 ? 'success' : 'warning'}>{lineup.length}/11 selected</Badge>
            </div>
            <div className="mt-3 grid max-h-[340px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {team.players.map((player) => {
                const checked = lineup.includes(player.name);
                return (
                  <Checkbox
                    key={player.id}
                    checked={checked}
                    onChange={() =>
                      setLineup((current) =>
                        current.includes(player.name)
                          ? current.filter((name) => name !== player.name)
                          : [...current, player.name],
                      )
                    }
                    label={`${player.name} · #${player.jersey}`}
                    description={player.role}
                  />
                );
              })}
            </div>
            {lineupError && <p className="mt-3 rounded-lg bg-red-50 p-2.5 text-[11px] font-semibold text-red-600">{lineupError}</p>}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setLineupFor(null)}>Cancel</Button>
              <Button variant="primary" onClick={saveLineup}>Confirm XI</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function CaptainResults() {
  const { user, pushToast } = useApp();
  const team = useMemo(() => resolveTeam(user?.team), [user?.team]);
  const completed = useMemo(
    () => teamFixtures(team.name).filter((match) => match.status === 'Completed'),
    [team.name],
  );
  const [viewing, setViewing] = useState<Match | null>(null);
  const [query, setQuery] = useState('');

  const wins = completed.filter((match) => resultFor(match, team.name) === 'Won').length;
  const losses = completed.filter((match) => resultFor(match, team.name) === 'Lost').length;
  const ties = completed.length - wins - losses;
  const winRate = completed.length ? Math.round((wins / completed.length) * 100) : 0;
  const topPlayers = [...team.players].sort((a, b) => b.runs - a.runs).slice(0, 3);

  const filtered = completed.filter((match) => {
    const text = `${match.teamA} ${match.teamB} ${match.ground} ${match.tournament}`.toLowerCase();
    return !query || text.includes(query.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        eyebrow="Results"
        title="Match results"
        description="Every completed fixture with the final score, result and a demo post-match report."
        actions={
          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={() =>
              pushToast({
                title: 'Results export simulated',
                description: `${filtered.length} completed matches would be exported.`,
                tone: 'info',
              })
            }
          >
            Export results
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Matches played" value={completed.length} icon={<CalendarCheck className="h-5 w-5" />} hint="Seeded demo fixtures" />
        <StatCard label="Won" value={wins} icon={<Trophy className="h-5 w-5" />} tone="grass" hint="Completed victories" />
        <StatCard label="Lost" value={losses} icon={<XCircle className="h-5 w-5" />} tone="orange" hint={`${ties} tied`} />
        <StatCard label="Win rate" value={`${winRate}%`} icon={<TrendingUp className="h-5 w-5" />} tone="blue" hint="Across completed matches" />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search opponent or venue"
              aria-label="Search match results"
              className="h-9 w-full rounded-lg border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs focus:border-cricket focus:bg-white focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="success" dot>{wins} wins</Badge>
            <Badge tone="danger" dot>{losses} losses</Badge>
            {ties > 0 && <Badge tone="warning" dot>{ties} tied</Badge>}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            className="m-5 border-0 bg-transparent"
            icon={<Trophy className="h-6 w-6" />}
            title="No results found"
            description="Completed matches will appear here. Try clearing the search if you expected a result."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="border-b border-forest/[0.06] bg-offwhite/60">
                <tr>
                  <th className="table-th">Match</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Venue</th>
                  <th className="table-th">Score</th>
                  <th className="table-th">Result</th>
                  <th className="table-th text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/[0.05]">
                {filtered.map((match) => {
                  const result = resultFor(match, team.name);
                  return (
                    <tr key={match.id} className="transition hover:bg-offwhite/50">
                      <td className="table-td">
                        <p className="text-[12px] font-bold text-forest">vs {opponentOf(match, team.name)}</p>
                        <p className="text-[10px] text-slateink-light">{match.tournament}</p>
                      </td>
                      <td className="table-td text-[11.5px]">
                        {formatDate(match.date)}
                        <p className="text-[10px] text-slateink-light">{match.time}</p>
                      </td>
                      <td className="table-td text-[11px]">{match.ground}</td>
                      <td className="table-td text-[11px]">
                        <p className="font-semibold text-forest">{scoreFor(match, team.name)}</p>
                        <p>{match.teamA === team.name ? match.scoreB ?? '—' : match.scoreA ?? '—'}</p>
                      </td>
                      <td className="table-td">
                        <Badge tone={result === 'Won' ? 'success' : result === 'Lost' ? 'danger' : 'warning'}>{result}</Badge>
                        <p className="mt-1 max-w-[210px] text-[10px] leading-relaxed text-slateink-light">{match.result}</p>
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

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-display text-[15px] font-bold text-forest">Season record</h3>
          <div className="mt-4 space-y-4">
            {[
              { label: 'Wins', value: wins, max: Math.max(1, completed.length), color: 'bg-success' },
              { label: 'Losses', value: losses, max: Math.max(1, completed.length), color: 'bg-red-400' },
              { label: 'Win rate', value: winRate, max: 100, color: 'bg-cricket' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slateink-light">{row.label}</span>
                  <span className="font-bold text-forest">{row.value}{row.label === 'Win rate' ? '%' : ''}</span>
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
            <Target className="h-3.5 w-3.5 text-cricket" /> Post-match review
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slateink-light">
            Open a result to review the score comparison and your top performers. Sharing a result is simulated and does
            not post to any league table.
          </p>
          <Link to="/captain/performance" className={buttonStyles('outline', 'sm', 'mt-4')}>
            Team performance <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Post-match report"
        description={viewing ? `${viewing.teamA} vs ${viewing.teamB}` : ''}
        size="md"
      >
        {viewing && (
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={resultFor(viewing, team.name) === 'Won' ? 'success' : resultFor(viewing, team.name) === 'Lost' ? 'danger' : 'warning'}>
                {resultFor(viewing, team.name)}
              </Badge>
              <Badge tone="info">{viewing.tournament}</Badge>
              <Badge tone="neutral">{formatDate(viewing.date)}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-offwhite p-3">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{team.name}</p>
                <p className="mt-1 font-display text-lg font-extrabold text-forest">{scoreFor(viewing, team.name)}</p>
              </div>
              <div className="rounded-xl bg-offwhite p-3">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{opponentOf(viewing, team.name)}</p>
                <p className="mt-1 font-display text-lg font-extrabold text-forest">
                  {viewing.teamA === team.name ? viewing.scoreB ?? '—' : viewing.scoreA ?? '—'}
                </p>
              </div>
            </div>
            {viewing.result && <p className="mt-3 rounded-xl bg-success/[0.07] p-3 text-[11.5px] font-semibold text-success">{viewing.result}</p>}
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slateink-faint">Top performers</p>
              <div className="mt-2 space-y-2">
                {topPlayers.map((player) => (
                  <div key={player.id} className="flex items-center gap-2 rounded-xl border border-forest/[0.07] p-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cricket/10 text-[9px] font-extrabold text-cricket">
                      #{player.jersey}
                    </span>
                    <span className="flex-1 text-[11.5px] font-semibold text-forest">{player.name}</span>
                    <span className="text-[10.5px] text-slateink-light">{player.runs} runs · {player.wickets} wkts</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              <Button
                variant="primary"
                onClick={() => {
                  pushToast({
                    title: 'Result share simulated',
                    description: `${viewing.result ?? 'Result'} — nothing was posted anywhere.`,
                    tone: 'info',
                  });
                  setViewing(null);
                }}
              >
                Share result
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

type Metric = 'runs' | 'wickets' | 'strikeRate';

export function CaptainPerformance() {
  const { user, pushToast } = useApp();
  const team = useMemo(() => resolveTeam(user?.team), [user?.team]);
  const completed = useMemo(
    () => teamFixtures(team.name).filter((match) => match.status === 'Completed'),
    [team.name],
  );
  const [metric, setMetric] = useState<Metric>('runs');

  const wins = completed.filter((match) => resultFor(match, team.name) === 'Won').length;
  const winRate = completed.length ? Math.round((wins / completed.length) * 100) : 0;
  const totalRuns = team.players.reduce((sum, player) => sum + player.runs, 0);
  const totalWickets = team.players.reduce((sum, player) => sum + player.wickets, 0);
  const bestAverage = Math.max(...team.players.map((player) => player.avg), 0);

  const sortedPlayers = [...team.players].sort((a, b) => b[metric] - a[metric]);
  const topRuns = [...team.players].sort((a, b) => b.runs - a.runs).slice(0, 8);
  const topWickets = [...team.players].sort((a, b) => b.wickets - a.wickets).slice(0, 6);

  return (
    <div>
      <PageHeader
        eyebrow="Performance"
        title="Team performance"
        description="Batting, bowling and form across the squad. Use the metric tabs to re-rank the table."
        actions={
          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={() =>
              pushToast({
                title: 'Performance report simulated',
                description: 'No document was generated in this demo.',
                tone: 'info',
              })
            }
          >
            Export report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Team runs" value={totalRuns} icon={<BarChart3 className="h-5 w-5" />} hint="Across the squad this season" />
        <StatCard label="Wickets" value={totalWickets} icon={<Zap className="h-5 w-5" />} tone="orange" hint="Bowling contributions" />
        <StatCard label="Best average" value={bestAverage.toFixed(1)} icon={<TrendingUp className="h-5 w-5" />} tone="grass" hint="Leading batter" />
        <StatCard label="Win rate" value={`${winRate}%`} icon={<Trophy className="h-5 w-5" />} tone="blue" hint={`${wins} of ${completed.length} completed`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <ChartCard title="Runs by player" subtitle="Top eight run scorers" className="xl:col-span-2">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRuns} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 8.5, fill: '#98A2B3' }} axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" height={54} />
                <YAxis tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value} runs`, 'Runs']} />
                <Bar dataKey="runs" fill="#217346" radius={[5, 5, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Wickets by player" subtitle="Leading bowlers">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topWickets} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 8.5, fill: '#98A2B3' }} axisLine={false} tickLine={false} interval={0} angle={-22} textAnchor="end" height={58} />
                <YAxis tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value} wickets`, 'Wickets']} />
                <Bar dataKey="wickets" fill="#FF9F43" radius={[5, 5, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="card overflow-hidden xl:col-span-2">
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-[15px] font-bold text-forest">Squad leaderboard</h3>
              <p className="mt-0.5 text-[10.5px] text-slateink-light">Sorted by the selected metric.</p>
            </div>
            <Tabs
              options={[
                { value: 'runs', label: 'Runs' },
                { value: 'wickets', label: 'Wickets' },
                { value: 'strikeRate', label: 'Strike rate' },
              ]}
              value={metric}
              onChange={(value) => setMetric(value as Metric)}
              size="sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="border-y border-forest/[0.06] bg-offwhite/60">
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th">Player</th>
                  <th className="table-th">Role</th>
                  <th className="table-th text-right">Mat</th>
                  <th className="table-th text-right">Runs</th>
                  <th className="table-th text-right">Avg</th>
                  <th className="table-th text-right">SR</th>
                  <th className="table-th text-right">Wkts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/[0.05]">
                {sortedPlayers.map((player, index) => (
                  <tr key={player.id} className="transition hover:bg-offwhite/50">
                    <td className="table-td text-[11px] font-bold text-slateink-faint">{index + 1}</td>
                    <td className="table-td">
                      <p className="text-[11.5px] font-bold text-forest">{player.name}</p>
                      <p className="text-[9.5px] text-slateink-light">#{player.jersey}</p>
                    </td>
                    <td className="table-td text-[10px] text-slateink-light">{player.role}</td>
                    <td className="table-td text-right text-[11px]">{player.matches}</td>
                    <td className={cn('table-td text-right text-[11.5px]', metric === 'runs' && 'font-bold text-cricket')}>{player.runs}</td>
                    <td className="table-td text-right text-[11px]">{player.avg.toFixed(1)}</td>
                    <td className={cn('table-td text-right text-[11px]', metric === 'strikeRate' && 'font-bold text-cricket')}>{player.strikeRate.toFixed(1)}</td>
                    <td className={cn('table-td text-right text-[11px]', metric === 'wickets' && 'font-bold text-cricket')}>{player.wickets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <ChartCard title="Team form" subtitle="Scored vs conceded">
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={teamTrend} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="captainPerf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8BCB75" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#8BCB75" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                  <XAxis dataKey="match" tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="scored" stroke="#217346" strokeWidth={2} fill="url(#captainPerf)" />
                  <Area type="monotone" dataKey="conceded" stroke="#FF9F43" strokeWidth={1.6} fill="none" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
              <Sparkles className="h-3.5 w-3.5 text-cricket" /> Selection insight
            </p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-slateink-light">
              {team.players.length} players are registered. Your top scorer has {topRuns[0]?.runs ?? 0} runs this season,
              while {topWickets[0]?.name ?? 'your lead bowler'} leads the attack with {topWickets[0]?.wickets ?? 0} wickets.
            </p>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-forest">
              <Crown className="h-4 w-4 text-matchday" /> Captain's call
            </h3>
            <p className="mt-2 text-[11px] leading-relaxed text-slateink-light">
              Rotate the bowling attack every three overs and keep one frontline bowler for the death. Back the inform
              batter at number three.
            </p>
            <Link to="/captain/team" className={buttonStyles('outline', 'sm', 'mt-3')}>
              Review squad <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
