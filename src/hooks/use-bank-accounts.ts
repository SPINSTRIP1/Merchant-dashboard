import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import api from "@/lib/api/axios-client";
import { USER_ACCOUNT_URL } from "@/constants";
import { handleAxiosError } from "@/lib/api/handle-axios-error";

export interface Bank {
  name: string;
  code: string;
}

export interface ResolvedBankAccount {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
}

export interface SavedBankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  currency: string;
  label: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountPayload {
  accountNumber: string;
  bankCode: string;
  currency: string;
  /** Ignored by the API for NGN — taken from the verified resolution. */
  accountName?: string;
  /** Ignored by the API for NGN — taken from the verified resolution. */
  bankName?: string;
  label?: string;
  isDefault?: boolean;
}

/** The API returns bank lists in a few shapes across providers — normalise them. */
type RawBank = Record<string, unknown>;

function normalizeBank(bank: RawBank): Bank {
  return {
    name: String(bank.name ?? bank.bankName ?? bank.bank_name ?? ""),
    code: String(bank.code ?? bank.bankCode ?? bank.bank_code ?? ""),
  };
}

function normalizeResolution(raw: RawBank): ResolvedBankAccount {
  return {
    accountNumber: String(raw.accountNumber ?? raw.account_number ?? ""),
    accountName: String(raw.accountName ?? raw.account_name ?? ""),
    bankCode: String(raw.bankCode ?? raw.bank_code ?? ""),
    bankName: String(raw.bankName ?? raw.bank_name ?? ""),
  };
}

/**
 * Wraps `GET /banks` (user-account service) — the list of supported banks
 * used to populate bank pickers. Options are already sorted by name.
 */
export function useBanks() {
  const { data, isLoading, error, refetch } = useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: async () => {
      try {
        const response = await api.get(USER_ACCOUNT_URL + "/banks");
        const raw = response.data.data;
        const list: RawBank[] = Array.isArray(raw) ? raw : (raw?.banks ?? []);
        return list
          .map(normalizeBank)
          .filter((bank) => bank.name && bank.code)
          .sort((a, b) => a.name.localeCompare(b.name));
      } catch (error) {
        console.log("Error fetching banks:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 60, // the bank list barely changes
  });

  return {
    banks: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Wraps `GET /banks/resolve` — name enquiry on an account number + bank code.
 * A successful resolution is also what makes the account eligible to be saved
 * via `POST /bank-accounts`, so always resolve before creating.
 *
 * Gated until a full 10-digit account number and a bank code are supplied.
 */
export function useResolveBankAccount({
  accountNumber,
  bankCode,
}: {
  accountNumber?: string;
  bankCode?: string;
}) {
  const enabled = !!bankCode && !!accountNumber && accountNumber.length === 10;

  const { data, isLoading, error, refetch } = useQuery<ResolvedBankAccount | null>({
    queryKey: ["resolve-bank-account", accountNumber, bankCode],
    enabled,
    retry: false,
    queryFn: async () => {
      try {
        const response = await api.get(USER_ACCOUNT_URL + "/banks/resolve", {
          params: { accountNumber, bankCode },
        });
        return normalizeResolution(response.data.data ?? {});
      } catch (error) {
        console.log("Error resolving bank account:", error);
        return null;
      }
    },
  });

  return {
    resolvedAccount: data ?? null,
    isResolving: enabled && isLoading,
    error,
    refetch,
  };
}

/**
 * Owns the user's saved settlement accounts — `GET/POST /bank-accounts`,
 * `PATCH/DELETE /bank-accounts/:id`.
 *
 * `defaultAccount` is the payout destination shown in the withdrawal flow;
 * it falls back to the first saved account when none is flagged default.
 */
export function useBankAccounts() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<SavedBankAccount[]>({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      try {
        const response = await api.get(USER_ACCOUNT_URL + "/bank-accounts");
        return (response.data.data ?? []) as SavedBankAccount[];
      } catch (error) {
        console.log("Error fetching bank accounts:", error);
        return [];
      }
    },
  });

  const accounts = data ?? [];

  /** Saves a bank account. The account must already be resolved/verified. */
  async function createBankAccount(payload: CreateBankAccountPayload) {
    setIsCreating(true);
    try {
      const response = await api.post(
        USER_ACCOUNT_URL + "/bank-accounts",
        payload,
      );
      toast.success("Settlement account added successfully!");
      await queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      return response.data.data as SavedBankAccount;
    } catch (error) {
      console.log("Error creating bank account:", error);
      toast.error(handleAxiosError(error as AxiosError));
      return null;
    } finally {
      setIsCreating(false);
    }
  }

  /** Updates the label / default flag of a saved account. */
  async function updateBankAccount(
    id: string,
    payload: { label?: string; isDefault?: boolean },
  ) {
    setIsUpdating(true);
    try {
      const response = await api.patch(
        `${USER_ACCOUNT_URL}/bank-accounts/${id}`,
        payload,
      );
      await queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      return response.data.data as SavedBankAccount;
    } catch (error) {
      console.log("Error updating bank account:", error);
      toast.error(handleAxiosError(error as AxiosError));
      return null;
    } finally {
      setIsUpdating(false);
    }
  }

  /** Marks a saved account as the default payout destination. */
  async function setDefaultAccount(id: string) {
    const account = await updateBankAccount(id, { isDefault: true });
    if (account) toast.success("Default settlement account updated");
    return account;
  }

  async function deleteBankAccount(id: string) {
    setIsDeleting(true);
    try {
      await api.delete(`${USER_ACCOUNT_URL}/bank-accounts/${id}`);
      toast.success("Settlement account removed");
      await queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      return true;
    } catch (error) {
      console.log("Error deleting bank account:", error);
      toast.error(handleAxiosError(error as AxiosError));
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    accounts,
    defaultAccount: accounts.find((a) => a.isDefault) ?? accounts[0] ?? null,
    isLoading,
    error,
    refetch,
    createBankAccount,
    isCreating,
    updateBankAccount,
    setDefaultAccount,
    isUpdating,
    deleteBankAccount,
    isDeleting,
  };
}
