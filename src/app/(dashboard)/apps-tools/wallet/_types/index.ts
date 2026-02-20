export interface UBO {
  id: string;
  address: string;
  email: string;
  fullName: string;
  identityMetadata: {
    bvn: string;
    nin: string;
  };
}

export interface KYCData {
  adminNotes: string | null;
  articlesOfAssociationUrl: string;
  bankStatementUrl: string;
  businessCategory: string;
  businessDescription: string;
  businessModel: string;
  businessSubCategory: string;
  certificateOfIncorporationUrl: string;
  companyName: string;
  companyWebsite: string;
  countryOfIncorporation: string;
  createdAt: string;
  customerBase: string;
  expiryDate: string | null;
  id: string;
  logoUrl: string;
  monthlyProcessingAmount: string;
  proofOfAddressUrl: string;
  registrationNumber: string;
  status: string;
  ubos: UBO[];
  updatedAt: string;
  userId: string;
}
