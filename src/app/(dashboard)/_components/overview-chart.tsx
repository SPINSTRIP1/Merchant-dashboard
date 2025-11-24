"use client";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Dropdown from "@/components/dropdown";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const weeklyData = [12000, 9800, 15600, 10800, 14500, 18900, 16700];
const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function OverviewChart() {
  const data = {
    labels: days,
    datasets: [
      {
        label: "Total",
        data: weeklyData,
        backgroundColor: "#9E76F8",
        borderColor: "#9E76F8",
        borderWidth: 0,
        borderRadius: {
          topLeft: 25,
          topRight: 25,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
        maxBarThickness: 60,
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
            return `Total: ${context.parsed.y}`;
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
          callback: function (value: any) {
            if (value >= 1000) {
              return `${value / 1000}k`;
            }
            return value.toString();
          },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <div className="bg-foreground p-3 lg:p-6 rounded-[32px] m-2">
      <Dropdown
        placeholder="This Week"
        header="Orders Overview"
        options={["Last Week", "Yesterday", "Today", "This Year"]}
      />

      <h3 className="text-secondary-text lg:text-lg">Total Orders</h3>

      <p className="text-xl lg:text-2xl mb-7 text-primary-text font-bold">
        41,345
      </p>
      <div className="h-56 lg:h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
