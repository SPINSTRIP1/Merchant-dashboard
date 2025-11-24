export interface InventoryStatsResponse {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  recentlyUpdated: number;
  totalItems: number;
}

export type ProductType = "DEFINITE" | "INDEFINITE";
export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type CycleType = "DAILY" | "WEEKLY" | "MONTHLY";
export type DayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface ProductVariant {
  color?: string;
  size?: string;
  dimensions?: string;
  shape?: string;
  form?: string;
}

export interface SlotConfig {
  slotCapacityPerCycle: number;
  cycleType: CycleType;
  cycleStartTime: string;
  excludedDays?: DayOfWeek[];
  excludedDates?: string[];
}

export interface InventoryProduct {
  catalogId: string;
  categoryId: string;
  name: string;
  description: string;
  tags: string[];
  sellingPrice: number;
  costPrice: number;
  taxPercentage: number;
  productType: ProductType;
  status: ProductStatus;
  showInMenu: boolean;
  isFeatured: boolean;
  brand?: string;
  variant?: ProductVariant;
  slotConfig?: SlotConfig;
  quantity: number;
  maxStockLevel: number;
  minStockLevelPercentage: number;
  dealIds?: string[];
}
