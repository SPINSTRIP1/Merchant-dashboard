/**
 * Sample deal performance (redemptions and revenue) until the backend reports it. Values are stable
 * per deal id, so a deal shows the same numbers on every visit.
 */
import { between, roundTo, seededRandom } from "./utils";

export interface DealPerformance {
  redemptions: number;
  revenue: number;
  /** Last 12 months, oldest first. */
  monthly: { label: string; redemptions: number; revenue: number }[];
}

const seedFrom = (text: string) => [...text].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 23);

export function sampleDealPerformance(dealId: string, status?: string): DealPerformance {
  const rng = seededRandom(seedFrom(dealId));
  const now = new Date();
  // Draft deals haven't run, so they have no redemptions.
  const active = status !== "DRAFT";
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const redemptions = active && rng() > 0.25 ? between(rng, 0, 80) : 0;
    return {
      label: d.toLocaleDateString("en-NG", { month: "short" }).toUpperCase(),
      redemptions,
      revenue: roundTo(redemptions * between(rng, 2_500, 9_000)),
    };
  });
  return {
    redemptions: monthly.reduce((sum, m) => sum + m.redemptions, 0),
    revenue: monthly.reduce((sum, m) => sum + m.revenue, 0),
    monthly,
  };
}
