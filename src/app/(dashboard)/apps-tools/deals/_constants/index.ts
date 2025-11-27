import { Deal } from "../_schemas";

export const DEFAULT_DEALS_VALUES: Partial<Deal> = {
  campaignId: "",
  name: "",
  description: "",
  discountPercentage: undefined,
  maximumThreshold: undefined,
  startDate: "",
  endDate: "",
  productIds: [],
  isFeatured: false,
  status: "ACTIVE",
};
