
export interface Persona {
  height: string;
  hair: string;
  skin: string;
  build: string;
  facialFeatures: string;
  referenceImage?: string; // Base64 de la foto enviada
}

export interface Outfit {
  id: string;
  name: string;
  designer: string;
  style: string;
  description: string;
  prompt: string;
  thumbnail: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  outfitName: string;
  timestamp: string;
}
