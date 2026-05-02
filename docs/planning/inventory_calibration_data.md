# SNAP Inventory: Reference Counting Methodology & Examples

This document provides **reference examples** from successful surveys to illustrate the required granularity for "Senior Level 3" inventory counting. These examples should be used to calibrate the AI Vision Pipeline's counting logic and "Reviewer Accuracy" validation (+/- 2 unit variance).

## Methodology Summary: How to Count
1. **By Weight (LB):** For fresh meats/produce sold loose (e.g., Bistec, Onions).
2. **By Pack/Container:** For multi-unit items sold as a single SKU (e.g., 20pc Tortillas, 12ct Eggs).
3. **By Variety:** For items where breadth is more important than depth (e.g., different types of Swai fillets).
4. **By Units:** For individual cans or bottles (e.g., Maruchan Cups, Jars).

## 1. Breads, Grains, or Cereals
| Variety | Item Identified | Count | Source |
| :--- | :--- | :--- | :--- |
| Tortillas (Corn) | Tostada Raspada Jumbo (20pc packs) | 3 Packs | |
| Tortillas (Flour) | Big Tortilla | 1 Pack | |
| Baking Mix | Tamale/Maseca Flour Mixes | 2 Bags | |
| Oats | Quaker Oats | 1 Container | |
| Rice | Bulk Rice Bags | 1 Bag | |
| Pasta/Ramen | Maruchan Instant Lunch (Shrimp/Pork) | 4 Cups | |
| Flatbread | Baleadas (Menu item) | 1 Variety | |
| Sopes | Prepared Sopes (Multi-packs) | 2 Packs | |
| Huaraches | Prepared Huaraches (8ct packs) | 2 Packs | |
| Empanada Dough | Goya Empanada Dough Discos | 2 Packs | |

## 2. Meats, Poultry, & Fish
> [!NOTE]
> Most fresh meats are sold by weight (lb) as indicated on the butcher signage.

| Variety | Item Identified | Count/Availability | Source |
| :--- | :--- | :--- | :--- |
| Beef | Milanesa / Bistec / Espaldilla | Available by lb | |
| Pork | Buche de Puerco / Pata de Puerco | Available by lb | |
| Chicken | Pechuga Preparada (Prepared Breast) | Available by lb | |
| Goat | Chivo | Available by lb | |
| Shrimp | Frozen Vannamei Shrimp / Cooked Shrimp | 2 Bags | |
| Octopus | Pulpo | Available by lb | |
| Crab | Imitation Crab Flakes | 1 Bag | |
| Squid | Giant Calmar (Squid) | 1 Bag | |
| Fish | Swai (Fish fillets) | 1 Variety | |
| Eggs | Chicken Eggs (Large Grade AA, 12ct) | 4 Cartons | |

## 3. Dairy / Dairy Substitute Products
| Variety | Item Identified | Count | Source |
| :--- | :--- | :--- | :--- |
| Cheese (Aged) | Queso Cotija | 2 Blocks | |
| Cheese (Fresh) | Queso Fresco | 2 Blocks | |
| Cheese (Regional) | Queso Ranchero | 2 Blocks | |
| Cheese (Soft) | Requeson | 2 Containers | |
| Sour Cream | Crema con sal (Cream with salt) | 2 Containers | |
| Cream (Unsalted) | Crema sin sal (Cream without salt) | 2 Containers | |
| Cream (Regional) | Crema Paxaquena | 2 Containers | |
| Yogurt Drink | FUD Yogurt Drink (Strawberry/Banana) | 2 Bottles | |
| Milk | Pre-Skimmed Milk Cheese (Milk source) | 1 Variety | |
| Margarine | Mazola (Vegetable-based) | 1 Container | |

## 4. Fruit / Vegetable
| Variety | Item Identified | Count/Availability | Source |
| :--- | :--- | :--- | :--- |
| Mango | Mango Fruit Bars/Beverages | 1 Variety | |
| Strawberry | Fresa (Beverages/Yogurt) | 1 Variety | |
| Banana | Banana (Yogurt flavor) | 1 Variety | |
| Watermelon | Watermelon (Aguas Frescas) | 1 Variety | |
| Tamarind | Tamarind (Beverages) | 1 Variety | |
| Orange | Naranja (Beverages) | 1 Variety | |
| Tomatillos | Canned/Jarred Tomatillos | 2 Jars | |
| Peppers | Jalapeños (Canned/Fresh) | 4 Jars | |
| Garlic | Bulk Garlic / Garlic Pouches | 1 Variety | |
| Beans | Black Beans / Pinto Beans (Canned/Bulk) | 4+ Cans | |
| Corn | White/Purple Hominy | 2+ Cans | |
| Cactus/Flower | Loroco (Bags) | 2 Bags | |
| Plantains | Tajadas (Fried Plantains) | 1 Variety | |
| Onions | Chopped Onions (Ceviche ingredient) | 1 Variety | |
