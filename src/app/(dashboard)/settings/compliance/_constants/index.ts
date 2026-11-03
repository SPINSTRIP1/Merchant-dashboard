import type { BusinessType } from "@/hooks/use-kyc";

/** The three KYC routes, with what each one asks for (ITEX merchant onboarding requirements). */
export const BUSINESS_TYPES: {
  value: BusinessType;
  title: string;
  description: string;
  needs: string[];
}[] = [
  {
    value: "UNREGISTERED",
    title: "Individual / unregistered business",
    description: "You trade in your own name and haven't registered with CAC.",
    needs: [
      "Government ID (passport, driver's licence or NIN slip)",
      "NIN and BVN",
      "Proof of business or home address",
      "Personal bank account",
      "Website or social media page",
    ],
  },
  {
    value: "SOLE_PROPRIETOR",
    title: "Registered business name",
    description: "A sole proprietorship registered with CAC as a business name (BN).",
    needs: [
      "Certificate of registration and status report",
      "Proprietor's ID, NIN and BVN",
      "Proof of business address",
      "Bank account in the business name",
      "Website or social media page",
    ],
  },
  {
    value: "LIMITED",
    title: "Limited company",
    description: "Registered with CAC as a limited company (Ltd / RC number).",
    needs: [
      "Certificate of incorporation",
      "Memorandum & Articles of Association",
      "CAC Form 7, plus CAC Form 2 or CAC 1.1",
      "Every director's ID, NIN and BVN",
      "Proof of business address",
      "Corporate bank account",
      "Website, plus SCUML certificate or operating licence if they apply",
    ],
  },
];

export const STEPS = ["Business type", "Details", "Documents", "Payout account", "Review"];

/** `POST /kyc/upload/merchant` accepts directorId1…directorId3. */
export const MAX_DIRECTORS = 3;

export const DOCUMENT_FORMATS = ["PDF", "JPG", "JPEG", "PNG"];
