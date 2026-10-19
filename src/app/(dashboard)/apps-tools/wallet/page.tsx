"use client";
import { SHOW_SAMPLE_FEATURES } from "@/lib/features";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, CalendarClock, ChevronRight, CreditCard, Landmark, TrendingUp, Wallet as WalletIcon } from "lucide-react";
import TransactionHistory from "./_components/transaction-history";
import RevenueChart from "./_components/revenue-chart";
import PointOfSale from "./_components/modals/point-of-sale";
import Account from "./_components/modals/account";
import SettlementAccount from "./_components/modals/settlement-account";
import Withdrawal from "./_components/modals/withdraw";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";
import SampleDataBadge from "@/components/sample-data-badge";
import { useKyc } from "@/hooks/use-kyc";
import { useWallet } from "@/hooks/use-wallet";
import { useBankAccounts } from "@/hooks/use-bank-accounts";
import { SAMPLE_WALLET_BALANCE, useWalletActivity, type WalletPeriod } from "@/hooks/use-wallet-extras";
import { formatNaira } from "@/utils";

/** Reads a number from the first of several possible fields on the wallet response. */
function pickNumber(source: Record<string, unknown> | undefined, keys: string[]): number | null {
  for (const key of keys) {
    const value = Number(source?.[key]);
    if (source?.[key] !== undefined && source?.[key] !== null && Number.isFinite(value)) return value;
  }
  return null;
}

function pickString(source: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  for (const key of keys) {
    if (typeof source?.[key] === "string" && source[key]) return source[key] as string;
  }
  return undefined;
}

export default function Wallet() {
  const [action, setAction] = useState<
    "pos" | "account" | "settlement" | "withdraw" | null
  >(null);
  const [period, setPeriod] = useState<WalletPeriod>("year");

  const { wallets, isLoading, createWallet, isCreating } = useWallet();
  const { kyc } = useKyc();
  const { defaultAccount } = useBankAccounts();
  const activity = useWalletActivity(period);

  if (isLoading) return <Loader />;

  // The wallet response shape isn't typed yet: use its balance/account fields when present.
  const wallet = (Array.isArray(wallets) ? wallets[0] : wallets) as Record<string, unknown> | undefined;
  const realBalance = pickNumber(wallet, ["balance", "availableBalance", "available_balance", "ledgerBalance"]);
  // Real balance only; the sample fallback is for local previews (SHOW_SAMPLE_FEATURES).
  const balance = realBalance ?? (SHOW_SAMPLE_FEATURES ? SAMPLE_WALLET_BALANCE : null);
  const accountNumber = pickString(wallet, ["accountNumber", "account_number", "virtualAccountNumber"]);
  const bankName = pickString(wallet, ["bankName", "bank_name"]);

  return (
    <div>
      <Breadcrumb parent={{ label: "Tools", href: "/apps-tools" }} current="Wallet" />
      <PageHeader title="Wallet" subtitle="Accept payments, split bills and settle to your bank." />
      {wallets?.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={<WalletIcon />}
            title="Welcome to Wallet"
            description="Set up your wallet to start accepting payments and managing your finances."
            action={
              <Button variant="brand" onClick={() => createWallet(kyc)} disabled={isCreating}>
                {isCreating ? "Creating Wallet..." : "Create Wallet"}
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="brand-gradient relative overflow-hidden rounded-2xl p-6 text-white lg:col-span-2"
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-16 -left-6 h-40 w-40 rounded-full bg-black/10" />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm text-white/80">
                    <WalletIcon className="h-4 w-4" /> Available Balance
                  </span>
                  {SHOW_SAMPLE_FEATURES && realBalance === null && (
                    <SampleDataBadge className="border-white/40 bg-white/15 text-white" />
                  )}
                </div>
                <p className="mt-3 font-display text-4xl font-extrabold tracking-tight">{balance === null ? "—" : formatNaira(balance)}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAction("account")}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-primary transition-transform hover:scale-[1.02]"
                  >
                    <ArrowDownToLine className="h-4 w-4" /> Deposit
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction("withdraw")}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur hover:bg-white/25"
                  >
                    <ArrowUpFromLine className="h-4 w-4" /> Withdraw
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction("pos")}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur hover:bg-white/25"
                  >
                    <CreditCard className="h-4 w-4" /> POS
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setAction("settlement")}
                  className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-black/15 px-3.5 py-2 text-xs font-medium text-white/90 hover:bg-black/25"
                >
                  <Landmark className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {defaultAccount
                      ? `Settles to ${defaultAccount.bankName} • ${defaultAccount.accountNumber}`
                      : "Add Settlement Account"}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">Wallet funding</p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">
                  {activity.isLoading ? "…" : formatNaira(activity.funding, true)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">deposits into your wallet</p>
              </div>
              <div className="rounded-2xl border bg-card p-5">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4 text-primary" /> Settlement Cadence
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">T+1</p>
                <p className="mt-1 text-xs text-muted-foreground">next business day, automatic</p>
              </div>
            </div>
          </div>

          <div className="my-6 grid grid-cols-2 gap-3">
            <StatCard
              index={0}
              label="Money In"
              value={activity.isLoading ? "…" : formatNaira(activity.moneyIn, true)}
              sub="completed credits"
              icon={<TrendingUp />}
            />
            <StatCard
              index={1}
              label="Withdrawals"
              value={activity.isLoading ? "…" : formatNaira(activity.withdrawn, true)}
              sub="settled to your bank"
              icon={<ArrowUpFromLine />}
            />
          </div>

          <RevenueChart
            series={activity.series}
            total={activity.moneyIn}
            period={period}
            onPeriodChange={setPeriod}
          />
          <TransactionHistory
            transactions={activity.transactions}
            isLoading={activity.isLoading}
            period={period}
            onPeriodChange={setPeriod}
          />
        </>
      )}

      <PointOfSale isOpen={action === "pos"} onClose={() => setAction(null)} />
      <Account
        isOpen={action === "account"}
        onClose={() => setAction(null)}
        accountNumber={accountNumber}
        bankName={bankName}
      />
      <SettlementAccount
        isOpen={action === "settlement"}
        onClose={() => setAction(null)}
      />
      <Withdrawal
        isOpen={action === "withdraw"}
        onClose={() => setAction(null)}
        onAddSettlementAccount={() => setAction("settlement")}
      />
    </div>
  );
}
