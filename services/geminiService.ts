
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
    
    // Extraer solo la data base64 pura sin el prefijo data:image/...
    const base64Data = referenceBase64.includes(',') ? referenceBase64.split(',')[1] : referenceBase64;

    let outfitDescription = "";
    if (full) {
      outfitDescription = `el vestido de gala "${full.name}" (${full.basePrompt}) en color ${colors.full}`;
    } else {
      const topPart = top ? `${top.basePrompt} en color ${colors.top}` : "su parte superior actual";
      const bottomPart = bottom ? `${bottom.basePrompt} en color ${colors.bottom}` : "su parte inferior actual";
      outfitDescription = `un conjunto compuesto por ${topPart} y ${bottomPart}`;
    }

    const accessoriesText = accessories.length > 0 
      ? `Acompañado de los siguientes accesorios: ${accessories.map(a => a.name).join(', ')}.`
      : "Sin accesorios adicionales.";

    const makeupText = `ESTILISMO: Labios ${makeup.lipstick} (${makeup.lipstickFinish}), ojos con técnica ${makeup.eyeshadow}.`;

    // Prompt ultra-estricto para preservación de identidad
    const identityPreservationPrompt = `
      IDENTITY PRESERVATION PROTOCOL - HIGH FIDELITY RENDER:
      1. SUJETO: La persona en la imagen de referencia es el sujeto absoluto. MANTÉN EL 100% DE SUS RASGOS FACIALES, ESTRUCTURA ÓSEA, FORMA DE OJOS, NARIZ Y BOCA.
      2. ATRIBUTOS FÍSICOS: Conserva intacto el tono de piel "${persona.skin}", el largo y textura del cabello "${persona.hair}" y su complexión física actual.
      3. ACCIÓN: No generes una persona nueva. Actúa como una capa de "Overlay" digital para vestir a la persona de la foto con: ${outfitDescription}.
      4. DETALLES: Integra ${accessoriesText} y aplica el maquillaje: ${makeupText}.
      5. AMBIENTE: Iluminación ${lighting}, calidad de estudio fotográfico 8k, estilo editorial de alta costura.
      6. CÁMARA: Ángulo ${angle}, manteniendo la pose de la persona o adaptándola suavemente a una pose "${pose}".

      REGLA DE ORO: La identidad facial debe ser indiscutiblemente la misma que la foto original. Prohibido cambiar etnia, rasgos o proporciones corporales.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [
            { text: identityPreservationPrompt }, 
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
      if (!candidate) throw new Error("No candidates found");

      const imagePart = candidate.content?.parts?.find(p => p.inlineData);
      if (!imagePart?.inlineData?.data) throw new Error("No image data found in candidate");

      return `data:image/png;base64,${imagePart.inlineData.data}`;
    } catch (error) {
      console.error("Critical Gemini Rendering Error:", error);
      throw error;
    }
  }

  async getExpertAdvice(persona: Persona): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Como director de arte de una revista de moda, da 3 consejos de estilo para una persona con estas características: ${JSON.stringify(persona)}.`
      });
      return response.text || "Consejos no disponibles.";
    } catch (error) { return "Error de conexión."; }
  }
}

export const geminiService = new GeminiService();
