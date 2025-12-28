
import { GoogleGenAI } from "@google/genai";
import { Persona, ClothingItem, Angle } from "../types";

export class GeminiService {
  async generateOutfitPreview(
    persona: Persona, 
    top: ClothingItem | null, 
    bottom: ClothingItem | null, 
    full: ClothingItem | null,
    topColor: string,
    bottomColor: string,
    fullColor: string,
    angle: Angle,
    referenceBase64: string
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    let outfitDescription = "";
    if (full) {
      outfitDescription = `a ${full.basePrompt} in ${fullColor} color`;
    } else {
      const topPart = top ? `${top.basePrompt} in ${topColor} color` : "no top";
      const bottomPart = bottom ? `${bottom.basePrompt} in ${bottomColor} color` : "no bottom";
      outfitDescription = `a combination of ${topPart} and ${bottomPart}`;
    }

    const stylingPrompt = `
      PHOTO EDITING TASK:
      IDENTITY: Use the exact person from the attached photo. Maintain her face, 1.60m height, morena skin, and long black hair perfectly.
      CLOTHING: She is wearing ${outfitDescription}.
      CAMERA ANGLE: Show her from a ${angle} view.
      QUALITY: Photorealistic fashion shot, 8k, professional studio lighting.
      INSTRUCTION: Replace her original clothes with the specified ones. Ensure the fit matches her slim but curved body type.
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
      console.error("Gemini AI Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
