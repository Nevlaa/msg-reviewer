import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SNAPScanReport } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * GeminiOrchestrator - Stable Version 1.5.0
 * Standardized on gemini-1.5-flash for reliability.
 */
export const processBatchWithGemini = async (
  files: File[]
): Promise<SNAPScanReport> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const imageParts = await Promise.all(
    files.map(async (file) => {
      const base64Data = await fileToCompressedBase64(file);
      return {
        inlineData: {
          data: base64Data.split(",")[1],
          mimeType: "image/jpeg",
        },
      };
    })
  );

  try {
    const result = await model.generateContent([
      "Analyze these store photos and return a SNAP compliance report in JSON.",
      ...imageParts
    ]);
    
    const response = await result.response;
    const responseText = response.text();
    const cleanedJson = responseText.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanedJson) as SNAPScanReport;
  } catch (error: any) {
    console.error("Gemini Batch Error:", error);
    throw new Error(`Gemini Batch Error: ${error.message}`);
  }
};

const fileToCompressedBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1024;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
