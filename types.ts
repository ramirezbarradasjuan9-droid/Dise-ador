
export type Category = 'Gala' | 'Casual' | 'Deportiva' | 'Dormir' | 'Jeans' | 'Shorts' | 'Accesorios';
export type Season = 'Primavera/Verano' | 'Otoño/Invierno';
export type PieceType = 'Superior' | 'Inferior' | 'Completo' | 'Accesorio';
export type Angle = 'Frente' | 'Espalda' | 'Lado' | '45 Grados';
export type Pose = 'Estándar' | 'Caminando' | 'Mano en Cadera' | 'Sentada Elegante' | 'Mirada sobre Hombro';
export type Mood = 'Serio y Profesional' | 'Carismático y Sonriente' | 'Risueño y Divertido' | 'Misterioso';

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
  subCategory?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  outfitDetails: string;
  timestamp: string;
  angle: Angle;
  pose: Pose;
  isFavorite?: boolean;
}

export interface UserProfile {
  username: string;
  password?: string;
  gallery: GalleryItem[];
  referenceImg: string | null;
}

export interface MakeupState {
  eyeshadow: string;
  lipstick: string;
  lipstickFinish: 'mate' | 'brillante' | 'metálico';
  lipContour: string;
  blush: string;
}
