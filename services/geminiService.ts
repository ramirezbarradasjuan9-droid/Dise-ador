
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
      outfitDescription = `la prenda de alta costura "${full.name}" (${full.basePrompt}) en tonalidad ${colors.full}`;
    } else {
      const topPart = top ? `${top.basePrompt} en color ${colors.top}` : "su torso original";
      const bottomPart = bottom ? `${bottom.basePrompt} en color ${colors.bottom}` : "su parte inferior original";
      outfitDescription = `el conjunto de ${topPart} y ${bottomPart}`;
    }

    const accessoriesText = accessories.length > 0 
      ? `Accesorios adicionales: ${accessories.map(a => a.name).join(', ')}.`
      : "Sin accesorios externos.";

    const makeupText = `LOOK: Labios ${makeup.lipstick} ${makeup.lipstickFinish}, sombras ${makeup.eyeshadow}.`;

    // PROMPT DE PRESERVACIÓN RADICAL DE IDENTIDAD
    const radicalIdentityPrompt = `
      STRICT IDENTITY PRESERVATION PROTOCOL (MASTER LEVEL):
      1. SUJETO PRIMARIO: La persona en la imagen de referencia DEBE permanecer 100% IDÉNTICA. 
      2. ROSTRO Y RASGOS: Mantén cada pixel de sus rasgos faciales, ojos, nariz, boca y expresión original. No suavices, no cambies etnia, no modifiques la edad.
      3. FISIOLOGÍA: Conserva el tono de piel exacto ("${persona.skin}"), la textura del cabello y color ("${persona.hair}") y la estética corporal completa.
      4. INTERVENCIÓN: Actúa exclusivamente como un sistema de superposición de ropa (Digital Try-On). Coloca ${outfitDescription} sobre el cuerpo del sujeto.
      5. ESTILISMO: Integra ${accessoriesText} y el maquillaje ${makeupText} respetando la base facial original.
      6. ENTORNO: Iluminación de estudio profesional (${lighting}), 8k resolution, fotorrealismo extremo, estilo cinematográfico.
      7. POSICIÓN: Adapta el ángulo a ${angle} y la pose a ${pose} pero SIN ALTERAR la fisionomía del sujeto.

      REGLA INQUEBRANTABLE: Si el rostro o la piel de la persona resultante no son 100% iguales a la foto de referencia, el render es un fallo. Cero modificaciones de identidad.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [
            { text: radicalIdentityPrompt }, 
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
      if (!candidate) throw new Error("No output candidate");

      const imagePart = candidate.content?.parts?.find(p => p.inlineData);
      if (!imagePart?.inlineData?.data) throw new Error("Missing image binary");

      return `data:image/png;base64,${imagePart.inlineData.data}`;
    } catch (error) {
      console.error("Gemini Render Engine Error:", error);
      throw error;
    }
  }

  async getExpertAdvice(persona: Persona): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiza este perfil de alta costura: ${JSON.stringify(persona)}. Proporciona 3 breves recomendaciones de diseño cinematográfico.`
      });
      return response.text || "Consejos no disponibles.";
    } catch (error) { return "Error de análisis."; }
  }
}

export const geminiService = new GeminiService();
