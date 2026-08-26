"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import EmptyState from "@/components/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { Ticket02Icon } from "@hugeicons/core-free-icons";
import { RegistrationStats } from "@/hooks/use-event-registrations";

ChartJS.register(ArcElement, Tooltip, Legend);

const TIER_COLORS = ["#6932E2", "#9E76F8", "#EBE2FF", "#4B21A8", "#C9B3F5"];

export default function TicketSalesChart({
  stats,
}: {
  stats?: RegistrationStats | null;
}) {
  // Tiers with actual ticket sales (sold = ticket quantity, not registrations)
  const tiers = (stats?.ticketTiers ?? [])
    .filter((t) => t.sold > 0)
    .map((t) => ({
      name: t.name,
      count: t.sold,
      amount: t.sold * (Number(t.price) || 0),
    }));

  const totalSold = tiers.reduce((acc, t) => acc + t.count, 0);
  const totalAmount = Number(stats?.totalRevenue) || 0;
  const hasData = totalSold > 0;

  const labels = tiers.map((t) => t.name);
  const colors = tiers.map((_, i) => TIER_COLORS[i % TIER_COLORS.length]);

  const buildData = (values: number[]) => ({
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: "#FFFFFF",
        borderWidth: 3,
        hoverOffset: 8,
        borderRadius: 8,
      },
    ],
  });

  const buildOptions = (total: number, isCurrency: boolean) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#F8F8F8",
        titleColor: "#0F0F0F",
        bodyColor: "#6F6D6D",
        borderColor: "#E5E5E5",
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const percentage = total
              ? ((value / total) * 100).toFixed(1)
              : "0.0";
            const display = isCurrency
              ? `₦${value.toLocaleString()}`
              : value.toLocaleString();
            return `${label}: ${display} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "75%",
  });

  return (
    <section className="mt-5 space-y-10">
      {hasData ? (
        <>
          {/* Sales revenue by tier */}
          <div className="flex gap-x-3 items-center">
            <div className="relative h-[147px] w-[147px] ">
              <Doughnut
                data={buildData(tiers.map((t) => t.amount))}
                options={buildOptions(totalAmount, true)}
              />

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-lg font-bold text-primary-text">
                  ₦{totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-secondary-text">
                  Total Ticket sales
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="text-sm space-y-4">
              {tiers.map((tier, i) => (
                <div key={tier.name} className="flex items-center gap-x-2">
                  <div
                    className="size-6 rounded"
                    style={{ backgroundColor: colors[i] }}
                  />
                  <p className="text-sm">{tier.name}</p>
                  <p className="font-bold">₦{tier.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets sold by tier */}
          <div className="flex mt-5 gap-x-3 items-center">
            <div className="relative h-[147px] w-[147px] ">
              <Doughnut
                data={buildData(tiers.map((t) => t.count))}
                options={buildOptions(totalSold, false)}
              />

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-lg font-bold text-primary-text">
                  {totalSold.toLocaleString()}
                </p>
                <p className="text-xs text-secondary-text">
                  Total Tickets Sold
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="text-sm space-y-4">
              {tiers.map((tier, i) => (
                <div key={tier.name} className="flex items-center gap-x-2">
                  <div
                    className="size-6 rounded"
                    style={{ backgroundColor: colors[i] }}
                  />
                  <p className="text-sm">{tier.name}</p>
                  <p className="font-bold">{tier.count.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<HugeiconsIcon icon={Ticket02Icon} size={32} color="#6932E2" />}
          title="No Ticket Sales"
          description="Ticket sales data will appear here once tickets are sold for your events."
        />
      )}
    </section>
  );
}
