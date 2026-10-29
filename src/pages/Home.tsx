import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  LayoutDashboard,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { grounds, testimonials } from '@/data/mock';
import { GroundSearch } from '@/components/GroundSearch';
import { GroundCard } from '@/components/GroundCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { buttonStyles } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { Avatar } from '@/components/ui/Avatar';
import { amenityIcon } from '@/components/ui/amenityIcon';
import { getSlotsFor, inr, toIso } from '@/lib/utils';

const popular = [...grounds].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
const featured = grounds.find((ground) => ground.id === 'grn-05') ?? grounds[0];
const today = toIso(new Date());
const availableToday = grounds.filter((ground) => ground.availableToday).slice(0, 4);
const cities = Array.from(new Set(grounds.map((ground) => ground.city))).map((city) => ({
  name: city,
  count: grounds.filter((ground) => ground.city === city).length,
  image: grounds.find((ground) => ground.city === city)?.image ?? '/images/ground-1.jpg',
}));

const features = [
  {
    icon: BadgeCheck,
    title: 'Verified grounds only',
    body: 'Every listing is reviewed for surface quality, facilities and accurate pricing before it goes live on CRICREX.',
  },
  {
    icon: Clock3,
    title: 'Live slot availability',
    body: 'See real open slots for the next seven days. No phone calls, no waiting for a confirmation message.',
  },
  {
    icon: CreditCard,
    title: 'Transparent pricing',
    body: 'Hourly rates, slot totals and simulated taxes are shown up front — the summary always matches your demo total.',
  },
  {
    icon: LayoutDashboard,
    title: 'Built for every role',
    body: 'Players, captains, scorers, umpires and owners each get a focused dashboard for their matchday workflow.',
  },
];

const steps = [
  {
    title: 'Discover your ground',
    body: 'Filter by city, surface, price and rating to find a ground that fits your squad and your fixture.',
    icon: MapPin,
  },
  {
    title: 'Pick your slots',
    body: 'Choose a date, select consecutive hourly slots and review the full booking summary before you confirm.',
    icon: CalendarCheck,
  },
  {
    title: 'Own the matchday',
    body: 'Get a demo booking reference instantly, then manage fixtures from your role-based CRICREX dashboard.',
    icon: TrophyIcon,
  },
];

function TrophyIcon(props: { className?: string }) {
  return <Sparkles {...props} />;
}

export function Home() {
  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-cricket/30 blur-[110px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-grass/10 blur-[120px]" />

        <div className="container-page relative pb-16 pt-12 sm:pt-16 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
            <div className="animate-fade-up">
              <span className="eyebrow-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-matchday" />
                Premium cricket ground booking
              </span>

              <h1 className="mt-6 font-display text-[42px] font-extrabold leading-[1.03] tracking-[-0.03em] text-white sm:text-[54px] lg:text-[62px] xl:text-[68px]">
                Find Your Ground.
                <br />
                <span className="relative inline-block text-grass">
                  Own Your Game.
                  <svg
                    viewBox="0 0 300 14"
                    className="absolute -bottom-2 left-0 w-full text-matchday/80"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M3 10.5C63 4 160 2 297 7.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-white/65 sm:text-base">
                Discover, compare, and book the perfect cricket ground for your next match — with live slot
                availability, verified facilities and a dashboard for every role in the game.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/grounds" className={buttonStyles('accent', 'lg')}>
                  Explore Grounds <ArrowRight className="h-[18px] w-[18px]" />
                </Link>
                <Link
                  to="/register?role=owner"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
                >
                  List your ground
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5">
                    {['VS', 'AM', 'PR', 'NK'].map((initials, index) => (
                      <span
                        key={initials}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-forest bg-gradient-to-br text-[10px] font-bold text-white ${
                          ['from-emerald-400 to-teal-600', 'from-amber-400 to-orange-600', 'from-sky-400 to-blue-600', 'from-rose-400 to-red-600'][index]
                        }`}
                      >
                        {initials}
                      </span>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} className="h-3 w-3 fill-matchday text-matchday" />
                      ))}
                      <span className="ml-1 text-xs font-bold text-white">4.9</span>
                    </div>
                    <p className="text-[11px] text-white/50">Loved by 4,200+ cricketers</p>
                  </div>
                </div>
                <div className="hidden h-8 w-px bg-white/15 sm:block" />
                <div>
                  <p className="font-display text-lg font-extrabold text-white">120+</p>
                  <p className="text-[11px] text-white/50">premium grounds</p>
                </div>
                <div className="hidden h-8 w-px bg-white/15 sm:block" />
                <div>
                  <p className="font-display text-lg font-extrabold text-white">42k</p>
                  <p className="text-[11px] text-white/50">demo bookings</p>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-[500px] animate-fade-up [animation-delay:120ms]">
              <div className="absolute -inset-3 rounded-[34px] border border-white/10 sm:-inset-5" />
              <div className="absolute -right-2 -top-3 hidden h-16 w-16 rounded-full bg-matchday shadow-[0_16px_36px_-12px_rgba(255,159,67,0.8)] sm:flex sm:items-center justify-center">
                <span className="text-center font-display text-[9px] font-extrabold uppercase leading-tight text-forest">
                  Book in
                  <br />
                  <span className="text-base">2 min</span>
                </span>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/15 shadow-lift">
                <img
                  src="/images/ground-4.jpg"
                  alt="Aerial view of a lush green cricket ground at CRICREX"
                  className="h-[380px] w-full object-cover sm:h-[470px] lg:h-[500px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/15 to-transparent" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
                  <Badge tone="forest" className="border border-white/20 bg-white/10 text-white backdrop-blur">
                    <Sparkles className="h-3 w-3 text-grass" /> Ground of the week
                  </Badge>
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-forest backdrop-blur">
                    Coimbatore
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="mb-2 flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-matchday text-matchday" />
                        <span className="text-xs font-bold text-white">4.9</span>
                        <span className="text-[11px] text-white/55">(214 reviews)</span>
                      </div>
                      <h2 className="font-display text-xl font-bold text-white sm:text-2xl">Greenfield Cricket Arena</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
                        <MapPin className="h-3.5 w-3.5 text-grass" /> Peelamedu, Coimbatore
                      </p>
                    </div>
                    <Link
                      to="/grounds/grn-01"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-forest transition hover:bg-matchday"
                      aria-label="View Greenfield Cricket Arena"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-7 -left-3 w-[228px] rounded-2xl border border-forest/[0.06] bg-white p-3.5 shadow-lift sm:-left-8">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
                    <CheckCircle2 className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-forest">Slot confirmed</p>
                    <p className="text-[10px] text-slateink-light">Sat · 06:00 AM – 09:00 AM</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-forest/[0.07] pt-2.5">
                  <span className="text-[10px] font-medium text-slateink-light">Demo booking CRX-7K2M9Q</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div id="search" className="relative mt-14 lg:mt-16">
            <GroundSearch />
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/50">
              <span className="font-semibold text-white/70">Popular:</span>
              {['Coimbatore', 'Chennai', 'Bengaluru', 'Indoor nets'].map((item) => {
                const isType = item === 'Indoor Nets';
                return (
                  <Link
                    key={item}
                    to={`/grounds?${isType ? 'type=Indoor+Nets' : `city=${encodeURIComponent(item)}`}`}
                    className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 font-medium text-white/70 transition hover:border-grass/40 hover:bg-white/10 hover:text-white"
                  >
                    {item}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-grass/30 to-transparent" />
      </section>

      {/* ── Trust strip ────────────────────────────────────── */}
      <section className="border-b border-forest/[0.07] bg-white">
        <div className="container-page grid grid-cols-2 gap-y-6 py-6 sm:grid-cols-4">
          {[
            { icon: ShieldCheck, label: 'Verified grounds', sub: 'Quality checked' },
            { icon: CalendarCheck, label: 'Instant slots', sub: 'Live availability' },
            { icon: CreditCard, label: 'Clear pricing', sub: 'No hidden fees' },
            { icon: Users, label: 'Role dashboards', sub: '6 tailored views' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center justify-center gap-3 border-forest/[0.07] px-2 sm:border-l sm:first:border-l-0">
              <Icon className="h-5 w-5 text-cricket" />
              <div>
                <p className="text-[12.5px] font-bold text-forest">{label}</p>
                <p className="text-[10.5px] text-slateink-light">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular grounds ────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Handpicked for matchday"
            title="Popular grounds this week"
            description="The grounds cricketers keep coming back to — inspected surfaces, strong facilities and transparent hourly pricing."
            action={
              <Link to="/grounds" className="link-underline">
                Browse all grounds <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {popular.map((ground) => (
              <GroundCard key={ground.id} ground={ground} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured ground ────────────────────────────────── */}
      <section className="pb-16 sm:pb-20">
        <div className="container-page">
          <div className="overflow-hidden rounded-[28px] bg-forest shadow-card">
            <div className="grid lg:grid-cols-2">
              <div className="relative order-2 min-h-[280px] lg:order-1 lg:min-h-[440px]">
                <img
                  src={featured.image}
                  alt={`${featured.name} in ${featured.city}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-forest/30" />
                <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur lg:bottom-6 lg:left-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-matchday/15 text-[#B25E00]">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slateink-light">Next open slot</p>
                    <p className="text-sm font-bold text-forest">Today · 05:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="relative order-1 flex flex-col justify-center p-7 sm:p-10 lg:order-2 lg:p-12">
                <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-grass/10 blur-3xl" />
                <span className="eyebrow-dark w-fit">
                  <Sparkles className="h-3 w-3" /> Editor’s pick
                </span>
                <h2 className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl">{featured.name}</h2>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-white/55">
                  <MapPin className="h-4 w-4 text-grass" /> {featured.locality}, {featured.city}
                </p>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60">{featured.description}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {featured.amenities.slice(0, 5).map((amenity) => {
                    const Icon = amenityIcon(amenity);
                    return (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-white/70"
                      >
                        <Icon className="h-3.5 w-3.5 text-grass" /> {amenity}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-white/45">From</p>
                    <p className="font-display text-2xl font-extrabold text-white">
                      {inr(featured.price)}
                      <span className="text-xs font-medium text-white/45"> / hour</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/grounds/${featured.id}`} className={buttonStyles('white', 'md')}>
                      View details
                    </Link>
                    <Link to={`/grounds/${featured.id}?book=1`} className={buttonStyles('accent', 'md')}>
                      Book Now <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse by city ─────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Play closer to home"
            title="Browse by location"
            description="From Coimbatore’s club grounds to Mumbai’s indoor nets — find cricket near you."
            action={
              <Link to="/grounds" className="link-underline">
                All locations <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {cities.slice(0, 6).map((city) => (
              <Link
                key={city.name}
                to={`/grounds?city=${encodeURIComponent(city.name)}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
              >
                <img
                  src={city.image}
                  alt={`Cricket grounds in ${city.name}`}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-base font-bold text-white">{city.name}</p>
                  <p className="mt-0.5 text-[11px] text-white/60">{city.count} ground{city.count > 1 ? 's' : ''}</p>
                  <span className="mt-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur transition group-hover:bg-matchday group-hover:text-forest group-hover:opacity-100">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Available today ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest-950 py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-cricket/25 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-40" />
        <div className="container-page relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <div>
            <span className="eyebrow-dark">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-grass" /> Play today
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Still time for
              <br />
              one more innings.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
              These grounds have open slots today. Pick a start time, lock your hours and get your squad on the field.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/grounds?availability=today" className={buttonStyles('accent', 'md')}>
                See available today <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/grounds" className={buttonStyles('ghost', 'md', 'border border-white/15 text-white hover:bg-white/10 hover:text-white')}>
                All grounds
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-grass/15 text-grass">
                <Clock3 className="h-5 w-5" />
              </span>
              <p className="text-xs leading-relaxed text-white/55">
                Slots shown are <span className="font-semibold text-white/80">simulated availability</span> for this demo. No real reservation is held.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {availableToday.map((ground, index) => {
              const slots = getSlotsFor(ground.id, today)
                .filter((slot) => slot.available)
                .slice(index % 2, (index % 2) + 2);
              return (
                <div
                  key={ground.id}
                  className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-3.5 transition hover:border-grass/30 hover:bg-white/[0.07] sm:flex-row sm:items-center"
                >
                  <Link to={`/grounds/${ground.id}`} className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-28">
                    <img src={ground.image} alt={ground.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/grounds/${ground.id}`} className="text-sm font-bold text-white transition hover:text-grass">
                      {ground.name}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/45">
                      <MapPin className="h-3 w-3" /> {ground.city} · {ground.type}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {slots.map((slot) => (
                        <Link
                          key={slot.time}
                          to={`/grounds/${ground.id}?book=1`}
                          className="rounded-md border border-grass/25 bg-grass/10 px-2 py-1 text-[10px] font-bold text-grass transition hover:bg-grass hover:text-forest"
                        >
                          {slot.time}
                        </Link>
                      ))}
                      <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium text-white/40">
                        +{Math.max(1, 12 - slots.length)} slots
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <p className="text-sm font-extrabold text-white">{inr(ground.price)}<span className="text-[10px] font-normal text-white/40">/hr</span></p>
                    <Link to={`/grounds/${ground.id}?book=1`} className={buttonStyles('accent', 'sm', 'h-8 px-3')}>
                      Book
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why choose ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="Why CRICREX"
            title="A better matchday, from first search to final ball"
            description="We built the booking experience we wanted as cricketers — fast, transparent and genuinely useful after the booking is made."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, body }, index) => (
              <div key={title} className="card card-hover relative overflow-hidden p-6">
                <span className="absolute right-5 top-4 font-display text-4xl font-extrabold text-forest/[0.05]">0{index + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cricket to-forest text-white shadow-[0_10px_20px_-10px_rgba(33,115,70,0.7)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-forest">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slateink-light">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="How it works"
                title="Three steps to your next match"
                description="No brokers, no phone tag. A clean booking flow that respects your time — and a dashboard that keeps the whole season organised."
              />
              <Link to="/register" className={buttonStyles('primary', 'md', 'mt-7')}>
                Create a demo account <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-matchday/25 bg-matchday/[0.07] p-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#B25E00]" />
                <p className="text-xs leading-relaxed text-[#8A5000]">
                  CRICREX is a UI-only demo. Accounts, bookings and payments are simulated — never real.
                </p>
              </div>
            </div>

            <ol className="relative space-y-4">
              <span className="absolute bottom-10 left-[27px] top-10 hidden w-px border-l border-dashed border-cricket/25 sm:block" aria-hidden="true" />
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="card relative flex gap-4 p-5 sm:p-6">
                    <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest text-white shadow-sm">
                      <Icon className="h-5 w-5 text-grass" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-matchday-dark">Step {index + 1}</p>
                      <h3 className="mt-1 font-display text-lg font-bold text-forest">{step.title}</h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-slateink-light">{step.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="From the boundary"
            title="What our demo players say"
            description="Illustrative testimonials created for this CRICREX concept — not verified customer reviews."
            action={<Badge tone="orange">Sample content</Badge>}
          />
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="card card-hover flex flex-col p-6">
                <Quote className="h-7 w-7 text-grass" />
                <blockquote className="mt-4 flex-1 text-[13.5px] leading-relaxed text-slateink">“{testimonial.quote}”</blockquote>
                <div className="mt-5 flex items-center gap-3 border-t border-forest/[0.07] pt-4">
                  <Avatar name={testimonial.name} tone={testimonial.tone} size="md" />
                  <figcaption>
                    <p className="text-sm font-bold text-forest">{testimonial.name}</p>
                    <p className="text-[11px] text-slateink-light">{testimonial.role}</p>
                  </figcaption>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} className="h-3 w-3 fill-matchday text-matchday" />
                    ))}
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="pb-16 sm:pb-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[28px] bg-forest px-6 py-12 sm:px-12 lg:px-16 lg:py-16">
            <img
              src="/images/ground-14.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/95 to-forest/60" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[28px] border-grass/20" />
            <div className="relative max-w-2xl">
              <span className="eyebrow-dark">
                <Sparkles className="h-3 w-3" /> Your season starts here
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white sm:text-[42px]">
                Your next innings starts here.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
                Find a ground, book your slots and bring the whole squad. It takes two minutes — and the first match is
                always the one you remember.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/grounds" className={buttonStyles('accent', 'lg')}>
                  Find a ground <ArrowRight className="h-[18px] w-[18px]" />
                </Link>
                <Link to="/about" className={buttonStyles('white', 'lg')}>
                  Learn about CRICREX
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-[11px] text-white/45">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-grass" /> No card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-grass" /> Instant demo confirmation</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-grass" /> Cancel anytime</span>
              </div>
            </div>
            <div className="absolute bottom-8 right-10 hidden items-center gap-1.5 lg:flex">
              <Rating value={4.9} showValue={false} size="md" />
              <span className="ml-1 text-xs text-white/60">4.9 / 5 demo rating</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
