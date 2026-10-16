"use client";

import { Line } from "react-chartjs-2";
import ChartCard from "@/components/chart-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { areaDataset, lineChartOptions, useChartThemeKey } from "@/lib/chart-theme";
import type { WalletPeriod } from "@/hooks/use-wallet-extras";
import { formatNaira } from "@/utils";

const PERIOD_LABELS: Record<WalletPeriod, string> = {
  week: "This Week",
  month: "This Month",
  year: "This Year",
};

export default function RevenueChart({
  series,
  total,
  period,
  onPeriodChange,
}: {
  series: { label: string; revenue: number }[];
  total: number;
  period: WalletPeriod;
  onPeriodChange: (period: WalletPeriod) => void;
}) {
  const chartKey = useChartThemeKey();
  return (
    <ChartCard
      title="Money In"
      subtitle={`Total ${formatNaira(total)} · ${PERIOD_LABELS[period].toLowerCase()}`}
      action={
        <span className="flex items-center gap-2">
          <Select value={period} onValueChange={(value) => onPeriodChange(value as WalletPeriod)}>
            <SelectTrigger className="h-8 w-[120px] rounded-full text-[11px] font-semibold text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIOD_LABELS) as WalletPeriod[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {PERIOD_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      }
    >
      <div className="h-64">
        <Line key={chartKey}
          data={{
            labels: series.map((p) => p.label),
            datasets: [areaDataset("Money in", series.map((p) => p.revenue), "chart-1")],
          }}
          options={lineChartOptions({
            formatY: (v) => formatNaira(v, true),
            tooltipLabel: (v) => `Money in: ${formatNaira(v)}`,
          })}
        />
      </div>
    </ChartCard>
  );
}
