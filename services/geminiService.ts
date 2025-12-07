
import { GoogleGenAI, Type } from "@google/genai";
import { PuzzleData } from "../types";

// Declare process to satisfy TypeScript since we are using DefinePlugin in Vite
declare const process: {
  env: {
    API_KEY: string | undefined;
  }
};

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const API_KEY = process.env.API_KEY;

// Debugging: Log status (don't log the full key for security)
if (!API_KEY) {
  console.warn("Gemini Service: API_KEY is missing/undefined in process.env");
} else {
  console.log(`Gemini Service: API_KEY found (Length: ${API_KEY.length}). Initializing AI...`);
}

// Initialize AI client only if key exists, otherwise use a safe dummy to prevent immediate crash
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const SYSTEM_PROMPT = `
You are a matchstick puzzle generator. 
Generate an incorrect arithmetic equation using digits 0-9 and operators +, - and =.
The equation must be incorrect, but can be made correct by moving EXACTLY ONE matchstick.
"Moving" means taking a matchstick from one position and placing it in another valid position within a digit or operator.
Ensure the solution is valid and simple.

Return JSON format:
{
  "originalEquation": "6+4=4",
  "targetMoves": 1,
  "hint": "Try fixing the result."
}
`;

export const fetchPuzzle = async (): Promise<PuzzleData> => {
  try {
    if (!ai) throw new Error("API Key is missing from environment variables");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a new matchstick puzzle.",
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalEquation: { type: Type.STRING },
            targetMoves: { type: Type.INTEGER },
            hint: { type: Type.STRING }
          },
          required: ["originalEquation", "targetMoves", "hint"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    
    return JSON.parse(text) as PuzzleData;
  } catch (error: any) {
    console.warn("Gemini API Error, using fallback:", error);
    
    let errorMsg = "API Connection Failed";
    if (!API_KEY) errorMsg = "API Key Not Found";
    else if (error.message?.includes("403")) errorMsg = "API Key Permission Denied";
    else if (error.message) errorMsg = error.message;
    
    // Return a playable fallback puzzle so the app doesn't break
    // Alternating fallbacks could be added here for variety in demo mode
    return {
      originalEquation: "6+4=4",
      targetMoves: 1,
      hint: "숫자 6을 0으로 바꿔보세요.",
      error: errorMsg
    };
  }
};

export const getHintFromAI = async (currentEquation: string): Promise<string> => {
   try {
    if (!ai) return "API 키가 설정되지 않아 AI 힌트를 사용할 수 없습니다.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Current state: ${currentEquation}. Give a small progressive hint without revealing the answer directly. Language: Korean.`,
      config: {
        systemInstruction: "You are a helpful puzzle assistant.",
      }
    });
    return response.text || "힌트를 불러올 수 없습니다.";
  } catch (error: any) {
    console.error("Hint API Error:", error);
    return "AI 힌트 연결에 실패했습니다.";
  }
}
