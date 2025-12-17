import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const gemini =
  apiKey
    ? new GoogleGenAI({ apiKey })
    : null;

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function geminiGenerateText(prompt: string) {
  if (!gemini) throw new Error("GEMINI_API_KEY_MISSING");

  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  const text = response.text;
  if (!text || typeof text !== "string") {
    throw new Error("GEMINI_EMPTY_TEXT");
  }
  
  return text;
}
