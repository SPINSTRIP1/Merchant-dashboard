"use client";
import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import EmptyState from "@/components/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartLineData02Icon } from "@hugeicons/core-free-icons";
import { useEventRegistrations } from "@/hooks/use-event-registrations";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

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
  const { registrations, isLoading } = useEventRegistrations({
    eventId,
    limit: 100,
  });

  // Years present in the data, newest first
  const years = Array.from(
    new Set(registrations.map((r) => new Date(r.createdAt).getFullYear())),
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
    datasets: [
      {
        label: "Registrations",
        data: monthlyCounts,
        borderColor: "#6932E2",
        backgroundColor: "rgba(105, 50, 226, 0.1)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#6932E2",
        pointBorderColor: "#6932E2",
        pointRadius: 0,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
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
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            return `${value} ${value === 1 ? "registration" : "registrations"}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "#E5E5E5",
          drawBorder: false,
        },
        ticks: {
          color: "#6F6D6D",
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        min: 0,
        grid: {
          display: true,
          color: "#E5E5E5",
          drawBorder: false,
        },
        ticks: {
          color: "#6F6D6D",
          font: {
            size: 14,
          },
          precision: 0,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <div className="mt-4 h-full">
      <div className="flex mb-7 items-center justify-between">
        <div>
          <h3 className="text-secondary-text text-sm">Total Registrations</h3>

          <p className="text-primary-text font-bold">
            {totalRegistrations.toLocaleString()}{" "}
            {totalRegistrations === 1 ? "Registrant" : "Registrants"}
          </p>
        </div>
        {years.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center border p-1 rounded-lg">
                <p className="text-sm">{activeYear}</p>
                <ChevronDown
                  className="inline-block text-secondary-text ml-1"
                  size={18}
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {years.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-56">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : hasData ? (
        <div className="h-56">
          <Line data={data} options={options} />
        </div>
      ) : (
        <EmptyState
          icon={
            <HugeiconsIcon
              icon={ChartLineData02Icon}
              size={32}
              color="#6932E2"
            />
          }
          title="No Registration Data"
          description="Registration data will appear here once people start registering for your events."
        />
      )}
    </div>
  );
}
