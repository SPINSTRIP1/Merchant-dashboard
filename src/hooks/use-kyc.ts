/**
 * Merchant KYC on the compliance service. There are three submission routes, one per business type
 * (ITEX onboarding requirements):
 *   POST /kyc/merchant/unregistered                 individuals / unregistered businesses
 *   POST /kyc/merchant/registered/limited           limited companies
 *   POST /kyc/merchant/registered/sole-proprietor   registered business names
 * Documents go up first through `POST /kyc/upload/merchant` (see `FileUpload`), and the payout bank is
 * picked from `GET /kyc/banks/ngn` and checked with `POST /kyc/bank-account/resolve`.
 * A submission can return a LedgerBlock `verificationUrl` the merchant completes; individuals are then
 * approved automatically, registered businesses move to UNDER_REVIEW for an admin.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { ComplianceStatus } from "@/types";

export type BusinessType = "UNREGISTERED" | "LIMITED" | "SOLE_PROPRIETOR";

export interface KycBankDetails {
  accountNumber: string;
  bankCode: string;
  accountName: string;
}

export interface KycDirector {
  id: string;
  fullName: string;
  nin: string;
  bvn: string;
  idDocumentUrl?: string | null;
}

/** `GET /kyc/merchant/status` → `data`. Document fields are signed URLs (valid for an hour). */
export interface KYCData {
  id: string;
  userId: string;
  businessRegistration: "UNREGISTERED" | "REGISTERED";
  entityType: "LIMITED" | "SOLE_PROPRIETOR" | null;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "UNDER_REVIEW";
  /** LedgerBlock hosted identity check the merchant still has to complete, if any. */
  verificationUrl: string | null;
  companyName: string | null;
  websiteUrl: string | null;
  socialUrl: string | null;
  nin: string | null;
  bvn: string | null;
  governmentIdUrl: string | null;
  proofOfAddressUrl: string | null;
  personalBankDetails: KycBankDetails | null;
  corporateBankDetails: KycBankDetails | null;
  certificateOfIncorporationUrl: string | null;
  memorandumArticlesUrl: string | null;
  cacForm7Url: string | null;
  cacForm2Url: string | null;
  cacForm11Url: string | null;
  requiresScuml: boolean;
  scumlCertificateUrl: string | null;
  requiresOperatingLicense: boolean;
  operatingLicenseUrl: string | null;
  statusReportUrl: string | null;
  proprietorFullName: string | null;
  proprietorNin: string | null;
  proprietorBvn: string | null;
  proprietorIdUrl: string | null;
  directors: KycDirector[];
  adminNotes: string | null;
  expiryDate: string | null;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

/** The business type a KYC record was submitted as (null before the first submission). */
export function businessTypeOf(kyc: Partial<KYCData> | undefined): BusinessType | null {
  if (!kyc?.businessRegistration) return null;
  if (kyc.businessRegistration === "UNREGISTERED") return "UNREGISTERED";
  return kyc.entityType === "SOLE_PROPRIETOR" ? "SOLE_PROPRIETOR" : "LIMITED";
}

const KYC_QUERY_KEY = ["kyc-merchant-status"];

/**
 * Single source of truth for the merchant's KYC / compliance record (`GET /kyc/merchant/status`).
 * The service re-checks LedgerBlock on every call while a submission is pending, so refetching
 * after the merchant returns from the hosted check picks up the new status.
 *
 * Consumers that only need the verification status should use `useComplianceStatus`
 * (which derives it from this same query).
 * Pass `{ enabled: false }` on public pages so signed-out visitors don't trigger a 401 → login redirect.
 */
export function useKyc({ enabled = true }: { enabled?: boolean } = {}) {
  const { data, isLoading, error, refetch } = useQuery<Partial<KYCData>, Error>({
    queryKey: KYC_QUERY_KEY,
    enabled,
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/kyc/merchant/status");
        return (response.data.data ?? {}) as KYCData;
      } catch (error) {
        console.log("Error fetching compliance status:", error);
        return {};
      }
    },
  });

  return {
    kyc: data,
    isLoading,
    error,
    refetch,
    status: (data?.status as ComplianceStatus) ?? "UNVERIFIED",
  };
}

export interface NgnBank {
  bankCode: string;
  bankName: string;
}

/** Nigerian banks from LedgerBlock (`GET /kyc/banks/ngn`), sorted by name. Use with `useResolveKycBankAccount`. */
export function useNgnBanks() {
  const { data, isLoading } = useQuery<NgnBank[]>({
    queryKey: ["kyc-banks-ngn"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/kyc/banks/ngn");
        return ((response.data.data ?? []) as NgnBank[])
          .map((bank) => ({ bankCode: String(bank.bankCode), bankName: String(bank.bankName ?? "").trim() }))
          .filter((bank) => bank.bankCode && bank.bankName)
          .sort((a, b) => a.bankName.localeCompare(b.bankName));
      } catch (error) {
        console.log("Error fetching banks:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 60, // the bank list barely changes
  });

  return { banks: data ?? [], isLoading };
}

/** Pulls the account holder's name out of a resolve response, whichever casing the provider uses. */
export function accountNameFrom(data: unknown): string {
  const body = (data ?? {}) as Record<string, unknown>;
  const name = body.accountName ?? body.account_name ?? body.name;
  return typeof name === "string" ? name.trim() : "";
}

/**
 * Name enquiry for a payout account (`POST /kyc/bank-account/resolve`). Gated until a bank and a
 * full 10-digit account number are supplied; `accountName` is empty when the account can't be found.
 */
export function useResolveKycBankAccount({ bankCode, accountNumber }: { bankCode?: string; accountNumber?: string }) {
  const enabled = !!bankCode && /^\d{10}$/.test(accountNumber ?? "");
  const { data, isLoading, error } = useQuery<string>({
    queryKey: ["kyc-resolve-bank-account", bankCode, accountNumber],
    enabled,
    retry: false,
    queryFn: async () => {
      const response = await api.post(SERVER_URL + "/kyc/bank-account/resolve", { bankCode, accountNumber });
      return accountNameFrom(response.data.data);
    },
  });

  return {
    accountName: data ?? "",
    isResolving: enabled && isLoading,
    error: enabled && error ? handleAxiosError(error as AxiosError) : null,
  };
}

/** Shared by all three business types. */
interface KycSubmissionBase {
  country?: string;
  websiteUrl?: string;
  socialUrl?: string;
  redirectUrl?: string;
  /** File key from `POST /kyc/upload/merchant`. */
  proofOfAddress: string;
}

export interface UnregisteredKycPayload extends KycSubmissionBase {
  nin: string;
  bvn: string;
  governmentId: string;
  personalBank: KycBankDetails;
}

export interface LimitedKycPayload extends KycSubmissionBase {
  companyName: string;
  corporateBank: KycBankDetails;
  certificateOfIncorporation: string;
  memorandumArticles: string;
  cacForm7: string;
  /** Send CAC Form 2 or CAC 1.1, not both. */
  cacForm2?: string;
  cacForm11?: string;
  directors: { fullName: string; nin: string; bvn: string; idDocument: string }[];
  requiresScuml: boolean;
  scumlCertificate?: string;
  requiresOperatingLicense: boolean;
  operatingLicense?: string;
}

export interface SoleProprietorKycPayload extends KycSubmissionBase {
  companyName: string;
  corporateBank: KycBankDetails;
  certificateOfIncorporation: string;
  statusReport: string;
  proprietorFullName: string;
  proprietorNin: string;
  proprietorBvn: string;
  proprietorId: string;
}

export type KycSubmission =
  | { type: "UNREGISTERED"; payload: UnregisteredKycPayload }
  | { type: "LIMITED"; payload: LimitedKycPayload }
  | { type: "SOLE_PROPRIETOR"; payload: SoleProprietorKycPayload };

const SUBMIT_ROUTE: Record<BusinessType, string> = {
  UNREGISTERED: "/kyc/merchant/unregistered",
  LIMITED: "/kyc/merchant/registered/limited",
  SOLE_PROPRIETOR: "/kyc/merchant/registered/sole-proprietor",
};

/**
 * Submits merchant KYC to the route for its business type. Resolves to the saved record and the
 * LedgerBlock `verificationUrl` (when the merchant has an identity check to finish). Errors are
 * rethrown with the API's message.
 */
export function useSubmitMerchantKyc() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ type, payload }: KycSubmission) => {
      try {
        const response = await api.post(SERVER_URL + SUBMIT_ROUTE[type], payload);
        const data = response.data.data ?? {};
        return {
          kyc: (data.merchantKyc ?? null) as KYCData | null,
          verificationUrl: (data.verificationUrl ?? data.merchantKyc?.verificationUrl ?? null) as string | null,
        };
      } catch (error) {
        const message = handleAxiosError(error as AxiosError);
        // SpinStrip's own LedgerBlock balance, not something the merchant can fix.
        throw new Error(
          /billing wallet/i.test(message)
            ? "Verification is temporarily unavailable on our side. Your details are fine, so please try again later."
            : message,
        );
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KYC_QUERY_KEY }),
  });

  return { submitKyc: mutation.mutateAsync, isSubmitting: mutation.isPending };
}
