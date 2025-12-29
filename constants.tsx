
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
  { id: 'gala-6', name: 'Cisne Negro', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Plumas y tul en negro azabache.', basePrompt: 'black feathers and tulle haute couture gown', thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400' },

  // CASUAL
  { id: 'cas-1', name: 'Blusa Lino Blanca', category: 'Casual', season: 'Primavera/Verano', type: 'Superior', description: 'Frescura total para el día.', basePrompt: 'minimalist white linen blouse', thumbnail: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=400' },
  { id: 'cas-2', name: 'Palazzo Beige', category: 'Casual', season: 'Primavera/Verano', type: 'Inferior', description: 'Corte ancho elegante.', basePrompt: 'high-waisted beige palazzo trousers', thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400' },
  { id: 'cas-3', name: 'Vestido Floral', category: 'Casual', season: 'Primavera/Verano', type: 'Completo', description: 'Estampado de jardín francés.', basePrompt: 'french floral summer dress with puff sleeves', thumbnail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400' },
  { id: 'cas-4', name: 'Chaqueta de Cuero', category: 'Casual', season: 'Otoño/Invierno', type: 'Superior', description: 'Biker clásica negra.', basePrompt: 'classic black leather biker jacket', thumbnail: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=400' },

  // DEPORTIVA
  { id: 'sp-1', name: 'Top Pro Athletic', category: 'Deportiva', season: 'Otoño/Invierno', type: 'Superior', description: 'Soporte máximo.', basePrompt: 'black compression sports top', thumbnail: 'https://images.unsplash.com/photo-1518310323263-71769732a9f5?w=400' },
  { id: 'sp-2', name: 'Leggings Ciclista', category: 'Deportiva', season: 'Primavera/Verano', type: 'Inferior', description: 'Ajuste aerodinámico.', basePrompt: 'tight athletic biker shorts', thumbnail: 'https://images.unsplash.com/photo-1506629082923-3111170b628a?w=400' },
  { id: 'sp-3', name: 'Conjunto Yoga Zen', category: 'Deportiva', season: 'Primavera/Verano', type: 'Completo', description: 'Sin costuras, ultra cómodo.', basePrompt: 'seamless lavender yoga set', thumbnail: 'https://images.unsplash.com/photo-1554344728-77ad90d6ed3d?w=400' },

  // DORMIR (Pijamas)
  { id: 'dor-1', name: 'Silk Negligee', category: 'Dormir', season: 'Primavera/Verano', type: 'Completo', description: 'Seda pura con detalles de encaje.', basePrompt: 'elegant champagne silk lace nightgown', thumbnail: 'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?w=400' },
  { id: 'dor-2', name: 'Pijama Algodón', category: 'Dormir', season: 'Otoño/Invierno', type: 'Completo', description: 'Dos piezas ultra suave.', basePrompt: 'luxury organic cotton striped pajama set', thumbnail: 'https://images.unsplash.com/photo-1563833717765-00462801314e?w=400' },

  // JEANS / SHORTS
  { id: 'jn-1', name: 'Wide Leg Blue', category: 'Jeans', season: 'Primavera/Verano', type: 'Inferior', description: 'Denim clásico de tiro alto.', basePrompt: 'high-waisted classic blue wide-leg jeans', thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400' },
  { id: 'sh-1', name: 'Shorts de Lino', category: 'Shorts', season: 'Primavera/Verano', type: 'Inferior', description: 'Ideales para la playa.', basePrompt: 'white linen summer shorts', thumbnail: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400' },

  // ACCESORIOS
  { id: 'acc-1', name: 'Lentes Diva Noir', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Lentes', description: 'Oversize negro.', basePrompt: 'oversized black designer sunglasses', thumbnail: 'https://images.unsplash.com/photo-1511499767390-90342f16b147?w=400' },
  { id: 'acc-2', name: 'Joyas de Zafiro', category: 'Accesorios', season: 'Otoño/Invierno', type: 'Accesorio', subCategory: 'Joyas', description: 'Gargantilla de lujo.', basePrompt: 'stunning sapphire and diamond necklace', thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400' }
];

export const ANGLES: { name: string }[] = [
  { name: 'Frente' },
  { name: 'Espalda' },
  { name: 'Lado' },
  { name: '45 Grados' },
];
