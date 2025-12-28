
import { Persona, Outfit } from './types';

export const MI_PERFIL: Persona = {
  height: "1.60m",
  hair: "Negro lacio, largo hasta la cintura, brillo sedoso",
  skin: "Morena cálida, tono canela profundo y radiante",
  build: "Figura estética, delgada con curvas definidas (reloj de arena)",
  facialFeatures: "Rasgos latinos elegantes, ojos almendrados expresivos",
};

export const CATALOGO: Outfit[] = [
  {
    id: 'versace-glam',
    name: 'Oro de Medianoche',
    designer: 'Versace Modern Haute Couture',
    style: 'Gala de Noche',
    description: 'Vestido largo de seda líquida en color oro viejo con detalles metálicos frontales.',
    thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400',
    prompt: 'Liquid silk floor-length gown in antique gold, architectural draping, metallic hardware accents, daring silhouette, luxury ballroom setting.'
  },
  {
    id: 'van-herpen-tech',
    name: 'Estructura Óptica',
    designer: 'Iris van Herpen 2025',
    style: 'Cóctel Vanguardista',
    description: 'Vestido midi con texturas 3D cortadas a láser que crean un efecto de movimiento cinético.',
    thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400',
    prompt: 'Avant-garde cocktail dress, laser-cut 3D organic patterns, semi-translucent material, futuristic structure, high-tech fashion studio photography.'
  },
  {
    id: 'valentino-red',
    name: 'Rubí Imperial',
    designer: 'Valentino Red Collection',
    style: 'Gala de Gala',
    description: 'Vestido de tul y terciopelo en rojo carmín profundo con capa de gasa etérea.',
    thumbnail: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=400',
    prompt: 'Majestic ruby red silk and velvet gown, flowing cape sleeves, dramatic train, royal gala ambiance, contrasting against deep black hair.'
  },
  {
    id: 'prada-minimal',
    name: 'Elegancia de Milán',
    designer: 'Prada Minimalist',
    style: 'Cóctel Moderno',
    description: 'Vestido columna de satén negro con bordados de cristal minimalistas en el cuello.',
    thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400',
    prompt: 'Sleek black satin column dress, minimalist crystal-embellished halter neck, sophisticated Italian chic, luxury rooftop lounge setting.'
  }
];
