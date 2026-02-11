
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResponse } from "../types";

const API_KEY = process.env.API_KEY || "";

export async function analyzeDocument(base64Image: string): Promise<GeminiAnalysisResponse> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1],
          },
        },
        {
          text: "Analyze this document scan. Perform full OCR. Determine the document type. Suggest a professional filename based on content like dates and entities. Provide a brief summary.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { 
            type: Type.STRING,
            enum: ['Receipt', 'Contract', 'Note', 'Whiteboard', 'Business Card', 'Other']
          },
          extractedText: { type: Type.STRING },
          summary: { type: Type.STRING },
          suggestedFileName: { type: Type.STRING },
        },
        required: ["title", "category", "extractedText", "summary", "suggestedFileName"],
      },
    },
  });

  try {
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as GeminiAnalysisResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw error;
  }
}
