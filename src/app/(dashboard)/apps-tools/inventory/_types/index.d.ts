export interface InventoryStatsResponse {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  recentlyUpdated: number;
  totalItems: number;
}
