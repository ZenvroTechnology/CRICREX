import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.replace('#', ''));
      if (target) {
        window.setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-offwhite">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
