
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
    
    // Extraer data base64 pura
    const base64Data = referenceBase64.includes(',') ? referenceBase64.split(',')[1] : referenceBase64;

    let outfitDescription = "";
    if (full) {
      outfitDescription = `el vestido de gala "${full.name}" (${full.basePrompt}) en color ${colors.full}`;
    } else {
      const topPart = top ? `${top.basePrompt} en color ${colors.top}` : "su torso original";
      const bottomPart = bottom ? `${bottom.basePrompt} en color ${colors.bottom}` : "su parte inferior original";
      outfitDescription = `un conjunto de ${topPart} y ${bottomPart}`;
    }

    const accessoriesText = accessories.length > 0 
      ? `Accesorios: ${accessories.map(a => a.name).join(', ')}.`
      : "Sin accesorios.";

    const makeupText = `ESTILISMO: Labios ${makeup.lipstick} ${makeup.lipstickFinish}, sombras ${makeup.eyeshadow}.`;

    // PROTOCOLO DE IDENTIDAD NIVEL MASTER - PROHIBIDO ALTERAR EL ROSTRO
    const radicalIdentityPrompt = `
      ULTRA-HIGH FIDELITY IDENTITY PRESERVATION (NO ALTERATIONS ALLOWED):
      1. SUJETO: La persona en la imagen adjunta es el MODELO ÚNICO.
      2. ROSTRO: Conserva el 100% de los rasgos faciales originales. Ojos, nariz, boca y forma de la cara deben ser IDÉNTICOS a la referencia. No modifiques la expresión ni la edad.
      3. PIEL Y CUERPO: Mantén el tono de piel exacto ("${persona.skin}") y la complexión física original. No cambies la fisionomía corporal.
      4. CABELLO: Conserva la textura y color de cabello original ("${persona.hair}").
      5. VESTIMENTA: Superpone digitalmente ${outfitDescription} sobre el cuerpo de la persona.
      6. COMPLEMENTOS: Añade ${accessoriesText} y aplica el maquillaje: ${makeupText}.
      7. CALIDAD: Renderizado cinematográfico 8k, iluminación ${lighting}, fotorrealismo extremo estilo revista de alta costura.
      
      IMPORTANTE: Si el rostro resultante no es exactamente el de la foto original, el resultado no es válido. La identidad debe ser 100% reconocible y original.
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
      if (!candidate) throw new Error("Error: No se pudo generar la imagen.");

      const imagePart = candidate.content?.parts?.find(p => p.inlineData);
      if (!imagePart?.inlineData?.data) throw new Error("Error: Los datos de imagen están incompletos.");

      return `data:image/png;base64,${imagePart.inlineData.data}`;
    } catch (error) {
      console.error("AI Engine Failure:", error);
      throw error;
    }
  }

  async getExpertAdvice(persona: Persona): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiza este perfil: ${JSON.stringify(persona)}. Danos 3 consejos de estilo para gala nocturna.`
      });
      return response.text || "No hay consejos disponibles.";
    } catch (error) { return "Error."; }
  }
}

export const geminiService = new GeminiService();
