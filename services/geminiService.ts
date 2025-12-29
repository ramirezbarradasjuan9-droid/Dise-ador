
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
    customClothingBase64?: string | null,
    lighting: string = 'Cinematográfica de Estudio Profesional'
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Limpieza de datos base64
    const personImgData = referenceBase64.includes(',') ? referenceBase64.split(',')[1] : referenceBase64;
    
    let parts: any[] = [];
    let outfitPrompt = "";

    const makeupPrompt = `MAKEUP: Applying ${makeup.eyeshadow} eyeshadow. LIPS: Using ${makeup.lipstick} lipstick with a ${makeup.lipstickFinish} finish texture (reflecting studio lights accordingly) and a ${makeup.lipContour} contour style. BLUSH: ${makeup.blush}. The makeup must look flawlessly integrated with the skin "${persona.skin}".`;

    if (customClothingBase64) {
      // Escenario: El usuario subió su propia imagen de ropa
      const clothingImgData = customClothingBase64.includes(',') ? customClothingBase64.split(',')[1] : customClothingBase64;
      
      outfitPrompt = `
        TASK: CLOTHING TRANSFER AND MAKEUP APPLICATION.
        IMAGE 1: Reference person (identity, skin tone, build).
        IMAGE 2: Reference clothing design.
        INSTRUCTION: Apply the EXACT design, style, fabric texture, and details from the clothing in IMAGE 2 onto the person from IMAGE 1. 
        CRITICAL: Change the fabric color of the garment to ${customColor}. Maintain all shadows and highlights but matching this exact hue.
        ${makeupPrompt}
      `;

      parts.push({ text: outfitPrompt });
      parts.push({ inlineData: { mimeType: "image/jpeg", data: personImgData } }); // Imagen 1: Persona
      parts.push({ inlineData: { mimeType: "image/jpeg", data: clothingImgData } }); // Imagen 2: Ropa
    } else {
      // Escenario: El usuario usa el catálogo interno
      if (full) {
        outfitPrompt = `un diseño completo llamado "${full.name}" (${full.basePrompt}) con la tela teñida exactamente en color "${customColor}"`;
      } else {
        const topPart = top ? `${top.basePrompt} en color "${customColor}"` : "prenda superior actual";
        const bottomPart = bottom ? `${bottom.basePrompt} en color "${customColor}"` : "prenda inferior actual";
        outfitPrompt = `un conjunto coordinado de ${topPart} y ${bottomPart}`;
      }

      const prompt = `
        PROFESSIONAL CINEMA STUDIO PHOTOGRAPHY:
        1. COMPOSITION: Full body shot.
        2. IDENTITY: Maintain exact facial features and skin "${persona.skin}" from the provided image.
        3. OUTFIT: ${outfitPrompt}. The primary fabric color must be exactly ${customColor}.
        4. MAKEUP: ${makeupPrompt}
        5. VIEWPORT: ${angle} view, ${pose} pose.
        6. QUALITY: 8k resolution, photorealistic, high fashion magazine style.
      `;

      parts.push({ text: prompt });
      parts.push({ inlineData: { mimeType: "image/jpeg", data: personImgData } });
    }

    // Añadir accesorios al prompt final si existen
    const sunglasses = accessories.find(a => a.subCategory === 'Lentes');
    if (sunglasses) {
      parts[0].text += ` \nADDITIONAL: The person must be wearing ${sunglasses.basePrompt}.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { 
          imageConfig: { aspectRatio: "9:16" } 
        }
      });

      const candidate = response.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find(p => p.inlineData);
      if (!imagePart?.inlineData?.data) throw new Error("Fallo en la generación visual.");

      return `data:image/png;base64,${imagePart.inlineData.data}`;
    } catch (error: any) {
      throw new Error(error.message || "Error en el servidor de renderizado.");
    }
  }
}

export const geminiService = new GeminiService();
