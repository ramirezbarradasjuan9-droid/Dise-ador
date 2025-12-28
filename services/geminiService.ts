
import { GoogleGenAI } from "@google/genai";
import { Persona, Outfit } from "../types";

export class GeminiService {
  async generateOutfitPreview(persona: Persona, outfit: Outfit, referenceBase64: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Prompt de precisión quirúrgica para mantener la identidad
    const stylingPrompt = `
      ULTRA-DETAILED FASHION PHOTOGRAPHY TASK:
      USE THE ATTACHED PHOTOGRAPH AS THE ABSOLUTE AND ONLY REFERENCE FOR THE MODEL'S FACE, BODY, AND IDENTITY.
      
      MODEL DATA (MATCH THE PHOTO):
      - IDENTITY: The exact woman in the photo.
      - HEIGHT: 1.60 meters (Ensure proportions reflect this stature naturally).
      - SKIN: Radiant warm morena (cinnamon) skin tone.
      - HAIR: Long, straight, glossy black hair reaching the waist.
      - PHYSIQUE: Slim, aesthetic, defined hourglass figure.
      - FACIAL FEATURES: Maintain the expression and facial structure of the woman in the photo perfectly.
      
      DESIGN TO APPLY:
      - OUTFIT: ${outfit.name} designed by ${outfit.designer}.
      - DESCRIPTION: ${outfit.description}.
      - STYLE ELEMENTS: ${outfit.prompt}.
      
      SCENE SETTING:
      - LOCATION: High-end luxury noctural gala event or professional fashion studio.
      - LIGHTING: Cinematic, warm, flattering lighting that highlights her morena skin and the dress textures.
      - QUALITY: 8k resolution, photorealistic, Vogue-style composition.
      
      EXECUTION: Photomanipulate the ${outfit.name} onto the woman from the reference photo. She is the model. The result must be a flawless high-fashion shot of HER.
    `;

    try {
      const parts: any[] = [
        { text: stylingPrompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: referenceBase64.includes(',') ? referenceBase64.split(',')[1] : referenceBase64
          }
        }
      ];

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

      throw new Error("No image part found in response");
    } catch (error) {
      console.error("Gemini AI Studio Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
