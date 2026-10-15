/**
 * Deal features from the prototype that the backend doesn't report yet: redemptions, revenue and
 * monthly performance per deal. SAMPLE DATA (src/mocks/deals.ts) that sits alongside the real deal
 * hooks; swap the bodies here for the real endpoint when it exists.
 */
import { useMemo } from "react";
import { sampleDealPerformance, type DealPerformance } from "@/mocks/deals";

export type { DealPerformance };

/** Performance for each deal, keyed by deal id. SAMPLE DATA. */
export function useDealsPerformance(deals: { id?: string; status?: string }[]) {
  return useMemo(() => {
    const map: Record<string, DealPerformance> = {};
    deals.forEach((deal) => {
      if (deal.id) map[deal.id] = sampleDealPerformance(deal.id, deal.status);
    });
    return map;
  }, [deals]);
}

/** Performance for a single deal. SAMPLE DATA. */
export function useDealPerformance(deal: { id?: string; status?: string } | null) {
  return useMemo(
    () => (deal?.id ? sampleDealPerformance(deal.id, deal.status) : null),
    [deal?.id, deal?.status]
  );
}
