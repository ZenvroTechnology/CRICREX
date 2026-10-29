import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  AtSign,
  BadgeCheck,
  CalendarCheck,
  Check,
  ClipboardCheck,
  Copy,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useApp } from '@/context/AppContext';
import { roleMeta } from '@/config/roles';
import { formatDate, initials, roleSlug } from '@/lib/utils';

const tones = [
  'from-emerald-400 to-teal-700',
  'from-amber-400 to-orange-600',
  'from-sky-400 to-blue-700',
  'from-rose-400 to-red-700',
  'from-violet-400 to-purple-700',
  'from-cyan-500 to-emerald-700',
  'from-lime-400 to-green-700',
  'from-fuchsia-400 to-pink-700',
];

export function Profile() {
  const { user, bookings, updateProfile, pushToast } = useApp();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    location: '',
    team: '',
    playingRole: '',
    jerseyNumber: '',
    groundName: '',
    groundLocation: '',
    groundCapacity: '',
    scoringExperience: '',
    scoringExpertise: '',
    certification: '',
    umpireExperience: '',
    matchLevel: '',
    captaincyExperience: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tone, setTone] = useState(tones[0]);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      location: user.location,
      team: user.team ?? '',
      playingRole: user.playingRole ?? '',
      jerseyNumber: user.jerseyNumber ?? '',
      groundName: user.groundName ?? '',
      groundLocation: user.groundLocation ?? '',
      groundCapacity: user.groundCapacity ?? '',
      scoringExperience: user.scoringExperience ?? '',
      scoringExpertise: user.scoringExpertise ?? '',
      certification: user.certification ?? '',
      umpireExperience: user.umpireExperience ?? '',
      matchLevel: user.matchLevel ?? '',
      captaincyExperience: user.captaincyExperience ?? '',
    });
    setTone(user.avatarTone);
  }, [user]);

  const myBookings = useMemo(
    () => bookings.filter((booking) => booking.userEmail.toLowerCase() === user?.email.toLowerCase()),
    [bookings, user?.email],
  );

  if (!user) return null;

  const meta = roleMeta(user.role);
  const RoleIcon = meta.icon;
  const slug = roleSlug(user.role);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 3) nextErrors.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!form.phone.trim()) nextErrors.phone = 'Add a contact number for your profile.';
    if (form.username.trim().length < 3) nextErrors.username = 'Usernames need at least 3 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      pushToast({ title: 'Check the highlighted fields', description: 'A few profile details still need attention.', tone: 'warning' });
      return;
    }

    updateProfile({ ...form, avatarTone: tone });
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      pushToast({ title: 'Account ID copied', description: user.id, tone: 'success' });
    } catch {
      pushToast({ title: 'Copy unavailable', description: `Your demo ID is ${user.id}.`, tone: 'info' });
    }
  };

  const isOwner = user.role === 'Ground Owner';
  const isScorer = user.role === 'Scorer';
  const isUmpire = user.role === 'Umpire';
  const isPlayer = user.role === 'Player';
  const isCaptain = user.role === 'Captain';
  const showCricketFields = isPlayer || isCaptain || isScorer || isUmpire;

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Keep your CRICREX identity and role details up to date. Changes are saved only in this browser."
        actions={
          <Link to={`/${slug}/settings`} className={buttonStyles('outline', 'md')}>
            <ShieldCheck className="h-4 w-4" /> Account settings
          </Link>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="relative h-24 bg-forest">
              <div className="absolute inset-0 hero-grid opacity-50" />
              <div className="absolute -bottom-8 left-5 rounded-full ring-4 ring-white">
                <Avatar name={user.name} tone={tone} size="xl" />
              </div>
            </div>
            <div className="px-5 pb-5 pt-11">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold text-forest">{user.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slateink-light">
                    <AtSign className="h-3 w-3" /> {user.username}
                  </p>
                </div>
                <StatusBadge status={user.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone={user.role === 'Admin' ? 'forest' : 'grass'} icon={<RoleIcon className="h-3 w-3" />}>
                  {user.role}
                </Badge>
                <Badge tone="neutral">ID {user.id.slice(-6).toUpperCase()}</Badge>
              </div>

              <dl className="mt-4 space-y-2.5 border-t border-forest/[0.07] pt-4">
                {[
                  { icon: Mail, value: user.email },
                  { icon: Phone, value: user.phone },
                  { icon: MapPin, value: user.location },
                  { icon: CalendarCheck, value: `Member since ${formatDate(user.joinedAt)}` },
                ].map(({ icon: Icon, value }) => (
                  <div key={value} className="flex items-start gap-2 text-[11.5px] text-slateink-light">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cricket" />
                    <span className="break-words">{value}</span>
                  </div>
                ))}
              </dl>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-offwhite p-3">
                  <p className="font-display text-lg font-extrabold text-forest">{myBookings.length}</p>
                  <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slateink-faint">Bookings</p>
                </div>
                <div className="rounded-xl bg-offwhite p-3">
                  <p className="font-display text-lg font-extrabold text-forest">
                    {myBookings.filter((booking) => booking.status === 'Completed').length}
                  </p>
                  <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slateink-faint">Played</p>
                </div>
              </div>

              <button
                type="button"
                onClick={copyId}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-forest/10 py-2 text-[10.5px] font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket"
              >
                <Copy className="h-3 w-3" /> Copy account ID
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-forest">
              <Sparkles className="h-4 w-4 text-matchday" /> Avatar colour
            </h3>
            <p className="mt-1 text-[10.5px] leading-relaxed text-slateink-light">Pick a gradient for your initials. It updates across the app.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tones.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  aria-label={`Use avatar colour ${option}`}
                  aria-pressed={tone === option}
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${option} ring-offset-2 transition ${
                    tone === option ? 'ring-2 ring-cricket' : 'hover:scale-105'
                  }`}
                >
                  {tone === option && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => updateProfile({ avatarTone: tone })}>
              Apply avatar colour
            </Button>
          </div>

          <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
              <Globe2 className="h-3.5 w-3.5 text-cricket" /> Simulated identity
            </p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-slateink-light">
              This profile is not verified against any government ID, cricket board or email service. It exists only in
              localStorage for the demo.
            </p>
          </div>
        </div>

        <form onSubmit={save} noValidate className="space-y-5">
          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cricket/10 text-cricket">
                <UserRound className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Personal details</h3>
                <p className="text-[10.5px] text-slateink-light">How you appear across CRICREX.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Full name" value={form.name} onChange={(event) => setField('name', event.target.value)} error={errors.name} required />
              <Input label="Username" value={form.username} onChange={(event) => setField('username', event.target.value)} error={errors.username} icon={<AtSign className="h-4 w-4" />} required />
              <Input label="Email address" type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} error={errors.email} icon={<Mail className="h-4 w-4" />} required />
              <Input label="Phone number" value={form.phone} onChange={(event) => setField('phone', event.target.value)} error={errors.phone} icon={<Phone className="h-4 w-4" />} required />
              <Input label="Location" value={form.location} onChange={(event) => setField('location', event.target.value)} icon={<MapPin className="h-4 w-4" />} containerClassName="sm:col-span-2" hint="City and state are enough for the demo." />
            </div>
          </div>

          {isOwner && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-matchday/15 text-[#B25E00]">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-[15px] font-bold text-forest">Ground ownership</h3>
                  <p className="text-[10.5px] text-slateink-light">Details shown on your public listing.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Input label="Ground name" value={form.groundName} onChange={(event) => setField('groundName', event.target.value)} />
                <Input label="Ground location" value={form.groundLocation} onChange={(event) => setField('groundLocation', event.target.value)} />
                <Input label="Capacity" value={form.groundCapacity} onChange={(event) => setField('groundCapacity', event.target.value)} hint="Players or spectators — describe it your way." />
                <Select label="Listing state" defaultValue="Published">
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Paused</option>
                </Select>
              </div>
            </div>
          )}

          {showCricketFields && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-grass/20 text-cricket">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-[15px] font-bold text-forest">Cricket profile</h3>
                  <p className="text-[10.5px] text-slateink-light">Role-specific details used by dashboards.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {(isPlayer || isCaptain) && (
                  <>
                    <Input label="Team" value={form.team} onChange={(event) => setField('team', event.target.value)} placeholder="Club or team name" />
                    <Input label="Playing role" value={form.playingRole} onChange={(event) => setField('playingRole', event.target.value)} placeholder="e.g. Top-order batter" />
                    <Input label="Jersey number" value={form.jerseyNumber} onChange={(event) => setField('jerseyNumber', event.target.value)} placeholder="18" />
                  </>
                )}
                {isCaptain && (
                  <Input label="Captaincy experience" value={form.captaincyExperience} onChange={(event) => setField('captaincyExperience', event.target.value)} placeholder="e.g. 4 years" />
                )}
                {isScorer && (
                  <>
                    <Input label="Scoring experience" value={form.scoringExperience} onChange={(event) => setField('scoringExperience', event.target.value)} placeholder="e.g. 6 years" />
                    <Input label="Scoring expertise" value={form.scoringExpertise} onChange={(event) => setField('scoringExpertise', event.target.value)} placeholder="Ball-by-ball, DLS, wagon wheel" containerClassName="sm:col-span-2" />
                  </>
                )}
                {isUmpire && (
                  <>
                    <Input label="Certification" value={form.certification} onChange={(event) => setField('certification', event.target.value)} placeholder="BCCI Level 2" />
                    <Input label="Umpiring experience" value={form.umpireExperience} onChange={(event) => setField('umpireExperience', event.target.value)} placeholder="e.g. 9 years" />
                    <Input label="Match level" value={form.matchLevel} onChange={(event) => setField('matchLevel', event.target.value)} placeholder="Club, district or state" containerClassName="sm:col-span-2" />
                  </>
                )}
              </div>

              <div className="mt-5 rounded-xl border border-forest/[0.07] bg-offwhite p-3.5">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-forest">
                  <ClipboardCheck className="h-3.5 w-3.5 text-cricket" /> Role-verified badge
                </p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-slateink-light">
                  {user.status === 'Active'
                    ? `Your ${user.role.toLowerCase()} profile is marked active in this demo. No documents were checked.`
                    : 'Your account is not active. Some demo actions may be restricted.'}
                </p>
              </div>
            </div>
          )}

          <div className="card p-5 sm:p-6">
            <h3 className="font-display text-[15px] font-bold text-forest">Short bio</h3>
            <p className="mt-0.5 text-[10.5px] text-slateink-light">A line about your cricket life. Purely cosmetic in this demo.</p>
            <Textarea
              className="mt-3"
              placeholder={isOwner ? 'We have been running cricket at our ground since 2014…' : 'Left-hand opener, occasional leg-spinner, terrible at running twos…'}
              defaultValue={user.captaincyExperience ? `Captain of ${user.team ?? 'my club'} · ${user.captaincyExperience} of leadership.` : ''}
              hint="Not saved to a server. Use the save button below to keep other profile details."
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10.5px] text-slateink-faint">
              Last simulated sign-in: {formatDate(new Date().toISOString().slice(0, 10), 'long')} · initials {initials(user.name)}
            </p>
            <div className="flex gap-2">
              <Link to={`/${slug}/settings`} className={buttonStyles('outline', 'md')}>
                Cancel
              </Link>
              <Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />}>
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
