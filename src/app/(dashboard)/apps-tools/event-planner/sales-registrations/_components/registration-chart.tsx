"use client";
import React from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
  revenueData = [],
  expenseData = [],
}: {
  revenueData?: number[];
  expenseData?: number[];
}) {
  const data = {
    labels: months,
    datasets: [
      {
        label: "Revenue",
        data: revenueData,
        borderColor: "#6932E2",
        backgroundColor: "rgba(105, 50, 226, 0.1)",
        borderWidth: 2.5,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "#6932E2",
        pointBorderColor: "#6932E2",
        pointRadius: 0,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
      },
      {
        label: "Expenses",
        data: expenseData,
        borderColor: "#EBE2FF",
        backgroundColor: "rgba(255, 141, 40, 0.1)",
        borderWidth: 2.5,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "#EBE2FF",
        pointBorderColor: "#EBE2FF",
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
            return `Revenue: $${context.parsed.y.toLocaleString()}`;
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
          stepSize: 10000,
          callback: function (value: any) {
            return `${value / 1000}k`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  const hasData = revenueData.length > 0 || expenseData.length > 0;

  return (
    <div className="mt-4 h-full">
      <div className="flex mb-7 items-center justify-between">
        <div>
          <h3 className="text-secondary-text text-sm">Total Registrations</h3>

          <p className="text-primary-text font-bold">
            {hasData ? "450 Registrants" : "0 Registrants"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center border p-1 rounded-lg">
              <p className="text-sm">This Year</p>
              <ChevronDown
                className="inline-block text-secondary-text ml-1"
                size={18}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuItem>Last Week</DropdownMenuItem>
            <DropdownMenuItem>Yesterday</DropdownMenuItem>
            <DropdownMenuItem>Next Month</DropdownMenuItem>
            <DropdownMenuItem>This Year</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {hasData ? (
        <>
          <div className="h-56">
            <Line data={data} options={options} />
          </div>
          <div className="flex items-center mt-4 gap-x-2">
            <div className="flex items-center gap-x-2">
              <div className="size-6 rounded bg-primary" />
              <p className="text-sm">Female</p>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="size-6 rounded bg-primary-accent" />
              <p className="text-sm">Male</p>
            </div>
          </div>
        </>
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
