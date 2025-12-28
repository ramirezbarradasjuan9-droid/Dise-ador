
import { GoogleGenAI } from "@google/genai";
import { Persona, ClothingItem, Angle, Pose, MakeupState } from "../types";

export class GeminiService {
  async generateOutfitPreview(
    persona: Persona, 
    top: ClothingItem | null, 
    bottom: ClothingItem | null, 
    full: ClothingItem | null,
    accessories: ClothingItem[],
    colors: { top: string, bottom: string, full: string },
    angle: Angle,
    pose: Pose,
    referenceBase64: string,
    makeup: MakeupState
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let outfitDescription = "";
    if (full) {
      outfitDescription = `a ${full.basePrompt} in ${colors.full} color`;
    } else {
      const topPart = top ? `${top.basePrompt} in ${colors.top} color` : "no top";
      const bottomPart = bottom ? `${bottom.basePrompt} in ${colors.bottom} color` : "no bottom";
      outfitDescription = `a combination of ${topPart} and ${bottomPart}`;
    }

    const accessoriesText = accessories.length > 0 
      ? `Accessoring with: ${accessories.map(a => a.basePrompt).join(', ')}.`
      : "No accessories.";

    const makeupText = `FACE MAKEUP: Apply ${makeup.eyeshadow} eyeshadow style. 
    LIP MAKEUP: Apply ${makeup.lipstick} with a ${makeup.lipstickFinish} finish and ${makeup.lipContour} contouring style. 
    CHEEK MAKEUP: Apply ${makeup.blush} blush.`;

    const stylingPrompt = `
      ULTRA-HIGH FASHION PHOTOMANIPULATION:
      MODEL IDENTITY: Use the EXACT woman from the photo. Keep her ${persona.height} stature, ${persona.skin} skin, and ${persona.hair}.
      CLOTHING: She is wearing ${outfitDescription}.
      ACCESSORIES: ${accessoriesText}
      ${makeupText}
      POSE & ANGLE: Model is in a ${pose} pose, viewed from the ${angle}.
      SCENE: High-end professional fashion studio or luxury runway.
      QUALITY: 8k resolution, cinematic lighting, Vogue magazine style, photorealistic.
      INSTRUCTION: Replace her current attire with this specified outfit and apply the specified makeup. Full body shot.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: stylingPrompt }, { inlineData: { mimeType: "image/jpeg", data: referenceBase64.split(',')[1] } }] },
        config: { imageConfig: { aspectRatio: "9:16" } }
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      return imagePart?.inlineData ? `data:image/png;base64,${imagePart.inlineData.data}` : "";
    } catch (error) {
      console.error("Gemini AI Error:", error);
      throw error;
    }
  }

  async getExpertAdvice(persona: Persona): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Actúa como un diseñador de moda de alta gama. Basado en este perfil: 
    Estatura: ${persona.height}, Cabello: ${persona.hair}, Piel: ${persona.skin}, Complexión: ${persona.build}.
    Danos 3 consejos breves y elegantes sobre qué colores le favorecen, qué tipo de cortes (rayas verticales vs horizontales, etc.) y qué estilos de gala le harían lucir espectacular. Sé profesional y motivador. Responde en español de forma concisa.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      return response.text || "No se pudo obtener el consejo en este momento.";
    } catch (error) {
      return "Error al conectar con el diseñador virtual.";
    }
  }

  async generateCustomDesign(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fullPrompt = `HIGH FASHION DESIGN SKETCH: A professional fashion design of ${prompt}. 
    Style: Minimalist luxury background, 8k resolution, cinematic lighting, studio photography, sharp details. 
    Focus: The clothing item should be the main subject. No face needed, just a mannequin or professional headless model.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: { imageConfig: { aspectRatio: "3:4" } }
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      return imagePart?.inlineData ? `data:image/png;base64,${imagePart.inlineData.data}` : "";
    } catch (error) {
      console.error("Gemini Design Generation Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
