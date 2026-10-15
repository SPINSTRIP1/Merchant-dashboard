"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Landmark, Plus, Star, Trash2 } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBankAccounts } from "@/hooks/use-bank-accounts";
import SettlementAccount from "@/app/(dashboard)/apps-tools/wallet/_components/modals/settlement-account";

export default function PaymentsPage() {
  const [isManaging, setIsManaging] = useState(false);
  const { accounts, isLoading, setDefaultAccount, isUpdating, deleteBankAccount, isDeleting } = useBankAccounts();

  return (
    <div>
      <Breadcrumb parent={{ label: "Settings", href: "/settings" }} current="Payments" />
      <PageHeader
        title="Payments"
        subtitle="Where SpinStrip sends your settlements."
        actions={
          <Button variant="brand" onClick={() => setIsManaging(true)}>
            <Plus /> Add Account
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground">Settlement accounts</h3>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              icon={<Landmark />}
              title="No settlement account yet"
              description="Add a Nigerian bank account to receive your payouts."
              action={
                <Button variant="brand" onClick={() => setIsManaging(true)}>
                  Add Account
                </Button>
              }
            />
          ) : (
            <ul className="mt-4 space-y-2">
              {accounts.map((account, i) => (
                <motion.li
                  key={account.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-wrap items-center gap-3 rounded-xl border p-4"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Landmark className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                      {account.accountName}
                      {account.isDefault && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {account.bankName} • {account.accountNumber}
                      {account.label ? ` • ${account.label}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!account.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => setDefaultAccount(account.id)}
                      >
                        <Star /> Make default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting}
                      onClick={() => deleteBankAccount(account.id)}
                      aria-label={`Remove ${account.bankName} account`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4 text-primary" /> Settlement Cadence
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">T+1</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cleared payments settle to your default account on the next business day.
          </p>
        </div>
      </div>

      <SettlementAccount isOpen={isManaging} onClose={() => setIsManaging(false)} />
    </div>
  );
}
