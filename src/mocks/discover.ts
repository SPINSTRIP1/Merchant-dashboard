/**
 * Sample SpinStrip Discover catalogue (public places and events across merchants). There is no
 * public listing endpoint yet — see "Discover" in docs/prototype-port-plan.md.
 */
import { between, seededRandom } from "./utils";

export interface DiscoverPlace {
  id: string;
  name: string;
  type: string;
  tagline: string;
  city: string;
  area: string;
  image: string;
  views: number;
  rating: number;
  priceLevel: 1 | 2 | 3;
}

export interface DiscoverEvent {
  id: string;
  name: string;
  kind: string;
  city: string;
  venue: string;
  image: string;
  startsAt: string;
  priceFrom: number;
}

export const DISCOVER_CITIES = ["Lagos", "Abuja", "Port Harcourt"] as const;

const PLACES: Omit<DiscoverPlace, "views" | "rating">[] = [
  { id: "dp-1", name: "The Lagoon Terrace", type: "Restaurant", tagline: "Sunset plates by the water", city: "Lagos", area: "Victoria Island", image: "/places/1.jpg", priceLevel: 3 },
  { id: "dp-2", name: "Amber Lounge", type: "Lounge", tagline: "Slow jams and signature cocktails", city: "Lagos", area: "Lekki Phase 1", image: "/places/2.png", priceLevel: 2 },
  { id: "dp-3", name: "Mama Put Deluxe", type: "Restaurant", tagline: "Home-style jollof, every day", city: "Abuja", area: "Wuse II", image: "/images/1.jpg", priceLevel: 1 },
  { id: "dp-4", name: "Skyline Rooftop", type: "Bar", tagline: "The city, from the 21st floor", city: "Abuja", area: "Maitama", image: "/places/3.png", priceLevel: 3 },
  { id: "dp-5", name: "Garden City Grill", type: "Restaurant", tagline: "Suya, small chops and live highlife", city: "Port Harcourt", area: "GRA Phase 2", image: "/images/2.jpg", priceLevel: 2 },
  { id: "dp-6", name: "Brew & Bean", type: "Cafe", tagline: "Specialty coffee and quiet corners", city: "Lagos", area: "Yaba", image: "/images/3.jpg", priceLevel: 1 },
  { id: "dp-7", name: "Glow Spa & Wellness", type: "Spa", tagline: "Unwind, reset, glow", city: "Lagos", area: "Ikoyi", image: "/places/4.png", priceLevel: 3 },
  { id: "dp-8", name: "Club Pulse", type: "Nightclub", tagline: "Afrobeats till sunrise", city: "Port Harcourt", area: "Trans Amadi", image: "/images/4.jpg", priceLevel: 2 },
];

const EVENTS: Omit<DiscoverEvent, "startsAt">[] = [
  { id: "de-1", name: "Afrobeats Night Live", kind: "Concert", city: "Lagos", venue: "Eko Convention Centre", image: "/events/1.jpg", priceFrom: 15_000 },
  { id: "de-2", name: "Lagos Food Festival", kind: "Festival", city: "Lagos", venue: "Muri Okunola Park", image: "/events/2.jpg", priceFrom: 5_000 },
  { id: "de-3", name: "Comedy Central Abuja", kind: "Comedy", city: "Abuja", venue: "Transcorp Hilton", image: "/events/3.jpg", priceFrom: 10_000 },
  { id: "de-4", name: "Tech & Brunch Meetup", kind: "Networking", city: "Port Harcourt", venue: "Garden City Grill", image: "/images/5.jpg", priceFrom: 0 },
  { id: "de-5", name: "Rooftop Jazz Sessions", kind: "Live Music", city: "Abuja", venue: "Skyline Rooftop", image: "/images/6.jpg", priceFrom: 8_000 },
  { id: "de-6", name: "Wine & Paint Evening", kind: "Workshop", city: "Lagos", venue: "Amber Lounge", image: "/places/1.jpg", priceFrom: 12_500 },
];

export function sampleDiscoverPlaces(): DiscoverPlace[] {
  const rng = seededRandom(2026);
  return PLACES.map((p) => ({
    ...p,
    views: Math.round(between(rng, 0, 18_000)),
    rating: Math.round(between(rng, 38, 50)) / 10,
  }));
}

export function sampleDiscoverEvents(now = new Date()): DiscoverEvent[] {
  const rng = seededRandom(4049);
  return EVENTS.map((e) => {
    const date = new Date(now);
    date.setDate(date.getDate() + Math.round(between(rng, 2, 40)));
    date.setHours(18 + Math.round(between(rng, 0, 3)), 0, 0, 0);
    return { ...e, startsAt: date.toISOString() };
  }).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
