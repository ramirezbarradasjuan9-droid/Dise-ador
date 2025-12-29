
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
      outfitDescription = `un diseño completo llamado "${full.name}" (${full.basePrompt}) en color ${customColor}`;
    } else {
      const topPart = top ? `${top.basePrompt} en color ${customColor}` : "prenda superior actual";
      const bottomPart = bottom ? `${bottom.basePrompt} en color ${customColor}` : "prenda inferior actual";
      outfitDescription = `un conjunto coordinado de ${topPart} y ${bottomPart}`;
    }

    // Filtrado inteligente de accesorios
    const sunglasses = accessories.find(a => a.subCategory === 'Lentes');
    const jewelry = accessories.filter(a => a.subCategory === 'Joyas');
    const otherAcc = accessories.filter(a => a.subCategory !== 'Lentes' && a.subCategory !== 'Joyas');

    const accessoriesText = `
      ACCESORIOS DETALLADOS:
      ${sunglasses ? `- Gafas: La persona debe estar usando ${sunglasses.basePrompt}.` : "- Rostro despejado, sin gafas."}
      ${jewelry.length > 0 ? `- Joyería: ${jewelry.map(j => j.basePrompt).join(', ')}.` : ""}
      ${otherAcc.length > 0 ? `- Complementos: ${otherAcc.map(o => o.basePrompt).join(', ')}.` : ""}
    `;

    const prompt = `
      PROFESSIONAL CINEMA STUDIO PHOTOGRAPHY:
      1. COMPOSITION: **FULL BODY SHOT** or **MEDIUM SHOT** ensuring facial accessories are visible.
      2. REFERENCE: Identity of the person from image: skin "${persona.skin}", build "${persona.build}".
      3. OUTFIT: ${outfitDescription}. 
      4. ACCESSORIES: ${accessoriesText}
      5. FACE: ${makeup.eyeshadow} eyeshadow, ${makeup.lipstick} lipstick. Ensure the face identity matches the reference image exactly.
      6. VIEWPORT: ${angle} view, ${pose} pose.
      7. LIGHTING: ${lighting}, dramatic rim lighting, soft box fill, high contrast.
      8. QUALITY: 8k resolution, photorealistic, blurred high-end studio background.
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
