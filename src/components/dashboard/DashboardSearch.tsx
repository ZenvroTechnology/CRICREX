import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import type { DashboardNavItem } from '@/config/navigation';

export function DashboardSearch({ items }: { items: DashboardNavItem[] }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const matches = query.trim()
    ? items.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  const go = (to: string) => {
    navigate(to);
    setQuery('');
    setFocused(false);
  };

  return (
    <div className="relative hidden md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-faint" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && matches[0]) go(matches[0].to);
          if (event.key === 'Escape') setQuery('');
        }}
        placeholder="Search pages…"
        aria-label="Search dashboard pages"
        className="h-10 w-52 rounded-xl border border-forest/10 bg-white pl-9 pr-3 text-xs text-slateink placeholder:text-slateink-faint focus:border-cricket focus:outline-none focus:ring-4 focus:ring-cricket/10 lg:w-60"
      />
      {focused && query.trim() && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-forest/10 bg-white py-1 shadow-lift animate-slide-down">
          {matches.length === 0 ? (
            <p className="px-3 py-3 text-[11px] text-slateink-light">No pages match “{query}”.</p>
          ) : (
            matches.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => go(item.to)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slateink transition hover:bg-offwhite hover:text-forest"
                >
                  <Icon className="h-3.5 w-3.5 text-cricket" />
                  {item.label}
                  <ArrowRight className="ml-auto h-3 w-3 text-slateink-faint" />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
