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

const revenueData = [
  10000, 20000, 30000, 45000, 30000, 45000, 40000, 30500, 20000, 15000, 4000,
  10000,
];
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

export default function RevenueChart() {
  const data = {
    labels: months,
    datasets: [
      {
        label: "Revenue",
        data: revenueData,
        borderColor: "#6932E2",
        backgroundColor: "rgba(105, 50, 226, 0.0)",
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
            size: 14,
          },
        },
      },
      y: {
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
          callback: function (value: any) {
            if (value >= 1000) {
              return `${value / 1000}k`;
            }
            return value.toString();
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <div className="bg-foreground mb-5 p-3 lg:p-6 rounded-[32px] m-2">
      <div className="flex mb-7 items-center justify-between">
        <div>
          <h3 className="text-secondary-text lg:text-lg">Total Revenue</h3>

          <p className="text-xl lg:text-2xl text-primary-text font-bold">
            N5,240,237.13
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
      <div className="h-56 lg:h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
