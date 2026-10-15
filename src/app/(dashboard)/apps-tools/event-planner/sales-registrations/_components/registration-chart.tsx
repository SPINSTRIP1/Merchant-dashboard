"use client";
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { LineChart } from "lucide-react";
import EmptyState from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { areaDataset, lineChartOptions, useChartThemeKey } from "@/lib/chart-theme";
import { useEventRegistrations } from "@/hooks/use-event-registrations";

const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export default function RegistrationChart({
  eventId,
  totalRegistrations = 0,
}: {
  eventId: string | null;
  totalRegistrations?: number;
}) {
  const chartKey = useChartThemeKey();
  const { registrations, isLoading } = useEventRegistrations({
    eventId,
    limit: 100,
  });

  // Years present in the data, newest first
  const years = Array.from(
    new Set([
      new Date().getFullYear(),
      ...registrations.map((r) => new Date(r.createdAt).getFullYear()),
    ]),
  ).sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const activeYear = selectedYear ?? years[0] ?? new Date().getFullYear();

  // Count registrations per month for the active year
  const monthlyCounts = months.map(
    (_, monthIndex) =>
      registrations.filter((r) => {
        const date = new Date(r.createdAt);
        return (
          date.getFullYear() === activeYear && date.getMonth() === monthIndex
        );
      }).length,
  );

  const hasData = monthlyCounts.some((count) => count > 0);

  const data = {
    labels: months,
    datasets: [areaDataset("Registrations", monthlyCounts, "chart-5")],
  };
  const options = lineChartOptions({
    integerTicks: true,
    tooltipLabel: (value) => `${value} ${value === 1 ? "registration" : "registrations"}`,
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Total Registrations</p>
          <p className="font-display text-lg font-bold text-foreground">
            {totalRegistrations.toLocaleString()}{" "}
            {totalRegistrations === 1 ? "Registrant" : "Registrants"}
          </p>
        </div>
        <Select value={String(activeYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="h-9 w-[100px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <Skeleton className="h-56" />
      ) : hasData ? (
        <div className="h-56">
          <Line key={chartKey} data={data} options={options} />
        </div>
      ) : (
        <EmptyState
          icon={<LineChart />}
          title="No registration data"
          description="Registrations will appear here once people start registering for your event."
        />
      )}
    </div>
  );
}
