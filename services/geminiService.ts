
import { GoogleGenAI } from "@google/genai";
import { Persona, ClothingItem, Angle, Pose, MakeupState } from "../types";

export class GeminiService {
  async generateOutfitPreview(
    persona: Persona, 
    top: ClothingItem | null, 
    bottom: ClothingItem | null, 
    full: ClothingItem | null,
    accessories: ClothingItem[],
    customColor: string,
    angle: Angle,
    pose: Pose,
    referenceBase64: string,
    makeup: MakeupState,
    lighting: string = 'Cinematográfica de Estudio Profesional'
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = referenceBase64.includes(',') ? referenceBase64.split(',')[1] : referenceBase64;

    let outfitDescription = "";
    if (full) {
      outfitDescription = `un vestido de gala espectacular llamado "${full.name}" (${full.basePrompt}) en color ${customColor}`;
    } else {
      const topPart = top ? `${top.basePrompt} en color ${customColor}` : "su prenda superior actual";
      const bottomPart = bottom ? `${bottom.basePrompt} en color ${customColor}` : "su prenda inferior actual";
      outfitDescription = `un conjunto de gala coordinado de ${topPart} y ${bottomPart}`;
    }

    const accessoriesText = accessories.length > 0 
      ? `Accesorios: ${accessories.map(a => a.name).join(', ')}.`
      : "Sin accesorios adicionales.";

    const prompt = `
      PROFESSIONAL CINEMA STUDIO PHOTOGRAPHY:
      1. COMPOSITION: **FULL BODY SHOT** from a considerable distance to show the entire outfit and silhouette from head to toe.
      2. REFERENCE: Identity of the person from image: skin "${persona.skin}", build "${persona.build}".
      3. OUTFIT: ${outfitDescription}. 
      4. STYLE: ${accessoriesText}. Face: ${makeup.eyeshadow} eyeshadow, ${makeup.lipstick} lipstick.
      5. VIEWPORT: ${angle} view, ${pose} pose.
      6. LIGHTING: ${lighting}, dramatic rim lighting, soft box fill, high contrast.
      7. QUALITY: 8k resolution, photorealistic, blurred studio background, anamorphic lens quality.
      8. PERSPECTIVE: Ensure the entire person is visible in the frame, no cropping of feet or head.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [
            { text: prompt }, 
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ] 
        },
        config: { 
          imageConfig: { 
            aspectRatio: "9:16"
          } 
        }
      });

      const candidate = response.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find(p => p.inlineData);
      if (!imagePart?.inlineData?.data) throw new Error("Fallo en la generación cinematográfica.");

      return `data:image/png;base64,${imagePart.inlineData.data}`;
    } catch (error: any) {
      throw new Error(error.message || "Error en el servidor de renderizado.");
    }
  }
}

export const geminiService = new GeminiService();
