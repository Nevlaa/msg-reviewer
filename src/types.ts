export type UnitOfSale = "Units" | "LBs" | "Both";

export interface FoodItem {
  variety: string;          // e.g., "Cheese", "Chicken", "Tortillas"
  count: number;            // Cap at 20 per SOP
  unit_of_sale: UnitOfSale; // How the item is priced/sold
  is_ffr: boolean;          // True if AT LEAST ONE unit is Fresh, Frozen, or Refrigerated
}

export interface FoodInventory {
  dairy_and_substitutes: FoodItem[]; // Max 10 items
  meats_poultry_fish: FoodItem[];    // Max 10 items
  breads_grains_cereals: FoodItem[]; // Max 10 items
  fruits_and_vegetables: FoodItem[]; // Max 14 items
}

export interface SNAPScanReport {
  food_inventory: FoodInventory;
  metadata: {
    exceeds_dairy_limit: boolean;    // True if AI detected > 10 varieties
    exceeds_meat_limit: boolean;     // True if AI detected > 10 varieties
    exceeds_bread_limit: boolean;    // True if AI detected > 10 varieties
    exceeds_produce_limit: boolean;  // True if AI detected > 14 varieties
  };
}
