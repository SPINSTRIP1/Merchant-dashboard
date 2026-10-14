"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type ScriptableContext,
} from "chart.js";

// Register everything the dashboard's charts use, once.
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

const FALLBACKS: Record<string, string> = {
  primary: "259 75% 54%",
  foreground: "255 30% 12%",
  "muted-foreground": "255 12% 45%",
  border: "260 25% 90%",
  card: "0 0% 100%",
  "chart-1": "259 75% 54%",
  "chart-2": "292 75% 55%",
  "chart-3": "233 80% 62%",
  "chart-4": "187 75% 42%",
  "chart-5": "32 95% 52%",
  "chart-6": "340 80% 58%",
};

/** Resolve a design token (e.g. "primary", "chart-2") to an `hsl()` colour, optionally with alpha. */
export function themeColor(token: string, alpha = 1): string {
  let value = FALLBACKS[token] ?? FALLBACKS.primary;
  if (typeof window !== "undefined") {
    const fromCss = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();
    if (fromCss) value = fromCss;
  }
  return alpha === 1 ? `hsl(${value})` : `hsl(${value} / ${alpha})`;
}

/** The six-colour categorical palette (chart-1 … chart-6). */
export const chartPalette = (alpha = 1) =>
  [1, 2, 3, 4, 5, 6].map((i) => themeColor(`chart-${i}`, alpha));

/** Vertical gradient fill (colour at `topAlpha` fading to transparent) for area charts. */
export function areaGradient(token: string, topAlpha = 0.35) {
  return (context: ScriptableContext<"line">) => {
    const { ctx, chartArea } = context.chart;
    if (!chartArea) return themeColor(token, topAlpha / 2);
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, themeColor(token, topAlpha));
    gradient.addColorStop(1, themeColor(token, 0));
    return gradient;
  };
}

/** Dataset preset for a smooth gradient-filled area line. */
export function areaDataset(label: string, data: number[], token = "chart-1") {
  return {
    label,
    data,
    borderColor: themeColor(token),
    backgroundColor: areaGradient(token),
    fill: true,
    tension: 0.4,
    borderWidth: 2.5,
    pointRadius: 0,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: themeColor(token),
    pointHoverBorderColor: themeColor("card"),
    pointHoverBorderWidth: 2,
  };
}

const tooltipBase = () => ({
  backgroundColor: themeColor("card"),
  titleColor: themeColor("foreground"),
  bodyColor: themeColor("foreground"),
  borderColor: themeColor("border"),
  borderWidth: 1,
  cornerRadius: 12,
  padding: 10,
  displayColors: false,
  titleFont: { weight: 600 as const },
});

/**
 * Options for line/area charts: dashed horizontal grid only, small muted ticks, card-styled tooltip.
 * `formatY` formats axis ticks and tooltip values (e.g. `(v) => formatNaira(v, true)`).
 */
export function lineChartOptions({
  formatY = (v: number) => v.toLocaleString("en-NG"),
  tooltipLabel,
  integerTicks = false,
}: {
  formatY?: (value: number) => string;
  tooltipLabel?: (value: number, datasetLabel: string) => string;
  integerTicks?: boolean;
} = {}): ChartOptions<"line"> {
  const tick = { color: themeColor("muted-foreground"), font: { size: 11 } };
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    animation: { duration: 900 },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipBase(),
        callbacks: {
          label: (ctx) => {
            const value = Number(ctx.parsed.y);
            return tooltipLabel
              ? tooltipLabel(value, ctx.dataset.label ?? "")
              : `${ctx.dataset.label ?? ""}: ${formatY(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { ...tick, autoSkip: true, maxRotation: 0, autoSkipPadding: 24 },
      },
      y: {
        beginAtZero: true,
        grid: { color: themeColor("border") },
        border: { display: false, dash: [3, 3] },
        ticks: {
          ...tick,
          precision: integerTicks ? 0 : undefined,
          callback: (value) => formatY(Number(value)),
        },
      },
    },
  };
}

/** Options for doughnuts: thin ring, circular legend markers at the bottom. */
export function doughnutChartOptions({
  formatValue = (v: number) => v.toLocaleString("en-NG"),
}: { formatValue?: (value: number) => string } = {}): ChartOptions<"doughnut"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "58%",
    animation: { duration: 900 },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          padding: 14,
          color: themeColor("muted-foreground"),
          font: { size: 12 },
        },
      },
      tooltip: {
        ...tooltipBase(),
        displayColors: true,
        callbacks: { label: (ctx) => ` ${ctx.label}: ${formatValue(Number(ctx.parsed))}` },
      },
    },
  };
}

/** Doughnut data from `{ name, value }` rows, coloured from the palette (optionally offset). */
export function doughnutData(
  rows: { name: string; value: number }[],
  paletteOffset = 0
): ChartData<"doughnut"> {
  const palette = chartPalette();
  return {
    labels: rows.map((r) => r.name),
    datasets: [
      {
        data: rows.map((r) => r.value),
        backgroundColor: rows.map((_, i) => palette[(i + paletteOffset) % palette.length]),
        borderWidth: 0,
        spacing: 3,
        hoverOffset: 6,
      },
    ],
  };
}
