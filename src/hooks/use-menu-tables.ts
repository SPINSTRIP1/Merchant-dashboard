/**
 * The restaurant's dining tables (Menu service, `/menu/tables`). The server numbers tables 1, 2, 3…
 * and the number never changes; each table's QR code opens the public menu with that number
 * (`places.spinstrip.com/restaurants/{merchantId}?number=7`), so guest orders are tagged to it.
 * A table can carry payout bank accounts; the server resolves each one (LedgerBlock, else Paystack)
 * when the table is saved, and `useResolveTableAccount` previews the name first.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { accountNameFrom } from "@/hooks/use-kyc";

export interface TableAccount {
  bankCode: string;
  accountNumber: string;
  accountName?: string;
  bankName?: string;
}

export interface DiningTable {
  id: string;
  /** Assigned by the server; stays the same for the table's life. */
  number: number;
  name: string;
  description: string | null;
  seats: number;
  accounts: TableAccount[];
  createdAt: string;
}

export interface TableInput {
  name: string;
  description?: string;
  seats: number;
  /** Replaces the table's saved accounts; send `[]` to clear them, omit to leave them alone. */
  accounts?: { bankCode: string; accountNumber: string }[];
}

export const TABLES_KEY = ["menu-tables"];

const fail = (error: unknown) => new Error(handleAxiosError(error as AxiosError));

/** The merchant's tables (first 100), ordered by number, with create / update / delete. */
export function useMenuTables() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<DiningTable[]>({
    queryKey: TABLES_KEY,
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/tables`, { params: { page: 1, limit: 100 } });
        const rows = (response.data?.data?.data ?? []) as DiningTable[];
        return [...rows].sort((a, b) => a.number - b.number);
      } catch (error) {
        console.log("Error fetching tables:", error);
        return [];
      }
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: TABLES_KEY });
    queryClient.invalidateQueries({ queryKey: ["menu-analytics"] });
  };

  const createTable = useMutation({
    mutationFn: async (input: TableInput) => {
      try {
        const response = await api.post(`${SERVER_URL}/menu/tables`, clean(input));
        return response.data.data as DiningTable;
      } catch (error) {
        throw fail(error);
      }
    },
    onSuccess: invalidate,
  });

  const updateTable = useMutation({
    mutationFn: async ({ id, ...input }: TableInput & { id: string }) => {
      try {
        const response = await api.patch(`${SERVER_URL}/menu/tables/${id}`, clean(input));
        return response.data.data as DiningTable;
      } catch (error) {
        throw fail(error);
      }
    },
    onSuccess: invalidate,
  });

  const deleteTable = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`${SERVER_URL}/menu/tables/${id}`);
      } catch (error) {
        throw fail(error);
      }
    },
    onSuccess: invalidate,
  });

  return { tables: data ?? [], isLoading, error, refetch, createTable, updateTable, deleteTable };
}

const clean = ({ name, description, seats, accounts }: TableInput) => ({
  name: name.trim(),
  seats,
  ...(description?.trim() ? { description: description.trim() } : {}),
  ...(accounts ? { accounts } : {}),
});

/**
 * Name enquiry for a table payout account (`POST /menu/tables/accounts/resolve`) — nothing is saved.
 * Gated until a bank and a full 10-digit account number are supplied.
 */
export function useResolveTableAccount({ bankCode, accountNumber }: { bankCode?: string; accountNumber?: string }) {
  const enabled = !!bankCode && /^\d{10}$/.test(accountNumber ?? "");
  const { data, isLoading, error } = useQuery<string>({
    queryKey: ["menu-table-resolve-account", bankCode, accountNumber],
    enabled,
    retry: false,
    queryFn: async () => {
      const response = await api.post(`${SERVER_URL}/menu/tables/accounts/resolve`, { bankCode, accountNumber });
      return accountNameFrom(response.data.data);
    },
  });

  return {
    accountName: data ?? "",
    isResolving: enabled && isLoading,
    error: enabled && error ? handleAxiosError(error as AxiosError) : null,
  };
}
