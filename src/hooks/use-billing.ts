import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReduxApps } from "@/hooks/use-redux-apps";
import { mockResponse } from "@/mocks/utils";

export type InvoiceStatus = "paid" | "due" | "failed";

export interface Invoice {
  id: string;
  ref: string;
  description: string;
  amount: number;
  status: InvoiceStatus;
  /** First day of the billed month (ISO). */
  periodStart: string;
}

export interface Subscription {
  name: string;
  icon: string;
  /** Monthly price in naira; 0 for free and default apps. */
  price: number;
}

export interface PaymentMethod {
  brand: string;
  last4: string;
}

const monthStart = (offset: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d;
};

/** Last 12 monthly invoices at the current bill; this month is due, earlier months are paid. */
function buildInvoices(monthly: number): Invoice[] {
  if (monthly <= 0) return [];
  return Array.from({ length: 12 }, (_, i) => {
    const period = monthStart(-i);
    const ym = `${period.getFullYear()}${String(period.getMonth() + 1).padStart(2, "0")}`;
    const monthName = period.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
    return {
      id: `inv_${ym}`,
      ref: `INV-${ym}-${String(42 + i).padStart(4, "0")}`,
      description: `SpinStrip Apps subscription — ${monthName}`,
      amount: monthly,
      status: i === 0 ? "due" : "paid",
      periodStart: period.toISOString(),
    };
  });
}

/**
 * The merchant's app subscriptions and billing history.
 *
 * Subscriptions and the monthly bill are derived from the apps catalogue (prices in
 * src/constants) and which apps are switched on. Invoices and the card on file are SAMPLE DATA
 * until the billing endpoints exist — swap the `queryFn` for the real call then.
 */
export function useBilling() {
  const { activeApps } = useReduxApps();

  const subscriptions = useMemo<Subscription[]>(
    () =>
      activeApps.map((app) => ({
        name: app.name,
        icon: app.icon,
        price: "amount" in app && typeof app.amount === "number" ? app.amount : 0,
      })),
    [activeApps]
  );
  const monthlyTotal = subscriptions.reduce((sum, s) => sum + s.price, 0);
  const paidCount = subscriptions.filter((s) => s.price > 0).length;

  const { data, isLoading, error, refetch } = useQuery<{
    invoices: Invoice[];
    paymentMethod: PaymentMethod | null;
  }>({
    queryKey: ["billing", monthlyTotal],
    queryFn: () =>
      mockResponse({
        invoices: buildInvoices(monthlyTotal),
        paymentMethod: { brand: "Verve", last4: "4421" },
      }),
  });

  return {
    subscriptions,
    monthlyTotal,
    paidCount,
    nextChargeDate: monthlyTotal > 0 ? monthStart(1) : null,
    invoices: data?.invoices ?? [],
    paymentMethod: data?.paymentMethod ?? null,
    isLoading,
    error,
    refetch,
  };
}
