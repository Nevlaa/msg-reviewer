# Systematic Image Scanning & Processing Logic

This document outlines the systematic rules and processing steps for the AI Reviewer to follow when scanning store images for SNAP compliance.

## Step 1: Multimodal Visual Scanning & OCR
The process begins with high-resolution visual analysis. You must utilize Optical Character Recognition (OCR) to extract text from product labels while simultaneously using image recognition to identify packaging shapes, colors, and branding.

*   **Rule 1 (Brand Identification):** Identify dominant brands (e.g., Maseca, El Mexicano, Chata) to establish the cultural and product context of the store.
*   **Rule 2 (Product Verification):** Cross-reference identified text against a known database of food items to confirm the specific variety (e.g., distinguishing between "Masa" and "Wheat Flour").

## Step 2: Logic-Based Categorization (The Master List)
Once items are identified, they must be mapped to the four USDA Staple Food Categories. The app must strictly follow the "SNAP Food Inventory Master List" provided in the prompt.

*   **Logic for Breads/Grains:** Assign items like Corn Tortillas and Jasmine Rice here.
*   **Logic for Meats/Poultry/Fish:** Assign frozen shrimp and shelf-stable pork (Chilorio/Cochinita) here.
*   **Logic for Dairy:** Assign cheeses (Panela, Ranchero) and yogurt drinks here.
*   **Logic for Fruits/Vegetables:** Assign beans, jalapeños, and fresh garlic here.

## Step 3: FFR Determination (Fresh, Frozen, Refrigerated)
The "perishable" status is critical for SNAP compliance. The logic for determining FFR status is based on the visual context of the item within the store:

*   **Frozen (F):** Items located within glass-door freezers or chest freezers (e.g., Golden Sea Shrimp, Fruit Paletas).
*   **Refrigerated (R):** Items located in open or closed cooling units (e.g., Panela and Ranchero cheeses, Yogurt drinks).
*   **Fresh (F):** Unprocessed produce, typically found in bins or displays (e.g., Fresh Garlic).
*   **Shelf-Stable:** Items found on standard ambient-temperature shelving (e.g., Maseca, canned beans, Mahatma rice).

## Step 4: Strict Exclusion Rules
To maintain accuracy for USDA reporting, the logic must apply these "Punting" and exclusion filters:

*   **Rule 3 (Accessory Foods):** Items like Takis, chips, candy, and sweet breads (Bimbo/Marinela) are recorded as "Accessory" and do not count toward the 3-variety staple minimum.
*   **Rule 4 (Condiments/Seasonings):** Ketchup, mustard, and hot sauces (Tapatio) are excluded from the staple inventory counts.
*   **Rule 5 (Non-Food):** Cleaning supplies, charcoal, and paper products must be flagged as ineligible.

## Step 5: Unit Depth Counting
The reviewer must visually estimate the "depth of stock."

*   **Rule 6 (The "3x3" Rule):** For SNAP authorization, a store must have at least 3 varieties per category and at least 3 units of each variety.
*   **Counting Method:** Scan the width and depth of the shelf to estimate total units. If more than 20 units are visible, use "20+" to denote significant stock.

## Step 6: Documentation & Validation
The final report must link the inventory data back to the FNS number and the consent form to ensure the review is legally valid.

*   **Validation:** Match the store name and FNS number (e.g., Hacienda Market, FNS# 0764592) from the signed Consent Form to the store's physical signage.
