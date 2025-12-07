import { GoogleGenAI, Type } from "@google/genai";
import { PuzzleData } from "../types";

// Safety check for API Key
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback puzzle in case of API failure or missing key
    return {
      originalEquation: "6+4=4",
      targetMoves: 1,
      hint: "숫자 6을 주의 깊게 보세요. (API Error - Using Fallback)"
    };
  }
};

export const getHintFromAI = async (currentEquation: string): Promise<string> => {
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Current state: ${currentEquation}. Give a small progressive hint without revealing the answer directly. Language: Korean.`,
      config: {
        systemInstruction: "You are a helpful puzzle assistant.",
      }
    });
    return response.text || "힌트를 불러올 수 없습니다.";
  } catch (error) {
    return "API 연결을 확인해주세요.";
  }
}
