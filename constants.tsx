
import { Persona, Outfit } from './types';

export const MI_PERFIL: Persona = {
  height: "1.60m",
  hair: "Negro lacio, largo hasta la cintura, muy brillante",
  skin: "Morena cálida, tono canela radiante",
  build: "Delgada, figura estética y definida (cuerpo reloj de arena)",
  facialFeatures: "Rasgos latinos definidos, ojos expresivos, sonrisa elegante",
  // La imagen de referencia se cargará dinámicamente en App.tsx
};

export const CATALOGO: Outfit[] = [
  {
    id: 'avant-garde-glass',
    name: 'Estructura de Cristal',
    designer: 'Inspiración Iris van Herpen',
    style: 'Cóctel Futurista',
    description: 'Vestido corto con tecnología de corte láser que crea un efecto 3D sobre la piel morena.',
    thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400',
    prompt: 'Ultra-modern avant-garde cocktail dress, 3D laser-cut translucent textures, architecture-inspired silhouette, high tech fashion, luxury gala event.'
  },
  {
    id: 'modern-versace',
    name: 'Seda de Medianoche',
    designer: 'Estilo Versace Moderno',
    style: 'Gala Nocturna',
    description: 'Vestido largo de seda líquida con detalles metálicos dorados que resaltan el cabello negro.',
    thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400',
    prompt: 'Liquid silk floor-length gown in deep midnight blue, gold hardware Medusa details, high thigh slit, sleek modern luxury, red carpet style.'
  },
  {
    id: 'minimalist-chic',
    name: 'Minimalismo de Milán',
    designer: 'Inspiración Prada',
    style: 'Cóctel Minimal',
    description: 'Vestido columna en satén color champagne para iluminar el rostro y la piel canela.',
    thumbnail: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=400',
    prompt: 'Champagne satin column dress, minimalist spaghetti straps, sophisticated and clean lines, high-end Italian fashion house style.'
  },
  {
    id: 'floral-couture',
    name: 'Jardín de Gala',
    designer: 'Inspiración Oscar de la Renta',
    style: 'Gala Formal',
    description: 'Bordados florales en relieve sobre tul negro, creando un contraste dramático y femenino.',
    thumbnail: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=400',
    prompt: 'Exquisite evening gown with 3D floral appliqués, black tulle base, intricate embroidery, majestic and feminine gala look.'
  }
];
