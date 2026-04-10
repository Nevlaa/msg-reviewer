Here is the specific JSON schema and data structure for the Food Inventory counts, designed directly from the USDA Food Inventory printable and SOP requirements.Because you are building this in React, I have provided both the JSON Schema (for your LLM prompt) and the TypeScript Interfaces (for your frontend state management).1. The JSON Schema for the LLMYou will include this JSON structure in your system prompt to ensure the Gemini API returns the data exactly as your React frontend expects it.JSON{
  "food_inventory": {
    "dairy_and_substitutes": [
      {
        "variety": "Milk",
        "count": 12,
        "unit_of_sale": "Units",
        "is_ffr": true
      }
    ],
    "meats_poultry_fish": [
      {
        "variety": "Lunchmeat",
        "count": 5,
        "unit_of_sale": "Both",
        "is_ffr": true
      }
    ],
    "breads_grains_cereals": [
      {
        "variety": "Rice",
        "count": 20,
        "unit_of_sale": "Units",
        "is_ffr": false
      }
    ],
    "fruits_and_vegetables": [
      {
        "variety": "Tomatoes",
        "count": 8,
        "unit_of_sale": "LBs",
        "is_ffr": true
      }
    ]
  },
  "metadata": {
    "exceeds_dairy_limit": false,
    "exceeds_meat_limit": false,
    "exceeds_bread_limit": false,
    "exceeds_produce_limit": false
  }
}
2. TypeScript Interfaces (For your React App)Use these types in your React project to strongly type the data coming back from the API and map it directly to your dashboard tables.TypeScripttype UnitOfSale = "Units" | "LBs" | "Both";

interface FoodItem {
  variety: string;          // e.g., "Cheese", "Chicken", "Tortillas"
  count: number;            // Cap at 20 per SOP
  unit_of_sale: UnitOfSale; // How the item is priced/sold
  is_ffr: boolean;          // True if AT LEAST ONE unit is Fresh, Frozen, or Refrigerated
}

interface FoodInventory {
  dairy_and_substitutes: FoodItem[]; // Max 10 items
  meats_poultry_fish: FoodItem[];    // Max 10 items
  breads_grains_cereals: FoodItem[]; // Max 10 items
  fruits_and_vegetables: FoodItem[]; // Max 14 items
}

interface SNAPScanReport {
  food_inventory: FoodInventory;
  metadata: {
    exceeds_dairy_limit: boolean;    // True if AI detected > 10 varieties
    exceeds_meat_limit: boolean;     // True if AI detected > 10 varieties
    exceeds_bread_limit: boolean;    // True if AI detected > 10 varieties
    exceeds_produce_limit: boolean;  // True if AI detected > 14 varieties
  };
}
3. LLM "System Instructions" SnippetTo ensure the AI categorizes the food correctly according to the strict Level 2 Reviewer rules, inject this logic block into your Gemini prompt:CRITICAL USDA INVENTORY RULES:Variety Limit Cap: Return a maximum of 10 varieties for Dairy, Meat, and Bread, and a maximum of 14 for Fruits/Vegetables. Prioritize varieties with the highest counts and FFR status.The 20-Count Ceiling: Never return a count higher than 20 for any single variety. If 50 cans of corn are detected, return 20.The Multi-Ingredient Rule: Categorize processed foods by their first ingredient. If the first ingredient is water, stock, or broth, categorize by the second ingredient.The FFR Rule: If even one unit of a variety is Fresh, Frozen, or Refrigerated, is_ffr MUST be set to true for that entire variety.Exclusions: Do NOT include accessory foods (chips, candy, soda, baked sweets) in this JSON unless they are 100% juice.

3. LLM "System Instructions" Snippet
Append this logic block to your Gemini prompt to act as the "Gatekeeper" for the specialty items:

CRITICAL HPI & BUNDLE RULES:

Highest Priced Items (HPIs): You must identify up to six (6) of the most expensive SNAP/EBT-eligible items priced at $5.00 or higher.

HPI Inclusions/Exclusions: HPIs CAN include accessory foods (e.g., energy drinks, cases of water, coffee, large bags of chips). HPIs MUST NOT include alcohol, hot foods, meat bundles, seafood specials, fruit/vegetable boxes, or infant formula.

Bundles: Identify up to four (4) of the most expensive bundles in each category (Meat, Seafood, Produce). A bundle is a group of items packaged together for a single price (e.g., "Pick 5 for $25" or a box of steaks).

Stock Count Cap: For any HPI or Bundle, if the stock exceeds 10 units, return exactly 10 for the stock_count.

Unique Price Points: Do not list the exact same product at the exact same price four times to fill the HPI list. Look for variety in the highest-priced items.