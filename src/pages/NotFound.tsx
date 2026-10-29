import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Home, LifeBuoy } from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { roleHome } from '@/lib/utils';

export function NotFound() {
  const { user } = useApp();

  return (
    <section className="relative overflow-hidden bg-forest py-20 text-white sm:py-28">
      <div className="absolute inset-0 hero-grid opacity-40" />
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-grass/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-matchday/10 blur-3xl" />

      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-[92px] font-extrabold leading-none tracking-tight text-white/10 sm:text-[140px]">404</p>
          <span className="eyebrow-dark -mt-6">
            <span className="h-1.5 w-1.5 rounded-full bg-matchday" /> Outside the boundary
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            That page is out of play.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60">
            The link may be old, mistyped or part of a demo flow that has moved. Head back to the pavilion and pick up
            from a page that definitely exists.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className={buttonStyles('accent', 'md')}>
              <Home className="h-4 w-4" /> Back to home
            </Link>
            <Link to="/grounds" className={buttonStyles('ghost', 'md', 'border border-white/20 text-white hover:bg-white/10 hover:text-white')}>
              <Compass className="h-4 w-4" /> Explore grounds
            </Link>
            {user && (
              <Link to={roleHome(user.role)} className={buttonStyles('ghost', 'md', 'border border-white/20 text-white hover:bg-white/10 hover:text-white')}>
                <ArrowLeft className="h-4 w-4" /> My dashboard
              </Link>
            )}
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-[11px] text-white/35">
            <LifeBuoy className="h-3.5 w-3.5 text-grass" />
            Every page in this demo is reachable from the header or a dashboard sidebar.
          </div>
        </div>
      </div>
    </section>
  );
}
