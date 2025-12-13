import { GoogleGenAI, Part } from "@google/genai"; // Import Part type

// Check if API key exists
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// NEW: Use the Part type array to store conversation history, allowing for text and images.
let conversationHistory: {
  role: "user" | "model";
  parts: Part[];
}[] = [];

/** Basic language heuristics */
const detectLanguage = (text: string): string => {
  const lower = text.toLowerCase();
  if (/(haba|wallahi|kai|yaya|nagode|barka)/.test(lower)) return "Hausa";
  if (/(kedụ|bia|ị|unu|anyị)/.test(lower)) return "Igbo";
  // Simple pidgin detection heuristics (extend as needed)
  if (/(how far|how you|i dey|no vex|abeg|na so)/.test(lower)) return "Pidgin";
  return "English";
};

/** Convert file to base64 for Gemini */
function fileToBase64(file: File): Promise<Part> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(",")[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
  });
}

/** Test Gemini connection */
export const testGeminiConnection = async (): Promise<boolean> => {
  if (!ai) return false;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
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
      const res = await fetch("https://cliniq2.pythonanywhere.com/pull");
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

    // --- NEW LOGIC FOR HANDLING USER MESSAGE AND HISTORY ---

    // 1. Prepare parts for the new user message
    const newUserParts: Part[] = [{ text: message }];

    // Add image if provided and get the Part object
    if (options?.imageFile) {
      try {
        const imagePart = await fileToBase64(options.imageFile);
        newUserParts.push(imagePart);
      } catch (imageError) {
        console.error("Error processing image:", imageError);
        // Continue without image
      }
    }

    // 2. Add new user message (with or without image) to history
    conversationHistory.push({ role: "user", parts: newUserParts });
    // Keep only last 10 messages (turns) for context
    conversationHistory = conversationHistory.slice(-10);

    // 3. Build the context for the System Prompt (text-only)
    const historyContext = conversationHistory
      .map((h) => {
        const textPart = h.parts.find((p) => "text" in p);
        const text = textPart ? textPart.text : "[Non-text content]";
        return `${h.role === "user" ? "User" : "Minda"}: ${text}`;
      })
      .join("\n");

    // Build the system prompt
    const systemPrompt = `
You are "Minda", a medically-informed health assistant for Nigerian youth and IDPs.

### ROLE
- You respond as a **medical professional** with clinically accurate, evidence-based health information.
- You provide **clear medical guidance**, basic interpretation, and educational explanations.
- You DO NOT perform a medical diagnosis, prescribe medications, or replace emergency medical services.
- If symptoms appear dangerous, you must tell the user to seek urgent medical attention.

### IMAGE RULES
- If the user submits an image that **is medically relevant** (injury, food, rash, wound, swelling, infection, medical device, symptom), analyze it professionally.
- If an image is **NOT related to health**, you MUST ignore it**, notify the user of it irrelevance and focus solely on the user's text query and available vital data.
- Never guess or hallucinate medical conditions from unclear images.

### LANGUAGE RULES
- ALWAYS respond entirely in ${language}.
- If user mixes languages, you may mix accordingly.
- If user writes in Nigerian Pidgin, reply fully in Pidgin.

### RESPONSE STYLE
- ${
      mode === "simple"
        ? "Keep responses concise (1–2 sentences) but medically accurate."
        : "Give medically grounded explanations (3–5 sentences), offer reassurance, and optional next steps."
    }

### VITALS USAGE
- Only reference vitals if the user explicitly asks about health, symptoms, or “my vitals”.
- If vitals are abnormal, give medically informed guidance and red-flag warnings.
- If vitals are normal, provide reassurance.

### SAFETY RULES
- If user expresses hopelessness or self-harm thoughts → give emotional support and share helplines, but remain medically supportive.
- If symptoms indicate emergency (e.g., chest pain, difficulty breathing, severe bleeding, seizures) → instruct immediate medical attention.

### CURRENT PATIENT VITALS
${vitalsSummary}

### MENTAL HEALTH HELPLINES
- Nigeria Mental Health Helpline: 0908 103 1231
- NAFDAC Counselling Line: 0800 162 3322

### CONTEXT
Below is the conversation history for reference (text-only):
${historyContext}

Your task now is to respond ONLY to the last user message in the 'contents' array, following ALL the rules above.
`.trim();

    // 4. Build the final 'contents' array for the API call
    // The *first* part of the API call contains the system prompt for context
    const contents: { role: "user" | "model"; parts: Part[] }[] = [
      // Use a special 'user' role for the system prompt to guide the model's behavior
      { role: "user", parts: [{ text: systemPrompt }] },
      // Add the actual conversation history
      ...conversationHistory.slice(0, -1).map((h) => ({ role: h.role, parts: h.parts })),
      // Add the final user message (the current query)
      { role: "user", parts: newUserParts },
    ];

    // Generate content with the new API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      // Pass the full contents array, including image parts from history
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: mode === "simple" ? 150 : 500,
      },
    });

    const text = response.text || "I'm here for you. How are you feeling?";

    // Add AI response to conversation history (text-only part)
    conversationHistory.push({ role: "model", parts: [{ text }] });

    return text;
  } catch (err) {
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
    conversationHistory.push({ role: "model", parts: [{ text: errorMessage }] });

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
