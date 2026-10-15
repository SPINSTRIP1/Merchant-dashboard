/**
 * Mocked additions to places until the backend supports them: taglines, visitors added by hand,
 * booking status changes, removed facilities and reviews. Kept in localStorage (via
 * createPersistentMap) so they survive a reload; reviews are generated per place from a seed.
 */
import { between, createPersistentMap, daysAgo, fullName, pick, seededRandom } from "./utils";

export interface ManualVisitor {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  purpose: string;
  createdAt: string;
}

export interface PlaceReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const placeTaglines = createPersistentMap<string>("spinstrip_mock_place_taglines");
export const placeManualVisitors = createPersistentMap<ManualVisitor[]>("spinstrip_mock_place_visitors");
export const bookingStatusOverrides = createPersistentMap<string>("spinstrip_mock_booking_status");
export const removedFacilities = createPersistentMap<string[]>("spinstrip_mock_removed_facilities");

const REVIEW_COMMENTS = [
  "Beautiful space, very clean and secure. Will book again.",
  "The pool area is the highlight. Host was responsive.",
  "Great value for the location. Kitchen is fully equipped.",
  "Check-in was smooth and the staff were lovely.",
  "Lovely ambience, though parking was tight on Saturday.",
  "Exceeded expectations. Highly recommended.",
  "Decent stay, Wi-Fi could be faster.",
];

const seedFrom = (text: string) => [...text].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 11);

/** 3–9 sample reviews for a place, stable per place id. */
export function sampleReviews(placeId: string): PlaceReview[] {
  const rng = seededRandom(seedFrom(placeId));
  return Array.from({ length: between(rng, 3, 9) }, (_, i) => ({
    id: `${placeId}_rev_${i}`,
    author: fullName(rng),
    rating: between(rng, 3, 5),
    comment: pick(rng, REVIEW_COMMENTS),
    createdAt: daysAgo(between(rng, 2, 120)).toISOString(),
  })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
