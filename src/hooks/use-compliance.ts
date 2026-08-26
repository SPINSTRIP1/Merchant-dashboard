import { useKyc } from "@/hooks/use-kyc";

/**
 * Returns only the merchant's compliance status.
 * Derived from `useKyc` so it shares the same underlying query
 * (react-query dedupes by key — no extra network request).
 */
export function useComplianceStatus() {
  const { status, isLoading, error, refetch } = useKyc();

  return {
    data: status,
    isLoading,
    error,
    refetch,
  };
}
