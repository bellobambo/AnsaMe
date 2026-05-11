import { GoogleGenAI } from "@google/genai";

const GEMMA_MODEL = "gemma-4-31b-it";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  return new GoogleGenAI({ apiKey });
}

export async function generateWithGemma(prompt: string) {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: GEMMA_MODEL,
    contents: prompt
  });

  return response.text ?? "";
}
