import { GoogleGenAI } from "@google/genai";

// Check if API key exists
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

let conversationHistory: { role: string; text: string }[] = [];

/** Basic language heuristics */
const detectLanguage = (text: string): string => {
  const lower = text.toLowerCase();
  if (/(haba|wallahi|kai|yaya|nagode|barka)/.test(lower)) return "Hausa";
  if (/(bawoni|se|ekaro|nko|epele|kaabo)/.test(lower)) return "Yoruba";
  if (/(kedụ|bia|ị|unu|anyị)/.test(lower)) return "Igbo";
  // Simple pidgin detection heuristics (extend as needed)
  if (/(how far|how you|i dey|no vex|abeg|na so)/.test(lower)) return "Pidgin";
  return "English";
};

/** Convert file to base64 for Gemini */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
  });
}

/** Test Gemini connection */
export const testGeminiConnection = async (): Promise<boolean> => {
  if (!ai) return false;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello",
    });
    return !!response.text;
  } catch (error) {
    console.warn("Gemini connection test failed:", error);
    return false;
  }
};

/** Main API: accept optional image file */
export const getGeminiResponse = async (
  message: string,
  options?: {
    imageFile?: File | null;
    mode?: "simple" | "detailed";
  }
): Promise<string> => {
  const mode = options?.mode ?? "detailed";

  try {
    // Check if API key is configured
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file");
    }

    if (!ai) {
      throw new Error("Gemini AI not initialized");
    }

    // detect language
    const language = detectLanguage(message);

    // Fetch vitals (non-blocking but included if available)
    let vitalsSummary = "No vitals data available.";
    try {
      const res = await fetch("https://vitalink.pythonanywhere.com/pull");
      if (res.ok) {
        const v = await res.json();
        vitalsSummary = `SpO₂: ${v.spo2 ?? "--"}%
Heart Rate: ${v.bpm ?? "--"} BPM
Temperature: ${v.temp ?? "--"}°C
Blood Pressure: ${v.sbp ?? "--"}/${v.dbp ?? "--"} mmHg
Steps: ${v.current_step_count ?? "--"}
Alert: ${v.alert ?? "None"}`;
      }
    } catch {
      vitalsSummary = "Unable to fetch vitals right now.";
    }

    // add user message to memory
    conversationHistory.push({ role: "user", text: message });
    // Keep only last 10 messages for context
    conversationHistory = conversationHistory.slice(-10);

    const historyContext = conversationHistory.map((h) => `${h.role === "user" ? "User" : "Minda"}: ${h.text}`).join("\n");

    // Build the system prompt
    const systemPrompt = `
You are "Minda", a compassionate emotional support chatbot for Nigerian youth and IDPs.
Language Rules:
- ALWAYS respond fully in ${language}.
- Do NOT mix languages unless the user mixes them.
- If user writes in Nigerian Pidgin, reply in Pidgin.

Personality:
- Warm, calm, friendly.
- Never judgmental.
- No medical or psychological diagnoses.

Response Style:
- ${mode === "simple" ? "Keep replies short and simple (1–2 sentences)." : "Use 3–5 sentences with empathy and gentle coping suggestions."}

Behavior:
- If user shows worry, stress, fear, or sadness → comfort them.
- Only mention vitals if the user explicitly asks about them.
- If user sounds hopeless or mentions self-harm → share helplines gently.

Current Vitals:
${vitalsSummary}
Helplines:
- Nigeria Mental Health Helpline: 0908 103 1231
- NAFDAC Counselling Line: 0800 162 3322

Conversation History:
${historyContext}

User: ${message}
`.trim();

    // Prepare content parts for the new API
    const parts: any[] = [{ text: systemPrompt }];

    // Add image if provided
    if (options?.imageFile) {
      try {
        const base64Data = await fileToBase64(options.imageFile);
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: options.imageFile.type,
          },
        });
      } catch (imageError) {
        console.error("Error processing image:", imageError);
        // Continue without image
      }
    }

    // Generate content with the new API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: mode === "simple" ? 150 : 500,
      },
    });

    const text = response.text || "I'm here for you. How are you feeling?";

    // Add AI response to conversation history
    conversationHistory.push({ role: "ai", text });

    return text;
  } catch (err: any) {
    console.error("Gemini Error:", err);

    // Clean error messages based on error type
    let errorMessage = "I'm having trouble responding right now.";

    if (err.message?.includes("API key") || err.message?.includes("401")) {
      errorMessage = "API authentication failed. Please check your Gemini API key.";
    } else if (err.message?.includes("network") || err.message?.includes("Failed to fetch")) {
      errorMessage = "Network error. Please check your internet connection and try again.";
    } else if (err.message?.includes("timeout")) {
      errorMessage = "The response is taking too long. Please try again with a simpler message.";
    } else if (err.message?.includes("content policy")) {
      errorMessage = "I'm unable to respond to that particular message. Please try rephrasing.";
    } else if (err.message?.includes("quota") || err.message?.includes("429")) {
      errorMessage = "Service is temporarily unavailable due to high demand. Please try again later.";
    } else if (err.message?.includes("not found") || err.message?.includes("404")) {
      // This might happen if gemini-2.5-flash is not available in your region
      errorMessage = "The AI model is currently unavailable. Please try a different model.";
    } else if (err.message?.includes("model")) {
      errorMessage = "The requested AI model is not available. Please contact support.";
    }

    // Still add error to conversation history for continuity
    conversationHistory.push({ role: "ai", text: errorMessage });

    return errorMessage;
  }
};

// Function to clear conversation history
export const clearConversationHistory = () => {
  conversationHistory = [];
};

// Function to get conversation history (for debugging)
export const getConversationHistory = () => {
  return [...conversationHistory];
};

// Function to check if Gemini is available
export const isGeminiAvailable = (): boolean => {
  return !!apiKey && !!ai;
};

// Function to list available models (for debugging)
export const listAvailableModels = async (): Promise<string[]> => {
  if (!ai) return [];

  try {
    const models = await ai.models.list();
    return models.map((model) => model.name);
  } catch (error) {
    console.error("Error listing models:", error);
    return [];
  }
};
