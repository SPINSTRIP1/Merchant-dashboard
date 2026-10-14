/**
 * Sample transactions and customers for the analytics screens (Overview, Settlement, Wallet)
 * until the backend exposes transaction reporting. Generated from a fixed seed, so the numbers are
 * stable across reloads, and dated relative to today so recent ranges always have data.
 */
import { between, daysAgo, emailFor, fullName, pick, roundTo, seededRandom, txRef } from "./utils";

export type TransactionType = "menu" | "event" | "place" | "inventory" | "deal" | "wallet";
export type TransactionStatus = "success" | "pending" | "failed";

export interface MockTransaction {
  id: string;
  ref: string;
  type: TransactionType;
  customerName: string;
  itemLabel: string;
  amount: number;
  status: TransactionStatus;
  settled: boolean;
  settledAt: string | null;
  tableId: string | null;
  createdAt: string;
}

export interface MockCustomer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  menu: "Menu",
  event: "Events",
  place: "Places",
  inventory: "Inventory",
  deal: "Deals",
  wallet: "Wallet",
};

export const TRANSACTION_TYPES = Object.keys(TRANSACTION_TYPE_LABELS) as TransactionType[];

const DISHES = [
  "Jollof Rice & Chicken", "Coconut Rice & Turkey", "Egusi & Pounded Yam", "Suya Platter",
  "Grilled Tilapia", "Fried Rice & Plantain", "Pepper Soup", "Asun", "Ofada Rice & Ayamase",
  "Chapman", "Akara & Pap", "Yam Porridge",
];

const ITEM_LABELS: Record<Exclude<TransactionType, "menu">, string[]> = {
  event: ["Independence Day", "Friday Night Live: Afrobeat", "Chef's Table", "Sunday Brunch Sessions"],
  place: ["Reservation — Lekki", "Reservation — VI Rooftop", "Reservation — PH Short Let"],
  inventory: ["Stock replenishment", "Supplier order", "Retail stock sale"],
  deal: ["Buy 1 get 1 free", "Midweek Lunch Rush", "First Visit Discount"],
  wallet: ["Wallet top-up", "Bill split payment", "Wallet cashback"],
};

const AMOUNT_RANGES: Record<TransactionType, [number, number]> = {
  menu: [3_000, 24_000],
  event: [2_000, 45_000],
  place: [10_000, 60_000],
  inventory: [25_000, 240_000],
  deal: [2_500, 18_000],
  wallet: [5_000, 50_000],
};

// Menu is the busiest channel, then events; the rest share the remainder.
const TYPE_WEIGHTS: TransactionType[] = [
  "menu", "menu", "menu", "menu", "event", "event", "place", "inventory", "deal", "wallet",
];

const TABLE_COUNT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Spread `days` back from today, weighted toward recent days. */
const recentDaysAgo = (rng: () => number, maxDays: number) => Math.floor(Math.pow(rng(), 1.6) * maxDays);

const atRandomTime = (rng: () => number, days: number) => {
  const d = daysAgo(days);
  d.setHours(between(rng, 8, 22), between(rng, 0, 59), between(rng, 0, 59), 0);
  return d;
};

function generateCustomers(): MockCustomer[] {
  const rng = seededRandom(20261);
  return Array.from({ length: 140 }, (_, i) => {
    const name = fullName(rng);
    return {
      id: `cus_${i + 1}`,
      name,
      email: emailFor(name, rng),
      createdAt: atRandomTime(rng, recentDaysAgo(rng, 365)).toISOString(),
    };
  });
}

function generateTransactions(customers: MockCustomer[]): MockTransaction[] {
  const rng = seededRandom(20262);
  const now = Date.now();

  return Array.from({ length: 520 }, (_, i) => {
    const type = pick(rng, TYPE_WEIGHTS);
    const created = atRandomTime(rng, recentDaysAgo(rng, 365));
    const [min, max] = AMOUNT_RANGES[type];
    const roll = rng();
    const status: TransactionStatus = roll < 0.9 ? "success" : roll < 0.96 ? "pending" : "failed";
    // Successful transactions settle T+1 — the day after the payment.
    const settledAt = new Date(created.getTime() + DAY_MS);
    const settled = status === "success" && settledAt.getTime() < now && rng() < 0.9;

    return {
      id: `txn_${i + 1}`,
      ref: txRef(created, rng),
      type,
      customerName: pick(rng, customers).name,
      itemLabel: type === "menu" ? pick(rng, DISHES) : pick(rng, ITEM_LABELS[type]),
      amount: roundTo(between(rng, min, max)),
      status,
      settled,
      settledAt: settled ? settledAt.toISOString() : null,
      tableId: type === "menu" ? `tbl_${between(rng, 1, TABLE_COUNT)}` : null,
      createdAt: created.toISOString(),
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

let cache: { customers: MockCustomer[]; transactions: MockTransaction[] } | null = null;

/** Sample customers and transactions (newest first), generated once per page load. */
export function mockLedger() {
  if (!cache) {
    const customers = generateCustomers();
    cache = { customers, transactions: generateTransactions(customers) };
  }
  return cache;
}

/** Sample wallet balance shown until the wallet endpoint's balance field is confirmed. */
export const MOCK_WALLET_BALANCE = 4_286_500;
