import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Settings, Ticket, UserRound } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { roleHome, roleSlug } from '@/lib/utils';

export function UserMenu({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;
  const slug = roleSlug(user.role);
  const textTone = variant === 'dark' ? 'text-white' : 'text-forest';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          variant === 'dark'
            ? 'flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1 pl-1 pr-2.5 transition hover:bg-white/[0.12]'
            : 'flex items-center gap-2 rounded-full border border-forest/10 bg-white py-1 pl-1 pr-2.5 transition hover:bg-offwhite'
        }
      >
        <Avatar name={user.name} tone={user.avatarTone} size="sm" />
        <span className={`hidden text-left lg:block ${textTone}`}>
          <span className="block text-[12.5px] font-semibold leading-tight">{user.name.split(' ')[0]}</span>
          <span className={`block text-[10px] ${variant === 'dark' ? 'text-white/55' : 'text-slateink-light'}`}>{user.role}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 ${variant === 'dark' ? 'text-white/60' : 'text-slateink-light'}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-forest/10 bg-white p-1.5 shadow-lift animate-slide-down"
        >
          <div className="flex items-center gap-3 rounded-xl bg-offwhite px-3 py-3">
            <Avatar name={user.name} tone={user.avatarTone} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-forest">{user.name}</p>
              <p className="truncate text-[11px] text-slateink-light">{user.email}</p>
            </div>
          </div>
          <div className="mt-1 space-y-0.5">
            <Link to={roleHome(user.role)} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slateink transition hover:bg-offwhite hover:text-forest" role="menuitem">
              <LayoutDashboard className="h-4 w-4 text-cricket" /> Dashboard
            </Link>
            <Link to="/bookings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slateink transition hover:bg-offwhite hover:text-forest" role="menuitem">
              <Ticket className="h-4 w-4 text-cricket" /> My Bookings
            </Link>
            <Link to={`/${slug}/profile`} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slateink transition hover:bg-offwhite hover:text-forest" role="menuitem">
              <UserRound className="h-4 w-4 text-cricket" /> Profile
            </Link>
            <Link to={`/${slug}/settings`} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slateink transition hover:bg-offwhite hover:text-forest" role="menuitem">
              <Settings className="h-4 w-4 text-cricket" /> Settings
            </Link>
          </div>
          <div className="mt-1 border-t border-forest/[0.07] pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
                navigate('/');
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
