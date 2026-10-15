/**
 * Customer spend per service (₦), which the customers endpoint doesn't return yet — it only has
 * visit counts. SAMPLE DATA: each customer's real counts multiplied by a typical spend per visit,
 * stable per customer. Sits alongside `useCustomers`; swap for the real fields when they exist.
 */
import { useMemo } from "react";
import { between, roundTo, seededRandom } from "@/mocks/utils";
import type { Customer } from "@/hooks/use-customers";

export interface CustomerSpend {
  menu: number;
  events: number;
  places: number;
  total: number;
}

const seedFrom = (text: string) => [...text].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 31);

export function useCustomerSpend(customers: Customer[]) {
  return useMemo(() => {
    const map: Record<string, CustomerSpend> = {};
    customers.forEach((c) => {
      const rng = seededRandom(seedFrom(c.id));
      const menu = roundTo((c.menuCount ?? 0) * between(rng, 3_000, 12_000));
      const events = roundTo((c.eventsCount ?? 0) * between(rng, 5_000, 25_000));
      const places = roundTo((c.placesCount ?? 0) * between(rng, 10_000, 45_000));
      map[c.id] = { menu, events, places, total: menu + events + places };
    });
    return map;
  }, [customers]);
}
