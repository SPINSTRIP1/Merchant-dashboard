import { InventoryProduct } from "../_schemas";

export const addInventorySteps: string[] = [
  "General Info",
  "Pricing",
  "Stock Management",
  "Visibility",
];

export const DEFAULT_INVENTORY_VALUES: Partial<InventoryProduct> = {
  name: "",
  description: "",
  categoryId: "",
  tags: [],
  brand: "",
  productType: "DEFINITE",
  sellingPrice: 0,
  costPrice: 0,
  taxPercentage: 0,
  quantity: 0,
  maxStockLevel: 200,
  // minStockLevelPercentage: 10,
  status: "ACTIVE",
  showInMenu: true,
  isFeatured: false,
  variant: {
    color: "",
    size: "",
    dimensions: "",
    shape: "",
    form: "",
  },
  dealIds: [],
};
