import {
  AirVent,
  Armchair,
  Bath,
  Building2,
  Car,
  Coffee,
  Droplets,
  Dumbbell,
  HeartPulse,
  Lightbulb,
  Monitor,
  Package,
  Shirt,
  Trophy,
  Wifi,
  type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  Floodlights: Lightbulb,
  Parking: Car,
  'Changing Rooms': Shirt,
  Washrooms: Bath,
  Pavilion: Building2,
  Scoreboard: Monitor,
  'Drinking Water': Droplets,
  'First Aid': HeartPulse,
  Cafeteria: Coffee,
  Seating: Armchair,
  'Equipment Rental': Dumbbell,
  'Air Conditioning': AirVent,
  'Wi-Fi': Wifi,
  Trophy: Trophy,
  Package: Package,
};

export function amenityIcon(name: string): LucideIcon {
  return icons[name] ?? Package;
}
