"use client";

import toast from "react-hot-toast";
import { Line } from "react-chartjs-2";
import { Download, Sparkles } from "lucide-react";
import { Deal } from "../../_schemas";
import { exportCsv, fmtDate, formatNaira } from "@/utils";
import StatusPill from "@/components/status-pill";
import ChartCard from "@/components/chart-card";
import SampleDataBadge from "@/components/sample-data-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { areaDataset, lineChartOptions, useChartThemeKey } from "@/lib/chart-theme";
import { useDealPerformance } from "@/hooks/use-deal-extras";

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}

export default function InsightsModal({
  isOpen,
  onClose,
  deal,
  campaignName,
}: {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  campaignName?: string;
}) {
  const chartKey = useChartThemeKey();
  const perf = useDealPerformance(deal);
  if (!deal) return null;

  const labels = perf?.monthly.map((m) => m.label) ?? [];

  const downloadReport = () => {
    if (!perf) return;
    exportCsv(
      `${deal.name.replace(/[^\w-]+/g, "-").toLowerCase()}-deal-report.csv`,
      ["Month", "Redemptions", "Revenue (NGN)"],
      perf.monthly.map((m) => [m.label, m.redemptions, m.revenue])
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-2xl">{deal.name}</DialogTitle>
            <StatusPill status={deal.status} />
          </div>
          {deal.description && <DialogDescription>{deal.description}</DialogDescription>}
        </DialogHeader>

        <div className="flex justify-end">
          <SampleDataBadge label="Sample performance" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ChartCard
            title="Performance"
            subtitle="Redemptions per month"
            action={<span className="text-foreground">{(perf?.redemptions ?? 0).toLocaleString()} total</span>}
          >
            <div className="h-48">
              <Line key={chartKey}
                data={{ labels, datasets: [areaDataset("Redemptions", perf?.monthly.map((m) => m.redemptions) ?? [], "chart-1")] }}
                options={lineChartOptions({ integerTicks: true, tooltipLabel: (v) => `${v} redemptions` })}
              />
            </div>
          </ChartCard>
          <ChartCard
            title="Revenue"
            subtitle="Revenue from redemptions"
            action={<span className="text-foreground">{formatNaira(perf?.revenue ?? 0, true)}</span>}
            delay={0.05}
          >
            <div className="h-48">
              <Line key={chartKey}
                data={{ labels, datasets: [areaDataset("Revenue", perf?.monthly.map((m) => m.revenue) ?? [], "chart-2")] }}
                options={lineChartOptions({
                  formatY: (v) => formatNaira(v, true),
                  tooltipLabel: (v) => `Revenue: ${formatNaira(v)}`,
                })}
              />
            </div>
          </ChartCard>
        </div>

        <div className="divide-y rounded-2xl border px-4">
          <Detail label="Campaign">{campaignName ?? "—"}</Detail>
          <Detail label="Discount">{deal.discountPercentage}% off</Detail>
          <Detail label="Maximum Threshold">{deal.maximumThreshold ?? 0} Orders</Detail>
          <Detail label="Products">
            {deal.products?.length ? (
              <span className="flex flex-wrap justify-end gap-1.5">
                {deal.products.map((item) => (
                  <span
                    key={item.id ?? item.name}
                    className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                  >
                    {item.name}
                  </span>
                ))}
              </span>
            ) : (
              "—"
            )}
          </Detail>
          <Detail label="Validity">
            {fmtDate(deal.startDate)} → {fmtDate(deal.endDate)}
          </Detail>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => toast("AI analysis is coming soon.")}>
            <Sparkles /> Analyse with AI
          </Button>
          <Button variant="brand" onClick={downloadReport} disabled={!perf}>
            <Download /> Download Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
