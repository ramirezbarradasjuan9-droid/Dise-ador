
import { Persona, ClothingItem } from './types';

export const MI_PERFIL: Persona = {
  height: "1.60m",
  hair: "Negro lacio, largo hasta la cintura",
  skin: "Morena cálida",
  build: "Delgada con curvas",
  facialFeatures: "Rasgos latinos",
};

export const CATALOGO: ClothingItem[] = [
  // GALA - Otoño/Invierno
  { id: 'gala-oi-1', name: 'Velvet Nocturno', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Vestido largo de terciopelo azul profundo.', basePrompt: 'luxurious deep blue velvet floor-length gown, long sleeves', thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400' },
  { id: 'gala-oi-2', name: 'Encaje Negro', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Gala con detalles de encaje y transparencia.', basePrompt: 'elegant black lace gala dress with sheer details', thumbnail: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400' },
  // GALA - Primavera/Verano
  { id: 'gala-pv-1', name: 'Seda Esmeralda', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Vestido de seda ligera sin espalda.', basePrompt: 'emerald green backless silk summer gown', thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400' },
  { id: 'gala-pv-2', name: 'Floral Haute', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Diseño floral bordado a mano.', basePrompt: 'haute couture floral embroidered summer gown', thumbnail: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400' },
  
  // CASUAL
  { id: 'cas-top-1', name: 'Blusa de Lino Blanca', category: 'Casual', season: 'Primavera/Verano', type: 'Superior', description: 'Fresca y minimalista.', basePrompt: 'white minimal linen blouse', thumbnail: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=400' },
  { id: 'cas-bot-1', name: 'Pantalón Palazzo', category: 'Casual', season: 'Primavera/Verano', type: 'Inferior', description: 'Corte ancho y elegante.', basePrompt: 'high-waisted beige palazzo trousers', thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400' },
  
  // SHORTS
  { id: 'sh-1', name: 'Short Mezclilla Corto', category: 'Shorts', season: 'Primavera/Verano', type: 'Inferior', description: 'Estilo urbano deslavado.', basePrompt: 'short distressed blue denim shorts', thumbnail: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400' },
  { id: 'sh-2', name: 'Bermuda de Lino', category: 'Shorts', season: 'Primavera/Verano', type: 'Inferior', description: 'Largo medio, corte sastre.', basePrompt: 'linen tailored medium length shorts', thumbnail: 'https://images.unsplash.com/photo-1626071465942-70b13511116c?w=400' },
  { id: 'sh-3', name: 'Short de Piel Negro', category: 'Shorts', season: 'Otoño/Invierno', type: 'Inferior', description: 'Elegante y atrevido.', basePrompt: 'black faux leather short shorts', thumbnail: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=400' },

  // JEANS
  { id: 'jn-1', name: 'Skinny High Rise', category: 'Jeans', season: 'Otoño/Invierno', type: 'Inferior', description: 'Ajuste perfecto.', basePrompt: 'high-waisted skinny blue jeans', thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400' },
  { id: 'jn-2', name: 'Wide Leg Retro', category: 'Jeans', season: 'Primavera/Verano', type: 'Inferior', description: 'Inspiración 70s.', basePrompt: 'retro wide leg light wash jeans', thumbnail: 'https://images.unsplash.com/photo-1582533081022-ae7a53f85b3a?w=400' },

  // DEPORTIVA
  { id: 'sp-1', name: 'Top Pro Athletic', category: 'Deportiva', season: 'Primavera/Verano', type: 'Superior', description: 'Máximo soporte.', basePrompt: 'professional compression sports top', thumbnail: 'https://images.unsplash.com/photo-1518310323263-71769732a9f5?w=400' },
  { id: 'sp-2', name: 'Leggings Ciclista', category: 'Deportiva', season: 'Primavera/Verano', type: 'Inferior', description: 'Short deportivo ajustado.', basePrompt: 'tight athletic biker shorts', thumbnail: 'https://images.unsplash.com/photo-1506629082923-3111170b628a?w=400' },

  // DORMIR
  { id: 'sl-1', name: 'Pijama de Seda', category: 'Dormir', season: 'Otoño/Invierno', type: 'Completo', description: 'Set de lujo dos piezas.', basePrompt: 'two-piece silk luxury pajama set', thumbnail: 'https://images.unsplash.com/photo-1582232402127-142f36034f55?w=400' },

  // ACCESORIOS
  { id: 'acc-1', name: 'Lentes Oversize', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Lentes', description: 'Estilo diva.', basePrompt: 'oversized black designer sunglasses', thumbnail: 'https://images.unsplash.com/photo-1511499767390-90342f16b147?w=400' },
  { id: 'acc-2', name: 'Bolso Chanel Style', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Bolso', description: 'Clásico acolchado.', basePrompt: 'luxury quilted chain handbag', thumbnail: 'https://images.unsplash.com/photo-1548033511-424962b81008?w=400' },
  { id: 'acc-3', name: 'Gargantilla Oro', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Joyas', description: 'Minimalismo puro.', basePrompt: 'chunky gold chain necklace', thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400' }
];

export const COLORS = [
  { name: 'Negro', hex: '#000000' },
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Oro', hex: '#D4AF37' },
  { name: 'Rojo Carmesí', hex: '#990000' },
  { name: 'Azul Eléctrico', hex: '#003399' },
  { name: 'Rosa Fucsia', hex: '#FF00FF' },
  { name: 'Verde Bosque', hex: '#014421' },
  { name: 'Beige', hex: '#F5F5DC' }
];

export const MAKEUP_EYESHADOWS = [
  { name: 'Natural', prompt: 'subtle natural earth tones eyeshadow' },
  { name: 'Smoky Eye', prompt: 'dramatic dark charcoal smoky eye makeup' },
  { name: 'Shimmer', prompt: 'elegant gold shimmer eyeshadow' },
  { name: 'Atrevido', prompt: 'bold artistic vibrant color eyeshadow' }
];

export const MAKEUP_LIPSTICKS = [
  { name: 'Nude', hex: '#E3B098', prompt: 'matte nude lipstick' },
  { name: 'Rojo Gala', hex: '#B22222', prompt: 'classic bold red velvet lipstick' },
  { name: 'Rosa Soft', hex: '#FFB6C1', prompt: 'soft pink gloss lipstick' },
  { name: 'Ciruela', hex: '#673147', prompt: 'deep plum dark lipstick' }
];

export const MAKEUP_LIPSTICK_FINISHES: { name: 'mate' | 'brillante' | 'metálico'; prompt: string }[] = [
  { name: 'mate', prompt: 'velvety matte finish' },
  { name: 'brillante', prompt: 'high-shine glossy finish' },
  { name: 'metálico', prompt: 'shimmering metallic finish' }
];

export const MAKEUP_LIP_CONTOURS = [
  { name: 'Natural', prompt: 'seamless natural lip blending' },
  { name: 'Marcado', prompt: 'sharply defined lip contour liner' },
  { name: 'Degradado', prompt: 'trendy soft ombre lip contour' },
  { name: 'Voluminoso', prompt: 'overlined lips for extra volume effect' }
];

export const MAKEUP_BLUSHES = [
  { name: 'Melocotón', hex: '#FFDAB9', prompt: 'soft peach blush' },
  { name: 'Rosa', hex: '#FFC0CB', prompt: 'dewy rose pink blush' },
  { name: 'Bronceado', hex: '#CD853F', prompt: 'sun-kissed bronzed blush' }
];

export const POSES: { name: string; description: string }[] = [
  { name: 'Estándar', description: 'Natural standing' },
  { name: 'Caminando', description: 'Dynamic movement' },
  { name: 'Mano en Cadera', description: 'Confident posture' },
  { name: 'Sentada Elegante', description: 'Graceful pose on stool' },
  { name: 'Mirada sobre Hombro', description: 'Turning look' },
];

export const ANGLES: { name: string }[] = [
  { name: 'Frente' },
  { name: 'Espalda' },
  { name: 'Lado' },
  { name: '45 Grados' },
];
