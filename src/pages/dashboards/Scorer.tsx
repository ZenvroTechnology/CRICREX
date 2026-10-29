import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Download,
  History as HistoryIcon,
  MapPin,
  Play,
  Radio,
  RotateCcw,
  Search,
  ShieldCheck,
  Timer,
  Trophy,
  Undo2,
  Users,
  XCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ChartCard, tooltipStyle } from '@/components/dashboard/ChartCard';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { useApp } from '@/context/AppContext';
import { matches } from '@/data/mock';
import { cn, formatDate, oversFromBalls, relativeDay } from '@/lib/utils';
import type { InningsState, Match } from '@/types';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const runRateData = [
  { over: '1', runs: 6 },
  { over: '3', runs: 21 },
  { over: '5', runs: 38 },
  { over: '7', runs: 54 },
  { over: '9', runs: 72 },
  { over: '11', runs: 89 },
  { over: '13', runs: 107 },
  { over: '15', runs: 124 },
  { over: '17', runs: 143 },
  { over: '19', runs: 158 },
];

const initialInnings: InningsState = {
  runs: 128,
  wickets: 4,
  balls: 86,
  extras: 6,
  batsmen: [
    { name: 'Rohan Kulkarni', runs: 58, balls: 42, fours: 6, sixes: 2, onStrike: true },
    { name: 'Manish Pandey', runs: 31, balls: 25, fours: 3, sixes: 0, onStrike: false },
  ],
  bowler: { name: 'Aakash Menon', overs: 3, balls: 2, runs: 24, wickets: 1, maidens: 0 },
  timeline: ['1', '4', '0', 'W', '2', '6'],
};

const firstInningsBatting = [
  { name: 'Rohan Kulkarni', runs: 58, balls: 42, fours: 6, sixes: 2, sr: 138.1, dismissal: 'c Menon b Iyer' },
  { name: 'Vikram Suresh', runs: 24, balls: 18, fours: 3, sixes: 0, sr: 133.3, dismissal: 'b Prasad' },
  { name: 'Manish Pandey', runs: 31, balls: 25, fours: 3, sixes: 0, sr: 124.0, dismissal: 'not out' },
  { name: 'Deepak Nayak', runs: 12, balls: 11, fours: 1, sixes: 0, sr: 109.1, dismissal: 'run out' },
  { name: 'Anil Kumar', runs: 9, balls: 7, fours: 1, sixes: 0, sr: 128.6, dismissal: 'not out' },
];

const firstInningsBowling = [
  { name: 'Aakash Menon', overs: '4.0', runs: 28, wickets: 2, maidens: 0, economy: 7.0 },
  { name: 'Kiran Rao', overs: '4.0', runs: 31, wickets: 1, maidens: 1, economy: 7.75 },
  { name: 'Pavan Reddy', overs: '4.0', runs: 22, wickets: 1, maidens: 0, economy: 5.5 },
  { name: 'Suresh Babu', overs: '4.0', runs: 26, wickets: 0, maidens: 0, economy: 6.5 },
];

function liveScore(match: Match): string {
  return match.scoreA ?? 'Yet to bat';
}

export function ScorerHome() {
  const { user, pushToast } = useApp();
  const assigned = matches.filter((match) => match.scorer === user?.name);
  const live = assigned.find((match) => match.status === 'Live');
  const upcoming = assigned.filter((match) => match.status === 'Upcoming');
  const completed = assigned.filter((match) => match.status === 'Completed');

  return (
    <div>
      <PageHeader
        eyebrow="Scorer workspace"
        title="Match scoring"
        description="Your assigned fixtures, live innings controls and completed scorecards — all in one demo workspace."
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ title: 'Scorecard export (demo)', description: 'No file was created in this frontend build.', tone: 'info' })}>Export</Button>
            <Link to="/scorer/live" className={buttonStyles('primary', 'md')}>
              <Radio className="h-4 w-4" /> Open live scoring
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned matches" value={assigned.length} icon={<ClipboardList className="h-5 w-5" />} hint={`${upcoming.length} upcoming · ${completed.length} completed`} />
        <StatCard label="Live now" value={live ? 1 : 0} icon={<Radio className="h-5 w-5" />} tone="orange" hint={live ? `${live.teamA} vs ${live.teamB}` : 'No match in progress'} />
        <StatCard label="Scorecards filed" value={completed.length + 6} icon={<CheckCircle2 className="h-5 w-5" />} tone="grass" hint="Including historical demo records" />
        <StatCard label="Scoring accuracy" value="99.2%" icon={<ShieldCheck className="h-5 w-5" />} tone="blue" hint="Simulated quality metric" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {live ? (
            <div className="relative overflow-hidden rounded-2xl bg-forest p-6 text-white shadow-card">
              <div className="absolute inset-0 hero-grid opacity-40" />
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-grass/15 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-200">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-red-400" /> Live now
                  </span>
                  <span className="text-[10.5px] text-white/50">{live.tournament} · {live.overs} overs</span>
                </div>
                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl font-extrabold text-white">{live.teamA}</p>
                    <p className="mt-1 font-mono text-3xl font-bold text-grass">{live.scoreA ?? '0/0'}</p>
                    <p className="mt-1 text-[11px] text-white/50">vs {live.teamB} · {live.ground}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Projected</p>
                    <p className="font-display text-xl font-extrabold text-matchday">164</p>
                    <p className="text-[10px] text-white/40">at 8.9 runs per over</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to="/scorer/live" className={buttonStyles('accent', 'md')}>
                    <Play className="h-4 w-4" /> Continue scoring
                  </Link>
                  <Link to="/scorer/scorecards" className={buttonStyles('ghost', 'md', 'border border-white/20 text-white hover:bg-white/10 hover:text-white')}>
                    <ClipboardList className="h-4 w-4" /> Scorecard
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <EmptyState icon={<Radio className="h-6 w-6" />} title="No live match" description="Your next assigned fixture will appear here when scoring starts." />
            </div>
          )}

          <div className="card mt-5 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Upcoming assignments</h3>
                <p className="mt-0.5 text-[11px] text-slateink-light">Matches assigned to you by the demo admin.</p>
              </div>
              <Link to="/scorer/matches" className="text-[10.5px] font-bold text-cricket hover:text-forest">View all</Link>
            </div>
            <div className="divide-y divide-forest/[0.05] border-t border-forest/[0.06]">
              {upcoming.slice(0, 3).map((match) => (
                <div key={match.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-cricket/10 text-cricket">
                    <CalendarCheck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-forest">{match.teamA} vs {match.teamB}</p>
                    <p className="flex items-center gap-1 text-[10px] text-slateink-light"><MapPin className="h-2.5 w-2.5" /> {match.ground} · {relativeDay(match.date)} · {match.time}</p>
                  </div>
                  <Badge tone="info">{match.tournament}</Badge>
                  <Link to="/scorer/live" className={buttonStyles('outline', 'sm')}>Prepare</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <ChartCard title="Run progression" subtitle="Live match — runs by over">
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={runRateData} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scorerRuns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF9F43" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#FF9F43" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#123D2A" strokeOpacity={0.06} vertical={false} />
                  <XAxis dataKey="over" tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} formatter={(value) => [`${value} runs`, 'Score']} />
                  <Area type="monotone" dataKey="runs" stroke="#FF9F43" strokeWidth={2.2} fill="url(#scorerRuns)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="card p-5">
            <h3 className="font-display text-[15px] font-bold text-forest">Recent scorecards</h3>
            <div className="mt-3 space-y-3">
              {completed.slice(0, 3).map((match) => (
                <div key={match.id} className="rounded-xl border border-forest/[0.07] p-3">
                  <p className="text-[11.5px] font-bold text-forest">{match.teamA} vs {match.teamB}</p>
                  <p className="mt-0.5 text-[10px] text-slateink-light">{formatDate(match.date)} · {match.ground}</p>
                  <p className="mt-1 text-[10px] font-semibold text-cricket">{match.result}</p>
                </div>
              ))}
            </div>
            <Link to="/scorer/history" className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-bold text-cricket hover:text-forest">
              Open scoring history <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A5000]"><Timer className="h-3.5 w-3.5" /> Matchday tip</p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#9A6A2A]">
              Use undo immediately if you mis-tap a delivery. Live scoring in this demo never leaves your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScorerMatches() {
  const { user, pushToast } = useApp();
  const assigned = matches.filter((match) => match.scorer === user?.name);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState<Match | null>(null);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});

  const filtered = assigned.filter((match) => {
    if (tab !== 'all' && match.status.toLowerCase() !== tab) return false;
    const text = `${match.teamA} ${match.teamB} ${match.tournament} ${match.ground}`.toLowerCase();
    return !query || text.includes(query.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        eyebrow="Assignments"
        title="Assigned matches"
        description="Confirm your availability, review fixtures and jump into live scoring when the first ball is bowled."
        actions={<Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ title: 'Assignment sheet simulated', description: 'No file was downloaded.', tone: 'info' })}>Download sheet</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total assignments" value={assigned.length} icon={<ClipboardList className="h-5 w-5" />} hint="Across all demo tournaments" />
        <StatCard label="Upcoming" value={assigned.filter((match) => match.status === 'Upcoming').length} icon={<CalendarCheck className="h-5 w-5" />} tone="blue" hint="Awaiting first ball" />
        <StatCard label="Live" value={assigned.filter((match) => match.status === 'Live').length} icon={<Radio className="h-5 w-5" />} tone="orange" hint="Scoring window open" />
        <StatCard label="Completed" value={assigned.filter((match) => match.status === 'Completed').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="grass" hint="Scorecards filed" />
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
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search teams or venue" aria-label="Search assigned matches" className="h-9 w-full rounded-lg border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs focus:border-cricket focus:bg-white focus:outline-none" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState className="m-5 border-0 bg-transparent" icon={<ClipboardList className="h-6 w-6" />} title="No matches in this view" description="Try another tab or clear the search to see your assignments." />
        ) : (
          <div className="divide-y divide-forest/[0.05]">
            {filtered.map((match) => (
              <div key={match.id} className="flex flex-col gap-3 p-4 transition hover:bg-offwhite/40 sm:flex-row sm:items-center sm:px-5">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', match.status === 'Live' ? 'bg-red-50 text-red-600' : 'bg-cricket/10 text-cricket')}>
                    {match.status === 'Live' ? <Radio className="h-5 w-5" /> : <CalendarCheck className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-bold text-forest">{match.teamA} vs {match.teamB}</p>
                      <StatusBadge status={match.status} />
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10.5px] text-slateink-light">
                      <span>{match.tournament}</span>
                      <span>•</span>
                      <span>{relativeDay(match.date)} · {match.time}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {match.ground}</span>
                    </p>
                    <p className="mt-1 text-[10px] text-slateink-faint">Umpire: {match.umpire} · {match.overs} overs</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAccepted((current) => ({ ...current, [match.id]: !current[match.id] }));
                      pushToast({ title: accepted[match.id] ? 'Availability withdrawn' : 'Availability confirmed', description: `${match.teamA} vs ${match.teamB} · demo only.`, tone: accepted[match.id] ? 'info' : 'success' });
                    }}
                    className={cn('rounded-lg px-2.5 py-1.5 text-[10.5px] font-bold transition', accepted[match.id] ? 'bg-success/10 text-success' : 'border border-forest/10 text-slateink hover:border-cricket/30 hover:text-cricket')}
                  >
                    {accepted[match.id] ? 'Available' : 'Set available'}
                  </button>
                  <button type="button" onClick={() => setViewing(match)} className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket">Details</button>
                  {match.status === 'Live' && <Link to="/scorer/live" className={buttonStyles('primary', 'sm')}>Score live</Link>}
                  {match.status === 'Completed' && <Link to="/scorer/scorecards" className={buttonStyles('outline', 'sm')}>Scorecard</Link>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-display text-[15px] font-bold text-forest">Scoring checklist</h3>
          <ul className="mt-3 space-y-2.5">
            {[
              'Confirm both team sheets before the toss.',
              'Record the toss result and opening batter/bowler.',
              'Sync the scoreboard after every over.',
              'Submit the final scorecard within 30 minutes.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-[11.5px] text-slateink-light">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest"><Users className="h-3.5 w-3.5 text-cricket" /> Demo assignment data</p>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-slateink-light">
            The admin demo account assigns matches to Nikhil Deshpande. Faisal Ahmed owns a second set of assignments in
            the sample data, but you are viewing the signed-in scorer’s list.
          </p>
        </div>
      </div>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title="Match assignment" description={viewing ? `${viewing.teamA} vs ${viewing.teamB}` : ''} size="md">
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
                ['Umpire', viewing.umpire],
                ['Scorer', viewing.scorer],
                ['Current score', liveScore(viewing)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-forest/[0.07] p-3">
                  <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{label}</dt>
                  <dd className="mt-0.5 text-[12px] font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              {viewing.status !== 'Completed' && (
                <Link to="/scorer/live" className={buttonStyles('primary', 'md')}>Open scoring console</Link>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function ScorerLive() {
  const { user, pushToast } = useApp();
  const liveMatch = matches.find((match) => match.status === 'Live') ?? matches[0];
  const [innings, setInnings] = useState<InningsState>(initialInnings);
  const [past, setPast] = useState<InningsState[]>([]);
  const [wicketOpen, setWicketOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [dismissal, setDismissal] = useState('Caught');
  const [newBatter, setNewBatter] = useState('Pavan Reddy');
  const [inningsClosed, setInningsClosed] = useState(false);

  const overs = oversFromBalls(innings.balls);
  const runRate = innings.balls > 0 ? (innings.runs / (innings.balls / 6)).toFixed(2) : '0.00';
  const target = 169;
  const remaining = Math.max(0, target - innings.runs);
  const ballsLeft = Math.max(0, liveMatch.overs * 6 - innings.balls);
  const requiredRate = ballsLeft > 0 ? ((remaining / ballsLeft) * 6).toFixed(2) : '—';
  const striker = innings.batsmen.find((batter) => batter.onStrike) ?? innings.batsmen[0];
  const partner = innings.batsmen.find((batter) => !batter.onStrike) ?? innings.batsmen[1];

  const commit = (next: InningsState) => {
    setPast((current) => [...current.slice(-24), innings]);
    setInnings(next);
  };

  const addRuns = (runs: number) => {
    if (inningsClosed) return;
    const nextBatsmen = innings.batsmen.map((batter) =>
      batter.onStrike ? { ...batter, runs: batter.runs + runs, balls: batter.balls + 1, fours: batter.fours + (runs === 4 ? 1 : 0), sixes: batter.sixes + (runs === 6 ? 1 : 0) } : batter,
    );
    commit({
      ...innings,
      runs: innings.runs + runs,
      balls: innings.balls + 1,
      batsmen: nextBatsmen,
      bowler: { ...innings.bowler, balls: innings.bowler.balls + 1, runs: innings.bowler.runs + runs },
      timeline: [...innings.timeline, String(runs)],
    });
    if (runs % 2 === 1) {
      setInnings((current) => ({
        ...current,
        batsmen: current.batsmen.map((batter) => ({ ...batter, onStrike: !batter.onStrike })),
      }));
    }
  };

  const addExtra = (type: 'Wide' | 'No ball' | 'Bye' | 'Leg bye') => {
    if (inningsClosed) return;
    const legal = type === 'Bye' || type === 'Leg bye';
    const nextBatsmen = innings.batsmen.map((batter) =>
      batter.onStrike && legal ? { ...batter, balls: batter.balls + 1 } : batter,
    );
    commit({
      ...innings,
      runs: innings.runs + 1,
      extras: innings.extras + 1,
      balls: innings.balls + (legal ? 1 : 0),
      batsmen: nextBatsmen,
      bowler: { ...innings.bowler, balls: innings.bowler.balls + (legal ? 1 : 0), runs: innings.bowler.runs + 1 },
      timeline: [...innings.timeline, type === 'Wide' ? 'wd' : type === 'No ball' ? 'nb' : type === 'Bye' ? 'b' : 'lb'],
    });
    pushToast({ title: `${type} recorded`, description: `One extra added. ${legal ? 'Ball counts.' : 'Ball does not count.'}`, tone: 'info' });
  };

  const recordWicket = () => {
    if (innings.wickets >= 9) {
      pushToast({ title: 'All out', description: 'Ten wickets have fallen. End the innings to continue.', tone: 'warning' });
      return;
    }
    const nextBatsmen = innings.batsmen.map((batter) =>
      batter.onStrike
        ? { name: newBatter || 'New batter', runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: true }
        : batter,
    );
    commit({
      ...innings,
      wickets: innings.wickets + 1,
      balls: innings.balls + 1,
      batsmen: nextBatsmen,
      bowler: { ...innings.bowler, balls: innings.bowler.balls + 1, wickets: innings.bowler.wickets + 1 },
      timeline: [...innings.timeline, 'W'],
    });
    setWicketOpen(false);
    pushToast({ title: `Wicket — ${dismissal.toLowerCase()}`, description: `${newBatter || 'New batter'} is in. ${innings.wickets + 1} down.`, tone: 'warning' });
  };

  const undo = () => {
    if (past.length === 0) {
      pushToast({ title: 'Nothing to undo', description: 'No deliveries have been recorded in this session yet.', tone: 'info' });
      return;
    }
    const previous = past[past.length - 1];
    setPast((current) => current.slice(0, -1));
    setInnings(previous);
    pushToast({ title: 'Last delivery undone', description: 'The innings is back to the previous state.', tone: 'info' });
  };

  const reset = () => {
    setPast([]);
    setInnings(initialInnings);
    setInningsClosed(false);
    pushToast({ title: 'Scoring console reset', description: 'Back to the sample live innings for this demo.', tone: 'info' });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Live scoring"
        title="Ball-by-ball console"
        description="A fully interactive demo innings. Every run, extra and wicket updates the scorecard in this browser only."
        actions={
          <>
            <Button variant="outline" icon={<Undo2 className="h-4 w-4" />} onClick={undo} disabled={past.length === 0}>Undo</Button>
            <Button variant="outline" icon={<RotateCcw className="h-4 w-4" />} onClick={reset}>Reset demo</Button>
          </>
        }
      />

      {inningsClosed && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-success/20 bg-success/[0.07] px-4 py-3">
          <p className="flex items-center gap-2 text-[12px] font-bold text-success"><CheckCircle2 className="h-4 w-4" /> Innings closed at {innings.runs}/{innings.wickets} after {overs} overs.</p>
          <Button size="sm" variant="outline" onClick={reset}>Start fresh innings</Button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl bg-forest p-5 text-white shadow-card sm:p-6">
            <div className="absolute inset-0 hero-grid opacity-40" />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-red-200">
                      <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-red-400" /> Live
                    </span>
                    <span className="text-[10px] text-white/45">{liveMatch.tournament}</span>
                  </div>
                  <p className="mt-3 font-display text-lg font-bold text-white">{liveMatch.teamA} <span className="text-white/40">vs</span> {liveMatch.teamB}</p>
                  <p className="text-[10.5px] text-white/45">{liveMatch.ground} · {liveMatch.overs} overs · Umpire {liveMatch.umpire}</p>
                </div>
                <Badge tone="orange">Scorer: {user?.name.split(' ')[0]}</Badge>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-6">
                <div>
                  <p className="font-display text-5xl font-extrabold leading-none text-white">{innings.runs}<span className="text-2xl text-white/45">/{innings.wickets}</span></p>
                  <p className="mt-1.5 text-[11px] text-white/50">{overs} overs · CRR {runRate}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 border-l border-white/10 pl-5 text-center">
                  <div>
                    <p className="font-display text-lg font-extrabold text-grass">{remaining}</p>
                    <p className="text-[8.5px] uppercase tracking-wide text-white/35">Runs needed</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-extrabold text-white">{ballsLeft}</p>
                    <p className="text-[8.5px] uppercase tracking-wide text-white/35">Balls left</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-extrabold text-matchday">{requiredRate}</p>
                    <p className="text-[8.5px] uppercase tracking-wide text-white/35">Req. rate</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-3 text-[10px] text-white/55">
                <span>Target {target}</span>
                <span className="text-white/20">•</span>
                <span>Extras {innings.extras}</span>
                <span className="text-white/20">•</span>
                <span>Bowler {innings.bowler.name}: {oversFromBalls(innings.bowler.balls)}–{innings.bowler.maidens}–{innings.bowler.runs}–{innings.bowler.wickets}</span>
              </div>
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Record a delivery</h3>
                <p className="mt-0.5 text-[10.5px] text-slateink-light">Tap a outcome to update the innings instantly.</p>
              </div>
              <span className="rounded-full bg-forest/[0.05] px-3 py-1 text-[10px] font-bold text-forest">Ball {innings.balls + 1} of {liveMatch.overs * 6}</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {[0, 1, 2, 3, 4, 6].map((run) => (
                <button
                  key={run}
                  type="button"
                  onClick={() => addRuns(run)}
                  disabled={inningsClosed}
                  aria-label={`Record ${run} run${run === 1 ? '' : 's'}`}
                  className={cn(
                    'flex h-14 items-center justify-center rounded-xl font-display text-xl font-extrabold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40',
                    run === 4 || run === 6 ? 'bg-matchday/15 text-[#B25E00] hover:bg-matchday/25' : 'bg-forest/[0.05] text-forest hover:bg-forest/10',
                  )}
                >
                  {run}
                </button>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                ['Wide', 'wd'], ['No ball', 'nb'], ['Bye', 'b'], ['Leg bye', 'lb'],
              ] as const).map(([label, short]) => (
                <button key={label} type="button" onClick={() => addExtra(label)} disabled={inningsClosed} className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-forest/10 text-[11px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket disabled:opacity-40">
                  {label} <span className="text-[9px] text-slateink-faint">{short}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setWicketOpen(true)}
                disabled={inningsClosed}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
              >
                <XCircle className="h-4 w-4" /> Record wicket
              </button>
              <Button variant="outline" className="h-12 flex-1" onClick={() => setEndOpen(true)} disabled={inningsClosed}>
                <Timer className="h-4 w-4" /> End innings
              </Button>
            </div>

            <div className="mt-4 rounded-xl bg-offwhite p-3">
              <p className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">This over</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {innings.timeline.slice(-6).map((ball, index) => (
                  <span key={`${ball}-${index}`} className={cn('flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-extrabold', ball === 'W' ? 'bg-red-100 text-red-700' : ball === '4' || ball === '6' ? 'bg-matchday/20 text-[#B25E00]' : 'bg-white text-forest ring-1 ring-inset ring-forest/10')}>
                    {ball}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <h3 className="font-display text-[15px] font-bold text-forest">Current batters</h3>
              <Link to="/scorer/scorecards" className="text-[10.5px] font-bold text-cricket hover:text-forest">Full scorecard</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead className="border-y border-forest/[0.06] bg-offwhite/60">
                  <tr>
                    <th className="table-th">Batter</th>
                    <th className="table-th text-right">R</th>
                    <th className="table-th text-right">B</th>
                    <th className="table-th text-right">4s</th>
                    <th className="table-th text-right">6s</th>
                    <th className="table-th text-right">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/[0.05]">
                  {[striker, partner].filter(Boolean).map((batter) => (
                    <tr key={batter.name} className={batter.onStrike ? 'bg-cricket/[0.025]' : ''}>
                      <td className="table-td text-[12px] font-semibold text-forest">
                        {batter.name} {batter.onStrike && <span className="ml-1 text-[9px] font-bold text-cricket">*</span>}
                      </td>
                      <td className="table-td text-right text-[12px] font-bold">{batter.runs}</td>
                      <td className="table-td text-right text-[11.5px]">{batter.balls}</td>
                      <td className="table-td text-right text-[11.5px]">{batter.fours}</td>
                      <td className="table-td text-right text-[11.5px]">{batter.sixes}</td>
                      <td className="table-td text-right text-[11.5px]">{batter.balls ? ((batter.runs / batter.balls) * 100).toFixed(1) : '0.0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[15px] font-bold text-forest">Match state</h3>
              <StatusBadge status={inningsClosed ? 'Completed' : 'Live'} />
            </div>
            <dl className="mt-4 space-y-3 text-[11.5px]">
              {[
                ['Innings', '1st innings'],
                ['Score', `${innings.runs}/${innings.wickets}`],
                ['Overs', overs],
                ['Run rate', runRate],
                ['Extras', String(innings.extras)],
                ['Timeline balls', String(innings.timeline.length)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <dt className="text-slateink-light">{label}</dt>
                  <dd className="font-bold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 rounded-xl border border-forest/[0.07] bg-offwhite p-3">
              <p className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">Bowler figures</p>
              <p className="mt-1 text-[12px] font-bold text-forest">{innings.bowler.name}</p>
              <p className="text-[10.5px] text-slateink-light">{oversFromBalls(innings.bowler.balls)}–{innings.bowler.maidens}–{innings.bowler.runs}–{innings.bowler.wickets} · Econ {innings.bowler.balls ? (innings.bowler.runs / (innings.bowler.balls / 6)).toFixed(2) : '0.00'}</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-[15px] font-bold text-forest">Scoring shortcuts</h3>
            <ul className="mt-3 space-y-2 text-[10.5px] leading-relaxed text-slateink-light">
              <li><span className="font-bold text-forest">0–6</span> — legal delivery, runs added to striker.</li>
              <li><span className="font-bold text-forest">Wide / No ball</span> — one extra, ball does not count.</li>
              <li><span className="font-bold text-forest">Bye / Leg bye</span> — one extra, ball counts.</li>
              <li><span className="font-bold text-forest">Undo</span> — restores the previous innings state.</li>
            </ul>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/[0.07] p-2.5 text-[10px] font-semibold text-success">
              <ShieldCheck className="h-3.5 w-3.5" /> Autosaved in component state
            </div>
          </div>

          <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest"><Activity className="h-3.5 w-3.5 text-cricket" /> Demo scoring only</p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-slateink-light">
              Refreshing the page resets this console to the seeded innings. No match data is sent anywhere.
            </p>
          </div>
        </div>
      </div>

      <Modal open={wicketOpen} onClose={() => setWicketOpen(false)} title="Record a wicket" description={`Ball ${innings.balls + 1} of the innings`} size="sm">
        <div className="space-y-4">
          <div className="rounded-xl bg-red-50 p-3 text-[11px] leading-relaxed text-red-700">
            {striker?.name} will be replaced. The wicket is added to {innings.bowler.name}'s figures.
          </div>
          <Select label="Dismissal type" value={dismissal} onChange={(event) => setDismissal(event.target.value)}>
            {['Caught', 'Bowled', 'LBW', 'Run out', 'Stumped', 'Hit wicket'].map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Input label="Incoming batter" value={newBatter} onChange={(event) => setNewBatter(event.target.value)} placeholder="Player name" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setWicketOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={recordWicket}>Confirm wicket</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={endOpen}
        onClose={() => setEndOpen(false)}
        onConfirm={() => {
          setEndOpen(false);
          setInningsClosed(true);
          pushToast({ title: 'Innings ended (demo)', description: `${liveMatch.teamA} finished on ${innings.runs}/${innings.wickets} after ${overs} overs.`, tone: 'success' });
        }}
        title="End this innings?"
        description={`The innings will be closed at ${innings.runs}/${innings.wickets} after ${overs} overs. This is a simulated action and can be reset.`}
        confirmLabel="End innings"
        tone="primary"
        icon={<Timer className="h-6 w-6" />}
      />
    </div>
  );
}

interface ScorecardData {
  label: string;
  score: string;
  batting: { name: string; runs: number; balls: number; fours: number; sixes: number; sr: number; dismissal: string }[];
  bowling: { name: string; overs: string; runs: number; wickets: number; maidens: number; economy: number }[];
}

const secondInningsBatting = [
  { name: 'Aakash Menon', runs: 44, balls: 31, fours: 5, sixes: 1, sr: 141.9, dismissal: 'c Pandey b Rao' },
  { name: 'Rahul Shetty', runs: 37, balls: 28, fours: 4, sixes: 0, sr: 132.1, dismissal: 'b Babu' },
  { name: 'Ishaan Patel', runs: 26, balls: 22, fours: 2, sixes: 1, sr: 118.2, dismissal: 'not out' },
  { name: 'Ayesha Khan', runs: 14, balls: 12, fours: 1, sixes: 0, sr: 116.7, dismissal: 'run out' },
  { name: 'Faisal Ahmed', runs: 8, balls: 9, fours: 0, sixes: 0, sr: 88.9, dismissal: 'not out' },
];

const secondInningsBowling = [
  { name: 'Kiran Rao', overs: '4.0', runs: 26, wickets: 2, maidens: 0, economy: 6.5 },
  { name: 'Suresh Babu', overs: '4.0', runs: 31, wickets: 1, maidens: 0, economy: 7.75 },
  { name: 'Anil Kumar', overs: '3.2', runs: 22, wickets: 1, maidens: 0, economy: 6.6 },
  { name: 'Yash Gupta', overs: '4.0', runs: 28, wickets: 0, maidens: 1, economy: 7.0 },
];

export function ScorerScorecards() {
  const { user, pushToast } = useApp();
  const assigned = matches.filter((match) => match.scorer === user?.name);
  const completed = assigned.filter((match) => match.status === 'Completed');
  const [selectedId, setSelectedId] = useState(completed[0]?.id ?? matches[0].id);
  const [inningsTab, setInningsTab] = useState('first');
  const selected = matches.find((match) => match.id === selectedId) ?? matches[0];

  const cards: Record<string, ScorecardData> = {
    first: {
      label: `${selected.teamA} innings`,
      score: selected.scoreA ?? '168/6 (20)',
      batting: firstInningsBatting,
      bowling: firstInningsBowling,
    },
    second: {
      label: `${selected.teamB} innings`,
      score: selected.scoreB ?? '144/9 (20)',
      batting: secondInningsBatting,
      bowling: secondInningsBowling,
    },
  };
  const card = cards[inningsTab];

  return (
    <div>
      <PageHeader
        eyebrow="Scorecards"
        title="Completed scorecards"
        description="Review batting and bowling cards for your filed matches. These are sample records with full detail."
        actions={<Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ title: 'PDF export simulated', description: 'No document was generated in this demo.', tone: 'info' })}>Download PDF</Button>}
      />

      <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block flex-1 text-[10px] font-bold uppercase tracking-wider text-slateink-faint">
          Match
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-forest/10 bg-white px-3 text-xs font-semibold text-forest focus:border-cricket focus:outline-none focus:ring-4 focus:ring-cricket/10">
            {[...completed, ...assigned.filter((match) => match.status !== 'Completed')].map((match) => (
              <option key={match.id} value={match.id}>{match.teamA} vs {match.teamB} · {formatDate(match.date)}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={selected.status === 'Completed' ? 'success' : 'info'}>{selected.status}</Badge>
          <Badge tone="neutral">{selected.tournament}</Badge>
          <Badge tone="neutral">{selected.ground}</Badge>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="card overflow-hidden">
          <div className="border-b border-forest/[0.07] bg-forest px-5 py-5 text-white">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-grass">{selected.tournament}</p>
                <h2 className="mt-1 font-display text-xl font-bold text-white">{selected.teamA} vs {selected.teamB}</h2>
                <p className="mt-0.5 text-[10.5px] text-white/50">{formatDate(selected.date, 'long')} · {selected.ground} · {selected.overs} overs</p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-extrabold text-grass">{card.score}</p>
                <p className="text-[10px] text-white/50">{card.label}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-5 pt-4">
            <Tabs
              options={[
                { value: 'first', label: '1st innings' },
                { value: 'second', label: '2nd innings' },
              ]}
              value={inningsTab}
              onChange={setInningsTab}
              size="sm"
            />
            <button type="button" onClick={() => pushToast({ title: 'Share link simulated', description: 'Scorecard links are not generated in this demo.', tone: 'info' })} className="text-[10.5px] font-bold text-cricket hover:text-forest">Share</button>
          </div>

          <div className="px-5 pb-2 pt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slateink-faint">Batting</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead className="border-y border-forest/[0.06] bg-offwhite/60">
                <tr>
                  <th className="table-th">Batter</th>
                  <th className="table-th">Dismissal</th>
                  <th className="table-th text-right">R</th>
                  <th className="table-th text-right">B</th>
                  <th className="table-th text-right">4s</th>
                  <th className="table-th text-right">6s</th>
                  <th className="table-th text-right">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/[0.05]">
                {card.batting.map((batter) => (
                  <tr key={batter.name}>
                    <td className="table-td text-[12px] font-semibold text-forest">{batter.name}</td>
                    <td className="table-td whitespace-normal text-[10.5px] text-slateink-light">{batter.dismissal}</td>
                    <td className="table-td text-right text-[12px] font-bold">{batter.runs}</td>
                    <td className="table-td text-right text-[11.5px]">{batter.balls}</td>
                    <td className="table-td text-right text-[11.5px]">{batter.fours}</td>
                    <td className="table-td text-right text-[11.5px]">{batter.sixes}</td>
                    <td className="table-td text-right text-[11.5px]">{batter.sr.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 pb-2 pt-5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slateink-faint">Bowling</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead className="border-y border-forest/[0.06] bg-offwhite/60">
                <tr>
                  <th className="table-th">Bowler</th>
                  <th className="table-th text-right">O</th>
                  <th className="table-th text-right">M</th>
                  <th className="table-th text-right">R</th>
                  <th className="table-th text-right">W</th>
                  <th className="table-th text-right">Econ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/[0.05]">
                {card.bowling.map((bowler) => (
                  <tr key={bowler.name}>
                    <td className="table-td text-[12px] font-semibold text-forest">{bowler.name}</td>
                    <td className="table-td text-right text-[11.5px]">{bowler.overs}</td>
                    <td className="table-td text-right text-[11.5px]">{bowler.maidens}</td>
                    <td className="table-td text-right text-[11.5px]">{bowler.runs}</td>
                    <td className="table-td text-right text-[12px] font-bold">{bowler.wickets}</td>
                    <td className="table-td text-right text-[11.5px]">{bowler.economy.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-display text-[15px] font-bold text-forest">Match summary</h3>
            {selected.result && <p className="mt-2 rounded-xl bg-success/[0.07] p-3 text-[11.5px] font-semibold leading-relaxed text-success">{selected.result}</p>}
            <dl className="mt-4 space-y-3 text-[11.5px]">
              {[
                ['Toss', `${selected.teamB} won, chose to field`],
                ['Umpire', selected.umpire],
                ['Scorer', selected.scorer],
                ['Match ID', selected.id.toUpperCase()],
                ['Overs', String(selected.overs)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <dt className="text-slateink-light">{label}</dt>
                  <dd className="text-right font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-[15px] font-bold text-forest">Filed matches</h3>
            <div className="mt-3 space-y-2">
              {completed.map((match) => (
                <button key={match.id} type="button" onClick={() => setSelectedId(match.id)} className={cn('w-full rounded-xl border p-3 text-left transition', selected.id === match.id ? 'border-cricket/30 bg-cricket/[0.04]' : 'border-forest/[0.07] hover:border-cricket/20')}>
                  <p className="text-[11px] font-bold text-forest">{match.teamA} vs {match.teamB}</p>
                  <p className="mt-0.5 text-[9.5px] text-slateink-light">{formatDate(match.date)} · {match.scoreA} / {match.scoreB}</p>
                </button>
              ))}
              {completed.length === 0 && <p className="text-[10.5px] text-slateink-light">No completed matches yet.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest"><BarChart3 className="h-3.5 w-3.5 text-cricket" /> Sample scorecard</p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-slateink-light">
              Batting and bowling rows are seeded demo records. The live console is the only editable scoring surface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScorerHistory() {
  const { user, pushToast } = useApp();
  const assigned = matches.filter((match) => match.scorer === user?.name);
  const completed = assigned.filter((match) => match.status === 'Completed');
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState<Match | null>(null);

  const filtered = assigned.filter((match) => {
    const text = `${match.teamA} ${match.teamB} ${match.ground} ${match.tournament}`.toLowerCase();
    return !query || text.includes(query.toLowerCase());
  });

  const wins = completed.length;

  return (
    <div>
      <PageHeader
        eyebrow="Records"
        title="Scoring history"
        description="Every match you have scored, with final scores and filed scorecards. Export is simulated."
        actions={<Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ title: 'History export simulated', description: `${filtered.length} records would be included.`, tone: 'info' })}>Export history</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total matches" value={assigned.length} icon={<ClipboardList className="h-5 w-5" />} hint="Assigned in the demo season" />
        <StatCard label="Scorecards filed" value={completed.length} icon={<CheckCircle2 className="h-5 w-5" />} tone="grass" hint="Completed matches" />
        <StatCard label="Overs recorded" value={completed.length * 20 + 86} icon={<HistoryIcon className="h-5 w-5" />} tone="blue" hint="Across all demo fixtures" />
        <StatCard label="On-time filing" value="100%" icon={<ShieldCheck className="h-5 w-5" />} tone="orange" hint="Simulated performance metric" />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-forest/[0.07] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search teams, ground or tournament" aria-label="Search scoring history" className="h-10 w-full rounded-xl border border-forest/10 bg-offwhite/60 pl-9 pr-3 text-xs focus:border-cricket focus:bg-white focus:outline-none" />
          </div>
          <Badge tone="success" icon={<Trophy className="h-3 w-3" />}>{wins} completed</Badge>
        </div>
        {filtered.length === 0 ? (
          <EmptyState className="m-5 border-0 bg-transparent" icon={<HistoryIcon className="h-6 w-6" />} title="No scoring history found" description="Try another search term to see assigned fixtures." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-forest/[0.06] bg-offwhite/60">
                <tr>
                  <th className="table-th">Match</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Venue</th>
                  <th className="table-th">Scores</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Scorecard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/[0.05]">
                {filtered.map((match) => (
                  <tr key={match.id} className="transition hover:bg-offwhite/50">
                    <td className="table-td">
                      <p className="text-[12px] font-bold text-forest">{match.teamA} vs {match.teamB}</p>
                      <p className="text-[10px] text-slateink-light">{match.tournament}</p>
                    </td>
                    <td className="table-td text-[11.5px]">{formatDate(match.date)}<p className="text-[10px] text-slateink-light">{match.time}</p></td>
                    <td className="table-td text-[11px]">{match.ground}</td>
                    <td className="table-td text-[11px]">
                      <p>{match.scoreA ?? '—'}</p>
                      <p>{match.scoreB ?? '—'}</p>
                    </td>
                    <td className="table-td"><StatusBadge status={match.status} /></td>
                    <td className="table-td text-right">
                      <button type="button" onClick={() => setViewing(match)} className="rounded-lg border border-forest/10 px-2.5 py-1.5 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title="Match record" description={viewing ? `${viewing.teamA} vs ${viewing.teamB}` : ''} size="md">
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
            {viewing.result && <p className="mt-3 rounded-xl bg-success/[0.07] p-3 text-[11.5px] font-semibold text-success">{viewing.result}</p>}
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ['Date', formatDate(viewing.date, 'long')],
                ['Start time', viewing.time],
                ['Ground', viewing.ground],
                ['Umpire', viewing.umpire],
                ['Scorer', viewing.scorer],
                ['Match ID', viewing.id.toUpperCase()],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-forest/[0.07] p-3">
                  <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slateink-faint">{label}</dt>
                  <dd className="mt-0.5 text-[11.5px] font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              <Button variant="primary" onClick={() => { setViewing(null); pushToast({ title: 'Scorecard opened (demo)', description: 'Use the Scorecards page to review the full card.', tone: 'info' }); }}>Open scorecard</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
