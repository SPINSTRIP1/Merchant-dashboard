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
  maxStockLevel: 100,
  minStockLevelPercentage: 10,
  status: "DRAFT",
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
