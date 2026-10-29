import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Heart,
  Images,
  Info,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Users,
} from 'lucide-react';
import { grounds } from '@/data/mock';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { GroundCard } from '@/components/GroundCard';
import { amenityIcon } from '@/components/ui/amenityIcon';
import { useApp } from '@/context/AppContext';
import { cn, dayParts, formatDate, getSlotsFor, getUpcomingDays, inr, relativeDay, TIME_SLOTS } from '@/lib/utils';
import type { Booking } from '@/types';

const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'amenities', label: 'Amenities', icon: <Sparkles className="h-3.5 w-3.5" /> },
  { value: 'reviews', label: 'Reviews' },
  { value: 'location', label: 'Location', icon: <MapPin className="h-3.5 w-3.5" /> },
];

const rules = [
  'Arrive 15 minutes before your slot for a smooth check-in.',
  'Only non-marking shoes on artificial turf; spikes allowed on outdoor turf.',
  'No glass containers or spikes on the practice square.',
  'Free cancellation up to 24 hours before the slot (simulated).',
];

export function GroundDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { addBooking, pushToast } = useApp();
  const ground = grounds.find((item) => item.id === id);
  const bookingRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => getUpcomingDays(7), []);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [tab, setTab] = useState('overview');
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [saved, setSaved] = useState(false);
  const [players, setPlayers] = useState(16);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [highlight, setHighlight] = useState(false);

  const slots = useMemo(
    () => (ground ? getSlotsFor(ground.id, selectedDate) : []),
    [ground, selectedDate],
  );

  const openSlots = slots.filter((slot) => slot.available);
  const subtotal = ground ? ground.price * selectedSlots.length : 0;
  const fee = selectedSlots.length > 0 ? 49 : 0;
  const total = subtotal + fee;

  useEffect(() => {
    if (params.get('book') === '1' && ground) {
      const timer = setTimeout(() => {
        bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlight(true);
        setTimeout(() => setHighlight(false), 2200);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [params, ground]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!ground) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={<MapPin className="h-6 w-6" />}
          title="We couldn’t find that ground"
          description="The listing may have been removed from the demo catalogue. Explore the other CRICREX grounds instead."
          action={<Link to="/grounds" className={buttonStyles('primary')}>Back to Explore Grounds</Link>}
        />
      </div>
    );
  }

  const toggleSlot = (time: string) => {
    setSelectedSlots((current) =>
      current.includes(time) ? current.filter((slot) => slot !== time) : [...current, time],
    );
  };

  const startBooking = () => {
    if (selectedSlots.length === 0) {
      pushToast({
        title: 'Choose at least one slot',
        description: 'Select an available time slot before continuing to review.',
        tone: 'warning',
      });
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setReviewOpen(true);
  };

  const confirmBooking = () => {
    const booking = addBooking({
      groundId: ground.id,
      groundName: ground.name,
      image: ground.image,
      city: ground.city,
      date: selectedDate,
      slots: [...selectedSlots].sort((a, b) => TIME_SLOTS.indexOf(a) - TIME_SLOTS.indexOf(b)),
      amount: total,
      players,
      note: note.trim() || undefined,
    });
    setConfirmed(booking);
    setReviewOpen(false);
    setSelectedSlots([]);
    setNote('');
    pushToast({
      title: 'Demo booking confirmed',
      description: `Reference ${booking.reference} created locally in your browser.`,
      tone: 'success',
    });
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      pushToast({ title: 'Link copied', description: 'Ground link copied to your clipboard.', tone: 'success' });
    } catch {
      pushToast({ title: 'Copy this link', description: window.location.href, tone: 'info' });
    }
  };

  const similar = grounds
    .filter((item) => item.id !== ground.id && (item.city === ground.city || item.type === ground.type))
    .slice(0, 3);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const base = Math.max(0, 100 - Math.abs(star - Math.round(ground.rating)) * 32 - (star < 4 ? 18 : 0));
    return { star, percent: Math.min(92, base) };
  });

  return (
    <div className="bg-offwhite pb-16">
      <div className="bg-white">
        <div className="container-page flex items-center justify-between gap-3 py-3.5">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[11px] text-slateink-light">
            <Link to="/" className="transition hover:text-cricket">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link to="/grounds" className="transition hover:text-cricket">Grounds</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate font-semibold text-forest">{ground.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSaved((current) => !current);
                pushToast({
                  title: saved ? 'Removed from saved' : 'Saved for later',
                  description: saved ? 'This ground was removed from your demo list.' : 'Find it in your saved grounds during this demo session.',
                  tone: saved ? 'info' : 'success',
                });
              }}
              className={cn(
                'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition',
                saved ? 'border-matchday bg-matchday/10 text-[#B25E00]' : 'border-forest/10 text-slateink hover:border-cricket/30 hover:text-cricket',
              )}
              aria-pressed={saved}
            >
              <Heart className={cn('h-3.5 w-3.5', saved && 'fill-current')} /> {saved ? 'Saved' : 'Save'}
            </button>
            <button
              type="button"
              onClick={share}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-forest/10 px-3 text-xs font-semibold text-slateink transition hover:border-cricket/30 hover:text-cricket"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="container-page pt-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slateink-light transition hover:text-cricket">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>

        {/* Gallery */}
        <div className="grid gap-2.5 lg:grid-cols-[2fr_1fr]">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl"
            aria-label="Open ground photo gallery"
          >
            <img
              src={ground.gallery[activeImage]}
              alt={`${ground.name} — photo ${activeImage + 1}`}
              className="h-[280px] w-full object-cover transition duration-700 group-hover:scale-[1.02] sm:h-[420px] lg:h-[480px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/55 via-transparent to-transparent" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <Badge tone="forest" className="border border-white/20 bg-forest/80 backdrop-blur">{ground.type}</Badge>
              <Badge tone={ground.availableToday ? 'success' : 'warning'} dot className="bg-white/95">
                {ground.availableToday ? 'Available today' : 'Limited slots'}
              </Badge>
            </div>
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-[11px] font-bold text-forest shadow-sm backdrop-blur">
              <Images className="h-3.5 w-3.5" /> {ground.gallery.length} photos
            </span>
          </button>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
            {ground.gallery.slice(1, 3).map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => {
                  setActiveImage(index + 1);
                  setLightbox(true);
                }}
                className="group relative overflow-hidden rounded-2xl"
                aria-label={`Open photo ${index + 2}`}
              >
                <img
                  src={image}
                  alt={`${ground.name} — photo ${index + 2}`}
                  className="h-[134px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[204px] lg:h-[235px]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-forest-950/0 transition group-hover:bg-forest-950/20" />
                {index === 1 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-forest-950/35 text-xs font-bold text-white backdrop-blur-[1px]">
                    View gallery
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px] xl:gap-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="grass">{ground.type}</Badge>
                  <Badge tone="neutral">Capacity {ground.capacity}</Badge>
                  <Badge tone="info" dot>Verified ground</Badge>
                </div>
                <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-forest sm:text-[38px]">
                  {ground.name}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slateink-light">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-cricket" /> {ground.locality}, {ground.city}</span>
                  <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-cricket" /> {ground.openHours}</span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Rating value={ground.rating} count={ground.reviewCount} size="md" />
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <button type="button" onClick={() => setTab('reviews')} className="flex items-center gap-1.5 text-xs font-semibold text-cricket hover:text-forest">
                    <MessageSquare className="h-3.5 w-3.5" /> {ground.reviewCount} reviews
                  </button>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-xs font-medium text-slateink-light">Popularity {ground.popularity}/100</span>
                </div>
              </div>
            </div>

            <div className="mt-7">
              <Tabs options={tabs} value={tab} onChange={setTab} variant="underline" />
            </div>

            <div className="mt-6 animate-fade-in" key={tab}>
              {tab === 'overview' && (
                <div className="space-y-8">
                  <div className="card p-6">
                    <h2 className="font-display text-lg font-bold text-forest">About this ground</h2>
                    <p className="mt-3 text-sm leading-7 text-slateink-light">{ground.description}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { label: 'Surface', value: ground.type, icon: Sparkles },
                        { label: 'Capacity', value: `${ground.capacity} players`, icon: Users },
                        { label: 'Open', value: ground.openHours, icon: Clock3 },
                        { label: 'Rating', value: `${ground.rating} / 5`, icon: Star },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-xl border border-forest/[0.07] bg-offwhite/60 p-3.5">
                          <Icon className="h-4 w-4 text-cricket" />
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slateink-faint">{label}</p>
                          <p className="mt-0.5 text-xs font-bold text-forest">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-lg font-bold text-forest">Facilities at a glance</h2>
                      <button type="button" onClick={() => setTab('amenities')} className="text-xs font-bold text-cricket hover:text-forest">
                        All amenities
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {ground.amenities.slice(0, 8).map((amenity) => {
                        const Icon = amenityIcon(amenity);
                        return (
                          <div key={amenity} className="card flex items-center gap-2.5 p-3.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cricket/10 text-cricket">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="text-xs font-semibold text-forest">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="card p-6">
                    <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
                      <ShieldCheck className="h-5 w-5 text-cricket" /> Ground rules
                    </h2>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {rules.map((rule) => (
                        <li key={rule} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slateink-light">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {tab === 'amenities' && (
                <div className="card p-6">
                  <h2 className="font-display text-lg font-bold text-forest">Everything included</h2>
                  <p className="mt-1.5 text-sm text-slateink-light">Amenities listed are simulated demo data for this ground.</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {ground.amenities.map((amenity) => {
                      const Icon = amenityIcon(amenity);
                      return (
                        <div key={amenity} className="flex items-center gap-3 rounded-xl border border-forest/[0.07] bg-offwhite/50 p-4">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-cricket shadow-sm">
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                          <div>
                            <p className="text-sm font-bold text-forest">{amenity}</p>
                            <p className="text-[11px] text-slateink-light">Included with your booking</p>
                          </div>
                          <CheckCircle2 className="ml-auto h-4 w-4 text-success" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 rounded-xl border border-matchday/25 bg-matchday/[0.07] p-4 text-xs leading-relaxed text-[#8A5000]">
                    <strong>Note:</strong> Equipment rental, where listed, may carry a separate charge at the venue. Prices on CRICREX are demo estimates only.
                  </div>
                </div>
              )}

              {tab === 'reviews' && (
                <div className="space-y-5">
                  <div className="card grid gap-6 p-6 sm:grid-cols-[200px_1fr]">
                    <div className="flex flex-col items-center justify-center border-forest/[0.07] text-center sm:border-r">
                      <p className="font-display text-5xl font-extrabold text-forest">{ground.rating.toFixed(1)}</p>
                      <Rating value={ground.rating} showValue={false} size="md" className="mt-2" />
                      <p className="mt-2 text-[11px] text-slateink-light">{ground.reviewCount} demo reviews</p>
                    </div>
                    <div className="space-y-2">
                      {ratingBreakdown.map(({ star, percent }) => (
                        <div key={star} className="flex items-center gap-2.5">
                          <span className="flex w-8 items-center gap-0.5 text-[11px] font-semibold text-slateink">{star}<Star className="h-2.5 w-2.5 fill-matchday text-matchday" /></span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-forest/[0.06]">
                            <div className="h-full rounded-full bg-matchday" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="w-8 text-right text-[10px] text-slateink-light">{percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {ground.reviews.map((review) => (
                    <article key={review.id} className="card p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cricket to-forest text-xs font-bold text-white">
                            {review.initials}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-forest">{review.author}</p>
                            <p className="text-[11px] text-slateink-light">{formatDate(review.date)} · Verified demo review</p>
                          </div>
                        </div>
                        <Rating value={review.rating} showValue={false} />
                      </div>
                      <p className="mt-4 text-[13.5px] leading-relaxed text-slateink-light">{review.comment}</p>
                      <button
                        type="button"
                        onClick={() => pushToast({ title: 'Helpful review', description: 'Thanks — feedback is stored only for this demo session.', tone: 'success' })}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-forest/10 px-2.5 py-1.5 text-[11px] font-semibold text-slateink-light transition hover:border-cricket/30 hover:text-cricket"
                      >
                        <ThumbsUp className="h-3 w-3" /> Helpful
                      </button>
                    </article>
                  ))}
                </div>
              )}

              {tab === 'location' && (
                <div className="card overflow-hidden">
                  <div className="relative h-64 overflow-hidden bg-[#DDE9DA] surface-grid">
                    <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #B7D9AE 0 12%, transparent 12%), radial-gradient(circle at 70% 65%, #C9E3C2 0 18%, transparent 18%)' }} />
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-white shadow-lift">
                        <MapPin className="h-6 w-6" />
                      </span>
                      <span className="mt-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-forest shadow-sm">{ground.name}</span>
                    </div>
                    <span className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-2.5 py-1.5 text-[10px] font-semibold text-slateink-light backdrop-blur">
                      Map preview · demo location
                    </span>
                  </div>
                  <div className="p-6">
                    <h2 className="font-display text-lg font-bold text-forest">Getting there</h2>
                    <p className="mt-2 text-sm text-slateink-light">{ground.locality}, {ground.city}, India</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-forest/[0.07] bg-offwhite/60 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slateink-faint">Nearest landmark</p>
                        <p className="mt-1 text-sm font-semibold text-forest">{ground.locality} main road</p>
                      </div>
                      <div className="rounded-xl border border-forest/[0.07] bg-offwhite/60 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slateink-faint">Parking</p>
                        <p className="mt-1 text-sm font-semibold text-forest">{ground.amenities.includes('Parking') ? 'On-site parking available' : 'Street parking nearby'}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const address = `${ground.name}, ${ground.locality}, ${ground.city}, India`;
                          try {
                            await navigator.clipboard.writeText(address);
                            pushToast({ title: 'Address copied', description: address, tone: 'success' });
                          } catch {
                            pushToast({ title: 'Address', description: address, tone: 'info' });
                          }
                        }}
                        className={buttonStyles('outline', 'sm')}
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy address
                      </button>
                      <a
                        href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${ground.locality}, ${ground.city}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonStyles('ghost', 'sm', 'border border-forest/10')}
                      >
                        Open in maps <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking panel */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div
              ref={bookingRef}
              className={cn(
                'card overflow-hidden transition-shadow duration-500',
                highlight && 'ring-4 ring-matchday/40 shadow-lift',
              )}
            >
              <div className="border-b border-forest/[0.07] bg-gradient-to-br from-forest to-forest-900 p-5 text-white">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-grass">Hourly booking</p>
                    <p className="mt-1 font-display text-2xl font-extrabold">
                      {inr(ground.price)}
                      <span className="text-xs font-medium text-white/50"> / hour</span>
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-grass" /> {openSlots.length} open
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-forest">Select a date</p>
                  <span className="text-[10px] text-slateink-light">Next 7 days</span>
                </div>
                <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {days.map((day) => {
                    const parts = dayParts(day);
                    const active = day === selectedDate;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setSelectedDate(day);
                          setSelectedSlots([]);
                        }}
                        aria-pressed={active}
                        className={cn(
                          'flex w-[52px] shrink-0 flex-col items-center rounded-xl border py-2 transition',
                          active
                            ? 'border-cricket bg-cricket text-white shadow-sm'
                            : 'border-forest/10 bg-white text-forest hover:border-cricket/40 hover:bg-cricket/[0.04]',
                        )}
                      >
                        <span className={cn('text-[9px] font-bold uppercase', active ? 'text-white/65' : 'text-slateink-faint')}>
                          {relativeDay(day) === 'Today' ? 'Today' : parts.day}
                        </span>
                        <span className="font-display text-lg font-extrabold leading-tight">{parts.date}</span>
                        <span className={cn('text-[9px] font-medium', active ? 'text-white/65' : 'text-slateink-light')}>{parts.month}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xs font-bold text-forest">Available time slots</p>
                  <span className="flex items-center gap-1 text-[10px] text-slateink-light">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" /> available
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                  {slots.map((slot) => {
                    const active = selectedSlots.includes(slot.time);
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => toggleSlot(slot.time)}
                        aria-pressed={active}
                        className={cn(
                          'rounded-lg border py-2 text-[10.5px] font-bold transition',
                          !slot.available && 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through',
                          slot.available && active && 'border-cricket bg-cricket text-white shadow-sm',
                          slot.available && !active && 'border-forest/10 bg-white text-slateink hover:border-cricket/50 hover:text-cricket',
                        )}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
                {selectedSlots.length === 0 && (
                  <p className="mt-2.5 text-[10.5px] text-slateink-faint">Tap a time slot to start your demo booking.</p>
                )}

                <div className="mt-5 flex items-center justify-between rounded-xl border border-forest/[0.07] bg-offwhite/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-xs font-semibold text-forest">
                    <Users className="h-4 w-4 text-cricket" /> Players
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlayers((current) => Math.max(2, current - 2))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-forest/10 bg-white text-slateink transition hover:border-cricket/40 hover:text-cricket"
                      aria-label="Decrease players"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-forest">{players}</span>
                    <button
                      type="button"
                      onClick={() => setPlayers((current) => Math.min(40, current + 2))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-forest/10 bg-white text-slateink transition hover:border-cricket/40 hover:text-cricket"
                      aria-label="Increase players"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-forest/[0.07] pt-4 text-xs">
                  <div className="flex justify-between text-slateink-light">
                    <span>{selectedSlots.length > 0 ? `${selectedSlots.length} slot${selectedSlots.length > 1 ? 's' : ''} × ${inr(ground.price)}` : 'Subtotal'}</span>
                    <span className="font-semibold text-slateink">{selectedSlots.length > 0 ? inr(subtotal) : '—'}</span>
                  </div>
                  <div className="flex justify-between text-slateink-light">
                    <span>Platform fee (demo)</span>
                    <span className="font-semibold text-slateink">{selectedSlots.length > 0 ? inr(fee) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-bold text-forest">Estimated total</span>
                    <span className="font-display text-xl font-extrabold text-forest">{selectedSlots.length > 0 ? inr(total) : inr(0)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startBooking}
                  className={buttonStyles('accent', 'lg', 'mt-4 w-full')}
                >
                  <CalendarDays className="h-[18px] w-[18px]" /> Book Now
                </button>

                <div className="mt-3 flex items-start gap-2 rounded-xl bg-forest/[0.035] px-3 py-2.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cricket" />
                  <p className="text-[10px] leading-relaxed text-slateink-light">
                    This is a simulated booking flow. No payment is collected and no real reservation is made.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slateink-faint">
                  <ShieldCheck className="h-3 w-3 text-success" /> Free cancellation up to 24h (demo)
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-forest/[0.07] bg-white p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-grass/20 text-cricket">
                <BadgeCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-forest">Verified by CRICREX</p>
                <p className="text-[10.5px] text-slateink-light">Listed by {ground.ownerId.replace('usr-owner-', 'Owner #')}</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar grounds */}
        {similar.length > 0 && (
          <div className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow">More like this</span>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-forest">Similar grounds</h2>
              </div>
              <Link to="/grounds" className="link-underline">View all <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <GroundCard key={item.id} ground={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Modal open={lightbox} onClose={() => setLightbox(false)} title={`${ground.name} gallery`} size="xl">
        <div className="overflow-hidden rounded-2xl">
          <img src={ground.gallery[activeImage]} alt={`${ground.name} enlarged`} className="max-h-[60vh] w-full object-cover" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {ground.gallery.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(index)}
              className={cn('overflow-hidden rounded-xl border-2', activeImage === index ? 'border-cricket' : 'border-transparent opacity-75 hover:opacity-100')}
            >
              <img src={image} alt={`Thumbnail ${index + 1}`} className="h-20 w-full object-cover" />
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-slateink-faint">Demo gallery · actual venue may differ</p>
      </Modal>

      {/* Review & confirm */}
      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review your booking"
        description="Confirm the details below. This is a demo reservation only."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Keep editing</Button>
            <Button variant="accent" onClick={confirmBooking} icon={<CheckCircle2 className="h-4 w-4" />}>
              Confirm demo booking
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 rounded-2xl border border-forest/[0.07] bg-offwhite/70 p-3">
          <img src={ground.image} alt={ground.name} className="h-16 w-20 rounded-xl object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-forest">{ground.name}</p>
            <p className="text-[11px] text-slateink-light">{ground.locality}, {ground.city}</p>
            <Rating value={ground.rating} count={ground.reviewCount} className="mt-1" />
          </div>
        </div>

        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slateink-light">Date</dt>
            <dd className="text-right font-semibold text-forest">{formatDate(selectedDate, 'long')}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slateink-light">Time slots</dt>
            <dd className="max-w-[60%] text-right font-semibold text-forest">{selectedSlots.join(', ')}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slateink-light">Players</dt>
            <dd className="font-semibold text-forest">{players}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slateink-light">Subtotal</dt>
            <dd className="font-semibold text-forest">{inr(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slateink-light">Platform fee (demo)</dt>
            <dd className="font-semibold text-forest">{inr(fee)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-forest/[0.07] pt-2.5">
            <dt className="font-bold text-forest">Total</dt>
            <dd className="font-display text-xl font-extrabold text-forest">{inr(total)}</dd>
          </div>
        </dl>

        <label htmlFor="booking-note" className="label mt-4">Booking note <span className="font-normal text-slateink-faint">(optional)</span></label>
        <textarea
          id="booking-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          placeholder="Pitch preparation, arrival time, team name…"
          className="field resize-none"
        />

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-matchday/25 bg-matchday/[0.08] p-3 text-[11px] leading-relaxed text-[#8A5000]">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          No payment is taken. The booking appears in My Bookings with a demo reference and can be cancelled anytime.
        </div>
      </Modal>

      {/* Success */}
      <Modal open={Boolean(confirmed)} onClose={() => setConfirmed(null)} size="sm" hideClose>
        {confirmed && (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-9 w-9 text-success" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-forest">Booking confirmed</h2>
            <p className="mt-1 text-sm text-slateink-light">Your demo slot is saved in this browser.</p>

            <div className="mt-5 rounded-2xl border border-dashed border-cricket/30 bg-cricket/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slateink-light">Booking reference</p>
              <p className="mt-1 font-display text-2xl font-extrabold tracking-wider text-forest">{confirmed.reference}</p>
              <Badge tone="success" className="mt-2" dot>{confirmed.status}</Badge>
            </div>

            <dl className="mt-4 space-y-2 text-left text-xs">
              <div className="flex justify-between gap-3"><dt className="text-slateink-light">Ground</dt><dd className="text-right font-semibold text-forest">{confirmed.groundName}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slateink-light">Date</dt><dd className="text-right font-semibold text-forest">{formatDate(confirmed.date, 'long')}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slateink-light">Slots</dt><dd className="max-w-[60%] text-right font-semibold text-forest">{confirmed.slots.join(', ')}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slateink-light">Total</dt><dd className="text-right font-semibold text-forest">{inr(confirmed.amount)}</dd></div>
            </dl>

            <div className="mt-5 grid gap-2">
              <Link to="/bookings" className={buttonStyles('primary', 'md', 'w-full')}>
                View My Bookings <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={() => setConfirmed(null)} className={buttonStyles('outline', 'md', 'w-full')}>
                Back to ground
              </button>
            </div>
            <p className="mt-3 text-[10px] text-slateink-faint">Simulated reservation — not a real booking.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
