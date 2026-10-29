import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Booking, NotificationItem, Role, User } from '@/types';
import { demoUsers, grounds, notificationsSeed, seedBookings } from '@/data/mock';
import { bookingRef, readStore, uid, writeStore } from '@/lib/utils';

interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: 'success' | 'error' | 'info' | 'warning';
}

interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  role: Exclude<Role, 'Admin'>;
  location?: string;
  groundName?: string;
  groundLocation?: string;
  groundCapacity?: string;
  scoringExperience?: string;
  scoringExpertise?: string;
  certification?: string;
  umpireExperience?: string;
  matchLevel?: string;
  team?: string;
  playingRole?: string;
  jerseyNumber?: string;
  captaincyExperience?: string;
}

interface NewBookingPayload {
  groundId: string;
  groundName: string;
  image: string;
  city: string;
  date: string;
  slots: string[];
  amount: number;
  players: number;
  note?: string;
}

interface AppContextValue {
  user: User | null;
  users: User[];
  bookings: Booking[];
  notifications: NotificationItem[];
  unreadCount: number;
  toasts: Toast[];
  login: (identifier: string, password: string, role: Role) => { ok: boolean; error?: string; user?: User };
  logout: () => void;
  register: (payload: RegisterPayload) => { ok: boolean; error?: string };
  updateProfile: (patch: Partial<User>) => void;
  setUserStatus: (id: string, status: User['status']) => void;
  addBooking: (payload: NewBookingPayload) => Booking;
  cancelBooking: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const AUTH_KEY = 'cricrex.auth.v1';
const USERS_KEY = 'cricrex.users.v1';
const BOOKINGS_KEY = 'cricrex.bookings.v1';

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => readStore<User[]>(USERS_KEY, demoUsers));
  const [user, setUser] = useState<User | null>(() => {
    const storedId = readStore<string | null>(AUTH_KEY, null);
    if (!storedId) return null;
    const pool = readStore<User[]>(USERS_KEY, demoUsers);
    return pool.find((item) => item.id === storedId) ?? null;
  });
  const [bookings, setBookings] = useState<Booking[]>(() => readStore<Booking[]>(BOOKINGS_KEY, seedBookings));
  const [notifications, setNotifications] = useState<NotificationItem[]>(notificationsSeed);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    writeStore(USERS_KEY, users);
  }, [users]);

  useEffect(() => {
    writeStore(BOOKINGS_KEY, bookings);
  }, [bookings]);

  useEffect(() => {
    if (user) writeStore(AUTH_KEY, user.id);
    else writeStore(AUTH_KEY, null);
  }, [user]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const pushToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = uid('toast');
      setToasts((current) => [...current.slice(-2), { ...toast, id }]);
      timers.current[id] = setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 4200);
    },
    [],
  );

  useEffect(
    () => () => {
      Object.values(timers.current).forEach(clearTimeout);
    },
    [],
  );

  const login = useCallback(
    (identifier: string, password: string, role: Role): { ok: boolean; error?: string; user?: User } => {
      const normalized = identifier.trim().toLowerCase();
      const found = users.find(
        (candidate) =>
          candidate.email.toLowerCase() === normalized || candidate.username.toLowerCase() === normalized,
      );
      if (!found) {
        return { ok: false, error: 'We could not find a CRICREX account with those details.' };
      }
      if (found.password !== password) {
        return { ok: false, error: 'That password does not match our demo records. Please try again.' };
      }
      if (found.status === 'Suspended') {
        return { ok: false, error: 'This demo account is suspended. Contact an administrator.' };
      }
      if (found.role !== role) {
        return { ok: false, error: `This account is registered as ${found.role}. Select that role to continue.` };
      }
      setUser(found);
      pushToast({
        title: `Welcome back, ${found.name.split(' ')[0]}`,
        description: `Signed in as ${found.role}. This is a simulated session.`,
        tone: 'success',
      });
      return { ok: true, user: found };
    },
    [pushToast, users],
  );

  const logout = useCallback(() => {
    setUser(null);
    pushToast({ title: 'Signed out', description: 'Your demo session has ended.', tone: 'info' });
  }, [pushToast]);

  const register = useCallback(
    (payload: RegisterPayload): { ok: boolean; error?: string } => {
      const emailTaken = users.some((candidate) => candidate.email.toLowerCase() === payload.email.trim().toLowerCase());
      if (emailTaken) return { ok: false, error: 'An account with this email already exists in the demo records.' };
      const usernameTaken = users.some(
        (candidate) => candidate.username.toLowerCase() === payload.username.trim().toLowerCase(),
      );
      if (usernameTaken) return { ok: false, error: 'That username is already taken. Try a different one.' };

      const tones = [
        'from-emerald-400 to-teal-700',
        'from-amber-400 to-orange-600',
        'from-sky-400 to-blue-700',
        'from-rose-400 to-red-700',
        'from-violet-400 to-purple-700',
      ];
      const newUser: User = {
        ...payload,
        id: uid('usr'),
        name: payload.name.trim(),
        email: payload.email.trim(),
        username: payload.username.trim(),
        phone: payload.phone.trim(),
        role: payload.role,
        status: 'Active',
        joinedAt: new Date().toISOString().slice(0, 10),
        location: payload.location?.trim() || 'India',
        password: payload.password,
        avatarTone: tones[Math.floor(Math.random() * tones.length)],
      };
      setUsers((current) => [...current, newUser]);
      return { ok: true };
    },
    [users],
  );

  const updateProfile = useCallback(
    (patch: Partial<User>) => {
      if (!user) return;
      const next = { ...user, ...patch };
      setUser(next);
      setUsers((current) => current.map((item) => (item.id === user.id ? next : item)));
      pushToast({ title: 'Profile updated', description: 'Your changes were saved to this browser only.', tone: 'success' });
    },
    [pushToast, user],
  );

  const setUserStatus = useCallback(
    (id: string, status: User['status']) => {
      setUsers((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
      setUser((current) => (current && current.id === id ? { ...current, status } : current));
      pushToast({
        title: status === 'Suspended' ? 'Account suspended' : 'Account activated',
        description: 'Status changes are simulated and stored in this browser only.',
        tone: status === 'Suspended' ? 'warning' : 'success',
      });
    },
    [pushToast],
  );

  const addBooking = useCallback(    (payload: NewBookingPayload): Booking => {
      const booking: Booking = {
        id: uid('bkg'),
        reference: bookingRef(),
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'Confirmed',
        userEmail: user?.email ?? 'guest@cricrex.demo',
        ...payload,
      };
      setBookings((current) => [booking, ...current]);
      setNotifications((current) => [
        {
          id: uid('nt'),
          title: 'Booking confirmed',
          body: `${payload.groundName} · ${payload.date} · ${payload.slots.length} slot(s).`,
          time: 'Just now',
          read: false,
          tone: 'success',
        },
        ...current,
      ]);
      return booking;
    },
    [user],
  );

  const cancelBooking = useCallback(
    (id: string) => {
      setBookings((current) =>
        current.map((booking) => (booking.id === id ? { ...booking, status: 'Cancelled' } : booking)),
      );
      pushToast({
        title: 'Booking cancelled',
        description: 'This is a simulated cancellation — no payment was reversed.',
        tone: 'info',
      });
    },
    [pushToast],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      users,
      bookings,
      notifications,
      unreadCount,
      toasts,
      login,
      logout,
      register,
      updateProfile,
      setUserStatus,
      addBooking,
      cancelBooking,
      markNotificationRead,
      markAllNotificationsRead,
      pushToast,
      dismissToast,
    }),
    [
      user,
      users,
      bookings,
      notifications,
      unreadCount,
      toasts,
      login,
      logout,
      register,
      updateProfile,
      setUserStatus,
      addBooking,
      cancelBooking,
      markNotificationRead,
      markAllNotificationsRead,
      pushToast,
      dismissToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

export function useGrounds() {
  return grounds;
}

const roleTitles: Record<Role, string> = {
  Admin: 'Platform Administration',
  'Ground Owner': 'Ground Operations',
  Scorer: 'Match Scoring',
  Umpire: 'Match Officiating',
  Player: 'Player Performance',
  Captain: 'Team Leadership',
};

export function useRoleTitle(role: Role): string {
  return roleTitles[role];
}
