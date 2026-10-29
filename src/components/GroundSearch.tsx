import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MapPin, Search, Trees } from 'lucide-react';
import { grounds } from '@/data/mock';
import { cn } from '@/lib/utils';

export function GroundSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');

  const cityOptions = useMemo(() => Array.from(new Set(grounds.map((ground) => ground.city))).sort(), []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    navigate(`/grounds${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Search cricket grounds"
      className={cn(
        'rounded-2xl border border-white/60 bg-white p-2.5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.55)] sm:rounded-[22px]',
        className,
      )}
    >
      <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-[1.05fr_1.2fr_0.95fr_auto] lg:items-center lg:gap-0">
        <label className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-offwhite lg:px-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cricket/10 text-cricket">
            <MapPin className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slateink-faint">City or location</span>
            <span className="relative block">
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                aria-label="City or location"
                className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-[13.5px] font-semibold text-forest focus:outline-none"
              >
                <option value="">Anywhere in India</option>
                {cityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slateink-light" />
            </span>
          </span>
        </label>

        <div className="hidden h-9 w-px bg-forest/10 lg:block" />

        <label className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-offwhite lg:px-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cricket/10 text-cricket">
            <Search className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slateink-faint">Ground name</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. Greenfield Arena"
              aria-label="Ground name"
              className="w-full bg-transparent text-[13.5px] font-semibold text-forest placeholder:font-normal placeholder:text-slateink-faint focus:outline-none"
            />
          </span>
        </label>

        <div className="hidden h-9 w-px bg-forest/10 lg:block" />

        <label className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-offwhite lg:px-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cricket/10 text-cricket">
            <Trees className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slateink-faint">Ground type</span>
            <span className="relative block">
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                aria-label="Ground type"
                className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-[13.5px] font-semibold text-forest focus:outline-none"
              >
                <option value="">All surfaces</option>
                <option value="Outdoor Turf">Outdoor turf</option>
                <option value="Artificial Turf">Artificial turf</option>
                <option value="Indoor Nets">Indoor nets</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slateink-light" />
            </span>
          </span>
        </label>

        <button
          type="submit"
          className="mt-1 flex h-[52px] items-center justify-center gap-2 rounded-xl bg-matchday px-6 font-bold text-forest shadow-[0_12px_28px_-12px_rgba(255,159,67,0.9)] transition hover:bg-matchday-dark active:scale-[0.99] sm:col-span-2 lg:mt-0 lg:col-span-1"
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={2.5} />
          Search Grounds
        </button>
      </div>
    </form>
  );
}
