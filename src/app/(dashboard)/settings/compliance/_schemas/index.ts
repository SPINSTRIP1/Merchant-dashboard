import { z } from "zod";

// File key validation schema (for uploaded files)
const fileKeySchema = z.string().optional();

// Step 1: Survey Schema
export const surveySchema = z.object({
  businessCategory: z.string().min(1, "Business category is required"),
  customerBase: z.string().min(1, "Customer base is required"),
  businessModel: z.string().min(1, "Business model is required"),
  monthlyProcessingAmount: z
    .string()
    .min(1, "Monthly processing amount is required"),
});

// Step 2: Business Information Schema
export const businessInfoSchema = z.object({
  businessSubCategory: z.string().min(1, "Business sub-category is required"),
  businessDescription: z
    .string()
    .min(10, "Business description must be at least 10 characters"),
  countryOfIncorporation: z
    .string()
    .min(1, "Country of incorporation is required"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyWebsite: z
    .string()
    .url("Please enter a valid website URL")
    .or(z.literal(""))
    .optional(),
  registrationNumber: z.string().min(1, "Registration number is required"),
  logo: fileKeySchema,
});

// Step 3: Company Documents Schema
export const companyDocumentsSchema = z.object({
  certificateOfIncorporation: z
    .string()
    .min(1, "Certificate of Incorporation is required")
    .optional(),
  articlesOfAssociation: z
    .string()
    .min(1, "Articles of Association is required"),
  proofOfAddress: z.string().min(1, "Proof of Address is required"),
  bankStatement: z.string().min(1, "Bank Statement is required"),
});

// Step 4: UBO Schema
export const uboSchema = z.array(
  z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 characters"),
    identityMetadata: z.object({
      bvn: z
        .string()
        .min(11, "BVN must be 11 digits")
        .max(11, "BVN must be 11 digits"),
      nin: z
        .string()
        .min(11, "NIN must be 11 digits")
        .max(11, "NIN must be 11 digits"),
    }),
    bankStatement: z.string().min(1, "UBO Bank Statement is required"),
  })
);

// Complete form schema (union of all steps)
export const completeKycSchema = surveySchema
  .merge(businessInfoSchema)
  .merge(companyDocumentsSchema)
  .extend({
    ubos: uboSchema,
    redirectUrl: z.string().optional(),
  });

// Type inference
export type SurveyFormData = z.infer<typeof surveySchema>;
export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;
export type CompanyDocumentsFormData = z.infer<typeof companyDocumentsSchema>;
export type UboFormData = z.infer<typeof uboSchema>;
export type CompleteKycFormData = z.infer<typeof completeKycSchema>;

// Export individual step schemas with the expected names
export const companyInformationSchema = surveySchema;
export const businessOperationsSchema = businessInfoSchema;
// companyDocumentsSchema is already exported above
export const uboInformationSchema = uboSchema;
