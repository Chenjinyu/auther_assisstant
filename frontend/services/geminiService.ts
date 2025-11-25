import { GoogleGenAI } from "@google/genai";
import { FALLBACK_MESSAGE } from "../lib/constants";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRAGResponse = async (userQuery: string, contextChunks: string[]): Promise<string> => {
  const contextString = contextChunks.join("\n\n");

  const systemInstruction = `
    You are a strictly constrained AI assistant for a personal portfolio website.
    Your knowledge is LIMITED to the provided Context.

    Rules:
    1. Answer the user's question using ONLY the information found in the Context below.
    2. If the answer is not explicitly found in the Context, or if the Context is empty, you MUST return exactly this sentence: "${FALLBACK_MESSAGE}"
    3. Do not make up facts about the author.
    4. Keep answers professional, concise, and friendly.

    Context:
    ${contextString}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for factual consistency
      }
    });

    return response.text || FALLBACK_MESSAGE;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am currently experiencing technical difficulties connecting to the AI model. Please try again later.";
  }
};
