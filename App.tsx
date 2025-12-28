
import React, { useState, useRef, useMemo } from 'react';
import { CATALOGO, MI_PERFIL, COLORS, ANGLES } from './constants';
import { ClothingItem, Category, Season, Angle, PieceType, GalleryItem } from './types';
import { geminiService } from './services/geminiService';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
  const [activeSeason, setActiveSeason] = useState<Season>('Primavera/Verano');
  const [selectedTop, setSelectedTop] = useState<ClothingItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem | null>(null);
  const [selectedFull, setSelectedFull] = useState<ClothingItem | null>(CATALOGO.find(i => i.type === 'Completo') || null);
  const [topColor, setTopColor] = useState(COLORS[0].name);
  const [bottomColor, setBottomColor] = useState(COLORS[0].name);
  const [fullColor, setFullColor] = useState(COLORS[0].name);
  const [angle, setAngle] = useState<Angle>('Frente');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [referenceImg, setReferenceImg] = useState<string | null>(null);

  const categories: (Category | 'Todos')[] = ['Todos', 'Gala', 'Casual', 'Jeans', 'Shorts', 'Deportiva', 'Dormir'];
  const seasons: Season[] = ['Primavera/Verano', 'Otoño/Invierno'];

  const filteredItems = useMemo(() => {
    return CATALOGO.filter(item => {
      const matchCat = activeCategory === 'Todos' || item.category === activeCategory;
      const matchSea = item.season === activeSeason;
      return matchCat && matchSea;
    });
  }, [activeCategory, activeSeason]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImg(reader.result as string);
        setCurrentView(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelect = (item: ClothingItem) => {
    if (item.type === 'Completo') {
      setSelectedFull(item);
      setSelectedTop(null);
      setSelectedBottom(null);
    } else if (item.type === 'Superior') {
      setSelectedTop(item);
      setSelectedFull(null);
    } else if (item.type === 'Inferior') {
      setSelectedBottom(item);
      setSelectedFull(null);
    }
  };

  const handleSimulate = async () => {
    if (!referenceImg) {
      alert("Sube tu foto primero.");
      return;
    }
    setIsGenerating(true);
    try {
      const url = await geminiService.generateOutfitPreview(
        MI_PERFIL, 
        selectedTop, 
        selectedBottom, 
        selectedFull,
        topColor,
        bottomColor,
        fullColor,
        angle,
        referenceImg
      );
      setCurrentView(url);
      
      const outfitName = selectedFull ? selectedFull.name : `${selectedTop?.name || 'Top'} + ${selectedBottom?.name || 'Bottom'}`;
      setGallery(prev => [{
        id: Date.now().toString(),
        url,
        outfitDetails: outfitName,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev]);
    } catch (e) {
      alert("Error en la simulación.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="h-16 glass sticky top-0 z-[100] px-4 md:px-12 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-serif font-bold text-lg">G</div>
          <h1 className="text-sm font-serif font-bold gold-text tracking-widest hidden sm:block">GALA VISION STUDIO</h1>
        </div>
        <div className="flex gap-4">
          <label className="cursor-pointer bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold border border-white/10 hover:bg-white/10 transition-all">
            {referenceImg ? 'CAMBIAR FOTO' : 'SUBIR FOTO'}
            <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
          </label>
        </div>
      </header>

      <div className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
        
        {/* Lado Izquierdo: Catálogo y Filtros */}
        <aside className="lg:col-span-3 border-r border-white/5 flex flex-col bg-[#050505] lg:h-[calc(100vh-64px)] overflow-hidden">
          <div className="p-4 space-y-4 border-b border-white/5">
            {/* Temporadas */}
            <div className="flex gap-2">
              {seasons.map(s => (
                <button 
                  key={s} 
                  onClick={() => setActiveSeason(s)}
                  className={`flex-1 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all ${activeSeason === s ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-white/5 bg-white/5 text-neutral-500'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* Categorías (Scroll horizontal en movil) */}
            <div className="flex lg:flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-now6 px-4 py-2 rounded-full text-[10px] font-bold transition-all border ${activeCategory === cat ? 'bg-white text-black border-white' : 'border-white/10 text-neutral-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
            {filteredItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => handleSelect(item)}
                className={`group relative rounded-2xl overflow-hidden border transition-all ${
                  (selectedFull?.id === item.id || selectedTop?.id === item.id || selectedBottom?.id === item.id) 
                  ? 'border-amber-500' : 'border-white/5'
                }`}
              >
                <div className="aspect-square lg:aspect-[16/9]">
                  <img src={item.thumbnail} className="w-full h-full object-cover" alt={item.name} />
                  <div className="absolute inset-0 bg-black/40 p-3 flex flex-col justify-end">
                    <span className="text-[7px] text-amber-500 font-bold uppercase tracking-widest">{item.type}</span>
                    <h4 className="text-[10px] font-bold leading-tight line-clamp-1">{item.name}</h4>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Centro: Simulador */}
        <main className="lg:col-span-6 p-4 md:p-8 flex flex-col gap-6 bg-[#020202] relative">
          <div className="flex-grow glass rounded-[2rem] overflow-hidden relative flex flex-col">
            {/* Toolbar superior del visualizador */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                {ANGLES.map(a => (
                  <button 
                    key={a.name}
                    onClick={() => setAngle(a.name as Angle)}
                    className={`w-10 h-10 rounded-full glass border flex items-center justify-center transition-all ${angle === a.name ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-white/10 text-neutral-500'}`}
                    title={a.name}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={a.icon}/></svg>
                  </button>
                ))}
              </div>
              {referenceImg && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 flex items-center gap-2 pointer-events-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Modelo Ready</span>
                </div>
              )}
            </div>

            <div className="flex-grow flex items-center justify-center relative">
              {isGenerating ? (
                <div className="text-center animate-pulse">
                  <div className="w-16 h-16 border-t-2 border-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[10px] font-bold tracking-[0.3em] text-amber-500 uppercase">Procesando Identidad...</p>
                </div>
              ) : currentView ? (
                <img src={currentView} className="w-full h-full object-contain animate-in fade-in duration-1000" alt="Resultado" />
              ) : (
                <div className="text-center p-12 max-w-sm">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <svg className="w-10 h-10 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                  <h3 className="text-2xl font-serif text-neutral-400 mb-2">Tu Espejo Digital</h3>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-widest">Sube una foto y escoge tu estilo para empezar</p>
                </div>
              )}
            </div>
          </div>

          {/* Botón Flotante de Acción */}
          <div className="flex justify-center">
            <button 
              onClick={handleSimulate}
              disabled={isGenerating || !referenceImg}
              className={`px-24 py-5 rounded-full font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all ${
                isGenerating || !referenceImg 
                ? 'bg-neutral-900 text-neutral-700 cursor-not-allowed border border-white/5' 
                : 'btn-gold text-black hover:scale-105 active:scale-95 shadow-amber-500/20'
              }`}
            >
              {isGenerating ? 'Generando...' : 'Ver Simulación'}
            </button>
          </div>
        </main>

        {/* Lado Derecho: Personalización y Galería */}
        <aside className="lg:col-span-3 border-l border-white/5 flex flex-col bg-[#050505] lg:h-[calc(100vh-64px)] overflow-hidden">
          <div className="p-6 space-y-8 overflow-y-auto">
            
            {/* Mix & Match Section */}
            <section className="space-y-6">
              <h2 className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-bold border-b border-amber-500/20 pb-2">Personalización</h2>
              
              <div className="space-y-6">
                {selectedFull ? (
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest">Vestido / Conjunto</label>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                      <p className="text-xs font-bold mb-3">{selectedFull.name}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {COLORS.map(c => (
                          <button 
                            key={c.name} 
                            onClick={() => setFullColor(c.name)}
                            className={`aspect-square rounded-full border-2 transition-all ${fullColor === c.name ? 'border-amber-500 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* TOP */}
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest">Prenda Superior</label>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <p className="text-xs font-bold mb-3">{selectedTop?.name || 'No seleccionado'}</p>
                        <div className="grid grid-cols-4 gap-2">
                          {COLORS.map(c => (
                            <button 
                              key={c.name} 
                              onClick={() => setTopColor(c.name)}
                              className={`aspect-square rounded-full border-2 transition-all ${topColor === c.name ? 'border-amber-500 scale-110' : 'border-transparent'}`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* BOTTOM */}
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest">Prenda Inferior</label>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <p className="text-xs font-bold mb-3">{selectedBottom?.name || 'No seleccionado'}</p>
                        <div className="grid grid-cols-4 gap-2">
                          {COLORS.map(c => (
                            <button 
                              key={c.name} 
                              onClick={() => setBottomColor(c.name)}
                              className={`aspect-square rounded-full border-2 transition-all ${bottomColor === c.name ? 'border-amber-500 scale-110' : 'border-transparent'}`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Galería */}
            {gallery.length > 0 && (
              <section className="space-y-4 pt-6 border-t border-white/5">
                <h2 className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">Historial de Pruebas</h2>
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => setCurrentView(item.url)}
                      className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 hover:border-amber-500 transition-all"
                    >
                      <img src={item.url} className="w-full h-full object-cover" alt="Historial" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
