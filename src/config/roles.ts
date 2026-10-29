import {
  Building2,
  ClipboardList,
  Crown,
  Flag,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/types';

export interface RoleMeta {
  role: Role;
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
  demoEmail: string;
  demoPassword: string;
}

export const roles: RoleMeta[] = [
  {
    role: 'Admin',
    slug: 'admin',
    label: 'Admin',
    description: 'Platform & user management',
    icon: ShieldCheck,
    demoEmail: 'admin@cricrex.demo',
    demoPassword: 'Admin@123',
  },
  {
    role: 'Ground Owner',
    slug: 'owner',
    label: 'Ground Owner',
    description: 'Grounds, pricing & bookings',
    icon: Building2,
    demoEmail: 'owner@cricrex.demo',
    demoPassword: 'Demo@123',
  },
  {
    role: 'Scorer',
    slug: 'scorer',
    label: 'Scorer',
    description: 'Ball-by-ball scoring',
    icon: ClipboardList,
    demoEmail: 'scorer@cricrex.demo',
    demoPassword: 'Demo@123',
  },
  {
    role: 'Umpire',
    slug: 'umpire',
    label: 'Umpire',
    description: 'Officiate assigned fixtures',
    icon: Flag,
    demoEmail: 'umpire@cricrex.demo',
    demoPassword: 'Demo@123',
  },
  {
    role: 'Player',
    slug: 'player',
    label: 'Player',
    description: 'Performances & bookings',
    icon: UserRound,
    demoEmail: 'player@cricrex.demo',
    demoPassword: 'Demo@123',
  },
  {
    role: 'Captain',
    slug: 'captain',
    label: 'Captain',
    description: 'Squad, fixtures & results',
    icon: Crown,
    demoEmail: 'captain@cricrex.demo',
    demoPassword: 'Demo@123',
  },
];

export const registerRoles = roles.filter((role) => role.role !== 'Admin');

export function roleFromSlug(slug: string | null): Role | null {
  if (!slug) return null;
  return roles.find((role) => role.slug === slug.toLowerCase())?.role ?? null;
}

export function roleMeta(role: Role): RoleMeta {
  return roles.find((item) => item.role === role) ?? roles[4];
}
