import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, Emotion } from "../types";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

// Define Schema for structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    synchronyScore: { type: Type.NUMBER, description: "Score from 0 to 100 indicating parent-child movement and behavioral synchrony." },
    childEmotion: { type: Type.STRING, description: "Dominant emotion of the child.", enum: ["Happy", "Distress", "Neutral", "Excited", "Frustrated"] },
    parentEmotion: { type: Type.STRING, description: "Dominant emotion of the parent.", enum: ["Happy", "Distress", "Neutral", "Excited", "Frustrated"] },
    turnTakingCount: { type: Type.NUMBER, description: "Estimated number of vocal or physical turn-taking exchanges." },
    feedback: { type: Type.STRING, description: "A summary paragraph of the interaction analysis." },
    keyMoments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING, description: "Time in video, e.g., '00:45'" },
          description: { type: Type.STRING, description: "What happened." },
          type: { type: Type.STRING, enum: ["positive", "negative", "neutral"] }
        }
      }
    },
    suggestedTasks: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "A specific, actionable intervention task based on the analysis." }
    }
  },
  required: ["synchronyScore", "childEmotion", "parentEmotion", "turnTakingCount", "feedback", "keyMoments", "suggestedTasks"]
};

export const analyzeVideoInteraction = async (
  base64Data: string, 
  mimeType: string
): Promise<AnalysisResult> => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this parent-child interaction video for early autism intervention assessment. 
            Focus on:
            1. Synchrony: How well are they moving/reacting to each other?
            2. Emotions: Identify the dominant emotions.
            3. Turn-taking: Count interactions.
            4. Provide actionable feedback based on ABA/DIR principles.
            
            Return the result in strict JSON format matching the schema.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4, // Lower temperature for more analytical results
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Return a fallback mock if AI fails (for graceful degradation in demo)
    return {
      synchronyScore: 0,
      childEmotion: Emotion.Neutral,
      parentEmotion: Emotion.Neutral,
      turnTakingCount: 0,
      feedback: "Unable to analyze video at this moment. Please try again.",
      keyMoments: [],
      suggestedTasks: []
    };
  }
};

export const generateEmergencyTips = async (context: string): Promise<string[]> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `The child is currently experiencing: ${context}. 
        Provide 3 immediate, short, calming strategies for the parent to use right now. 
        Keep it under 10 words per tip.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
      return ["Deep pressure massage", "Reduce sensory input (lights/noise)", "Use a calm, low voice"];
  }
}
