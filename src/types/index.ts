export type Role = 'Admin' | 'Ground Owner' | 'Scorer' | 'Umpire' | 'Player' | 'Captain';

export type RoleSlug = 'admin' | 'owner' | 'scorer' | 'umpire' | 'player' | 'captain';

export type UserStatus = 'Active' | 'Suspended' | 'Pending';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: Role;
  status: UserStatus;
  joinedAt: string;
  location: string;
  password: string;
  avatarTone: string;
  team?: string;
  groundName?: string;
  groundLocation?: string;
  groundCapacity?: string;
  scoringExperience?: string;
  scoringExpertise?: string;
  certification?: string;
  umpireExperience?: string;
  matchLevel?: string;
  playingRole?: string;
  jerseyNumber?: string;
  captaincyExperience?: string;
}

export type GroundType = 'Outdoor Turf' | 'Artificial Turf' | 'Indoor Nets';

export interface Review {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Ground {
  id: string;
  name: string;
  city: string;
  locality: string;
  type: GroundType;
  price: number;
  rating: number;
  reviewCount: number;
  capacity: number;
  image: string;
  gallery: string[];
  description: string;
  amenities: string[];
  openHours: string;
  availableToday: boolean;
  featured: boolean;
  popularity: number;
  ownerId: string;
  status: 'Published' | 'Draft' | 'Paused';
  reviews: Review[];
}

export type BookingStatus = 'Confirmed' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  reference: string;
  groundId: string;
  groundName: string;
  image: string;
  city: string;
  date: string;
  slots: string[];
  amount: number;
  status: BookingStatus;
  createdAt: string;
  userEmail: string;
  players: number;
  note?: string;
}

export type MatchStatus = 'Upcoming' | 'Live' | 'Completed';

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  ground: string;
  date: string;
  time: string;
  tournament: string;
  status: MatchStatus;
  result?: string;
  overs: number;
  umpire: string;
  scorer: string;
  scoreA?: string;
  scoreB?: string;
}

export interface PlayerPerformance {
  id: string;
  name: string;
  role: string;
  jersey: number;
  runs: number;
  balls: number;
  wickets: number;
  economy: number;
  catches: number;
  matches: number;
  avg: number;
  strikeRate: number;
  form: number[];
}

export interface InningsState {
  runs: number;
  wickets: number;
  balls: number;
  extras: number;
  batsmen: { name: string; runs: number; balls: number; fours: number; sixes: number; onStrike: boolean }[];
  bowler: { name: string; overs: number; balls: number; runs: number; wickets: number; maidens: number };
  timeline: string[];
}

export interface Team {
  id: string;
  name: string;
  city: string;
  captain: string;
  coach: string;
  homeGround: string;
  players: PlayerPerformance[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  tone: 'success' | 'info' | 'warning';
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  initials: string;
  tone: string;
}
