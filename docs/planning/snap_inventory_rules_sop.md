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

## 6. Variety Aggregation (The "Consolidation" Rule)
To prevent "Variety Hallucinations," flavors and fat-content variations must be consolidated:
- **Milk (Dairy)**: Whole, 2%, Skim, Chocolate, Strawberry, and Dairy-based Protein Shakes = **1 Variety** (Milk - Dairy).
- **Yogurt**: Strawberry, Blueberry, Plain, Greek = **1 Variety** (Yogurt).
- **Bread**: White, Wheat, Honey Wheat, Sliced, Loaf = **1 Variety** (Bread).
- **Rule**: If the only difference is flavor or fat percentage, it is **NOT** a new variety.
- **Exceptions**: Plant-based milks (Almond vs. Soy vs. Oat) **ARE** distinct varieties from each other and from Dairy Milk.

## 7. AI Counting Strategy
1. **Pass 1 (Perimeter)**: Scan coolers and freezers (FFR) first.
2. **Pass 2 (Center Aisle)**: Fill gaps using shelf-stable foods (Canned, Grains).
3. **Variety Verification**: Ensure 3 distinct brands/types per category if possible.
4. **Volume Check**: Use "10+" for stacked rows; cap at 20.

## 8. Acceptable Staple Food Varieties Reference
Variety is generally defined by the product kind or main ingredient.

### 1. Vegetables or Fruits
Variety is generally defined by the product kind or main ingredient.
*   **Potatoes** (e.g., fresh potatoes, frozen tater tots)
*   **Oranges** (e.g., 100% orange juice, fresh oranges)
*   **Tomatoes** (e.g., canned tomato soup, sun-dried tomatoes)
*   **Apples** (e.g., dried apples, pre-cut apple go-packs)
*   **Pumpkin** (e.g., canned pumpkin, fresh whole pumpkin)
*   **Bananas** (e.g., fresh bananas, frozen bananas)
*   **Lettuce** (e.g., fresh head of iceberg, bagged romaine)
*   **Pineapples** (e.g., canned pineapple rings, fresh whole pineapple)

### 2. Meat, Poultry, or Fish
The first ingredient determines the variety for multiple-ingredient products.
*   **Turkey** (e.g., deli-sliced, ground turkey)
*   **Chicken** (e.g., fresh cutlets, frozen nuggets)
*   **Beef** (e.g., ground beef, beef jerky)
*   **Tuna** (e.g., fresh steak, canned tuna)
*   **Catfish** (e.g., frozen filets, smoked packaged catfish)
*   **Lamb/Mutton** (e.g., fresh chops, ground lamb)
*   **Pork** (e.g., loin, fresh sliced ham)
*   **Chicken Eggs** (e.g., fresh eggs, liquid egg whites)

### 3. Dairy Products
Includes plant-based alternatives and infant formula as specific varieties.
*   **Cheese** (e.g., cheddar slices, grated parmesan)
*   **Milk** (e.g., skim, whole milk)
*   **Almond-based milk** (e.g., refrigerated or shelf-stable)
*   **Butter** (e.g., salted or frozen sweet cream)
*   **Butter substitute** (e.g., margarine, non-dairy spread)
*   **Sour cream** (e.g., lite, organic)
*   **Yogurt** (e.g., French vanilla, nonfat peach)
*   **Infant formula** (e.g., liquid ready-to-feed, powdered milk formula)
*   **Soy infant formula** (e.g., liquid or powdered soy formula)

### 4. Breads or Cereals
*   **Bread** (e.g., rye, multigrain)
*   **Pasta** (e.g., gluten-free spaghetti, whole wheat rotini)
*   **Tortillas** (e.g., corn, flour)
*   **Bagels** (e.g., poppy seed, plain)
*   **Pitas** (e.g., low-carb, whole wheat)
*   **Cold breakfast cereal** (e.g., rice-based, oat-based)
*   **Buns/rolls** (e.g., frozen dinner rolls, hot dog buns)
*   **Infant cereal** (e.g., wheat-based, oat-based)
*   **Rice** (e.g., bagged rice, rice-based frozen meals)
