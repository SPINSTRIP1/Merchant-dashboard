/**
 * Sample per-item inventory history until the backend records it: stock activity log, price
 * history and monthly sales. Stable per item id.
 */
import { between, daysAgo, fullName, pick, roundTo, seededRandom } from "./utils";

export interface StockActivity {
  id: string;
  date: string;
  change: number;
  action: string;
  staff: { name: string; role: "Owner" | "Admin Ops" };
}

export interface PriceChange {
  from: number;
  to: number;
  date: string;
}

const seedFrom = (text: string) => [...text].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 29);

export function sampleStockActivity(itemId: string): StockActivity[] {
  const rng = seededRandom(seedFrom(itemId));
  return Array.from({ length: 6 }, (_, i) => {
    const kind = pick(rng, ["restock", "sale", "sale", "adjust"] as const);
    const change =
      kind === "restock" ? between(rng, 20, 80) : kind === "sale" ? -between(rng, 3, 25) : -between(rng, 1, 5);
    const action =
      kind === "restock"
        ? `+${change} restocked`
        : kind === "sale"
          ? `${change} sold`
          : `${change} adjusted (damaged/expired)`;
    return {
      id: `${itemId}_act_${i}`,
      date: daysAgo(i * between(rng, 1, 4)).toISOString(),
      change,
      action,
      staff: { name: fullName(rng), role: pick(rng, ["Owner", "Admin Ops"] as const) },
    };
  });
}

export function samplePriceHistory(itemId: string, currentPrice: number): PriceChange[] {
  const rng = seededRandom(seedFrom(`${itemId}:price`));
  if (!currentPrice) return [];
  const previous = roundTo(currentPrice * (between(rng, 70, 95) / 100));
  return [{ from: previous, to: currentPrice, date: daysAgo(between(rng, 20, 90)).toISOString() }];
}

/** Units sold per month for the last 12 months, oldest first. */
export function sampleMonthlySales(itemId: string): { label: string; units: number }[] {
  const rng = seededRandom(seedFrom(`${itemId}:sales`));
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return {
      label: d.toLocaleDateString("en-NG", { month: "short" }).toUpperCase(),
      units: between(rng, 0, 120),
    };
  });
}
