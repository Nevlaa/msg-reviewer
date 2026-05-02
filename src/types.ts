export type UnitOfSale = "Units" | "LBs" | "Both";
export type ValidationStatus = "Pending" | "Pass" | "Fail" | "Corrected";
export type UserRole = "Reviewer" | "QC";

export interface FoodItem {
  id: string;
  variety: string;          // e.g., "Cheese", "Chicken", "Tortillas"
  count: number;            // Cap at 20 per SOP
  unit_of_sale: UnitOfSale; // How the item is priced/sold
  is_ffr: boolean;          // True if AT LEAST ONE unit is Fresh, Frozen, or Refrigerated
  photo_ids?: string[];     // Link to specific photos as evidence
}

export interface FoodInventory {
  dairy_and_substitutes: FoodItem[]; // Max 10 items
  meats_poultry_fish: FoodItem[];    // Max 10 items
  breads_grains_cereals: FoodItem[]; // Max 10 items
  fruits_and_vegetables: FoodItem[]; // Max 14 items
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: ValidationStatus;
  comment?: string;
  guideline?: string;
}

export interface QCAuditResult {
  critical_requirements: ChecklistItem[];
  food_inventory_status: ValidationStatus;
  comments_status: ValidationStatus;
  corrections_applied: {
    consent_form: boolean;
    electronic_sketch: boolean;
  };
  overall_score: number;
}

export type ImageCategory = "Exterior" | "Overview" | "Checkout" | "Dairy" | "Meat" | "Produce" | "Bread" | "Other";

export interface ImageClassification {
  photo_id: string;
  category: ImageCategory;
  confidence: number;
  confirmed: boolean;
}

export interface SNAPScanReport {
  id: string;
  store_name: string;
  visit_date: string;
  reviewer_id: string;
  food_inventory: FoodInventory;
  reviewer_comments: string;
  survey_answers: Record<string, string>;
  photos: { id: string; url: string; category: string; classification?: ImageClassification }[];
  metadata: {
    confidence_score: number;
    audit_integrity: 'High' | 'Medium' | 'Low';
    exceeds_dairy_limit?: boolean;
    exceeds_meat_limit?: boolean;
    exceeds_bread_limit?: boolean;
    exceeds_produce_limit?: boolean;
  };
  audit_result?: QCAuditResult;
}
