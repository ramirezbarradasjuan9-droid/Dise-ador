
import { Persona, ClothingItem } from './types';

export const MI_PERFIL: Persona = {
  height: "1.60m",
  hair: "Negro lacio, largo hasta la cintura",
  skin: "Morena cálida",
  build: "Delgada con curvas",
  facialFeatures: "Rasgos latinos",
};

export const CATALOGO: ClothingItem[] = [
  // GALA
  {
    id: 'gala-1',
    name: 'Vestido de Seda Real',
    category: 'Gala',
    season: 'Primavera/Verano',
    type: 'Completo',
    description: 'Vestido largo elegante con caída natural.',
    basePrompt: 'elegant floor-length silk gown with a flowing silhouette',
    thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=200'
  },
  // CASUAL
  {
    id: 'top-casual-1',
    name: 'Blusa de Lino',
    category: 'Casual',
    season: 'Primavera/Verano',
    type: 'Superior',
    description: 'Blusa fresca de cuello V.',
    basePrompt: 'linen V-neck blouse, breathable fabric',
    thumbnail: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=200'
  },
  {
    id: 'bot-casual-1',
    name: 'Falda Midi',
    category: 'Casual',
    season: 'Primavera/Verano',
    type: 'Inferior',
    description: 'Falda a media pierna con vuelo.',
    basePrompt: 'high-waisted midi skirt with a subtle flare',
    thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=200'
  },
  // JEANS
  {
    id: 'top-shirt-1',
    name: 'Playera Básica',
    category: 'Casual',
    season: 'Primavera/Verano',
    type: 'Superior',
    description: 'Playera de algodón premium.',
    basePrompt: 'minimalist premium cotton t-shirt',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'
  },
  {
    id: 'jean-1',
    name: 'Jeans Slim Fit',
    category: 'Jeans',
    season: 'Otoño/Invierno',
    type: 'Inferior',
    description: 'Mezclilla de alta calidad ajustada.',
    basePrompt: 'classic slim-fit denim jeans',
    thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200'
  },
  // SHORTS
  {
    id: 'short-1',
    name: 'Short de Mezclilla',
    category: 'Shorts',
    season: 'Primavera/Verano',
    type: 'Inferior',
    description: 'Short corto desflecado.',
    basePrompt: 'distressed denim shorts',
    thumbnail: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200'
  },
  // SPORTS
  {
    id: 'sport-top-1',
    name: 'Top Deportivo',
    category: 'Deportiva',
    season: 'Primavera/Verano',
    type: 'Superior',
    description: 'Soporte alto para ejercicio.',
    basePrompt: 'high-support athletic sports bra',
    thumbnail: 'https://images.unsplash.com/photo-1518310323263-71769732a9f5?w=200'
  },
  {
    id: 'sport-bot-1',
    name: 'Leggings Pro',
    category: 'Deportiva',
    season: 'Otoño/Invierno',
    type: 'Inferior',
    description: 'Ajuste compresivo de alta tecnología.',
    basePrompt: 'compressive high-waist yoga leggings',
    thumbnail: 'https://images.unsplash.com/photo-1506629082923-3111170b628a?w=200'
  },
  // SLEEPWEAR
  {
    id: 'sleep-1',
    name: 'Conjunto Pijama',
    category: 'Dormir',
    season: 'Otoño/Invierno',
    type: 'Completo',
    description: 'Seda suave para el descanso.',
    basePrompt: 'luxurious soft silk pajama set',
    thumbnail: 'https://images.unsplash.com/photo-1582232402127-142f36034f55?w=200'
  }
];

export const COLORS = [
  { name: 'Negro', hex: '#000000' },
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Rojo', hex: '#FF0000' },
  { name: 'Azul', hex: '#0000FF' },
  { name: 'Rosa', hex: '#FFC0CB' },
  { name: 'Verde', hex: '#008000' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Gris', hex: '#808080' },
];

export const ANGLES: { name: string; icon: string }[] = [
  { name: 'Frente', icon: 'M12 4v16m8-8H4' },
  { name: 'Espalda', icon: 'M12 14l9-5-9-5-9 5 9 5z' },
  { name: 'Lado', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { name: '45 Grados', icon: 'M13 5l7 7-7 7M5 5l7 7-7 7' },
];
