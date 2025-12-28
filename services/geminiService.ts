
import { GoogleGenAI } from "@google/genai";
import { Persona, ClothingItem, Angle, Pose, MakeupState, Mood } from "../types";

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
    makeup: MakeupState,
    mood: Mood = 'Carismático y Sonriente'
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

    const makeupText = `FACE MAKEUP: Apply ${makeup.eyeshadow} eyeshadow. 
    LIPS: ${makeup.lipstick} color, ${makeup.lipstickFinish} finish.`;

    const stylingPrompt = `
      FASHION AVATAR SIMULATION:
      USER IDENTITY: PRESERVE THE EXACT FACE AND FEATURES FROM THE UPLOADED PHOTO.
      MOOD/EXPRESSION: Adjust the facial expression to be ${mood}.
      CLOTHING: The person is wearing ${outfitDescription}.
      ACCESSORIES: ${accessoriesText}
      ${makeupText}
      POSE & ANGLE: ${pose} pose from ${angle} angle.
      SCENE: Luxury fashion studio, soft cinematic lighting, 8k, professional photography.
      INSTRUCTION: This is a high-quality avatar for social media. Keep the likeness of the person perfect.
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
    Danos 3 consejos breves y elegantes sobre qué colores le favorecen y qué estilos le harían lucir espectacular. Responde en español.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      return response.text || "No se pudo obtener el consejo.";
    } catch (error) { return "Error al conectar."; }
  }

  async generateCustomDesign(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fullPrompt = `HIGH FASHION DESIGN SKETCH of ${prompt}.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: { imageConfig: { aspectRatio: "3:4" } }
      });
      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      return imagePart?.inlineData ? `data:image/png;base64,${imagePart.inlineData.data}` : "";
    } catch (error) { throw error; }
  }
}

export const geminiService = new GeminiService();
