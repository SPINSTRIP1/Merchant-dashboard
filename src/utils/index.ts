// Security utility functions (same as your auth manager)
export const encrypt = (text: string): string => {
  try {
    const salt = "spinstrip2024";
    const combined = salt + text + salt;
    return btoa(combined);
  } catch (error) {
    console.error("Encryption error:", error);
    return text;
  }
};

export const decrypt = (encrypted: string): string => {
  try {
    const decoded = atob(encrypted);
    const salt = "spinstrip2024";
    return decoded.slice(salt.length, -salt.length);
  } catch (error) {
    console.error("Decryption error:", error);
    return encrypted;
  }
};

// Format amount to Nigerian Naira, always showing 2 decimals: `₦12,500.00`, `₦12.3456`.
export const formatAmount = (amount: number | string): string => formatMoney(amount, 2);

// Format ISO date string to DD/MM/YYYY
export const formatISODate = (isoString: string): string => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format ISO date string to YYYY-MM-DD for date inputs
export const formatDateForInput = (isoString: string): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Format ISO date string to "31 Dec 2025" format
export const formatDateDisplay = (isoString: string): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = date.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const capitalizeFirstLetter = (str: string | undefined): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ---------------------------------------------------------------------------
// Display formatting (dashboard-wide)
// ---------------------------------------------------------------------------

/**
 * Money is never rounded: extra decimals are cut off after `MONEY_DECIMALS` places, and
 * whole naira always show in full (no "K"/"M" shortening). ₦10,500 stays ₦10,500.
 */
export const MONEY_DECIMALS = 4;

/** `value` as a plain decimal string cut (not rounded) to `places` decimals: 12.34567 → "12.3456". */
export const truncateDecimals = (value: number | string, places = MONEY_DECIMALS): string => {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return "0";
  // String(n) is the shortest exact form (1.005 stays "1.005"); fall back for exponent notation.
  let text = String(Math.abs(n));
  if (text.includes("e")) text = Math.abs(n).toFixed(20);
  const [whole, fraction = ""] = text.split(".");
  const cut = fraction.slice(0, places).replace(/0+$/, "");
  const sign = n < 0 && (/[1-9]/.test(whole) || /[1-9]/.test(cut)) ? "-" : "";
  return `${sign}${whole}${cut ? `.${cut}` : ""}`;
};

/** `₦` + grouped whole naira + up to 4 truncated decimals, padded to `minDecimals`. */
const formatMoney = (amount: number | string, minDecimals: number): string => {
  const [signedWhole, fraction = ""] = truncateDecimals(amount).split(".");
  const negative = signedWhole.startsWith("-");
  const whole = negative ? signedWhole.slice(1) : signedWhole;
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimals = fraction.padEnd(minDecimals, "0");
  return `${negative ? "-" : ""}₦${grouped}${decimals ? `.${decimals}` : ""}`;
};

/** Naira without forced decimals: `₦12,500`, `₦12,500.5`, `₦0.1234`. Never rounded or shortened. */
export const formatNaira = (amount: number | string): string => formatMoney(amount, 0);

/** "14 Oct 2026" */
export const fmtDate = (value: string | number | Date): string =>
  new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** "14 Oct 2026 · 3:05 pm" */
export const fmtDateTime = (value: string | number | Date): string => {
  const date = new Date(value);
  const time = date
    .toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase();
  return `${fmtDate(date)} · ${time}`;
};

/** "just now", "5m ago", "3h ago", "12d ago", then the date after 30 days. */
export const timeAgo = (value: string | number | Date): string => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(value);
};

export type RangePreset = "today" | "week" | "month" | "year" | "custom";
export interface DateRange {
  preset: RangePreset;
  from: Date;
  to: Date;
}

/** Date range for a preset. Weeks start on Monday; `to` is always the end of today. */
export const rangeFor = (preset: RangePreset, custom?: { from: Date; to: Date }): DateRange => {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  switch (preset) {
    case "week":
      from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
      break;
    case "month":
      from.setDate(1);
      break;
    case "year":
      from.setMonth(0, 1);
      break;
    case "custom":
      if (custom) return { preset, from: custom.from, to: custom.to };
      break;
  }
  return { preset, from, to };
};

/** Download rows as a CSV file. Values are quoted and escaped. */
export const exportCsv = (
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void => {
  const escape = (value: string | number | null | undefined) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
