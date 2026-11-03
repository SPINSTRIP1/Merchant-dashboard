"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, ChevronsUpDown, Loader2, Search, XCircle } from "lucide-react";
import Field from "@/components/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNgnBanks, useResolveKycBankAccount, type KycBankDetails } from "@/hooks/use-kyc";
import { useResolveTableAccount } from "@/hooks/use-menu-tables";
import { cn } from "@/lib/utils";

export const EMPTY_BANK: KycBankDetails = { bankCode: "", accountNumber: "", accountName: "" };

/**
 * Bank + account number with a live name check. `accountName` in `value` is only filled once the
 * account resolves, so `!!value.accountName` means "verified". `resolveWith` picks the service that
 * checks it: KYC (`POST /kyc/bank-account/resolve`) or a table (`POST /menu/tables/accounts/resolve`).
 */
export default function BankAccountField({
  value,
  onChange,
  resolveWith,
  label = "Bank account",
  idPrefix = "bank",
}: {
  value: KycBankDetails;
  onChange: (value: KycBankDetails) => void;
  resolveWith: "kyc" | "table";
  label?: string;
  idPrefix?: string;
}) {
  const { banks, isLoading: banksLoading } = useNgnBanks();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const lookup = { bankCode: value.bankCode, accountNumber: value.accountNumber };
  const kyc = useResolveKycBankAccount(resolveWith === "kyc" ? lookup : {});
  const table = useResolveTableAccount(resolveWith === "table" ? lookup : {});
  const { accountName, isResolving, error } = resolveWith === "kyc" ? kyc : table;
  const ready = !!value.bankCode && /^\d{10}$/.test(value.accountNumber);

  // Keep the parent's accountName in step with the latest lookup.
  useEffect(() => {
    const next = ready && !isResolving ? accountName : "";
    if (next !== value.accountName) onChange({ ...value, accountName: next });
  }, [accountName, isResolving, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = banks.find((bank) => bank.bankCode === value.bankCode);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? banks.filter((bank) => bank.bankName.toLowerCase().includes(term)) : banks;
  }, [banks, query]);

  return (
    <div className="space-y-3">
      <Field label={label} htmlFor={`${idPrefix}-bank`}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              id={`${idPrefix}-bank`}
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-controls={`${idPrefix}-bank-list`}
              className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-background px-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className={cn("truncate", !selected && "text-muted-foreground")}>
                {selected?.bankName ?? (banksLoading ? "Loading banks…" : "Select bank")}
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] rounded-xl p-0">
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search banks"
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ul id={`${idPrefix}-bank-list`} role="listbox" className="max-h-64 overflow-y-auto p-1">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-xs text-muted-foreground">No bank matches “{query}”.</li>
              )}
              {filtered.map((bank) => (
                <li key={bank.bankCode}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={bank.bankCode === value.bankCode}
                    onClick={() => {
                      onChange({ ...value, bankCode: bank.bankCode, accountName: "" });
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span className="truncate">{bank.bankName}</span>
                    {bank.bankCode === value.bankCode && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </Field>

      <Field label="Account number" htmlFor={`${idPrefix}-account`}>
        <Input
          id={`${idPrefix}-account`}
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          value={value.accountNumber}
          onChange={(e) =>
            onChange({ ...value, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10), accountName: "" })
          }
          placeholder="10-digit account number"
        />
      </Field>

      {ready && (
        <p
          aria-live="polite"
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm",
            isResolving
              ? "bg-muted text-muted-foreground"
              : value.accountName
                ? "bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-300"
                : "bg-destructive/10 text-destructive",
          )}
        >
          {isResolving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Checking account…
            </>
          ) : value.accountName ? (
            <>
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {value.accountName}
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 shrink-0" />
              {error || "We couldn't find this account. Check the number and bank."}
            </>
          )}
        </p>
      )}
    </div>
  );
}
