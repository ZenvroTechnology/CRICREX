import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Crown,
  Flag,
  HeartHandshake,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Ticket,
  Users,
} from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useApp } from '@/context/AppContext';
import { roles } from '@/config/roles';
import { isValidEmail } from '@/lib/utils';

const stats = [
  { value: '120+', label: 'Verified grounds' },
  { value: '18', label: 'Cities across India' },
  { value: '40k+', label: 'Simulated bookings' },
  { value: '4.9/5', label: 'Average ground rating' },
];

const steps = [
  {
    icon: Search,
    title: 'Discover the right ground',
    body: 'Filter by city, surface, price, rating and live availability. Every listing shows transparent hourly pricing and the facilities you actually need.',
  },
  {
    icon: CalendarCheck,
    title: 'Lock in your slots',
    body: 'Pick a date, choose one or more one-hour slots and review the full cost before confirming. Your demo booking is saved instantly in this browser.',
  },
  {
    icon: ClipboardList,
    title: 'Run the whole matchday',
    body: 'Captains manage squads and fixtures, scorers record every ball, umpires track assignments and owners see bookings and earnings in one place.',
  },
];

const values = [
  {
    icon: Target,
    title: 'Built for local cricket',
    body: 'From Sunday friendlies to district finals, every screen is shaped around how club cricket actually works.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent by default',
    body: 'Clear prices, honest availability and no hidden fees. What you review is exactly what the demo confirms.',
  },
  {
    icon: HeartHandshake,
    title: 'Every role included',
    body: 'Players, captains, scorers, umpires, owners and admins each get a workspace designed for their job.',
  },
  {
    icon: Sparkles,
    title: 'Details that feel premium',
    body: 'A calm green palette, readable data and thoughtful empty states — because admin tools do not have to feel like admin tools.',
  },
];

const contactTopics = [
  'Booking a ground',
  'Listing my ground',
  'Scoring or umpiring',
  'Team & captain features',
  'Something else',
];

export function About() {
  const { pushToast } = useApp();
  const [form, setForm] = useState({ name: '', email: '', topic: contactTopics[0], message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 3) nextErrors.name = 'Please enter your full name.';
    if (!isValidEmail(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (form.message.trim().length < 15) nextErrors.message = 'Add a little more detail (15+ characters).';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSent(true);
    pushToast({
      title: 'Message captured (demo)',
      description: `Thanks ${form.name.split(' ')[0]} — no email was sent, but the form works end to end.`,
      tone: 'success',
    });
    setForm({ name: '', email: '', topic: contactTopics[0], message: '' });
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-forest text-white">
        <img
          src="/images/ground-7.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest/95 to-forest-950/90" />
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="container-page relative py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="eyebrow-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-matchday" /> About CRICREX
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[56px]">
              Cricket deserves better
              <br />
              <span className="text-grass">than a group chat.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/65 sm:text-base">
              CRICREX is a frontend demonstration of one calm home for ground discovery, bookings and matchday
              management — built for every role that makes a local game happen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/grounds" className={buttonStyles('accent', 'lg')}>
                Explore grounds <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register?role=owner"
                className={buttonStyles('ghost', 'lg', 'border border-white/20 text-white hover:bg-white/10 hover:text-white')}
              >
                List your ground
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-3xl">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[11px] font-medium text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-forest/10 shadow-card">
              <img src="/images/ground-4.jpg" alt="A prepared cricket oval at golden hour" className="h-[320px] w-full object-cover sm:h-[400px]" />
            </div>
            <div className="absolute -bottom-6 right-4 hidden w-56 rounded-2xl border border-forest/10 bg-white p-4 shadow-lift sm:block">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-cricket" />
                <p className="text-xs font-bold text-forest">Every ground verified</p>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slateink-light">
                Sample listings with real-world amenities, reviews and pricing models.
              </p>
            </div>
          </div>

          <div>
            <span className="eyebrow">Our story</span>
            <h2 className="mt-4 section-title text-balance">One platform for the whole game.</h2>
            <div className="mt-5 space-y-4 text-[14.5px] leading-relaxed text-slateink-light">
              <p>
                Booking a ground should not mean six phone calls, a lost screenshot and a price that changes when you
                arrive. And running a matchday should not need four different notebooks.
              </p>
              <p>
                CRICREX brings those pieces together: a searchable ground catalogue, a slot-based booking flow, and six
                focused workspaces for the people who make the game happen. Ground owners can manage pricing and
                availability. Scorers can record ball by ball. Umpires, players and captains get their own view of the
                season.
              </p>
              <p className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-4 text-[13px] text-forest">
                This build is intentionally frontend-only. Accounts, payments, emails and bookings are simulated and
                stored in your browser, so you can explore every role safely.
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                'No backend or database required',
                'Role-aware dashboards',
                'Fully responsive layouts',
                'Accessible, keyboard-friendly UI',
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 text-[12.5px] font-medium text-slateink">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-y border-forest/[0.07] bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-4 section-title">From search to scorecard.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slateink-light">
              Three deliberate steps, no clutter. The demo follows the same flow a real club would use.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="card card-hover relative p-6">
                  <span className="absolute right-5 top-5 font-display text-4xl font-extrabold text-forest/[0.06]">
                    0{index + 1}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cricket/10 text-cricket">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-forest">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slateink-light">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Six workspaces</span>
          <h2 className="mt-4 section-title">A view for every role.</h2>
          <p className="mt-3 text-sm leading-relaxed text-slateink-light">
            Admin access is provisioned separately. Every other role can register through the demo sign-up flow.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isAdmin = role.role === 'Admin';
            return (
              <div key={role.slug} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/[0.06] text-cricket">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-forest">{role.label}</h3>
                    <p className="text-[11px] text-slateink-light">{role.description}</p>
                  </div>
                </div>
                <Link
                  to={isAdmin ? '/login?role=admin' : `/login?role=${role.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-cricket transition hover:text-forest"
                >
                  Try the {role.label.toLowerCase()} demo <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-forest py-16 text-white sm:py-20">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="eyebrow-dark">What we believe</span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Local cricket is serious cricket.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
                The best tools respect the people using them — the captain chasing a last-minute slot, the scorer
                tracking a tense final over, the owner keeping the lights on.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/grounds" className={buttonStyles('accent', 'md')}>
                  Find a ground <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/bookings" className={buttonStyles('ghost', 'md', 'border border-white/20 text-white hover:bg-white/10 hover:text-white')}>
                  <Ticket className="h-4 w-4" /> My bookings
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                    <Icon className="h-5 w-5 text-grass" />
                    <h3 className="mt-3 text-sm font-bold text-white">{value.title}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">{value.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="container-page scroll-mt-24 py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="eyebrow">Contact</span>
            <h2 className="mt-4 section-title">Say hello to the demo desk.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slateink-light">
              This form is fully functional on the client, but no message leaves your browser. Use it to test the
              validation and success states.
            </p>
            <div className="mt-6 space-y-3">
              {[
                { icon: Mail, label: 'hello@cricrex.demo', hint: 'Simulated inbox' },
                { icon: MapPin, label: 'Race Course Road, Coimbatore', hint: 'Demo headquarters' },
                { icon: Users, label: 'Support for every role', hint: 'Admin, owner, scorer, umpire, player, captain' },
              ].map(({ icon: Icon, label, hint }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl border border-forest/[0.07] bg-white p-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cricket/10 text-cricket">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold text-forest">{label}</p>
                    <p className="text-[10.5px] text-slateink-light">{hint}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: CalendarCheck, label: 'Bookings' },
                { icon: ClipboardList, label: 'Scoring' },
                { icon: Flag, label: 'Umpiring' },
                { icon: Crown, label: 'Captains' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-forest/[0.05] px-3 py-1.5 text-[11px] font-semibold text-forest">
                  <Icon className="h-3 w-3 text-cricket" /> {label}
                </span>
              ))}
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            {sent ? (
              <div className="flex h-full min-h-[340px] flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-forest">Message captured</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slateink-light">
                  Your demo message passed validation. Nothing was emailed and no ticket was created. You can send
                  another message or head back to the grounds.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={() => setSent(false)} className={buttonStyles('outline', 'md')}>
                    Send another
                  </button>
                  <Link to="/grounds" className={buttonStyles('primary', 'md')}>
                    Explore grounds <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Full name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(event) => setField('name', event.target.value)}
                    error={errors.name}
                    required
                  />
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@club.com"
                    value={form.email}
                    onChange={(event) => setField('email', event.target.value)}
                    error={errors.email}
                    required
                  />
                </div>
                <Select label="What is this about?" value={form.topic} onChange={(event) => setField('topic', event.target.value)}>
                  {contactTopics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </Select>
                <Textarea
                  label="Message"
                  placeholder="Tell us what you are trying to do…"
                  value={form.message}
                  onChange={(event) => setField('message', event.target.value)}
                  error={errors.message}
                  hint="Minimum 15 characters. Stored nowhere."
                  required
                />
                <div className="flex flex-col-reverse gap-2 border-t border-forest/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10.5px] text-slateink-faint">No backend — this is a UI demonstration.</p>
                  <button type="submit" className={buttonStyles('primary', 'md')}>
                    Send demo message <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
