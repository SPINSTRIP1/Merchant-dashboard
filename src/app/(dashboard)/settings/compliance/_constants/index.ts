import { countries } from "@/data/countries";
import { CompleteKycFormData } from "../_schemas";

export const DEFAULT_COMPLIANCE_VALUES: CompleteKycFormData = {
  businessCategory: "",
  customerBase: "",
  businessModel: "",
  monthlyProcessingAmount: "",
  businessSubCategory: "",
  businessDescription: "",
  countryOfIncorporation: countries[0].name,
  companyName: "",
  companyWebsite: "",
  registrationNumber: "",
  logo: "",
  certificateOfIncorporation: "",
  articlesOfAssociation: "",
  proofOfAddress: "",
  bankStatement: "",
  ubos: [
    {
      fullName: "",
      email: "",
      address: "",
      phoneNumber: "",
      identityMetadata: {
        bvn: "",
        nin: "",
      },
      bankStatement: "",
    },
  ],
  redirectUrl: "https://spinstrip.com",
};

export const steps = [
  "Survey",
  "About Business",
  "Upload Company Documents",
  "Ultimate Beneficial Owner (UBO)",
];
