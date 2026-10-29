import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck, Star } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

export function AuthShell({
  children,
  title,
  subtitle,
  footer,
  wide = false,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-offwhite lg:grid lg:grid-cols-[1.02fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-forest p-10 text-white lg:flex lg:flex-col xl:p-14">
        <img
          src="/images/ground-5.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest/95 to-forest-950/85" />
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-grass/15 blur-[100px]" />

        <div className="relative flex flex-1 flex-col">
          <Logo />

          <div className="my-auto max-w-lg py-12">
            <span className="eyebrow-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-matchday" /> Your matchday, organised
            </span>
            <h2 className="mt-5 font-display text-[40px] font-extrabold leading-[1.08] tracking-tight text-white xl:text-[46px]">
              The ground is ready.
              <br />
              <span className="text-grass">Are you?</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              Book premium cricket grounds, manage fixtures and follow every ball from one beautifully simple
              platform — built for every role in the game.
            </p>

            <div className="mt-9 space-y-3">
              {[
                'Verified grounds with transparent hourly pricing',
                'Six role-based dashboards for the whole season',
                'Simulated bookings — no payment, no pressure',
              ].map((item) => (
                <p key={item} className="flex items-start gap-2.5 text-[13px] text-white/75">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-grass" /> {item}
                </p>
              ))}
            </div>

            <div className="mt-10 flex gap-3">
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} className="h-3 w-3 fill-matchday text-matchday" />
                  ))}
                  <span className="ml-1 text-[11px] font-bold">4.9</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-white/55">“Booked our whole season in one evening.”</p>
                <p className="mt-2 text-[10px] font-semibold text-white/40">Sample demo testimonial</p>
              </div>
              <div className="flex w-[140px] flex-col justify-between rounded-2xl bg-matchday p-4 text-forest">
                <MapPin className="h-5 w-5" />
                <div>
                  <p className="font-display text-2xl font-extrabold leading-none">120+</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide">premium grounds</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between border-t border-white/10 pt-5 text-[10px] text-white/35">
            <span>© {new Date().getFullYear()} CRICREX demo</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Frontend-only experience</span>
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <div className="lg:hidden">
            <Logo variant="dark" />
          </div>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slateink-light transition hover:bg-forest/5 hover:text-forest"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to CRICREX
          </Link>
        </div>

        <div className="flex flex-1 items-start justify-center px-4 pb-10 pt-2 sm:px-6 lg:items-center lg:pt-0">
          <div className={cn('w-full', wide ? 'max-w-2xl' : 'max-w-[440px]')}>
            <div className="mb-6 text-center lg:text-left">
              <h1 className="font-display text-[28px] font-extrabold tracking-tight text-forest sm:text-[32px]">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-slateink-light">{subtitle}</p>
            </div>
            {children}
            {footer && <div className="mt-6 text-center">{footer}</div>}
          </div>
        </div>

        <div className="px-5 pb-6 text-center text-[10px] leading-relaxed text-slateink-faint">
          CRICREX is a frontend demonstration. Accounts, emails and bookings are simulated and stored only in your browser.
        </div>
      </main>
    </div>
  );
}
