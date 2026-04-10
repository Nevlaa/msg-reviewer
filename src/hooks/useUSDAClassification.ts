// useUSDAClassification.ts
import { useMemo } from 'react';

/**
 * SNAP Level 2 Multi-Ingredient Brand Lookup
 * Standard SOP guidance dictating if cross-brand items are assigned by 1st or 2nd ingredient.
 */
const BRAND_LOOKUP: Record<string, { category: string, rule: string }> = {
  "campbell's": { category: "Meats, Poultry, Fish", rule: "Classify by 2nd ingredient if 1st is water/broth" },
  "marie callender's": { category: "Meats, Poultry, Fish", rule: "Classify by primary meat content in pot pies" },
  "progresso": { category: "Meats, Poultry, Fish", rule: "Classify by 2nd ingredient if 1st is water/broth" },
  "chef boyardee": { category: "Breads, Grains, Cereals", rule: "Pasta is the predominant staple ingredient" },
  "stouffer's": { category: "Breads, Grains, Cereals", rule: "Requires manual check, default to pasta/grain if lasagna" }
};

export const useUSDAClassification = () => {
  const getClassification = useMemo(() => {
    return (brandName: string) => {
      const normalizedName = brandName.toLowerCase().trim();
      return BRAND_LOOKUP[normalizedName] || { 
        category: "Unknown", 
        rule: "Classify by 1st ingredient as per standard SOP." 
      };
    };
  }, []);

  return { getClassification };
};
