
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
    mood: Mood = 'Carismático y Sonriente',
    lighting: string = 'Cinematográfica de Estudio'
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const base64Data = referenceBase64.includes(',') ? referenceBase64.split(',')[1] : referenceBase64;

    let outfitDescription = "";
    if (full) {
      outfitDescription = `un vestido de gala completo modelo "${full.name}" (${full.basePrompt}) en color ${colors.full}`;
    } else {
      const topPart = top ? `${top.basePrompt} en color ${colors.top}` : "una parte superior elegante";
      const bottomPart = bottom ? `${bottom.basePrompt} en color ${colors.bottom}` : "una parte inferior a juego";
      outfitDescription = `una combinación de ${topPart} y ${bottomPart}`;
    }

    const accessoriesText = accessories.length > 0 
      ? `Añade estos accesorios: ${accessories.map(a => a.name).join(', ')}.`
      : "Sin accesorios adicionales.";

    const makeupText = `MAQUILLAJE: Labios en estilo ${makeup.lipstick}, sombras de ojos en estilo ${makeup.eyeshadow}. Acabado ${makeup.lipstickFinish}.`;

    const stylingPrompt = `
      FOTOGRAFÍA CINEMATOGRÁFICA DE ALTA COSTURA:
      1. MODELO: Mantén los rasgos faciales, tono de piel "${persona.skin}" y cabello "${persona.hair}" de la persona en la foto de referencia.
      2. ATUENDO: La modelo viste ${outfitDescription}.
      3. DETALLES: ${accessoriesText}
      4. BELLEZA: ${makeupText} Expresión facial "${mood}".
      5. COMPOSICIÓN: Ángulo de cámara ${angle}, pose de modelo ${pose}.
      6. ILUMINACIÓN: ${lighting}, calidad 8k UHD, estilo editorial de Vogue, iluminación de estudio profesional, fotorrealismo extremo.
      
      IMPORTANTE: No cambies la identidad de la persona, solo su ropa y maquillaje.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [
            { text: stylingPrompt }, 
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ] 
        },
        config: { 
          imageConfig: { aspectRatio: "9:16" } 
        }
      });

      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("No response from AI");

      const imagePart = candidate.content?.parts?.find(p => p.inlineData);
      if (!imagePart?.inlineData?.data) throw new Error("No image data generated");

      return `data:image/png;base64,${imagePart.inlineData.data}`;
    } catch (error) {
      console.error("Gemini Image Error:", error);
      throw error;
    }
  }

  async getExpertAdvice(persona: Persona): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Como diseñador de alta costura, da 3 consejos breves en español para este perfil físico: ${JSON.stringify(persona)}.`
      });
      return response.text || "No hay consejos disponibles.";
    } catch (error) { return "Error de conexión."; }
  }
}

export const geminiService = new GeminiService();
