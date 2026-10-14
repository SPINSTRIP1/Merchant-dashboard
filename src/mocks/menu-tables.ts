/**
 * Sample dining tables and seatings for Menu → Tables & QR / Table Analytics and the waiter app,
 * until the backend has table endpoints. Table ids line up with `tableId` on the sample menu
 * transactions in ./transactions, so revenue and order counts per table are consistent.
 */
import { between, createMockCollection, daysAgo, pick, seededRandom } from "./utils";

export interface DiningTable {
  id: string;
  label: string;
  seats: number;
  /** Random token embedded in the table's QR code (`/preview/menu?table=<token>`). */
  qrToken: string;
  createdAt: string;
}

export interface Seating {
  id: string;
  tableId: string;
  guests: number;
  seatedAt: string;
}

export const randomQrToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, "0")).join("");

const seededToken = (rng: () => number) =>
  Array.from({ length: 16 }, () => "0123456789abcdef"[between(rng, 0, 15)]).join("");

export const tablesCollection = createMockCollection<DiningTable>(() => {
  const rng = seededRandom(30301);
  return Array.from({ length: 10 }, (_, i) => ({
    id: `tbl_${i + 1}`,
    label: `Table ${i + 1}`,
    seats: pick(rng, [2, 2, 4, 4, 4, 6]),
    qrToken: seededToken(rng),
    createdAt: daysAgo(between(rng, 60, 300)).toISOString(),
  }));
});

export const seatingsCollection = createMockCollection<Seating>(() => {
  const rng = seededRandom(30302);
  return Array.from({ length: 380 }, (_, i) => {
    const seatedAt = daysAgo(Math.floor(Math.pow(rng(), 1.4) * 90));
    seatedAt.setHours(between(rng, 11, 22), between(rng, 0, 59), 0, 0);
    return {
      id: `seat_${i + 1}`,
      tableId: `tbl_${between(rng, 1, 10)}`,
      guests: between(rng, 1, 6),
      seatedAt: seatedAt.toISOString(),
    };
  }).sort((a, b) => b.seatedAt.localeCompare(a.seatedAt));
});
