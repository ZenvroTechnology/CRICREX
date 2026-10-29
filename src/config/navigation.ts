import {
  Activity,
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Flag,
  Gauge,
  History,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Radio,
  ShieldCheck,
  Swords,
  Target,
  Ticket,
  Trophy,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { RoleSlug } from '@/types';

export interface DashboardNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface DashboardNavGroup {
  title: string;
  items: DashboardNavItem[];
}

export const dashboardNavigation: Record<
  RoleSlug,
  { roleLabel: string; description: string; groups: DashboardNavGroup[] }
> = {
  admin: {
    roleLabel: 'Administration',
    description: 'Platform overview',
    groups: [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
          { label: 'Recent activity', to: '/admin/activity', icon: Activity },
        ],
      },
      {
        title: 'Manage',
        items: [
          { label: 'Users', to: '/admin/users', icon: Users },
          { label: 'Grounds', to: '/admin/grounds', icon: Building2 },
          { label: 'Bookings', to: '/admin/bookings', icon: CalendarCheck },
        ],
      },
    ],
  },
  owner: {
    roleLabel: 'Ground Owner',
    description: 'Ground operations',
    groups: [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', to: '/owner', icon: LayoutDashboard, end: true },
          { label: 'Bookings', to: '/owner/bookings', icon: Ticket },
          { label: 'Earnings', to: '/owner/earnings', icon: Wallet },
        ],
      },
      {
        title: 'Manage ground',
        items: [
          { label: 'Ground profile', to: '/owner/ground', icon: Building2 },
          { label: 'Pricing', to: '/owner/pricing', icon: CreditCard },
          { label: 'Availability', to: '/owner/availability', icon: CalendarDays },
        ],
      },
    ],
  },
  scorer: {
    roleLabel: 'Scorer',
    description: 'Match scoring',
    groups: [
      {
        title: 'Matchday',
        items: [
          { label: 'Dashboard', to: '/scorer', icon: LayoutDashboard, end: true },
          { label: 'Assigned matches', to: '/scorer/matches', icon: ListChecks },
          { label: 'Live scoring', to: '/scorer/live', icon: Radio },
        ],
      },
      {
        title: 'Records',
        items: [
          { label: 'Scorecards', to: '/scorer/scorecards', icon: ClipboardList },
          { label: 'Scoring history', to: '/scorer/history', icon: History },
        ],
      },
    ],
  },
  umpire: {
    roleLabel: 'Umpire',
    description: 'Match officiating',
    groups: [
      {
        title: 'Matchday',
        items: [
          { label: 'Dashboard', to: '/umpire', icon: LayoutDashboard, end: true },
          { label: 'Assignments', to: '/umpire/matches', icon: Flag },
          { label: 'Schedule', to: '/umpire/schedule', icon: CalendarDays },
        ],
      },
      {
        title: 'Records',
        items: [
          { label: 'Match history', to: '/umpire/history', icon: History },
          { label: 'My profile', to: '/umpire/profile', icon: UserRound },
        ],
      },
    ],
  },
  player: {
    roleLabel: 'Player',
    description: 'Performance hub',
    groups: [
      {
        title: 'My cricket',
        items: [
          { label: 'Dashboard', to: '/player', icon: LayoutDashboard, end: true },
          { label: 'Matches', to: '/player/matches', icon: CalendarDays },
          { label: 'Performance', to: '/player/stats', icon: BarChart3 },
        ],
      },
      {
        title: 'Records',
        items: [
          { label: 'Match history', to: '/player/history', icon: History },
          { label: 'Book a ground', to: '/grounds', icon: MapPin },
        ],
      },
    ],
  },
  captain: {
    roleLabel: 'Captain',
    description: 'Team leadership',
    groups: [
      {
        title: 'Team',
        items: [
          { label: 'Dashboard', to: '/captain', icon: LayoutDashboard, end: true },
          { label: 'Squad', to: '/captain/team', icon: Users },
          { label: 'Fixtures', to: '/captain/matches', icon: Swords },
        ],
      },
      {
        title: 'Results',
        items: [
          { label: 'Match results', to: '/captain/results', icon: Trophy },
          { label: 'Performance', to: '/captain/performance', icon: Target },
        ],
      },
    ],
  },
};

export const profileNav = (slug: RoleSlug): DashboardNavItem[] => [
  { label: 'Profile', to: `/${slug}/profile`, icon: UserRound },
  { label: 'Settings', to: `/${slug}/settings`, icon: Gauge },
  { label: 'Notifications', to: `/${slug}/notifications`, icon: ShieldCheck },
];
