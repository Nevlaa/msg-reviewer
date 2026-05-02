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
    const prompt = `You are a SENIOR LEVEL 3 QC AUDITOR. Perform a thorough 3x3 VARIETY COUNT audit.
    
    STEP 1: INVENTORY & UNIT COUNTING (VERY IMPORTANT)
    - Specifically look for these varieties: ${expectedCategories.join(", ")}.
    - For EVERY variety found, count the EXACT number of units visible on shelves.
    - If you see a row or stack, assume depth. If more than 10 are visible/likely, use "10+".
    - Match found items against the survey list.
    - DISTINCT VARIETY RULE: Whole Milk and 2% Milk are DIFFERENT varieties. White Bread and Wheat Bread are DIFFERENT varieties.
    - VERIFY 'FFR' (Fresh/Frozen/Refrigerated) status.
    
    STEP 2: STAPLE AREA EVIDENCE
    - Scan specifically for: Jerky, Canned Foods, Chips, Milk, Eggs, Juice, Coolers, Pastry/Bread.
    
    Return a STRICT JSON object:
    {
      "inventory": [
        { "item": "Variety Name", "count": "number or 10+", "ffr_found": boolean, "source_photo": "index of photo", "confidence": 0.0-1.0 }
      ],
      "evidence_found": {
        "jerky": { "found": boolean, "source_photo": "index" },
        "canned": { "found": boolean, "source_photo": "index" },
        "chips": { "found": boolean, "source_photo": "index" },
        "milk_eggs": { "found": boolean, "source_photo": "index" },
        "juice": { "found": boolean, "source_photo": "index" },
        "coolers": { "found": boolean, "source_photo": "index" },
        "pastry": { "found": boolean, "source_photo": "index" }
      },
      "quality_audit": { "status": "Good" | "Poor", "details": "string" }
    }`;

    try {
      const result = await this.model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      let text = response.text().trim();

      // JSON REPAIR: If truncated, try to close the array/object
      if (!text.endsWith('}')) {
        console.warn("AI: JSON truncated. Attempting repair...");
        if (text.includes('"inventory": [')) {
          text = text.replace(/,?\s*$/, '') + ']}';
        } else {
          text = text + '}';
        }
      }

      const cleanJson = text.match(/\{[\s\S]*\}/)?.[0] || text;
      return JSON.parse(cleanJson);
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
