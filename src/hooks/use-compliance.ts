import { useKyc, type KYCData } from "@/hooks/use-kyc";

export interface ComplianceStep {
  key: "business" | "documents" | "owners" | "review";
  label: string;
  done: boolean;
}

/** The four KYC milestones, ticked off from the merchant's KYC record. */
export function complianceSteps(kyc: KYCData | undefined): ComplianceStep[] {
  const owner = kyc?.ubos?.[0];
  return [
    {
      key: "business",
      label: "Business information",
      done: !!(kyc?.companyName && kyc?.registrationNumber),
    },
    {
      key: "documents",
      label: "Company documents",
      done: !!(
        kyc?.articlesOfAssociationUrl &&
        kyc?.proofOfAddressUrl &&
        kyc?.bankStatementUrl
      ),
    },
    {
      key: "owners",
      label: "Owner ID verification",
      done: !!(owner?.identityMetadata?.bvn && owner?.identityMetadata?.nin),
    },
    {
      key: "review",
      label: "Approved by SpinStrip",
      done: kyc?.status === "VERIFIED",
    },
  ];
}

/**
 * The merchant's compliance status plus progress, derived from `useKyc` so it shares the same
 * underlying query (react-query dedupes by key — no extra network request).
 */
export function useComplianceStatus() {
  const { kyc, status, isLoading, error, refetch } = useKyc();
  const steps = complianceSteps(kyc);
  const percent = Math.round(
    (steps.filter((s) => s.done).length / steps.length) * 100,
  );

  return {
    data: status,
    steps,
    percent,
    adminNotes: kyc?.adminNotes ?? null,
    isLoading,
    error,
    refetch,
  };
}
