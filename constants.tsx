
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
  { id: 'gala-1', name: 'Velvet Nocturno', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Vestido largo de terciopelo azul profundo con escote en V.', basePrompt: 'luxurious deep blue velvet floor-length gown, plunge neckline', thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600' },
  { id: 'gala-2', name: 'Encaje Imperial', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Gala con detalles de encaje francés y transparencias.', basePrompt: 'elegant black lace gala dress with sheer details', thumbnail: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600' },
  { id: 'gala-3', name: 'Seda Esmeralda', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Vestido de seda ligera, espalda descubierta y caída fluida.', basePrompt: 'emerald green silk gown, backless design, fluid fabric', thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600' },
  { id: 'gala-4', name: 'Rojo Pasión', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Corte sirena en seda roja vibrante con cola extendida.', basePrompt: 'stunning red mermaid silk dress, long train', thumbnail: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600' },
  { id: 'gala-5', name: 'Dorado Estelar', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Vestido con lentejuelas oro y detalles en tul.', basePrompt: 'shimmering gold sequin gown, tulle accents', thumbnail: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600' },

  // CASUAL
  { id: 'cas-1', name: 'Lino Mediterráneo', category: 'Casual', season: 'Primavera/Verano', type: 'Superior', description: 'Blusa minimalista de lino blanco roto.', basePrompt: 'minimalist off-white linen blouse, relaxed fit', thumbnail: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600' },
  { id: 'cas-2', name: 'Palazzo Urbano', category: 'Casual', season: 'Primavera/Verano', type: 'Inferior', description: 'Corte ancho elegante en color arena.', basePrompt: 'high-waisted sand palazzo trousers', thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600' },
  { id: 'cas-6', name: 'Satin Slip', category: 'Casual', season: 'Primavera/Verano', type: 'Completo', description: 'Vestido lencero de satén negro.', basePrompt: 'minimalist black satin slip dress', thumbnail: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600' },

  // DEPORTIVA
  { id: 'sp-1', name: 'Onyx Compression', category: 'Deportiva', season: 'Otoño/Invierno', type: 'Superior', description: 'Soporte de alto impacto con malla transpirable.', basePrompt: 'black high-impact compression sports bra', thumbnail: 'https://images.unsplash.com/photo-1518310323263-71769732a9f5?w=600' },
  { id: 'sp-3', name: 'Zen Yoga Set', category: 'Deportiva', season: 'Primavera/Verano', type: 'Completo', description: 'Conjunto sin costuras en color lavanda.', basePrompt: 'seamless lavender yoga set, ribbed texture', thumbnail: 'https://images.unsplash.com/photo-1554344728-77ad90d6ed3d?w=600' },

  // LENTES DE SOL (Luxury Collection)
  { id: 'lente-1', name: 'Aviador Clásico Oro', category: 'Accesorios', subCategory: 'Lentes', season: 'Primavera/Verano', type: 'Accesorio', description: 'Montura delgada de metal dorado con micas degradadas.', basePrompt: 'classic gold-rimmed aviator sunglasses with gradient brown lenses', thumbnail: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600' },
  { id: 'lente-2', name: 'Cat-Eye Vintage Noir', category: 'Accesorios', subCategory: 'Lentes', season: 'Otoño/Invierno', type: 'Accesorio', description: 'Diseño retro puntiagudo en acetato negro pulido.', basePrompt: 'vintage sharp cat-eye sunglasses in polished black acetate', thumbnail: 'https://images.unsplash.com/photo-1511499767390-90342f16b147?w=600' },
  { id: 'lente-3', name: 'Wayfarer Moderno', category: 'Accesorios', subCategory: 'Lentes', season: 'Primavera/Verano', type: 'Accesorio', description: 'Forma cuadrada icónica en carey oscuro.', basePrompt: 'modern dark tortoiseshell wayfarer sunglasses', thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600' },
  { id: 'lente-4', name: 'Diva Oversized', category: 'Accesorios', subCategory: 'Lentes', season: 'Otoño/Invierno', type: 'Accesorio', description: 'Montura grande cuadrada para un look de celebridad.', basePrompt: 'large oversized black square designer sunglasses', thumbnail: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=600' },
  { id: 'lente-5', name: 'Geométricos Futuristas', category: 'Accesorios', subCategory: 'Lentes', season: 'Primavera/Verano', type: 'Accesorio', description: 'Forma hexagonal con micas color azul espejado.', basePrompt: 'futuristic hexagonal sunglasses with blue mirrored lenses', thumbnail: 'https://images.unsplash.com/photo-1508296696981-9997159747ad?w=600' },
  { id: 'lente-6', name: 'Escudo Deportivo', category: 'Accesorios', subCategory: 'Lentes', season: 'Primavera/Verano', type: 'Accesorio', description: 'Diseño envolvente monomica para actividades intensas.', basePrompt: 'wraparound sports shield sunglasses, iridescent lens', thumbnail: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600' },
  { id: 'lente-7', name: 'Rectangular Minimal', category: 'Accesorios', subCategory: 'Lentes', season: 'Primavera/Verano', type: 'Accesorio', description: 'Perfil bajo estilo años 90 en blanco mate.', basePrompt: 'minimalist 90s rectangular sunglasses in matte white', thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600' },
  { id: 'lente-8', name: 'Round Bohemio', category: 'Accesorios', subCategory: 'Lentes', season: 'Primavera/Verano', type: 'Accesorio', description: 'Lentes redondos estilo John Lennon con detalles grabados.', basePrompt: 'round bohemian sunglasses with intricate engraved silver frames', thumbnail: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=600' },

  // JOYERÍA Y OTROS
  { id: 'acc-2', name: 'Sapphire Drop', category: 'Accesorios', season: 'Otoño/Invierno', type: 'Accesorio', subCategory: 'Joyas', description: 'Collar de zafiros y diamantes.', basePrompt: 'stunning sapphire and diamond drop necklace', thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600' },
  { id: 'acc-3', name: 'Velvet Clutch', category: 'Accesorios', season: 'Otoño/Invierno', type: 'Accesorio', subCategory: 'Bolsos', description: 'Bolso de mano de terciopelo con cadena.', basePrompt: 'small black velvet clutch bag, gold chain', thumbnail: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600' },
  { id: 'acc-4', name: 'Stiletto Gold', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Calzado', description: 'Tacones de aguja dorados.', basePrompt: 'elegant gold high heel stilettos', thumbnail: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600' }
];

export const ANGLES: { name: string }[] = [
  { name: 'Frente' },
  { name: 'Espalda' },
  { name: 'Lado' },
  { name: '45 Grados' },
];
