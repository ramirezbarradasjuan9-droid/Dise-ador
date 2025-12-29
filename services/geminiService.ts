
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

    const makeupPrompt = `MAKEUP: Applying ${makeup.eyeshadow} eyeshadow. LIPS: Using ${makeup.lipstick} lipstick with a ${makeup.lipstickFinish} finish texture and a ${makeup.lipContour} contour style. BLUSH: ${makeup.blush}. The makeup must look flawlessly integrated with the skin "${persona.skin}".`;

    if (customClothingBase64) {
      // Escenario: El usuario subió su propia imagen de ropa
      const clothingImgData = customClothingBase64.includes(',') ? customClothingBase64.split(',')[1] : customClothingBase64;
      
      outfitPrompt = `
        TASK: FULL CLOTHING REPLACEMENT AND TRANSFER.
        IMAGE 1: Reference person (identity, skin tone, body shape).
        IMAGE 2: Target clothing design.
        INSTRUCTION: COMPLETELY REMOVE the clothing currently worn by the person in IMAGE 1. 
        REPLACE IT entirely with the EXACT design, fabric, and style from IMAGE 2. 
        CRITICAL: There should be NO trace of the original clothes (jeans, shirts, etc.) from Image 1. Dress the person ONLY in the new garment.
        COLOR ADJUSTMENT: Change the fabric color to exactly "${customColor}".
        ${makeupPrompt}
      `;

      parts.push({ text: outfitPrompt });
      parts.push({ inlineData: { mimeType: "image/jpeg", data: personImgData } }); // Imagen 1: Persona
      parts.push({ inlineData: { mimeType: "image/jpeg", data: clothingImgData } }); // Imagen 2: Ropa
    } else {
      // Escenario: El usuario usa el catálogo interno
      if (full) {
        outfitPrompt = `the full gown named "${full.name}" (${full.basePrompt}) dyed in "${customColor}" color.`;
      } else {
        const topPart = top ? `${top.basePrompt} in color "${customColor}"` : "";
        const bottomPart = bottom ? `${bottom.basePrompt} in color "${customColor}"` : "";
        outfitPrompt = `a coordinated outfit consisting of ${topPart} and ${bottomPart}.`;
      }

      const prompt = `
        PROFESSIONAL HIGH-FASHION STUDIO PHOTOGRAPHY:
        1. MANDATORY: COMPLETELY REMOVE AND REPLACE the original clothing worn by the person in the reference photo. 
        2. OUTFIT: Dress the person EXCLUSIVELY in ${outfitPrompt}. No original clothes (like jeans or t-shirts) should be visible underneath or anywhere.
        3. IDENTITY: Maintain the exact facial identity and skin tone "${persona.skin}" from the provided photo.
        4. MAKEUP: ${makeupPrompt}
        5. VIEWPORT: ${angle} view, ${pose} pose.
        6. QUALITY: 8k resolution, cinematic lighting, photorealistic.
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
