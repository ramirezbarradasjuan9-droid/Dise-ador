
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
  { id: 'gala-1', name: 'Velvet Nocturno', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Vestido largo de terciopelo azul profundo.', basePrompt: 'luxurious deep blue velvet floor-length gown', thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400' },
  { id: 'gala-2', name: 'Encaje Imperial', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Gala con detalles de encaje y transparencia.', basePrompt: 'elegant black lace gala dress', thumbnail: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400' },
  { id: 'gala-3', name: 'Seda Esmeralda', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Vestido de seda ligera sin espalda.', basePrompt: 'emerald green silk gown', thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400' },
  { id: 'gala-4', name: 'Rojo Pasión', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Corte sirena en seda roja.', basePrompt: 'stunning red mermaid silk dress', thumbnail: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400' },
  { id: 'gala-5', name: 'Dorado Estelar', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Vestido con lentejuelas oro.', basePrompt: 'shimmering gold sequin gown', thumbnail: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400' },
  { id: 'gala-6', name: 'Blanco Nupcial', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Elegancia pura en blanco marfil.', basePrompt: 'ivory white elegant evening gown', thumbnail: 'https://images.unsplash.com/photo-1549064430-804104d49d47?w=400' },

  // DEPORTIVA
  { id: 'sp-1', name: 'Top Pro Athletic', category: 'Deportiva', season: 'Otoño/Invierno', type: 'Superior', description: 'Soporte máximo.', basePrompt: 'black compression sports top', thumbnail: 'https://images.unsplash.com/photo-1518310323263-71769732a9f5?w=400' },
  { id: 'sp-2', name: 'Leggings Ciclista', category: 'Deportiva', season: 'Primavera/Verano', type: 'Inferior', description: 'Ajuste aerodinámico.', basePrompt: 'tight athletic biker shorts', thumbnail: 'https://images.unsplash.com/photo-1506629082923-3111170b628a?w=400' },
  { id: 'sp-3', name: 'Conjunto Yoga Zen', category: 'Deportiva', season: 'Primavera/Verano', type: 'Completo', description: 'Sin costuras, ultra cómodo.', basePrompt: 'seamless lavender yoga set', thumbnail: 'https://images.unsplash.com/photo-1554344728-77ad90d6ed3d?w=400' },
  { id: 'sp-4', name: 'Chaqueta Térmica', category: 'Deportiva', season: 'Otoño/Invierno', type: 'Superior', description: 'Para correr en frío.', basePrompt: 'slim fit thermal running jacket', thumbnail: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?w=400' },
  { id: 'sp-5', name: 'Pantalón Cargo Sport', category: 'Deportiva', season: 'Otoño/Invierno', type: 'Inferior', description: 'Estilo urbano deportivo.', basePrompt: 'black techwear cargo sports pants', thumbnail: 'https://images.unsplash.com/photo-1543133331-528299fb581d?w=400' },

  // CASUAL
  { id: 'cas-1', name: 'Blusa Lino Blanca', category: 'Casual', season: 'Primavera/Verano', type: 'Superior', description: 'Frescura total.', basePrompt: 'minimalist white linen blouse', thumbnail: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=400' },
  { id: 'cas-2', name: 'Palazzo Beige', category: 'Casual', season: 'Primavera/Verano', type: 'Inferior', description: 'Corte ancho elegante.', basePrompt: 'high-waisted beige palazzo trousers', thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400' },
  
  // ACCESORIOS
  { id: 'acc-1', name: 'Lentes Diva Noir', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Lentes', description: 'Oversize negro.', basePrompt: 'oversized black designer sunglasses', thumbnail: 'https://images.unsplash.com/photo-1511499767390-90342f16b147?w=400' },
  { id: 'acc-2', name: 'Lentes Aviador Oro', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Lentes', description: 'Clásico marco dorado.', basePrompt: 'classic gold aviator sunglasses', thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400' },
  { id: 'acc-3', name: 'Bolso Chanel Style', category: 'Accesorios', season: 'Otoño/Invierno', type: 'Accesorio', subCategory: 'Bolso', description: 'Acolchado negro.', basePrompt: 'luxury quilted chain handbag', thumbnail: 'https://images.unsplash.com/photo-1548033511-424962b81008?w=400' },
  { id: 'acc-4', name: 'Clutch de Gala', category: 'Accesorios', season: 'Otoño/Invierno', type: 'Accesorio', subCategory: 'Bolso', description: 'Cristales brillantes.', basePrompt: 'sparkling crystal evening clutch', thumbnail: 'https://images.unsplash.com/photo-1566150905458-1bf1fd113961?w=400' },
  { id: 'acc-5', name: 'Gorra Urban Pink', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Gorra', description: 'Estilo callejero.', basePrompt: 'stylish pink baseball cap', thumbnail: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400' },
  { id: 'acc-6', name: 'Joyas de Zafiro', category: 'Accesorios', season: 'Otoño/Invierno', type: 'Accesorio', subCategory: 'Joyas', description: 'Gargantilla de lujo.', basePrompt: 'stunning sapphire and diamond necklace', thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400' }
];

export const COLORS = [
  { name: 'Negro Nocturno', hex: '#000000' },
  { name: 'Blanco Perla', hex: '#FFFFFF' },
  { name: 'Oro Puro', hex: '#D4AF37' },
  { name: 'Rojo Gala', hex: '#990000' },
  { name: 'Azul Real', hex: '#003399' },
  { name: 'Verde Esmeralda', hex: '#014421' },
  { name: 'Beige Arena', hex: '#F5F5DC' }
];

export const MAKEUP_EYESHADOWS = [
  { name: 'Natural', prompt: 'subtle natural earth tones eyeshadow' },
  { name: 'Smoky Eye', prompt: 'dramatic dark charcoal smoky eye makeup' },
  { name: 'Shimmer Oro', prompt: 'elegant gold shimmer eyeshadow' },
  { name: 'Carmesí', prompt: 'bold artistic vibrant crimson eyeshadow' }
];

export const MAKEUP_LIPSTICKS = [
  { name: 'Nude', hex: '#E3B098', prompt: 'matte nude lipstick' },
  { name: 'Rojo Intenso', hex: '#B22222', prompt: 'classic bold red velvet lipstick' },
  { name: 'Rosa Soft', hex: '#FFB6C1', prompt: 'soft pink gloss lipstick' },
  { name: 'Bordeaux', hex: '#673147', prompt: 'deep plum dark lipstick' }
];

export const MAKEUP_LIPSTICK_FINISHES: { name: 'mate' | 'brillante' | 'metálico'; prompt: string }[] = [
  { name: 'mate', prompt: 'velvety matte finish' },
  { name: 'brillante', prompt: 'high-shine glossy finish' },
  { name: 'metálico', prompt: 'shimmering metallic finish' }
];

export const MAKEUP_LIP_CONTOURS = [
  { name: 'Natural', prompt: 'seamless natural lip blending' },
  { name: 'Definido', prompt: 'sharply defined lip contour liner' },
  { name: 'Ombre', prompt: 'trendy soft ombre lip contour' }
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
