import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  AtSign,
  Camera,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/context/AppContext';
import { isValidEmail } from '@/lib/utils';

const columns = [
  {
    title: 'Discover',
    links: [
      { label: 'Explore Grounds', to: '/grounds' },
      { label: 'Popular Grounds', to: '/grounds?sort=rating' },
      { label: 'Available Today', to: '/grounds?availability=today' },
      { label: 'Browse by City', to: '/grounds' },
    ],
  },
  {
    title: 'For Teams',
    links: [
      { label: 'My Bookings', to: '/bookings' },
      { label: 'Player Dashboard', to: '/login?role=player' },
      { label: 'Captain Dashboard', to: '/login?role=captain' },
      { label: 'Scorer Dashboard', to: '/login?role=scorer' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About CRICREX', to: '/about' },
      { label: 'How It Works', to: '/about#how-it-works' },
      { label: 'For Ground Owners', to: '/register?role=owner' },
      { label: 'Contact Support', to: '/about#contact' },
    ],
  },
];

const policyCopy: Record<string, string> = {
  Privacy:
    'CRICREX is a frontend demonstration. We do not collect, store or transmit personal data to a server. Demo account details and bookings are kept only in your browser’s localStorage so the experience survives a page refresh. Clearing your browser storage resets the demo.',
  Terms:
    'All ground listings, prices, reviews, matches and bookings in CRICREX are fictional sample content created for demonstration. No real reservation is created, no payment is taken and no ground owner is notified. Do not use the demo to plan a real fixture.',
  Cookies:
    'CRICREX does not use advertising or analytics cookies. The demo relies on localStorage keys prefixed with “cricrex.” to remember your simulated session and bookings on this device. You can remove them at any time from your browser settings.',
};

export function PublicFooter() {
  const { pushToast } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [policy, setPolicy] = useState<string | null>(null);

  const subscribe = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !isValidEmail(email)) {
      setError('Enter a valid email address to join the demo newsletter.');
      return;
    }
    setError('');
    setEmail('');
    pushToast({
      title: 'You’re on the demo list',
      description: 'No email was sent — this newsletter signup is simulated.',
      tone: 'success',
    });
  };

  return (
    <footer className="relative overflow-hidden bg-forest-950 text-white">
      <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-cricket/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-grass/10 blur-3xl" />

      <div className="container-page relative">
        <div className="grid gap-12 border-b border-white/10 py-14 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              CRICREX brings ground discovery, booking and matchday management into one premium cricket experience —
              built for players, captains, scorers, umpires and ground owners.
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-white/65">
              <p className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-grass" />
                <span>Race Course Road, Coimbatore, Tamil Nadu 641018</span>
              </p>
              <a href="mailto:hello@cricrex.demo" className="flex items-center gap-2.5 transition hover:text-grass">
                <Mail className="h-4 w-4 text-grass" />
                <span>hello@cricrex.demo</span>
              </a>
              <a href="tel:+919000000000" className="flex items-center gap-2.5 transition hover:text-grass">
                <Phone className="h-4 w-4 text-grass" />
                <span>+91 90000 00000</span>
              </a>
            </div>
            <div className="mt-6 flex items-center gap-2">
              {[
                { icon: Camera, label: 'Instagram' },
                { icon: AtSign, label: 'Facebook' },
                { icon: MessageCircle, label: 'X' },
                { icon: Play, label: 'YouTube' },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    pushToast({
                      title: `${label} link`,
                      description: 'Social profiles are placeholders in this demo experience.',
                      tone: 'info',
                    })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-white/65 transition hover:border-grass/40 hover:bg-white/10 hover:text-grass"
                  aria-label={`CRICREX on ${label} (demo link)`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-grass">{column.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-[13.5px] text-white/60 transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 border-b border-white/10 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h3 className="font-display text-xl font-bold text-white">Matchday ideas, once a month.</h3>
            <p className="mt-1 text-sm text-white/50">Ground guides, fixture tips and owner insights. Demo signup only.</p>
          </div>
          <form onSubmit={subscribe} noValidate className="w-full lg:w-[440px]">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError('');
                  }}
                  placeholder="you@club.com"
                  aria-label="Email address for demo newsletter"
                  aria-invalid={Boolean(error)}
                  className="h-11 w-full rounded-xl border border-white/12 bg-white/[0.06] pl-10 pr-3 text-sm text-white placeholder:text-white/35 focus:border-grass/60 focus:outline-none focus:ring-4 focus:ring-grass/10"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-grass px-4 text-sm font-bold text-forest transition hover:bg-grass-light"
              >
                Join <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {error && <p className="mt-2 text-xs font-medium text-[#FFB4A8]">{error}</p>}
          </form>
        </div>

        <div className="flex flex-col gap-4 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CRICREX. A frontend demonstration project. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/55">
              <ShieldCheck className="h-3 w-3 text-grass" /> Simulated bookings only
            </span>
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <button key={item} type="button" onClick={() => setPolicy(item)} className="transition hover:text-white">
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal open={Boolean(policy)} onClose={() => setPolicy(null)} title={`${policy} — demo notice`} size="md">
        <p className="text-sm leading-relaxed text-slateink">{policy ? policyCopy[policy] : ''}</p>
        <div className="mt-5 rounded-xl border border-matchday/25 bg-matchday/[0.08] p-4 text-xs leading-relaxed text-[#8A5000]">
          CRICREX is a UI-only demonstration. No backend, database, payment processor or email service is connected.
        </div>
        <button
          type="button"
          onClick={() => setPolicy(null)}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-cricket px-5 text-sm font-semibold text-white transition hover:bg-cricket-dark"
        >
          Got it
        </button>
      </Modal>
    </footer>
  );
}
