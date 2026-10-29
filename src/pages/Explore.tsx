import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Trees,
  X,
} from 'lucide-react';
import { grounds } from '@/data/mock';
import { GroundCard } from '@/components/GroundCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { cn, inr } from '@/lib/utils';

const cities = Array.from(new Set(grounds.map((ground) => ground.city))).sort();
const types = ['Outdoor Turf', 'Artificial Turf', 'Indoor Nets'];
const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'popular', label: 'Most popular' },
];

interface FilterState {
  q: string;
  city: string;
  type: string;
  min: number;
  max: number;
  rating: number;
  available: boolean;
  sort: string;
}

function readFilters(params: URLSearchParams): FilterState {
  return {
    q: params.get('q') ?? '',
    city: params.get('city') ?? '',
    type: params.get('type') ?? '',
    min: Number(params.get('min') ?? 0),
    max: Number(params.get('max') ?? 3000),
    rating: Number(params.get('rating') ?? 0),
    available: params.get('availability') === 'today',
    sort: params.get('sort') ?? 'recommended',
  };
}

export function Explore() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);
  const [view, setView] = useState<'grid' | 'list'>((params.get('view') as 'grid' | 'list') ?? 'grid');
  const [visible, setVisible] = useState(6);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const update = (patch: Partial<FilterState> & { view?: 'grid' | 'list' }) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (key === 'view') {
        if (value === 'list') next.set('view', 'list');
        else next.delete('view');
        return;
      }
      if (key === 'min' && Number(value) > 0) next.set('min', String(value));
      else if (key === 'min') next.delete('min');
      else if (key === 'max' && Number(value) < 3000) next.set('max', String(value));
      else if (key === 'max') next.delete('max');
      else if (key === 'rating' && Number(value) > 0) next.set('rating', String(value));
      else if (key === 'rating') next.delete('rating');
      else if (key === 'available') {
        if (value) next.set('availability', 'today');
        else next.delete('availability');
      } else if (key === 'sort') {
        if (value === 'recommended') next.delete('sort');
        else next.set('sort', String(value));
      } else if (value) next.set(key, String(value));
      else next.delete(key);
    });
    setParams(next, { replace: true });
    setVisible(6);
  };

  const reset = () => {
    setParams(new URLSearchParams(), { replace: true });
    setVisible(6);
  };

  const results = useMemo(() => {
    const query = filters.q.toLowerCase().trim();
    const filtered = grounds.filter((ground) => {
      if (query && !`${ground.name} ${ground.city} ${ground.locality}`.toLowerCase().includes(query)) return false;
      if (filters.city && ground.city !== filters.city) return false;
      if (filters.type && ground.type !== filters.type) return false;
      if (ground.price < filters.min || ground.price > filters.max) return false;
      if (filters.rating > 0 && ground.rating < filters.rating) return false;
      if (filters.available && !ground.availableToday) return false;
      return true;
    });

    const sorted = [...filtered];
    switch (filters.sort) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        sorted.sort((a, b) => b.popularity - a.popularity);
        break;
      default:
        sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.popularity - a.popularity);
    }
    return sorted;
  }, [filters]);

  const activeCount = [
    filters.q,
    filters.city,
    filters.type,
    filters.min > 0 || filters.max < 3000 ? 'price' : '',
    filters.rating,
    filters.available,
  ].filter(Boolean).length;

  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.q) activeChips.push({ key: 'q', label: `“${filters.q}”`, clear: () => update({ q: '' }) });
  if (filters.city) activeChips.push({ key: 'city', label: filters.city, clear: () => update({ city: '' }) });
  if (filters.type) activeChips.push({ key: 'type', label: filters.type, clear: () => update({ type: '' }) });
  if (filters.min > 0 || filters.max < 3000)
    activeChips.push({
      key: 'price',
      label: `${inr(filters.min)} – ${inr(filters.max)}${filters.max >= 3000 ? '+' : ''}`,
      clear: () => update({ min: 0, max: 3000 }),
    });
  if (filters.rating) activeChips.push({ key: 'rating', label: `${filters.rating}+ rating`, clear: () => update({ rating: 0 }) });
  if (filters.available) activeChips.push({ key: 'available', label: 'Available today', clear: () => update({ available: false }) });

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <label htmlFor="explore-search" className="label">Search</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
          <input
            id="explore-search"
            value={filters.q}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="Ground, area or city"
            className="field pl-10"
          />
        </div>
      </div>

      <div>
        <label htmlFor="explore-city" className="label">Location</label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
          <select
            id="explore-city"
            value={filters.city}
            onChange={(event) => update({ city: event.target.value })}
            className="field appearance-none pl-10 pr-8"
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="label mb-0">Hourly price</span>
          <span className="text-[11px] font-bold text-cricket">
            {inr(filters.min)} – {filters.max >= 3000 ? `${inr(3000)}+` : inr(filters.max)}
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slateink-faint">
              <span>Minimum</span>
              <span>{inr(filters.min)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={3000}
              step={100}
              value={filters.min}
              aria-label="Minimum hourly price"
              onChange={(event) => update({ min: Math.min(Number(event.target.value), filters.max) })}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-forest/10 accent-cricket"
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slateink-faint">
              <span>Maximum</span>
              <span>{filters.max >= 3000 ? `${inr(3000)}+` : inr(filters.max)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={3000}
              step={100}
              value={filters.max}
              aria-label="Maximum hourly price"
              onChange={(event) => update({ max: Math.max(Number(event.target.value), filters.min) })}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-forest/10 accent-cricket"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { label: 'Under ₹1,200', min: 0, max: 1200 },
            { label: '₹1,200 – ₹1,800', min: 1200, max: 1800 },
            { label: '₹1,800+', min: 1800, max: 3000 },
          ].map((band) => (
            <button
              key={band.label}
              type="button"
              onClick={() => update({ min: band.min, max: band.max })}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-[10.5px] font-semibold transition',
                filters.min === band.min && filters.max === band.max
                  ? 'border-cricket bg-cricket/10 text-cricket'
                  : 'border-forest/10 text-slateink-light hover:border-cricket/30 hover:text-cricket',
              )}
            >
              {band.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="explore-type" className="label">Ground type</label>
        <div className="relative">
          <Trees className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slateink-light" />
          <select
            id="explore-type"
            value={filters.type}
            onChange={(event) => update({ type: event.target.value })}
            className="field appearance-none pl-10 pr-8"
          >
            <option value="">All surfaces</option>
            {types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-forest/[0.07] pt-5">
        <p className="label">Minimum rating</p>
        <div className="grid grid-cols-2 gap-2">
          {[0, 3.5, 4, 4.5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => update({ rating })}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition',
                filters.rating === rating
                  ? 'border-cricket bg-cricket text-white'
                  : 'border-forest/10 text-slateink-light hover:border-cricket/30 hover:text-cricket',
              )}
            >
              {rating === 0 ? 'Any rating' : <><Star className="h-3 w-3 fill-current" /> {rating}+</>}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-forest/[0.07] pt-5">
        <p className="label">Availability</p>
        <button
          type="button"
          role="switch"
          aria-checked={filters.available}
          onClick={() => update({ available: !filters.available })}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-forest/10 px-3.5 py-3 text-left transition hover:border-cricket/30"
        >
          <span>
            <span className="block text-xs font-bold text-forest">Available today</span>
            <span className="mt-0.5 block text-[10.5px] text-slateink-light">Show grounds with open slots</span>
          </span>
          <span className={cn('relative h-5 w-9 shrink-0 rounded-full transition', filters.available ? 'bg-cricket' : 'bg-slate-300')}>
            <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all', filters.available ? 'left-[18px]' : 'left-0.5')} />
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={reset}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-forest/10 py-2.5 text-xs font-bold text-slateink transition hover:border-cricket/30 hover:text-cricket"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset all filters
      </button>
    </div>
  );

  return (
    <div>
      <section className="relative overflow-hidden bg-forest py-10 text-white sm:py-12">
        <div className="absolute inset-0 hero-grid opacity-50" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-grass/10 blur-3xl" />
        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-white/45">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/80">Explore Grounds</span>
          </nav>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Find your next ground</h1>
              <p className="mt-2 max-w-xl text-sm text-white/55">
                {grounds.length} verified grounds across {cities.length} cities. Filter by surface, price and availability — all happening live in your browser.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="grass" className="border border-grass/25 bg-grass/10 text-grass">
                <span className="h-1.5 w-1.5 rounded-full bg-grass" /> {grounds.filter((g) => g.availableToday).length} open today
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <div className="card p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-forest">
                    <SlidersHorizontal className="h-4 w-4 text-cricket" /> Filters
                    {activeCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cricket px-1.5 text-[10px] font-bold text-white">
                        {activeCount}
                      </span>
                    )}
                  </h2>
                </div>
                {filterPanel}
              </div>
              <div className="mt-4 rounded-2xl border border-matchday/25 bg-matchday/[0.08] p-4">
                <p className="text-xs font-bold text-[#8A5000]">Need a bigger ground?</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#9A6A2A]">
                  Capacities shown are demo values. Contact the ground owner through the details page.
                </p>
              </div>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-forest/10 bg-white px-3.5 text-xs font-bold text-forest shadow-sm lg:hidden"
                >
                  <Filter className="h-4 w-4 text-cricket" /> Filters
                  {activeCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cricket px-1.5 text-[10px] text-white">{activeCount}</span>
                  )}
                </button>
                <p className="text-sm text-slateink-light">
                  <span className="font-bold text-forest">{results.length}</span> ground{results.length === 1 ? '' : 's'} found
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-[11px] font-semibold text-slateink-light">Sort by</label>
                <select
                  id="sort"
                  value={filters.sort}
                  onChange={(event) => update({ sort: event.target.value })}
                  className="h-10 rounded-xl border border-forest/10 bg-white px-3 text-xs font-semibold text-forest shadow-sm focus:border-cricket focus:outline-none focus:ring-4 focus:ring-cricket/10"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1 rounded-xl border border-forest/10 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => { setView('grid'); update({ view: 'grid' }); }}
                    aria-label="Grid view"
                    aria-pressed={view === 'grid'}
                    className={cn('rounded-lg p-1.5 transition', view === 'grid' ? 'bg-cricket text-white' : 'text-slateink-light hover:text-forest')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setView('list'); update({ view: 'list' }); }}
                    aria-label="List view"
                    aria-pressed={view === 'list'}
                    className={cn('rounded-lg p-1.5 transition', view === 'list' ? 'bg-cricket text-white' : 'text-slateink-light hover:text-forest')}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.clear}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cricket/20 bg-cricket/[0.06] px-2.5 py-1.5 text-[11px] font-semibold text-cricket transition hover:bg-cricket/10"
                  >
                    {chip.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button type="button" onClick={reset} className="text-[11px] font-semibold text-slateink-light underline-offset-2 hover:text-forest hover:underline">
                  Clear all
                </button>
              </div>
            )}

            {results.length === 0 ? (
              <EmptyState
                className="mt-6"
                icon={<Search className="h-6 w-6" />}
                title="No grounds match those filters"
                description="Try widening your price range, removing the availability toggle, or searching a different city. Your filters are applied instantly."
                action={<Button variant="primary" icon={<RotateCcw className="h-4 w-4" />} onClick={reset}>Reset filters</Button>}
              />
            ) : (
              <>
                <div className={cn('mt-6', view === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4')}>
                  {results.slice(0, visible).map((ground) => (
                    <GroundCard key={ground.id} ground={ground} variant={view} />
                  ))}
                </div>

                <div className="mt-8 flex flex-col items-center gap-3">
                  <p className="text-xs text-slateink-light">
                    Showing <span className="font-bold text-forest">{Math.min(visible, results.length)}</span> of {results.length} grounds
                  </p>
                  {visible < results.length ? (
                    <Button variant="outline" onClick={() => setVisible((current) => current + 6)}>
                      Load more grounds
                    </Button>
                  ) : (
                    <p className="text-[11px] text-slateink-faint">You’ve seen every ground that matches — end of the list.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filter grounds" description="Filters apply instantly as you change them." size="sm">
        {filterPanel}
        <button
          type="button"
          onClick={() => setFiltersOpen(false)}
          className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-cricket text-sm font-bold text-white transition hover:bg-cricket-dark"
        >
          Show {results.length} ground{results.length === 1 ? '' : 's'}
        </button>
      </Modal>
    </div>
  );
}
