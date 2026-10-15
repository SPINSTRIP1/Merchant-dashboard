/**
 * Mocked additions to events until the backend supports them: events deleted from the dashboard
 * (no delete endpoint yet) and how many ticket sales came through a deal.
 */
import { between, createPersistentMap, seededRandom } from "./utils";

/** Event ids the merchant deleted in this browser (value is the deletion time). */
export const deletedEvents = createPersistentMap<string>("spinstrip_mock_deleted_events");

const seedFrom = (text: string) => [...text].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 17);

/** Roughly a fifth of completed ticket sales, stable per event. */
export function sampleViaDealCount(eventId: string, completedSales: number): number {
  if (completedSales <= 0) return 0;
  const rng = seededRandom(seedFrom(eventId));
  return Math.min(completedSales, Math.round(completedSales * (between(rng, 10, 30) / 100)));
}
