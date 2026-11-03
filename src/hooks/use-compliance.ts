import { businessTypeOf, useKyc, type KYCData } from "@/hooks/use-kyc";

export interface ComplianceStep {
  key: "business" | "documents" | "identity" | "review";
  label: string;
  done: boolean;
}

/** Whether the documents for the record's business type are all on file. */
function documentsDone(kyc: Partial<KYCData>) {
  if (!kyc.proofOfAddressUrl) return false;
  switch (businessTypeOf(kyc)) {
    case "UNREGISTERED":
      return !!kyc.governmentIdUrl;
    case "LIMITED":
      return !!(
        kyc.certificateOfIncorporationUrl &&
        kyc.memorandumArticlesUrl &&
        kyc.cacForm7Url &&
        (kyc.cacForm2Url || kyc.cacForm11Url)
      );
    case "SOLE_PROPRIETOR":
      return !!(kyc.certificateOfIncorporationUrl && kyc.statusReportUrl);
    default:
      return false;
  }
}

/** Whether the owner / director identity numbers and the payout bank are on file. */
function identityDone(kyc: Partial<KYCData>) {
  switch (businessTypeOf(kyc)) {
    case "UNREGISTERED":
      return !!(kyc.nin && kyc.bvn && kyc.personalBankDetails);
    case "LIMITED":
      return !!(kyc.directors?.length && kyc.corporateBankDetails);
    case "SOLE_PROPRIETOR":
      return !!(kyc.proprietorNin && kyc.proprietorBvn && kyc.corporateBankDetails);
    default:
      return false;
  }
}

/** The four KYC milestones, ticked off from the merchant's KYC record. */
export function complianceSteps(kyc: Partial<KYCData> | undefined): ComplianceStep[] {
  const record = kyc ?? {};
  // Older approved records predate the per-type fields; approval covers every step.
  const verified = record.status === "VERIFIED";
  return [
    { key: "business", label: "Business type & details", done: verified || !!businessTypeOf(record) },
    { key: "documents", label: "Documents", done: verified || documentsDone(record) },
    { key: "identity", label: "Identity & payout account", done: verified || identityDone(record) },
    { key: "review", label: "Approved by SpinStrip", done: verified },
  ];
}

/**
 * The merchant's compliance status plus progress, derived from `useKyc` so it shares the same
 * underlying query (react-query dedupes by key — no extra network request).
 */
export function useComplianceStatus() {
  const { kyc, status, isLoading, error, refetch } = useKyc();
  const steps = complianceSteps(kyc);
  const percent = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

  return {
    data: status,
    kyc,
    steps,
    percent,
    adminNotes: kyc?.adminNotes ?? null,
    verificationUrl: kyc?.verificationUrl ?? null,
    isLoading,
    error,
    refetch,
  };
}
