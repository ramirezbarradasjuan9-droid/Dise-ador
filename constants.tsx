
import { Persona, ClothingItem, Pose } from './types';

export const MI_PERFIL: Persona = {
  height: "1.60m",
  hair: "Negro lacio, largo hasta la cintura",
  skin: "Morena cálida",
  build: "Delgada con curvas",
  facialFeatures: "Rasgos latinos",
};

export const OP_MAQUILLAJE = {
  sombras: ['Humo Profundo', 'Dorado Champagne', 'Tierra Mate', 'Rosado Glacé', 'Verde Esmeralda', 'Natural'],
  labiales: ['Rojo Pasión', 'Nude Elegante', 'Vino Intenso', 'Rosa Palo', 'Coral Vibrante', 'Chocolate'],
  acabados: ['mate', 'brillante', 'metálico'] as const,
  rubores: ['Melocotón', 'Rosado Suave', 'Bronceado', 'Natural'],
  contornosLabiales: ['Natural', 'Definido', 'Degradado (Ombré)', 'Sobrelineado (Overlined)']
};

export const POSES: { id: Pose, label: string, icon: string }[] = [
  { id: 'Estándar', label: 'Estándar', icon: '🧍' },
  { id: 'Caminando', label: 'Caminando', icon: '🚶' },
  { id: 'Mano en Cadera', label: 'Mano en Cadera', icon: '💃' },
  { id: 'Sentada Elegante', label: 'Sentada', icon: '🪑' },
  { id: 'Mirada sobre Hombro', label: 'Mirada Atenta', icon: '📸' },
];

export const CATALOGO: ClothingItem[] = [
  // --- CATEGORÍA: GALA (Alta Costura & Noche) ---
  { id: 'gala-1', name: 'Velvet Nocturno', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Vestido largo de terciopelo azul profundo con escote en V.', basePrompt: 'luxurious deep blue velvet floor-length gown, plunge neckline', thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600' },
  { id: 'gala-2', name: 'Encaje Imperial', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Gala con detalles de encaje francés y transparencias.', basePrompt: 'elegant black lace gala dress with sheer details', thumbnail: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600' },
  { id: 'gala-3', name: 'Seda Esmeralda', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Vestido de seda ligera, espalda descubierta y caída fluida.', basePrompt: 'emerald green silk gown, backless design, fluid fabric', thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600' },
  { id: 'gala-4', name: 'Rojo Pasión', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Corte sirena en seda roja vibrante con cola extendida.', basePrompt: 'stunning red mermaid silk dress, long train', thumbnail: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600' },
  { id: 'gala-5', name: 'Dorado Estelar', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Vestido con lentejuelas oro y detalles en tul.', basePrompt: 'shimmering gold sequin gown, tulle accents', thumbnail: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600' },
  { id: 'gala-6', name: 'Cisne Negro', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Plumas y tul en negro azabache, diseño vanguardista.', basePrompt: 'black feathers and tulle haute couture gown', thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600' },
  { id: 'gala-7', name: 'Champagne Glow', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Seda satinada color champagne con drapeado lateral.', basePrompt: 'champagne satin gown, high slit', thumbnail: 'https://images.unsplash.com/photo-1550630993-c7fc3947bd9d?w=600' },
  { id: 'gala-8', name: 'Boreal Aurora', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Degradado de azul a plata en pedrería fina.', basePrompt: 'blue to silver gradient sequin gown', thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600' },
  { id: 'gala-9', name: 'Minimalist Pearl', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Blanco perla, corte columna con cuello halter.', basePrompt: 'pearl white minimalist column gown, halter neck', thumbnail: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600' },
  { id: 'gala-10', name: 'Burgundy Royal', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Brocado color vino con hombros descubiertos.', basePrompt: 'deep burgundy brocade ball gown, off-shoulder', thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600' },
  { id: 'gala-11', name: 'Silver Storm', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Malla metálica plateada estilo futurista.', basePrompt: 'silver metallic mesh evening gown, futuristic style', thumbnail: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=600' },
  { id: 'gala-12', name: 'Rose Petal', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Tul rosa pastel con aplicaciones de flores 3D.', basePrompt: 'pastel pink tulle gown, 3D floral appliqués', thumbnail: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600' },
  { id: 'gala-13', name: 'Obsidian Plunge', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Negro mate con escote profundo y cinturón joya.', basePrompt: 'matte black gown, extreme plunge neckline, jewel belt', thumbnail: 'https://images.unsplash.com/photo-1518310323263-71769732a9f5?w=600' },
  { id: 'gala-14', name: 'Violet Empire', category: 'Gala', season: 'Primavera/Verano', type: 'Completo', description: 'Gasa violeta con corte imperio y pedrería en busto.', basePrompt: 'violet chiffon empire waist gown, beaded bodice', thumbnail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600' },
  { id: 'gala-15', name: 'Midnight Spark', category: 'Gala', season: 'Otoño/Invierno', type: 'Completo', description: 'Lentejuelas azul noche estilo galaxia.', basePrompt: 'midnight blue sequined evening dress, galaxy pattern', thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600' },

  // --- CATEGORÍA: CASUAL (Street, Office & Daily) ---
  { id: 'cas-1', name: 'Lino Mediterráneo', category: 'Casual', season: 'Primavera/Verano', type: 'Superior', description: 'Blusa minimalista de lino blanco roto.', basePrompt: 'minimalist off-white linen blouse, relaxed fit', thumbnail: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600' },
  { id: 'cas-2', name: 'Palazzo Urbano', category: 'Casual', season: 'Primavera/Verano', type: 'Inferior', description: 'Corte ancho elegante en color arena.', basePrompt: 'high-waisted sand palazzo trousers', thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600' },
  { id: 'cas-3', name: 'Jardín Francés', category: 'Casual', season: 'Primavera/Verano', type: 'Completo', description: 'Vestido floral con mangas abullonadas.', basePrompt: 'french floral summer dress, puff sleeves', thumbnail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600' },
  { id: 'cas-4', name: 'Biker Noir', category: 'Casual', season: 'Otoño/Invierno', type: 'Superior', description: 'Chaqueta de cuero con herrajes plateados.', basePrompt: 'black leather biker jacket, silver hardware', thumbnail: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600' },
  { id: 'cas-5', name: 'Knit Comfort', category: 'Casual', season: 'Otoño/Invierno', type: 'Superior', description: 'Suéter de punto grueso en color crema.', basePrompt: 'chunky oversized cream knit sweater', thumbnail: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600' },
  { id: 'cas-6', name: 'Satin Slip', category: 'Casual', season: 'Primavera/Verano', type: 'Completo', description: 'Vestido lencero de satén negro.', basePrompt: 'minimalist black satin slip dress', thumbnail: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600' },
  { id: 'cas-7', name: 'Denim Jacket XL', category: 'Casual', season: 'Otoño/Invierno', type: 'Superior', description: 'Chaqueta vaquera oversize con lavado vintage.', basePrompt: 'oversized vintage wash denim jacket', thumbnail: 'https://images.unsplash.com/photo-1527082395-e939b847da0d?w=600' },
  { id: 'cas-8', name: 'Midi Pleated', category: 'Casual', season: 'Primavera/Verano', type: 'Inferior', description: 'Falda midi plisada color verde oliva.', basePrompt: 'olive green pleated midi skirt', thumbnail: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600' },
  { id: 'cas-9', name: 'Classic Trench', category: 'Casual', season: 'Otoño/Invierno', type: 'Superior', description: 'Gabardina clásica color camel.', basePrompt: 'classic camel colored trench coat', thumbnail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600' },
  { id: 'cas-10', name: 'Silk Cami', category: 'Casual', season: 'Primavera/Verano', type: 'Superior', description: 'Top de seda con tirantes finos en color perla.', basePrompt: 'pearl silk camisole top, thin straps', thumbnail: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600' },
  { id: 'cas-11', name: 'Tailored Blazer', category: 'Casual', season: 'Otoño/Invierno', type: 'Superior', description: 'Blazer estructurado en gris marengo.', basePrompt: 'structured charcoal grey oversized blazer', thumbnail: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=600' },
  { id: 'cas-12', name: 'Boho Tunic', category: 'Casual', season: 'Primavera/Verano', type: 'Superior', description: 'Túnica bordada estilo bohemio.', basePrompt: 'bohemian embroidered white tunic blouse', thumbnail: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600' },
  { id: 'cas-13', name: 'Leather Trousers', category: 'Casual', season: 'Otoño/Invierno', type: 'Inferior', description: 'Pantalones de cuero vegano rectos.', basePrompt: 'straight leg vegan leather black trousers', thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600' },
  { id: 'cas-14', name: 'Cashmere Cardigan', category: 'Casual', season: 'Otoño/Invierno', type: 'Superior', description: 'Cárdigan largo de cachemira suave.', basePrompt: 'long soft cashmere cardigan in grey', thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600' },
  { id: 'cas-15', name: 'Summer Romper', category: 'Casual', season: 'Primavera/Verano', type: 'Completo', description: 'Mono corto de lino en color terracota.', basePrompt: 'terracotta linen summer romper', thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600' },

  // --- CATEGORÍA: DEPORTIVA (Athleisure & Performance) ---
  { id: 'sp-1', name: 'Onyx Compression', category: 'Deportiva', season: 'Otoño/Invierno', type: 'Superior', description: 'Soporte de alto impacto con malla transpirable.', basePrompt: 'black high-impact compression sports bra', thumbnail: 'https://images.unsplash.com/photo-1518310323263-71769732a9f5?w=600' },
  { id: 'sp-2', name: 'Aero Shorts', category: 'Deportiva', season: 'Primavera/Verano', type: 'Inferior', description: 'Shorts de ciclista con ajuste aerodinámico.', basePrompt: 'tight charcoal athletic biker shorts', thumbnail: 'https://images.unsplash.com/photo-1506629082923-3111170b628a?w=600' },
  { id: 'sp-3', name: 'Zen Yoga Set', category: 'Deportiva', season: 'Primavera/Verano', type: 'Completo', description: 'Conjunto sin costuras en color lavanda.', basePrompt: 'seamless lavender yoga set, ribbed texture', thumbnail: 'https://images.unsplash.com/photo-1554344728-77ad90d6ed3d?w=600' },
  { id: 'sp-4', name: 'Wind Runner', category: 'Deportiva', season: 'Otoño/Invierno', type: 'Superior', description: 'Rompevientos ligero reflectante.', basePrompt: 'lightweight reflective white windbreaker', thumbnail: 'https://images.unsplash.com/photo-1548690312-e3b507d17a4d?w=600' },
  { id: 'sp-5', name: 'Electric Leggings', category: 'Deportiva', season: 'Otoño/Invierno', type: 'Inferior', description: 'Leggings de cintura alta en azul eléctrico.', basePrompt: 'high-waisted electric blue leggings', thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' },
  { id: 'sp-6', name: 'Pro Tracksuit', category: 'Deportiva', season: 'Otoño/Invierno', type: 'Completo', description: 'Chándal completo técnico en negro mate.', basePrompt: 'technical matte black full tracksuit', thumbnail: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=600' },
  { id: 'sp-7', name: 'Gym Crop Top', category: 'Deportiva', season: 'Primavera/Verano', type: 'Superior', description: 'Top corto de secado rápido en neón.', basePrompt: 'neon yellow quick-dry crop top', thumbnail: 'https://images.unsplash.com/photo-1518310323263-71769732a9f5?w=600' },
  { id: 'sp-8', name: 'Tennis Skirt', category: 'Deportiva', season: 'Primavera/Verano', type: 'Inferior', description: 'Falda de tenis blanca plisada.', basePrompt: 'white pleated performance tennis skirt', thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' },
  { id: 'sp-9', name: 'Thermal Base', category: 'Deportiva', season: 'Otoño/Invierno', type: 'Superior', description: 'Capa base térmica para running.', basePrompt: 'thermal compression running base layer', thumbnail: 'https://images.unsplash.com/photo-1548690312-e3b507d17a4d?w=600' },
  { id: 'sp-10', name: 'Mesh Tank', category: 'Deportiva', season: 'Primavera/Verano', type: 'Superior', description: 'Camiseta de tirantes en malla abierta.', basePrompt: 'black open mesh athletic tank top', thumbnail: 'https://images.unsplash.com/photo-1518310323263-71769732a9f5?w=600' },

  // --- CATEGORÍA: DORMIR (Pijamas & Lounge) ---
  { id: 'dor-1', name: 'Seda Imperial', category: 'Dormir', season: 'Primavera/Verano', type: 'Completo', description: 'Camisón de seda champagne con encaje.', basePrompt: 'champagne silk and lace nightgown', thumbnail: 'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?w=600' },
  { id: 'dor-2', name: 'Cotton Dreams', category: 'Dormir', season: 'Otoño/Invierno', type: 'Completo', description: 'Pijama de algodón orgánico a rayas.', basePrompt: 'striped organic cotton luxury pajama set', thumbnail: 'https://images.unsplash.com/photo-1563833717765-00462801314e?w=600' },
  { id: 'dor-3', name: 'Satin Robe', category: 'Dormir', season: 'Primavera/Verano', type: 'Completo', description: 'Bata de satén color perla.', basePrompt: 'elegant pearl white satin robe', thumbnail: 'https://images.unsplash.com/photo-1556910602-3884ee026896?w=600' },
  { id: 'dor-4', name: 'Velvet Lounge', category: 'Dormir', season: 'Otoño/Invierno', type: 'Completo', description: 'Conjunto de descanso en terciopelo gris.', basePrompt: 'grey velvet lounge set, hoodie and joggers', thumbnail: 'https://images.unsplash.com/photo-1598559069352-3d8437b0d42c?w=600' },
  { id: 'dor-5', name: 'Lace Slip', category: 'Dormir', season: 'Primavera/Verano', type: 'Completo', description: 'Vestido de dormir corto con encaje rojo.', basePrompt: 'red lace and satin short nightdress', thumbnail: 'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?w=600' },

  // --- CATEGORÍA: JEANS & SHORTS ---
  { id: 'jn-1', name: 'Vintage High', category: 'Jeans', season: 'Primavera/Verano', type: 'Inferior', description: 'Denim clásico recto de tiro alto.', basePrompt: 'vintage high-waisted straight leg blue jeans', thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600' },
  { id: 'jn-2', name: 'Midnight Flare', category: 'Jeans', season: 'Otoño/Invierno', type: 'Inferior', description: 'Pantalón acampanado negro profundo.', basePrompt: 'black flared denim jeans, high rise', thumbnail: 'https://images.unsplash.com/photo-1582533081052-f8c851bb2f1e?w=600' },
  { id: 'jn-3', name: 'Mom Jeans Fit', category: 'Jeans', season: 'Primavera/Verano', type: 'Inferior', description: 'Ajuste mom jeans con roturas ligeras.', basePrompt: 'light wash distressed mom jeans', thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600' },
  { id: 'jn-4', name: 'Skinny Onyx', category: 'Jeans', season: 'Otoño/Invierno', type: 'Inferior', description: 'Vaqueros súper skinny en negro azabache.', basePrompt: 'super skinny jet black denim jeans', thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600' },
  { id: 'sh-1', name: 'Linen Beach', category: 'Shorts', season: 'Primavera/Verano', type: 'Inferior', description: 'Shorts de lino con cordón ajustable.', basePrompt: 'white linen casual shorts', thumbnail: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600' },
  { id: 'sh-2', name: 'Denim Cutoffs', category: 'Shorts', season: 'Primavera/Verano', type: 'Inferior', description: 'Shorts vaqueros desflecados.', basePrompt: 'distressed denim cutoff shorts', thumbnail: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600' },
  { id: 'sh-3', name: 'Tailored Shorts', category: 'Shorts', season: 'Primavera/Verano', type: 'Inferior', description: 'Shorts de vestir con pinzas en beige.', basePrompt: 'beige tailored high waisted shorts', thumbnail: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600' },

  // --- CATEGORÍA: ACCESORIOS (Lentes, Joyería, Bolsos, Zapatos) ---
  { id: 'lente-1', name: 'Aviador Clásico Oro', category: 'Accesorios', subCategory: 'Lentes', season: 'Primavera/Verano', type: 'Accesorio', description: 'Montura delgada de metal dorado con micas degradadas.', basePrompt: 'classic gold-rimmed aviator sunglasses', thumbnail: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600' },
  { id: 'lente-2', name: 'Cat-Eye Vintage Noir', category: 'Accesorios', subCategory: 'Lentes', season: 'Otoño/Invierno', type: 'Accesorio', description: 'Diseño retro puntiagudo en acetato negro.', basePrompt: 'vintage sharp cat-eye sunglasses black', thumbnail: 'https://images.unsplash.com/photo-1511499767390-90342f16b147?w=600' },
  { id: 'lente-3', name: 'Wayfarer Moderno', category: 'Accesorios', subCategory: 'Lentes', season: 'Primavera/Verano', type: 'Accesorio', description: 'Forma cuadrada icónica en carey oscuro.', basePrompt: 'modern dark tortoiseshell wayfarer sunglasses', thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600' },
  { id: 'lente-4', name: 'Diva Oversized', category: 'Accesorios', subCategory: 'Lentes', season: 'Otoño/Invierno', type: 'Accesorio', description: 'Montura grande cuadrada para celebridades.', basePrompt: 'large oversized black designer sunglasses', thumbnail: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=600' },
  { id: 'lente-5', name: 'Geométricos Azul', category: 'Accesorios', subCategory: 'Lentes', season: 'Primavera/Verano', type: 'Accesorio', description: 'Forma hexagonal con micas azules.', basePrompt: 'futuristic hexagonal sunglasses blue', thumbnail: 'https://images.unsplash.com/photo-1508296696981-9997159747ad?w=600' },
  { id: 'acc-2', name: 'Sapphire Drop', category: 'Accesorios', season: 'Otoño/Invierno', type: 'Accesorio', subCategory: 'Joyas', description: 'Collar de zafiros y diamantes.', basePrompt: 'sapphire and diamond drop necklace', thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600' },
  { id: 'acc-3', name: 'Velvet Clutch', category: 'Accesorios', season: 'Otoño/Invierno', type: 'Accesorio', subCategory: 'Bolsos', description: 'Bolso de mano de terciopelo con cadena.', basePrompt: 'small black velvet clutch bag', thumbnail: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600' },
  { id: 'acc-4', name: 'Stiletto Gold', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Calzado', description: 'Tacones de aguja dorados.', basePrompt: 'elegant gold high heel stilettos', thumbnail: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600' },
  { id: 'acc-5', name: 'Diamond Studs', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Joyas', description: 'Pendientes de diamante minimalistas.', basePrompt: 'classic diamond stud earrings', thumbnail: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600' },
  { id: 'acc-6', name: 'Leather Tote', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Bolsos', description: 'Bolso shopper de cuero marrón.', basePrompt: 'large tan leather tote bag', thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600' },
  { id: 'acc-7', name: 'Silk Scarf', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Complementos', description: 'Pañuelo de seda estampado.', basePrompt: 'patterned silk neck scarf', thumbnail: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa82?w=600' },
  { id: 'acc-8', name: 'Urban Sneakers', category: 'Accesorios', season: 'Primavera/Verano', type: 'Accesorio', subCategory: 'Calzado', description: 'Zapatillas urbanas blancas.', basePrompt: 'clean minimal white leather urban sneakers', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600' }
];

export const ANGLES: { name: string }[] = [
  { name: 'Frente' },
  { name: 'Espalda' },
  { name: 'Lado' },
  { name: '45 Grados' },
];
