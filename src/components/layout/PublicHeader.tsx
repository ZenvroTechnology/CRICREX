import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Ticket, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { UserMenu } from '@/components/layout/UserMenu';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { buttonStyles } from '@/components/ui/Button';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/grounds', label: 'Explore Grounds' },
  { to: '/bookings', label: 'My Bookings' },
  { to: '/about', label: 'About Us' },
];

export function PublicHeader() {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-forest-950 text-white/70 md:block">
        <div className="container-page flex h-9 items-center justify-between text-[11px] font-medium">
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-grass" />
            CRICREX demo experience — all bookings and accounts are simulated.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/50">Ground support</span>
            <a href="tel:+919000000000" className="font-semibold text-white/85 transition hover:text-grass">
              +91 90000 00000
            </a>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'bg-forest transition-shadow duration-300',
          scrolled ? 'shadow-[0_12px_30px_-18px_rgba(0,0,0,0.8)]' : 'shadow-none',
        )}
      >
        <div className="container-page flex h-[68px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition',
                    isActive ? 'text-white' : 'text-white/65 hover:bg-white/[0.06] hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && <span className="absolute inset-x-3.5 -bottom-[3px] h-[2px] rounded-full bg-grass" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            {user ? (
              <>
                <Link
                  to="/bookings"
                  className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="My bookings"
                >
                  <Ticket className="h-[18px] w-[18px]" />
                </Link>
                <UserMenu />
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3.5 py-2 text-[13.5px] font-semibold text-white/85 transition hover:bg-white/[0.06] hover:text-white">
                  Login
                </Link>
                <Link to="/register" className={buttonStyles('accent', 'sm', 'h-10 px-4')}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-lg p-2 text-white transition hover:bg-white/10 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div id="mobile-nav" className="border-t border-white/10 bg-forest px-4 pb-5 pt-3 lg:hidden animate-slide-down">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition',
                      isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/[0.06] hover:text-white',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 border-t border-white/10 pt-4">
              {user ? (
                <div className="flex items-center justify-between gap-3">
                  <UserMenu />
                  <Link to="/bookings" className="text-sm font-semibold text-grass">
                    My Bookings
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" className="flex h-11 items-center justify-center rounded-xl border border-white/20 text-sm font-semibold text-white">
                    Login
                  </Link>
                  <Link to="/register" className="flex h-11 items-center justify-center rounded-xl bg-matchday text-sm font-semibold text-forest">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
