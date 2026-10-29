import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LifeBuoy, LogOut, Menu, Settings, ShieldCheck, UserRound, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { UserMenu } from '@/components/layout/UserMenu';
import { NotificationsMenu } from '@/components/dashboard/NotificationsMenu';
import { DashboardSearch } from '@/components/dashboard/DashboardSearch';
import { dashboardNavigation } from '@/config/navigation';
import { useApp } from '@/context/AppContext';
import { cn, roleSlug } from '@/lib/utils';
import type { RoleSlug } from '@/types';

export function DashboardLayout() {
  const { user, logout, pushToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const slug = (roleSlug(user?.role ?? 'Player')) as RoleSlug;
  const navigation = dashboardNavigation[slug];

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const allItems = navigation.groups.flatMap((group) => group.items);
  const current =
    allItems.find((item) => item.to === location.pathname) ??
    allItems.find((item) => item.to !== `/${slug}` && location.pathname.startsWith(item.to)) ??
    (location.pathname.endsWith('/profile')
      ? { label: 'Profile' }
      : location.pathname.endsWith('/settings')
        ? { label: 'Settings' }
        : location.pathname.endsWith('/notifications')
          ? { label: 'Notifications' }
          : { label: 'Dashboard' });

  const sidebar = (
    <div className="flex h-full flex-col bg-forest text-white">
      <div className="flex items-center justify-between px-5 pb-5 pt-5">
        <Logo />
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-4 mb-4 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-grass/15 text-grass">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-bold text-white">{navigation.roleLabel}</p>
          <p className="text-[9.5px] font-medium uppercase tracking-wider text-white/40">Demo workspace</p>
        </div>
        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-grass" />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 no-scrollbar" aria-label="Dashboard navigation">
        {navigation.groups.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-3 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/30">{group.title}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}
                  >
                    <Icon className="h-[17px] w-[17px] shrink-0" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-1.5 px-3 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/30">Account</p>
          <div className="space-y-0.5">
            <NavLink to={`/${slug}/profile`} className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}>
              <UserRound className="h-[17px] w-[17px]" /> Profile
            </NavLink>
            <NavLink to={`/${slug}/settings`} className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}>
              <Settings className="h-[17px] w-[17px]" /> Settings
            </NavLink>
          </div>
        </div>
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-grass" />
            <p className="text-[11px] font-bold text-white">Demo support</p>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-white/45">Questions about this experience? Support is simulated.</p>
          <button
            type="button"
            onClick={() => pushToast({ title: 'Support is simulated', description: 'This demo has no live support desk. Try the Help section in Settings.', tone: 'info' })}
            className="mt-2 text-[10px] font-bold text-grass transition hover:text-white"
          >
            Contact demo support →
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
        >
          <LogOut className="h-[17px] w-[17px]" /> Log out
        </button>

        {user && (
          <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-white/10 px-3 py-2.5">
            <Avatar name={user.name} tone={user.avatarTone} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-bold text-white">{user.name}</p>
              <p className="truncate text-[9.5px] text-white/40">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-offwhite">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[262px] lg:block">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-forest-950/55 backdrop-blur-[2px] animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] shadow-lift animate-slide-down">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-[262px]">
        <header className="sticky top-0 z-40 border-b border-forest/[0.07] bg-white/90 backdrop-blur-md">
          <div className="flex h-[66px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-forest/10 text-slateink transition hover:border-cricket/30 hover:text-cricket lg:hidden"
              aria-label="Open sidebar"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slateink-faint">
                <Link to={`/${slug}`} className="transition hover:text-cricket">{navigation.roleLabel}</Link>
                <ChevronRight className="h-2.5 w-2.5" />
                <span className="text-slateink">{current.label}</span>
              </div>
              <h1 className="truncate font-display text-[17px] font-bold text-forest">{current.label}</h1>
            </div>

            <div className="flex items-center gap-2">
              <DashboardSearch items={allItems} />
              <NotificationsMenu />
              <span className="mx-1 hidden h-7 w-px bg-forest/10 sm:block" />
              <UserMenu variant="light" />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1360px]">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-forest/[0.07] px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-2 text-[10px] text-slateink-faint sm:flex-row">
            <p>© {new Date().getFullYear()} CRICREX · {navigation.roleLabel} demo workspace</p>
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Data saved locally · no backend connected
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
