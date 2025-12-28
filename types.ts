
export type Category = 'Gala' | 'Casual' | 'Deportiva' | 'Dormir' | 'Jeans' | 'Shorts';
export type Season = 'Primavera/Verano' | 'Otoño/Invierno';
export type PieceType = 'Superior' | 'Inferior' | 'Completo';
export type Angle = 'Frente' | 'Espalda' | 'Lado' | '45 Grados';

export interface Persona {
  height: string;
  hair: string;
  skin: string;
  build: string;
  facialFeatures: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  season: Season;
  type: PieceType;
  description: string;
  basePrompt: string;
  thumbnail: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  outfitDetails: string;
  timestamp: string;
}
