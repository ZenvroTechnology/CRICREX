export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function inr(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function compact(value: number): string {
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function parseIso(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDate(value: string, style: 'short' | 'long' | 'day' = 'short'): string {
  const date = value.includes('T') ? new Date(value) : parseIso(value);
  if (Number.isNaN(date.getTime())) return value;
  if (style === 'long') {
    return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }
  if (style === 'day') {
    return `${DAYS[date.getDay()]}`;
  }
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function dayParts(value: string): { day: string; date: string; month: string } {
  const date = parseIso(value);
  return {
    day: DAYS[date.getDay()],
    date: `${date.getDate()}`,
    month: MONTHS[date.getMonth()],
  };
}

export function relativeDay(value: string): string {
  const today = toIso(new Date());
  const tomorrow = toIso(addDays(new Date(), 1));
  if (value === today) return 'Today';
  if (value === tomorrow) return 'Tomorrow';
  return formatDate(value);
}

export function getUpcomingDays(count: number): string[] {
  const today = new Date();
  return Array.from({ length: count }, (_, index) => toIso(addDays(today, index)));
}

export const TIME_SLOTS = [
  '06:00 AM',
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
  '09:00 PM',
];

/** Deterministic pseudo-random available slots for a ground + date. */
export function getSlotsFor(groundId: string, date: string): { time: string; available: boolean }[] {
  const seedBase = `${groundId}-${date}`;
  let seed = 0;
  for (let i = 0; i < seedBase.length; i += 1) seed = (seed * 31 + seedBase.charCodeAt(i)) % 100000;
  return TIME_SLOTS.map((time, index) => {
    seed = (seed * 1103515245 + 12345 + index * 97) % 2147483647;
    const value = Math.abs(seed) % 100;
    return { time, available: value > 34 };
  });
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function bookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return `CRX-${out}`;
}

export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStore(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore in demo */
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function passwordStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] };
}

export function oversFromBalls(balls: number): string {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function roleHome(role: string): string {
  const map: Record<string, string> = {
    Admin: '/admin',
    'Ground Owner': '/owner',
    Scorer: '/scorer',
    Umpire: '/umpire',
    Player: '/player',
    Captain: '/captain',
  };
  return map[role] ?? '/';
}

export function roleSlug(role: string): string {
  const map: Record<string, string> = {
    Admin: 'admin',
    'Ground Owner': 'owner',
    Scorer: 'scorer',
    Umpire: 'umpire',
    Player: 'player',
    Captain: 'captain',
  };
  return map[role] ?? 'player';
}

export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
