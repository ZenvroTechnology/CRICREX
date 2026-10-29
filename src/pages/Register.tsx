import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Info,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { FormAlert } from '@/components/auth/FormAlert';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Input, PasswordInput, Select, Checkbox } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { registerRoles } from '@/config/roles';
import { useApp } from '@/context/AppContext';
import { cn, isValidEmail } from '@/lib/utils';
import type { Role } from '@/types';

type RegRole = Exclude<Role, 'Admin'>;

interface FormState {
  name: string;
  email: string;
  username: string;
  password: string;
  confirm: string;
  phone: string;
  location: string;
  groundName: string;
  groundLocation: string;
  groundCapacity: string;
  scoringExperience: string;
  scoringExpertise: string;
  certification: string;
  umpireExperience: string;
  matchLevel: string;
  team: string;
  playingRole: string;
  jerseyNumber: string;
  captaincyExperience: string;
}

const emptyForm: FormState = {
  name: '',
  email: '',
  username: '',
  password: '',
  confirm: '',
  phone: '',
  location: '',
  groundName: '',
  groundLocation: '',
  groundCapacity: '',
  scoringExperience: '',
  scoringExpertise: '',
  certification: '',
  umpireExperience: '',
  matchLevel: '',
  team: '',
  playingRole: '',
  jerseyNumber: '',
  captaincyExperience: '',
};

export function Register() {
  const { register, users } = useApp();
  const [params] = useSearchParams();
  const querySlug = params.get('role');
  const initialRole = (registerRoles.find((item) => item.slug === querySlug)?.role ?? 'Player') as RegRole;

  const [role, setRole] = useState<RegRole>(initialRole);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [terms, setTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ name: string; email: string; role: RegRole } | null>(null);

  const activeMeta = useMemo(() => registerRoles.find((item) => item.role === role)!, [role]);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      delete next.form;
      return next;
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (form.name.trim().length < 3) nextErrors.name = 'Enter your full name (at least 3 characters).';
    if (!form.email.trim()) nextErrors.email = 'Enter your email address.';
    else if (!isValidEmail(form.email)) nextErrors.email = 'Enter a valid email address.';
    else if (users.some((user) => user.email.toLowerCase() === form.email.trim().toLowerCase())) {
      nextErrors.email = 'This email is already used by a demo account.';
    }
    if (!form.username.trim()) nextErrors.username = 'Choose a username.';
    else if (!/^[a-zA-Z0-9._]{3,20}$/.test(form.username.trim())) {
      nextErrors.username = 'Use 3–20 letters, numbers, dots or underscores.';
    } else if (users.some((user) => user.username.toLowerCase() === form.username.trim().toLowerCase())) {
      nextErrors.username = 'That username is already taken in the demo.';
    }
    if (!form.password) nextErrors.password = 'Create a password.';
    else if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password)) {
      nextErrors.password = 'Include an uppercase letter, a lowercase letter and a number.';
    }
    if (!form.confirm) nextErrors.confirm = 'Confirm your password.';
    else if (form.confirm !== form.password) nextErrors.confirm = 'Passwords do not match.';
    if (!form.phone.trim()) nextErrors.phone = 'Enter your contact number.';
    else if (form.phone.replace(/\D/g, '').length < 10) nextErrors.phone = 'Enter a valid 10-digit contact number.';

    if (role === 'Ground Owner') {
      if (!form.groundName.trim()) nextErrors.groundName = 'Enter your ground name.';
      if (!form.groundLocation.trim()) nextErrors.groundLocation = 'Enter the ground location.';
      if (!form.groundCapacity.trim()) nextErrors.groundCapacity = 'Add an approximate player capacity.';
    }
    if (role === 'Scorer') {
      if (!form.scoringExperience.trim()) nextErrors.scoringExperience = 'Tell us your scoring experience.';
      if (!form.scoringExpertise.trim()) nextErrors.scoringExpertise = 'Add your scoring expertise.';
    }
    if (role === 'Umpire') {
      if (!form.certification.trim()) nextErrors.certification = 'Enter your certification level.';
      if (!form.umpireExperience.trim()) nextErrors.umpireExperience = 'Tell us your umpiring experience.';
      if (!form.matchLevel) nextErrors.matchLevel = 'Select the highest level you officiate.';
    }
    if (role === 'Player' || role === 'Captain') {
      if (!form.team.trim()) nextErrors.team = 'Enter your team name.';
      if (!form.playingRole) nextErrors.playingRole = 'Select your playing role.';
    }
    if (role === 'Player') {
      if (!form.jerseyNumber.trim()) nextErrors.jerseyNumber = 'Add your jersey number.';
      else if (Number(form.jerseyNumber) < 1 || Number(form.jerseyNumber) > 99) nextErrors.jerseyNumber = 'Use a number between 1 and 99.';
    }
    if (role === 'Captain' && !form.captaincyExperience) {
      nextErrors.captaincyExperience = 'Select your captaincy experience.';
    }
    if (!terms) nextErrors.terms = 'Please accept the demo terms to continue.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      const result = register({
        name: form.name,
        email: form.email,
        username: form.username,
        password: form.password,
        phone: form.phone,
        role,
        location: form.location || form.groundLocation,
        groundName: role === 'Ground Owner' ? form.groundName : undefined,
        groundLocation: role === 'Ground Owner' ? form.groundLocation : undefined,
        groundCapacity: role === 'Ground Owner' ? form.groundCapacity : undefined,
        scoringExperience: role === 'Scorer' ? form.scoringExperience : undefined,
        scoringExpertise: role === 'Scorer' ? form.scoringExpertise : undefined,
        certification: role === 'Umpire' ? form.certification : undefined,
        umpireExperience: role === 'Umpire' ? form.umpireExperience : undefined,
        matchLevel: role === 'Umpire' ? form.matchLevel : undefined,
        team: role === 'Player' || role === 'Captain' ? form.team : undefined,
        playingRole: role === 'Player' || role === 'Captain' ? form.playingRole : undefined,
        jerseyNumber: role === 'Player' ? form.jerseyNumber : undefined,
        captaincyExperience: role === 'Captain' ? form.captaincyExperience : undefined,
      });
      setSubmitting(false);
      if (!result.ok) {
        setErrors({ form: result.error ?? 'Something went wrong. Please try again.' });
        return;
      }
      setCreated({ name: form.name, email: form.email, role });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  if (created) {
    return (
      <AuthShell
        title="Your demo account is ready"
        subtitle="Registration is complete in this browser. No email was sent and no server account was created."
        footer={
          <p className="text-sm text-slateink-light">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-cricket transition hover:text-forest">Return to login</Link>
          </p>
        }
      >
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-forest to-forest-900 p-8 text-center text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-grass/15">
              <CheckCircle2 className="h-9 w-9 text-grass" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-white">Welcome to the squad</h2>
            <p className="mt-1 text-sm text-white/55">Your CRICREX demo profile has been created.</p>
          </div>
          <div className="p-6">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slateink-light">Name</dt>
                <dd className="text-right font-semibold text-forest">{created.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slateink-light">Email</dt>
                <dd className="text-right font-semibold text-forest">{created.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slateink-light">Role</dt>
                <dd className="text-right font-semibold text-forest">{created.role}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slateink-light">Status</dt>
                <dd className="text-right"><span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success">Active (demo)</span></dd>
              </div>
            </dl>
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-matchday/25 bg-matchday/[0.08] p-3 text-[11px] leading-relaxed text-[#8A5000]">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Sign in with the email and password you just created. This account lives only in your browser storage.
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link
                to={`/login?role=${created.role === 'Ground Owner' ? 'owner' : created.role === 'Scorer' ? 'scorer' : created.role === 'Umpire' ? 'umpire' : created.role === 'Captain' ? 'captain' : 'player'}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cricket text-sm font-bold text-white transition hover:bg-cricket-dark"
              >
                Sign in now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/" className="inline-flex h-11 items-center justify-center rounded-xl border border-forest/15 text-sm font-semibold text-forest transition hover:bg-offwhite">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </AuthShell>
    );
  }

  const roleDetails = () => {
    switch (role) {
      case 'Ground Owner':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Ground name" placeholder="e.g. Greenfield Cricket Arena" value={form.groundName} onChange={(event) => update('groundName', event.target.value)} error={errors.groundName} required containerClassName="sm:col-span-2" />
            <Input label="Ground location" placeholder="Area, city" value={form.groundLocation} onChange={(event) => update('groundLocation', event.target.value)} error={errors.groundLocation} required />
            <Input label="Approximate capacity" type="number" min={2} placeholder="e.g. 22 players" value={form.groundCapacity} onChange={(event) => update('groundCapacity', event.target.value)} error={errors.groundCapacity} required />
          </div>
        );
      case 'Scorer':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Scoring experience" value={form.scoringExperience} onChange={(event) => update('scoringExperience', event.target.value)} error={errors.scoringExperience} required>
              <option value="">Select experience</option>
              <option>Less than 1 year</option>
              <option>1–3 years</option>
              <option>3–6 years</option>
              <option>6+ years</option>
            </Select>
            <Select label="Primary expertise" value={form.scoringExpertise} onChange={(event) => update('scoringExpertise', event.target.value)} error={errors.scoringExpertise} required>
              <option value="">Select expertise</option>
              <option>Ball-by-ball scoring</option>
              <option>Digital scoring apps</option>
              <option>DLS method</option>
              <option>Wagon wheels & analytics</option>
            </Select>
          </div>
        );
      case 'Umpire':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Certification" placeholder="e.g. BCCI Level 2" value={form.certification} onChange={(event) => update('certification', event.target.value)} error={errors.certification} required />
            <Select label="Umpiring experience" value={form.umpireExperience} onChange={(event) => update('umpireExperience', event.target.value)} error={errors.umpireExperience} required>
              <option value="">Select experience</option>
              <option>Less than 2 years</option>
              <option>2–5 years</option>
              <option>5–10 years</option>
              <option>10+ years</option>
            </Select>
            <Select label="Highest match level" value={form.matchLevel} onChange={(event) => update('matchLevel', event.target.value)} error={errors.matchLevel} required containerClassName="sm:col-span-2">
              <option value="">Select match level</option>
              <option>Club & academy</option>
              <option>District</option>
              <option>State A</option>
              <option>National</option>
            </Select>
          </div>
        );
      case 'Player':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Team name" placeholder="e.g. Coimbatore Chargers" value={form.team} onChange={(event) => update('team', event.target.value)} error={errors.team} required />
            <Select label="Playing role" value={form.playingRole} onChange={(event) => update('playingRole', event.target.value)} error={errors.playingRole} required>
              <option value="">Select role</option>
              <option>Top-order Batter</option>
              <option>Middle-order Batter</option>
              <option>Wicketkeeper Batter</option>
              <option>All-rounder</option>
              <option>Fast Bowler</option>
              <option>Spin Bowler</option>
            </Select>
            <Input label="Jersey number" type="number" min={1} max={99} placeholder="e.g. 18" value={form.jerseyNumber} onChange={(event) => update('jerseyNumber', event.target.value)} error={errors.jerseyNumber} required />
          </div>
        );
      case 'Captain':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Team name" placeholder="e.g. Bengaluru Blazers" value={form.team} onChange={(event) => update('team', event.target.value)} error={errors.team} required />
            <Select label="Playing role" value={form.playingRole} onChange={(event) => update('playingRole', event.target.value)} error={errors.playingRole} required>
              <option value="">Select role</option>
              <option>Opening Batter</option>
              <option>Middle-order Batter</option>
              <option>All-rounder</option>
              <option>Fast Bowler</option>
              <option>Spin Bowler</option>
              <option>Wicketkeeper Batter</option>
            </Select>
            <Select label="Captaincy experience" value={form.captaincyExperience} onChange={(event) => update('captaincyExperience', event.target.value)} error={errors.captaincyExperience} required containerClassName="sm:col-span-2">
              <option value="">Select experience</option>
              <option>First season</option>
              <option>1–3 years</option>
              <option>3–5 years</option>
              <option>5+ years</option>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AuthShell
      wide
      title="Create your CRICREX account"
      subtitle="Join as a player, captain, scorer, umpire or ground owner. Every field below is validated in the browser — no server involved."
      footer={
        <p className="text-sm text-slateink-light">
          Already have a demo account?{' '}
          <Link to="/login" className="font-bold text-cricket transition hover:text-forest">Sign in</Link>
        </p>
      }
    >
      <div className="card p-5 sm:p-6">
        <div className="flex items-start gap-2.5 rounded-xl border border-forest/10 bg-forest/[0.03] p-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-cricket" />
          <p className="text-[11px] leading-relaxed text-slateink-light">
            <span className="font-bold text-forest">Admin registration is closed.</span> Administrator accounts are
            provisioned through the predefined CRICREX demo login only.
          </p>
        </div>

        <div className="mt-5">
          <p className="label">Choose your role <span className="text-matchday-dark">*</span></p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {registerRoles.map((item) => {
              const Icon = item.icon;
              const active = item.role === role;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    setRole(item.role as RegRole);
                    setErrors({});
                  }}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition',
                    active ? 'border-cricket bg-cricket/[0.06]' : 'border-forest/10 hover:border-cricket/30 hover:bg-offwhite',
                  )}
                >
                  <Icon className={cn('h-[18px] w-[18px]', active ? 'text-cricket' : 'text-slateink-light')} />
                  <span className={cn('text-center text-[10px] font-bold leading-tight', active ? 'text-forest' : 'text-slateink')}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
          <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-cricket/[0.04] px-3 py-2">
            <activeMeta.icon className="h-4 w-4 text-cricket" />
            <p className="text-[10.5px] text-slateink-light">
              <span className="font-bold text-forest">{activeMeta.label}:</span> {activeMeta.description}
            </p>
          </div>
        </div>

        {errors.form && (
          <FormAlert tone="error" title="Registration could not be completed" className="mt-4">
            {errors.form}
          </FormAlert>
        )}

        <form onSubmit={submit} noValidate className="mt-5 space-y-5">
          <div>
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-forest">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cricket text-[10px] text-white">1</span>
              Account details
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Input label="Full name" placeholder="e.g. Vikram Suresh" value={form.name} onChange={(event) => update('name', event.target.value)} error={errors.name} autoComplete="name" required />
              <Input label="Email address" type="email" placeholder="you@club.com" value={form.email} onChange={(event) => update('email', event.target.value)} error={errors.email} autoComplete="email" required />
              <Input label="Username" placeholder="e.g. vikram.18" value={form.username} onChange={(event) => update('username', event.target.value)} error={errors.username} autoComplete="username" required />
              <Input label="Contact number" type="tel" placeholder="+91 98400 12345" value={form.phone} onChange={(event) => update('phone', event.target.value)} error={errors.phone} autoComplete="tel" required />
              <Input label="City / location" placeholder="e.g. Coimbatore, Tamil Nadu" value={form.location} onChange={(event) => update('location', event.target.value)} hint="Optional — helps personalise your demo." containerClassName="sm:col-span-2" />
            </div>
          </div>

          <div className="border-t border-forest/[0.07] pt-5">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-forest">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cricket text-[10px] text-white">2</span>
              {activeMeta.label} details
            </h2>
            <div className="mt-3">{roleDetails()}</div>
          </div>

          <div className="border-t border-forest/[0.07] pt-5">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-forest">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cricket text-[10px] text-white">3</span>
              Secure your demo account
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <PasswordInput label="Password" value={form.password} onChange={(event) => update('password', event.target.value)} error={errors.password} autoComplete="new-password" required />
                <PasswordStrength password={form.password} />
              </div>
              <PasswordInput label="Confirm password" value={form.confirm} onChange={(event) => update('confirm', event.target.value)} error={errors.confirm} autoComplete="new-password" required />
            </div>
          </div>

          <div>
            <Checkbox
              checked={terms}
              onChange={(checked) => {
                setTerms(checked);
                setErrors((current) => ({ ...current, terms: '' }));
              }}
              label={
                <span>
                  I agree to the{' '}
                  <button type="button" onClick={(event) => { event.preventDefault(); setTermsOpen(true); }} className="font-bold text-cricket underline underline-offset-2">
                    demo terms & privacy notice
                  </button>
                  .
                </span>
              }
            />
            {errors.terms && <p className="mt-1 text-xs font-medium text-red-600">{errors.terms}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cricket text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgba(33,115,70,0.8)] transition hover:bg-cricket-dark disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating demo account…</> : <><Sparkles className="h-4 w-4" /> Create demo account <ArrowRight className="h-4 w-4" /></>}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slateink-faint">
            <Lock className="h-3 w-3" /> Stored locally in your browser. No real account is created.
          </div>
        </form>
      </div>

      <Modal open={termsOpen} onClose={() => setTermsOpen(false)} title="Demo terms & privacy" size="md">
        <div className="space-y-3 text-sm leading-relaxed text-slateink">
          <p className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cricket" />
            CRICREX is a UI-only demonstration project. All grounds, users, reviews, matches and bookings are fictional
            sample data.
          </p>
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cricket" />
            Your demo profile, password and bookings are stored only in this browser’s localStorage. No data is sent to
            a server.
          </p>
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-cricket" />
            Never enter a real password. Registration does not create a real account and bookings are not real
            reservations.
          </p>
        </div>
        <button type="button" onClick={() => { setTerms(true); setTermsOpen(false); }} className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-cricket px-5 text-sm font-semibold text-white transition hover:bg-cricket-dark">
          Accept demo terms
        </button>
      </Modal>
    </AuthShell>
  );
}
