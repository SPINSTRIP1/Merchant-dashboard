"use client";

import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { CreditCard, Download, Receipt, Sparkles } from "lucide-react";
import PageHeader from "@/components/page-header";
import StatusPill from "@/components/status-pill";
import EmptyState from "@/components/empty-state";
import SampleDataBadge from "@/components/sample-data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBilling } from "@/hooks/use-billing";
import { fmtDate, formatNaira } from "@/utils";

export default function BillingPage() {
  const {
    subscriptions,
    monthlyTotal,
    paidCount,
    nextChargeDate,
    invoices,
    paymentMethod,
    isLoading,
  } = useBilling();

  return (
    <>
      <PageHeader title="Billing" subtitle="Your SpinStrip app subscriptions and invoices." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="brand-gradient relative overflow-hidden rounded-2xl p-6 text-white"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative">
            <Sparkles className="h-5 w-5 text-white/80" />
            <p className="mt-4 text-sm text-white/80">Current monthly bill</p>
            <p className="font-display text-3xl font-extrabold tracking-tight">
              {formatNaira(monthlyTotal)}
              <span className="text-base font-semibold text-white/70">/month</span>
            </p>
            <p className="mt-1 text-xs text-white/75">
              {paidCount} paid app{paidCount === 1 ? "" : "s"} active
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border bg-card p-6"
        >
          <div className="flex items-start justify-between gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <SampleDataBadge />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Payment method</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-8 w-40" />
          ) : (
            <p className="mt-1 font-display text-2xl font-bold text-foreground">
              {paymentMethod ? `${paymentMethod.brand} •••• ${paymentMethod.last4}` : "No card on file"}
            </p>
          )}
          <button
            type="button"
            onClick={() => toast("Card management is coming soon.")}
            className="mt-1 text-xs font-semibold text-primary hover:underline"
          >
            Update card
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border bg-card p-6"
        >
          <Receipt className="h-5 w-5 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Next charge</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">
            {nextChargeDate ? fmtDate(nextChargeDate) : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {nextChargeDate ? `${formatNaira(monthlyTotal)}, charged to wallet or card` : "No paid apps active"}
          </p>
        </motion.div>
      </div>

      <section className="mt-6 rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-display text-base font-bold text-foreground">Active Subscriptions</h3>
          <Link href="/apps-tools" className="text-xs font-semibold text-primary hover:underline">
            Manage apps
          </Link>
        </div>
        {subscriptions.length ? (
          <ul className="divide-y">
            {subscriptions.map((sub) => (
              <li key={sub.name} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <span className="flex items-center gap-3">
                  <Image src={sub.icon} alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
                  <span className="text-sm font-medium text-foreground">{sub.name}</span>
                </span>
                {sub.price > 0 ? (
                  <span className="text-sm font-semibold text-foreground">{formatNaira(sub.price)}/month</span>
                ) : (
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Free</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Sparkles />} title="No active apps" hint="Turn on apps in Apps & Tools." />
        )}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center justify-between gap-2 border-b px-5 py-4">
          <h3 className="font-display text-base font-bold text-foreground">Invoices</h3>
          <SampleDataBadge />
        </div>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : invoices.length ? (
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Download</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">{invoice.ref}</TableCell>
                  <TableCell className="text-foreground">{invoice.description}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fmtDate(invoice.periodStart)}</TableCell>
                  <TableCell className="font-semibold text-foreground">{formatNaira(invoice.amount)}</TableCell>
                  <TableCell>
                    <StatusPill status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => toast(`Invoice downloads are coming soon (${invoice.ref}).`)}
                      aria-label={`Download ${invoice.ref}`}
                      className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState icon={<Receipt />} title="No invoices yet" hint="Invoices appear once you turn on a paid app." />
        )}
      </section>
    </>
  );
}
