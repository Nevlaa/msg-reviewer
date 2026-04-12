import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SNAPScanReport } from "../types";
import { getSystemPrompt } from "./PromptGenerator";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export type ValidationMode = 'reviewer' | 'qc';

/**
 * GeminiOrchestrator: Orchestrates multi-image batch processing via Gemini 1.5 Pro.
 */
export const processBatchWithGemini = async (
  files: File[], 
  mode: ValidationMode = 'reviewer'
): Promise<SNAPScanReport> => {
  // 1. Initialize Model (Gemini 1.5 Pro recommended for 70+ images & complex logic)
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    generationConfig: { responseMimeType: "application/json" }
  });

  // 2. Prepare System Instructions
  let systemInstructions = getSystemPrompt();
  
  if (mode === 'qc') {
    systemInstructions += "\n\nCRITICAL QC OVERRIDE: Act as the QC AUDITOR. Your primary goal is to verify the accuracy of the reviewer's counts. Flag any deficiencies, blurriness, or missed varieties with higher scrutiny.";
  }

  // 3. Convert Files to GenerativePart (Base64)
  const imageParts = await Promise.all(
    files.map(async (file) => {
      const base64Data = await fileToBase64(file);
      return {
        inlineData: {
          data: base64Data.split(",")[1],
          mimeType: file.type,
        },
      };
    })
  );

  // 4. Execute Prompt
  try {
    const result = await model.generateContent([
      systemInstructions,
      ...imageParts
    ]);

    const responseText = result.response.text();
    return JSON.parse(responseText) as SNAPScanReport;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process batch with Gemini. Please check your API key or image formats.");
  }
};

/**
 * Utility: Converts File object to Base64 string for API ingestion
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
