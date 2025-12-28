
import { GoogleGenAI } from "@google/genai";
import { Persona, Outfit } from "../types";

export class GeminiService {
  async generateOutfitPreview(persona: Persona, outfit: Outfit, referenceBase64?: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Instrucción maestra que fuerza la identidad de la mujer de la foto
    const stylingPrompt = `
      FASHION STUDIO INSTRUCTION:
      USE THE ATTACHED PHOTO AS THE ABSOLUTE REFERENCE MODEL.
      MODEL CHARACTERISTICS:
      - Height: ${persona.height} (ensure proportions are accurate for this height).
      - Skin: ${persona.skin}.
      - Hair: ${persona.hair}.
      - Build: ${persona.build}.
      - Facial Features: MUST maintain the exact face and expression from the reference photo.
      
      CLOTHING TO APPLY:
      - Design: ${outfit.name} (${outfit.designer}).
      - Style: ${outfit.style}.
      - Prompt: ${outfit.prompt}.
      
      EXECUTION: Place this specific woman in the design. The lighting should be professional studio or luxury gala event. 
      High-end fashion photography style, 8k resolution, maintaining her natural beauty and features perfectly.
    `;

    try {
      const parts: any[] = [{ text: stylingPrompt }];
      
      if (referenceBase64) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: referenceBase64.split(',')[1] || referenceBase64
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: "9:16"
          }
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }

      throw new Error("No se pudo generar la simulación");
    } catch (error) {
      console.error("Gemini Engine Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
