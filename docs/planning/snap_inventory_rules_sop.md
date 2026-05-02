# SNAP QC Validator: Official Food Inventory & Counting Rules (SOP)

This document serves as the ground-truth logic for the AI Auditor when performing inventory sweeps and variety counting.

## 1. Core Inventory Principles
- **Inventory (FI)** = Documenting staple food varieties + unit counts (depth of stock).
- **Breadth (Variety)**: Count each meaningfully different variety (e.g., Different flavors/types).
- **Depth (Units)**: Count total units available on shelves/coolers.
- **The "20 Cap"**: Never return a count higher than **20** for any single variety.
- **Priority**:
    1. FFR (Fresh, Frozen, Refrigerated) items first.
    2. Most abundant items.
    3. Items with ≥3 units.

## 2. Threshold Rules
### Small / Regular Stores (3x3 Rule)
- **Minimum**: 3 varieties in each of the 4 staple groups.
- **Units**: Each variety must have at least **3 units**.
- **Total**: Minimum 12 staple varieties required.

### Large Stores (10/10/10/14 Rule)
- **Dairy**: 10 varieties.
- **Bread/Grains**: 10 varieties.
- **Meat/Poultry/Fish**: 10 varieties.
- **Fruits & Vegetables**: 14 varieties.
- **Logic**: Stop counting once thresholds are met.

## 3. Staple Food Categories & Examples
### 🥛 Dairy
- Milk (Whole, Skim, Almond, Soy, Oat).
- Cheese (Blocks, Shredded, Slices).
- Yogurt, Sour Cream, Ghee.
- Infant Formula (Dairy/Soy/Other).
- Powdered Milk, Margarine, Dairy Nutrition Bars.

### 🍞 Bread / Cereal / Grains
- Bread (Loaf, Wheat, White), Rolls, Buns, Tortillas.
- Rice, Pasta, Ramen, Rice Noodles.
- Flour, Cornmeal, Baking Mix (Cornbread/Wheat).
- Cold Cereals (Cheerios, Frosted Flakes, etc.), Hot Cereals (Oatmeal, Grits).
- Granola / Cereal Bars.

### 🥩 Meat / Poultry / Fish
- Fresh/Frozen Beef, Pork, Chicken, Turkey, Lamb, etc.
- **Eggs** (Chicken, Duck, Quail).
- Canned Meats: Tuna, Chicken, SPAM, Vienna Sausages.
- **Jerky** / Meat Sticks.
- Frozen burgers, chili, meat meals (if SNAP-eligible).

### 🍎 Fruits & Vegetables
- Fresh/Frozen/Canned Fruit (Apples, Bananas, Berries, etc.).
- Fresh/Frozen/Canned Vegetables (Lettuce, Tomatoes, Potatoes, Corn, etc.).
- Dried Fruit, Beans, Nuts, Seeds.
- **100% Juice**.

## 4. Categorization Logic (The First Ingredient Rule)
- **Rule**: Categorize mixed foods by their **first ingredient**.
- **Soup Examples**:
    - Chicken Noodle Soup → **Meat** category.
    - Tomato Soup → **Vegetable** category.
    - Cream of Chicken → **NOT staple** (Fat/Oil based).
- **Prepared/Frozen Foods**: Count if not hot at sale and requires preparation.

## 5. Exclusions (DO NOT COUNT)
- **Accessory Foods**: Chips, Candy, Soda.
- **Prohibited**: Alcohol, Tobacco, Hot Prepared Foods (Ready-to-eat).
- **Non-Food**: Cleaning supplies, Paper goods.

## 6. AI Counting Strategy
1. **Pass 1 (Perimeter)**: Scan coolers and freezers (FFR) first.
2. **Pass 2 (Center Aisle)**: Fill gaps using shelf-stable foods (Canned, Grains).
3. **Variety Verification**: Ensure 3 distinct brands/types per category if possible.
4. **Volume Check**: Use "10+" for stacked rows; cap at 20.
