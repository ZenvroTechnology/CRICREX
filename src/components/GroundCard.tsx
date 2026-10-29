import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Heart, MapPin, Star, Users } from 'lucide-react';
import type { Ground } from '@/types';
import { cn, inr } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';
import { buttonStyles } from '@/components/ui/Button';

export function GroundCard({ ground, variant = 'grid' }: { ground: Ground; variant?: 'grid' | 'list' }) {
  const { pushToast } = useApp();
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const toggleSave = () => {
    setSaved((current) => !current);
    pushToast({
      title: saved ? 'Removed from saved grounds' : 'Saved for later',
      description: saved ? `${ground.name} was removed from your demo list.` : `${ground.name} was added to your demo list.`,
      tone: saved ? 'info' : 'success',
    });
  };

  const saveButton = (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleSave();
      }}
      aria-label={saved ? `Remove ${ground.name} from saved grounds` : `Save ${ground.name}`}
      aria-pressed={saved}
      className={cn(
        'absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/50 backdrop-blur transition',
        saved ? 'bg-matchday text-white' : 'bg-white/90 text-slateink hover:bg-white hover:text-rose-500',
      )}
    >
      <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
    </button>
  );

  if (variant === 'list') {
    return (
      <article className="card card-hover group overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <Link to={`/grounds/${ground.id}`} className="relative block w-full shrink-0 overflow-hidden sm:w-[290px]">
            <div className="relative h-52 w-full sm:h-full sm:min-h-[210px]">
              <img
                src={ground.image}
                alt={`${ground.name} cricket ground in ${ground.city}`}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/50 via-transparent to-transparent" />
            </div>
            <span className="absolute left-3 top-3">
              <Badge tone="forest" className="bg-forest/85 backdrop-blur">
                {ground.type}
              </Badge>
            </span>
            {saveButton}
          </Link>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link to={`/grounds/${ground.id}`} className="font-display text-lg font-bold text-forest transition hover:text-cricket">
                  {ground.name}
                </Link>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slateink-light">
                  <MapPin className="h-3.5 w-3.5 text-cricket" />
                  {ground.locality}, {ground.city}
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-lg bg-matchday/10 px-2 py-1 text-xs font-bold text-[#B25E00]">
                <Star className="h-3.5 w-3.5 fill-matchday text-matchday" />
                {ground.rating.toFixed(1)}
                <span className="font-medium text-slateink-faint">({ground.reviewCount})</span>
              </span>
            </div>

            <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-slateink-light">{ground.description}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-slateink-light">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-cricket" /> Up to {ground.capacity} players
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarCheck className="h-3.5 w-3.5 text-cricket" /> {ground.openHours}
              </span>
              <Badge tone={ground.availableToday ? 'success' : 'warning'} dot>
                {ground.availableToday ? 'Available today' : 'Limited slots'}
              </Badge>
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
              <p className="text-sm text-slateink-light">
                <span className="font-display text-xl font-extrabold text-forest">{inr(ground.price)}</span>
                <span className="text-xs"> / hour</span>
              </p>
              <div className="flex gap-2">
                <Link to={`/grounds/${ground.id}`} className={buttonStyles('outline', 'sm')}>
                  View Details
                </Link>
                <button type="button" onClick={() => navigate(`/grounds/${ground.id}?book=1`)} className={buttonStyles('accent', 'sm')}>
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <div className="relative overflow-hidden">
        <Link to={`/grounds/${ground.id}`} aria-label={`View ${ground.name}`}>
          <div className="relative aspect-[16/11] overflow-hidden">
            <img
              src={ground.image}
              alt={`${ground.name} cricket ground in ${ground.city}`}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/65 via-forest-950/5 to-transparent" />
          </div>
        </Link>

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <Badge tone="forest" className="bg-forest/80 backdrop-blur-sm">
            {ground.type}
          </Badge>
          {ground.featured && (
            <Badge tone="orange" className="bg-matchday text-forest ring-0">
              Featured
            </Badge>
          )}
        </div>
        {saveButton}

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <Badge tone={ground.availableToday ? 'success' : 'warning'} dot className="bg-white/95 shadow-sm backdrop-blur">
            {ground.availableToday ? 'Available today' : 'Limited slots'}
          </Badge>
          <span className="flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-[11px] font-bold text-forest shadow-sm backdrop-blur">
            <Star className="h-3 w-3 fill-matchday text-matchday" />
            {ground.rating.toFixed(1)}
            <span className="font-medium text-slateink-light">({ground.reviewCount})</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link to={`/grounds/${ground.id}`} className="font-display text-[17px] font-bold leading-snug text-forest transition group-hover:text-cricket">
          {ground.name}
        </Link>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slateink-light">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-cricket" />
          {ground.locality}, {ground.city}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slateink-light">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-cricket" /> {ground.capacity} players
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{ground.openHours}</span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2 border-t border-forest/[0.07] pt-4">
            <p>
              <span className="font-display text-xl font-extrabold text-forest">{inr(ground.price)}</span>
              <span className="text-xs text-slateink-light"> / hour</span>
            </p>
            <Link to={`/grounds/${ground.id}`} className="text-[12.5px] font-bold text-cricket transition hover:text-forest">
              View details
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_1.15fr] gap-2">
            <Link to={`/grounds/${ground.id}`} className={buttonStyles('outline', 'sm')}>
              Details
            </Link>
            <button
              type="button"
              onClick={() => navigate(`/grounds/${ground.id}?book=1`)}
              className={buttonStyles('accent', 'sm')}
            >
              Book Now <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
