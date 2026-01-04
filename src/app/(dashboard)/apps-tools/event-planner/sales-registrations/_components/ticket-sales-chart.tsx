"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import EmptyState from "@/components/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { Ticket02Icon } from "@hugeicons/core-free-icons";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TicketSalesChart() {
  const ticketSales = {
    vip: 0,
    premium: 0,
    regular: 0,
  };

  const total = ticketSales.vip + ticketSales.premium + ticketSales.regular;
  const hasData = total > 0;

  const data = {
    labels: ["VIP", "Premium", "Regular"],
    datasets: [
      {
        data: [ticketSales.regular, ticketSales.vip, ticketSales.premium],
        backgroundColor: ["#6932E2", "#EBE2FF", "#9E76F8"],
        borderColor: "#FFFFFF",
        borderWidth: 3,
        hoverOffset: 8,
        borderRadius: 8,
      },
    ],
  };

  const options = {
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
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "75%",
  };

  return (
    <section className="mt-5 space-y-10">
      {hasData ? (
        <>
          <div className="flex gap-x-3 items-center">
            <div className="relative h-[147px] w-[147px] ">
              <Doughnut data={data} options={options} />

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-lg font-bold text-primary-text">
                  N4,371,098
                </p>
                <p className="text-xs text-secondary-text">
                  Total Ticket sales
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="text-sm space-y-4">
              <div className="flex items-center gap-x-2">
                <div className="size-6 rounded bg-primary" />
                <p className="text-sm">Regular</p>
                <p className="font-bold">N1,478,439</p>
              </div>
              <div className="flex items-center gap-x-2">
                <div className="size-6 rounded bg-primary-accent" />
                <p className="text-sm">VIP</p>
                <p className="font-bold">N1,478,439</p>
              </div>
              <div className="flex items-center gap-x-2">
                <div className="size-6 rounded bg-[#9E76F8]" />
                <p className="text-sm">Premium</p>
                <p className="font-bold">N1,478,439</p>
              </div>
            </div>
          </div>
          <div className="flex mt-5 gap-x-3 items-center">
            <div className="relative h-[147px] w-[147px] ">
              <Doughnut data={data} options={options} />

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-lg font-bold text-primary-text">375</p>
                <p className="text-xs text-secondary-text">
                  Total Tickets Sold
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="text-sm space-y-4">
              <div className="flex items-center gap-x-2">
                <div className="size-6 rounded bg-primary" />
                <p className="text-sm">Regular</p>
                <p className="font-bold">98</p>
              </div>
              <div className="flex items-center gap-x-2">
                <div className="size-6 rounded bg-primary-accent" />
                <p className="text-sm">VIP</p>
                <p className="font-bold">48</p>
              </div>
              <div className="flex items-center gap-x-2">
                <div className="size-6 rounded bg-[#9E76F8]" />
                <p className="text-sm">Premium</p>
                <p className="font-bold">229</p>
              </div>
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
