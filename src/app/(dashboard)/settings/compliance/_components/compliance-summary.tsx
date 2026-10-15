"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import StatusPill from "@/components/status-pill";
import type { ComplianceStep } from "@/hooks/use-compliance";
import type { ComplianceStatus } from "@/types";

const STATUS_LABELS: Record<ComplianceStatus, string> = {
  ACTIVE: "Verified",
  PENDING: "In review",
  REJECTED: "Rejected",
  UNVERIFIED: "Not verified",
};

const BENEFITS = [
  "Verified merchants get next-day (T+1) settlement on all transactions.",
  "Public pages (menu, places, events) rank higher in SpinStrip discovery.",
  "Higher transaction limits and access to working-capital offers.",
  "NDPR-aligned data handling keeps your customers' information safe.",
];

export default function ComplianceSummary({
  status,
  steps,
  percent,
  adminNotes,
}: {
  status: ComplianceStatus;
  steps: ComplianceStep[];
  percent: number;
  adminNotes: string | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card p-6"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-foreground">Compliance Status</h3>
          <StatusPill status={status} label={STATUS_LABELS[status] ?? status} />
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="brand-gradient h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{percent}% complete</p>

        <ul className="mt-5 space-y-3">
          {steps.map((step, i) => (
            <motion.li
              key={step.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="flex items-center gap-3 text-sm"
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full ${
                  step.done ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                }`}
              >
                {step.done ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
              </span>
              <span className={step.done ? "font-medium text-foreground" : "text-muted-foreground"}>{step.label}</span>
            </motion.li>
          ))}
        </ul>

        {status === "ACTIVE" && (
          <div className="mt-6 flex gap-3 rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">You&apos;re fully verified</p>
              <p className="mt-1 text-xs">All checks passed. Your business has full access to payouts and public pages.</p>
            </div>
          </div>
        )}
        {status === "PENDING" && (
          <div className="mt-6 flex gap-3 rounded-2xl bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Under review</p>
              <p className="mt-1 text-xs">Our team reviews submissions within 24–48 hours. You&apos;ll be notified once confirmed.</p>
            </div>
          </div>
        )}
        {status === "REJECTED" && (
          <div className="mt-6 flex gap-3 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Your submission needs changes</p>
              <p className="mt-1 text-xs">
                {adminNotes || "Please review your details and documents below, then submit again."}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border bg-card p-6"
      >
        <h3 className="font-display text-lg font-bold text-foreground">Why compliance matters</h3>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {benefit}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
