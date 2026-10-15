import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import SampleDataBadge from "@/components/sample-data-badge";
import type { DealPerformance } from "@/hooks/use-deal-extras";
import { formatNaira } from "@/utils";
import { cn } from "@/lib/utils";
import { Deal } from "../_schemas";

function Panel({
  title,
  tone,
  rows,
  emptyText,
}: {
  title: string;
  tone: "good" | "poor";
  rows: { deal: Deal; perf: DealPerformance }[];
  emptyText: string;
}) {
  const Icon = tone === "good" ? TrendingUp : TrendingDown;
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-xl",
            tone === "good" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-500"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ deal, perf }) => (
            <li key={deal.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{deal.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {deal.discountPercentage}% off · {perf.redemptions.toLocaleString()} redemptions
                </p>
              </div>
              <span className="shrink-0 font-display text-sm font-bold text-primary">
                {formatNaira(perf.revenue, true)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Best and worst active deals by redemptions (sample performance data). */
export default function PerformingDeals({
  deals,
  performance,
}: {
  deals: Deal[];
  performance: Record<string, DealPerformance>;
}) {
  const ranked = deals
    .filter((d) => d.status === "ACTIVE" && d.id && performance[d.id])
    .map((deal) => ({ deal, perf: performance[deal.id!] }))
    .sort((a, b) => b.perf.redemptions - a.perf.redemptions);

  const top = ranked.filter((r) => r.perf.redemptions > 0).slice(0, 3);
  const poor = ranked
    .filter((r) => !top.includes(r))
    .slice(-3)
    .reverse();

  return (
    <aside className="space-y-4">
      <SampleDataBadge label="Sample performance" />
      <Panel
        title="Top Performing Deals"
        tone="good"
        rows={top}
        emptyText="No top performing deals yet — redemptions will rank your deals here."
      />
      <Panel
        title="Poor Performing Deals"
        tone="poor"
        rows={poor}
        emptyText="No poor performing deals — nice work."
      />
    </aside>
  );
}
