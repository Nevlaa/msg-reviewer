import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * VisionService - Next-Gen Performance Version 2.5.0
 * Using gemini-2.5-flash-lite for ultra-rapid high-volume audits.
 */
export class VisionService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  public isLocked: boolean = false;

  constructor(apiKey: string) {
    console.log("🚀 INITIALIZING NEXT-GEN ENGINE: gemini-2.5-flash-lite");
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        temperature: 0.1
      }
    });
  }

  /**
   * Batch 1: Critical Compliance Audit
   */
  async analyzeCriticalEvidence(images: { 
    consent?: any, sketch?: any, exterior?: any, overviews?: any[], checkouts?: any[] 
  }, context: any): Promise<any> {
    const prompt = `
      Perform a Phase 1 Critical Compliance Audit.
      EXPECTED FNS: ${context.expected_fns}
      EXPECTED STORE: ${context.expected_store}
      
      DOCUMENTS: Verify Consent Form signature and Sketch landmarks (Entrance, Checkouts, HPI Stars).
      ARCHITECTURE: Compare Exterior photo against Street View reference.
      LAYOUT: Confirm Overviews and Checkouts provide clear coverage of the store.
      QUALITY: Flag if any critical photos are "Wrong size", Blurry, or Poorly framed.
      
      Return JSON:
      {
        "consent": { "all_six_filled": boolean, "signature_present": boolean, "source_photo": "string" },
        "sketch": { "hpi_stars_found": boolean, "entrance_labeled": boolean, "checkouts_x": boolean, "source_photo": "string" },
        "exterior": { "architectural_match": "High" | "Medium" | "Low", "confidence": 0.0-1.0, "source_photo": "string" },
        "layout": { "overviews_found": boolean, "checkouts_found": boolean, "source_photos": ["string"] },
        "quality": { "wrong_size": boolean, "blurry": boolean, "status": "Good" | "Poor", "source_photo": "string" }
      }
    `;

    const parts = [prompt];
    if (images.consent) parts.push(images.consent);
    if (images.sketch) parts.push(images.sketch);
    if (images.exterior) parts.push(images.exterior);
    if (images.overviews) parts.push(...images.overviews);
    if (images.checkouts) parts.push(...images.checkouts);

    try {
      const result = await this.model.generateContent(parts);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (err) {
      console.error("Critical Evidence Analysis Failed:", err);
      return null;
    }
  }

  /**
   * Batch 2: High-Variety Accumulator
   */
  async analyzeInventory(imageParts: any[], expectedCategories: any[]): Promise<any> {
    const prompt = `You are a SENIOR LEVEL 3 QC AUDITOR performing a USDA SNAP 3x3 VARIETY COUNT audit.

    STEP 1: INVENTORY & UNIT COUNTING (CRITICAL)
    - Survey list to verify: ${expectedCategories.join(", ")}.
    - For EVERY distinct food variety visible, count units on shelves.
    - If stacked or in rows, assume depth — use "10+" if more than 10.
    - DISTINCT VARIETY RULE: Whole Milk vs 2% Milk = 2 varieties. White Bread vs Wheat Bread = 2 varieties.
    - Slim Jim, Jack Link's, beef sticks = JERKY = counts as Meat/Poultry/Fish variety.
    - SPAM, canned chicken, Vienna sausages, canned tuna = Meat/Poultry/Fish variety.
    - Crackers (Ritz, Saltines), cookies, donuts, pastries, Little Debbie = Bread/Cereals variety.
    - For EACH item set "category" to one of: "Bread/Cereals", "Dairy", "Meat/Poultry/Fish", "Fruit/Veg".
    - Set ffr_found=true if item is inside a cooler, fridge, or freezer.
    
    STEP 2: STAPLE AREA EVIDENCE (scan ALL photos)
    - "jerky": Slim Jim, Jack Link's, beef jerky, meat sticks on any shelf or rack
    - "canned": Any canned food shelves (soup, beans, tuna, SPAM, Vienna sausages)
    - "chips": Chips, Doritos, Lays, Cheetos, Bugles, Combos, Chex Mix, snack bags
    - "milk_eggs": Milk jugs, egg cartons, cheese, yogurt in coolers or fridges
    - "juice": Juice bottles, juice boxes, Gatorade, lemonade
    - "coolers": ANY glass-door refrigerator, walk-in cooler, fridge, freezer door — beer coolers count too
    - "pastry": Bread loaves, buns, donuts, Little Debbie, muffins, pastries, cakes

    Return STRICT JSON:
    {
      "inventory": [
        { "item": "Variety Name", "category": "Category", "count": "number or 10+", "ffr_found": boolean, "source_photo": 0, "confidence": 0.9 }
      ],
      "evidence_found": {
        "jerky": { "found": boolean, "source_photo": 0 },
        "canned": { "found": boolean, "source_photo": 0 },
        "chips": { "found": boolean, "source_photo": 0 },
        "milk_eggs": { "found": boolean, "source_photo": 0 },
        "juice": { "found": boolean, "source_photo": 0 },
        "coolers": { "found": boolean, "source_photo": 0 },
        "pastry": { "found": boolean, "source_photo": 0 }
      },
      "quality_audit": { "status": "Good", "details": "string" }
    }`;

    try {
      const result = await this.model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      let text = response.text().trim();

      // Extract JSON block
      let cleanJson = text.match(/\{[\s\S]*\}/)?.[0] || text;

      // Robust JSON repair for truncated Gemini responses
      const repairJson = (raw: string): any => {
        // Attempt 1: parse as-is
        try { return JSON.parse(raw); } catch (_) {}
        
        // Attempt 2: close unterminated strings and brackets
        let fixed = raw;
        // Close any unterminated string (odd number of unescaped quotes)
        const quoteCount = (fixed.match(/(?<!\\)"/g) || []).length;
        if (quoteCount % 2 !== 0) {
          fixed = fixed.replace(/,?\s*$/, '') + '"';
        }
        // Remove trailing commas before closing brackets
        fixed = fixed.replace(/,\s*$/, '');
        // Count open vs close brackets and close any remaining
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;
        const openBraces = (fixed.match(/\{/g) || []).length;
        const closeBraces = (fixed.match(/\}/g) || []).length;
        for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += ']';
        for (let i = 0; i < openBraces - closeBraces; i++) fixed += '}';
        
        try { return JSON.parse(fixed); } catch (_) {}
        
        // Attempt 3: truncate to the last complete inventory item
        const lastGoodItem = fixed.lastIndexOf('},');
        if (lastGoodItem > 0) {
          const truncated = fixed.substring(0, lastGoodItem + 1);
          // Re-close everything
          let reclose = truncated;
          const ob = (reclose.match(/\[/g) || []).length - (reclose.match(/\]/g) || []).length;
          const oc = (reclose.match(/\{/g) || []).length - (reclose.match(/\}/g) || []).length;
          for (let i = 0; i < ob; i++) reclose += ']';
          for (let i = 0; i < oc; i++) reclose += '}';
          try { return JSON.parse(reclose); } catch (_) {}
        }
        
        console.error("AI: All JSON repair attempts failed. Returning partial data.");
        return { inventory: [], evidence_found: {}, quality_audit: { status: "Error", details: "JSON parse failed" } };
      };

      console.log(`AI: Raw inventory response length: ${cleanJson.length} chars`);
      return repairJson(cleanJson);
    } catch (err) {
      console.error("Gemini Inventory Analysis Failed:", err);
      throw err;
    }
  }

  async analyzeSketch(imagePart: any, context: any): Promise<any> {
    const prompt = `Analyze sketch for FNS, Entrance, Checkouts, and HPI Stars. Return JSON.`;
    try {
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (err) {
      console.error("Sketch Analysis Error:", err);
      return null;
    }
  }

  async analyzeConsentForm(imagePart: any): Promise<any> {
    const prompt = `Verify Consent Form signature and date. Return JSON.`;
    try {
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (err) {
      console.error("Consent Analysis Error:", err);
      return null;
    }
  }
}
