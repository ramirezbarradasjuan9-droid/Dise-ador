
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CATALOGO, ANGLES, MI_PERFIL, OP_MAQUILLAJE, POSES } from './constants';
import { ClothingItem, Category, Angle, Pose, UserProfile, MakeupState } from './types';
import { geminiService } from './services/geminiService';

const CATEGORIES: Category[] = ['Gala', 'Casual', 'Deportiva', 'Dormir', 'Jeans', 'Shorts', 'Accesorios'];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [modal, setModal] = useState<{show: boolean, title: string, msg: string, type: 'info' | 'error'}>({ show: false, title: '', msg: '', type: 'info' });
  
  const [activeTab, setActiveTab] = useState<'Lookbook' | 'Gallery' | 'CatalogBook'>('Lookbook');
  const [activeCategory, setActiveCategory] = useState<Category>('Gala');
  const [catalogPage, setCatalogPage] = useState(0);
  const [pageDirection, setPageDirection] = useState<'next' | 'prev'>('next');
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const itemsPerPage = isMobile ? 1 : 2;

  // Estados de selección
  const [selectedFull, setSelectedFull] = useState<ClothingItem | null>(null);
  const [selectedTop, setSelectedTop] = useState<ClothingItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<ClothingItem[]>([]);
  const [customClothingImg, setCustomClothingImg] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState('#D4AF37');
  
  // Efectos visuales de selección globales
  const [sparkles, setSparkles] = useState<{id: number, x: number, y: number, tx: number, ty: number, color?: string}[]>([]);
  const [floatingLabels, setFloatingLabels] = useState<{id: number, x: number, y: number, text: string}[]>([]);

  // Estado de Maquillaje
  const [makeup, setMakeup] = useState<MakeupState>({
    eyeshadow: 'Natural',
    lipstick: 'Nude Elegante',
    lipstickFinish: 'brillante',
    lipContour: 'Natural',
    blush: 'Natural'
  });
  
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCloth, setIsUploadingCloth] = useState(false);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [angle, setAngle] = useState<Angle>('Frente');
  const [pose, setPose] = useState<Pose>('Estándar');

  // Estados de Manipulación de Imagen (Zoom/Rotación)
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clothInputRef = useRef<HTMLInputElement>(null);

  const filteredCatalog = useMemo(() => CATALOGO.filter(item => item.category === activeCategory), [activeCategory]);
  const currentItems = filteredCatalog.slice(catalogPage * itemsPerPage, (catalogPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(filteredCatalog.length / itemsPerPage);

  const showInfo = (title: string, msg: string) => setModal({ show: true, title, msg, type: 'info' });
  const showError = (title: string, msg: string) => setModal({ show: true, title, msg, type: 'error' });

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'es-ES';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        if (transcript.includes("frente")) setAngle("Frente");
        else if (transcript.includes("espalda")) setAngle("Espalda");
        else if (transcript.includes("zoom")) setZoom(2);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const handleSimulate = async () => {
    if (!currentUser?.referenceImg) return showError("Identidad Necesaria", "Sube una foto de tu rostro/cuerpo para la simulación.");
    if (!customClothingImg && !selectedFull && !selectedTop) return showError("Falta Diseño", "Selecciona una prenda para renderizar.");
    
    setIsGenerating(true);
    setZoom(1);
    setRotation(0);
    setIsStageOpen(true);
    try {
      const url = await geminiService.generateOutfitPreview(
        MI_PERFIL, selectedTop, selectedBottom, selectedFull, selectedAccessories,
        customColor, angle, pose, currentUser.referenceImg, 
        makeup,
        customClothingImg
      );
      setCurrentView(url);
    } catch (e: any) {
      showError("Error de Render", e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setCurrentUser({ username: 'Invitado', referenceImg: result, gallery: [] });
        setIsUploading(false);
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerVisualFeedback = (e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    
    const newSparkles = Array.from({length: 12}).map((_, i) => ({
      id: Math.random() + Date.now(),
      x,
      y,
      tx: (Math.random() - 0.5) * 200,
      ty: (Math.random() - 0.5) * 200 - 40,
      color: i % 2 === 0 ? '#d4af37' : '#ffffff'
    }));
    
    const newLabel = { id: Date.now(), x, y: y - 20, text: '+ Añadido' };

    setSparkles(prev => [...prev, ...newSparkles]);
    setFloatingLabels(prev => [...prev, newLabel]);

    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 800);
    
    setTimeout(() => {
      setFloatingLabels(prev => prev.filter(l => l.id !== newLabel.id));
    }, 1000);
  };

  const selectOutfit = (item: ClothingItem, e?: React.MouseEvent) => {
    if (e) triggerVisualFeedback(e);
    setCustomClothingImg(null);
    if (item.type === 'Accesorio') {
      setSelectedAccessories(prev => prev.some(a => a.id === item.id) ? prev.filter(a => a.id !== item.id) : [...prev, item]);
    } else if (item.type === 'Completo') {
      setSelectedFull(item);
      setSelectedTop(null); setSelectedBottom(null);
    } else {
      if (item.type === 'Superior') setSelectedTop(item);
      else setSelectedBottom(item);
      setSelectedFull(null);
    }
  };

  const isSelected = (item: ClothingItem) => {
    if (item.type === 'Accesorio') return selectedAccessories.some(a => a.id === item.id);
    return selectedFull?.id === item.id || selectedTop?.id === item.id || selectedBottom?.id === item.id;
  };

  const navigateCatalog = (direction: 'next' | 'prev') => {
    setPageDirection(direction);
    if (direction === 'next' && catalogPage < totalPages - 1) setCatalogPage(catalogPage + 1);
    else if (direction === 'prev' && catalogPage > 0) setCatalogPage(catalogPage - 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#010101] text-white">
      {/* Portales de efectos visuales */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        {sparkles.map(s => (
          <div 
            key={s.id} 
            className="sparkle-dot" 
            style={{ 
              left: s.x, 
              top: s.y, 
              backgroundColor: s.color,
              '--tx': `${s.tx}px`, 
              '--ty': `${s.ty}px` 
            } as any} 
          />
        ))}
        {floatingLabels.map(l => (
          <div key={l.id} className="float-confirm" style={{ left: l.x, top: l.y }}>{l.text}</div>
        ))}
      </div>

      {modal.show && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setModal({...modal, show: false})} />
          <div className="relative w-full max-w-sm p-10 rounded-[3rem] border border-amber-500/20 bg-neutral-950 shadow-2xl text-center animate-pop">
            <h3 className="text-xl font-serif gold-text mb-4 tracking-widest uppercase">{modal.title}</h3>
            <p className="text-[11px] text-neutral-400 mb-10 leading-relaxed italic">{modal.msg}</p>
            <button onClick={() => setModal({...modal, show: false})} className="w-full btn-gold py-4 rounded-2xl text-[10px] uppercase font-bold tracking-[0.3em]">Cerrar</button>
          </div>
        </div>
      )}

      <header className="h-20 glass sticky top-0 z-[500] px-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-serif text-black font-bold text-xl shadow-[0_0_20px_rgba(245,158,11,0.5)]">G</div>
          <div className="hidden xs:block">
            <h1 className="text-[11px] font-serif gold-text tracking-[0.3em] uppercase">Gala Vision Elite</h1>
            <p className="text-[7px] text-neutral-500 font-mono tracking-widest uppercase">Master Studio 8K</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('Lookbook')} className={`px-5 py-2.5 rounded-full text-[9px] font-bold uppercase transition-all ${activeTab === 'Lookbook' ? 'bg-amber-500 text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}>Taller</button>
          <button onClick={() => setActiveTab('CatalogBook')} className={`px-5 py-2.5 rounded-full text-[9px] font-bold uppercase transition-all ${activeTab === 'CatalogBook' ? 'bg-amber-500 text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}>Lookbook</button>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row relative overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-full lg:w-[380px] bg-[#050505] border-b lg:border-r border-white/5 p-8 flex flex-col gap-10 shrink-0 overflow-y-auto no-scrollbar">
          <section className="space-y-6">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">1. Perfil de Identidad</h3>
            <div 
              className="relative w-full aspect-[4/5] rounded-[2.5rem] bg-neutral-900 border border-white/10 overflow-hidden cursor-pointer group shadow-2xl transition-all hover:border-amber-500/30"
              onClick={() => fileInputRef.current?.click()}
            >
              {currentUser?.referenceImg ? (
                <img src={currentUser.referenceImg} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Identity" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 text-center p-8">
                  <span className="text-2xl mb-4">📸</span>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Sube tu Foto de Referencia</p>
                </div>
              )}
              {isUploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">2. Tono de Gala</h3>
            <div className="flex items-center gap-4 bg-neutral-900 border border-white/10 rounded-xl p-3">
              <input 
                type="color" 
                value={customColor} 
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
              />
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">{customColor}</span>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">3. Belleza & Pose</h3>
            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-widest text-neutral-500 block">Maquillaje Labial</label>
              <select 
                value={makeup.lipstick}
                onChange={(e) => setMakeup({...makeup, lipstick: e.target.value})}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-[10px] uppercase font-bold tracking-widest outline-none"
              >
                {OP_MAQUILLAJE.labiales.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-widest text-neutral-500 block">Pose de Pasarela</label>
              <select 
                value={pose}
                onChange={(e) => setPose(e.target.value as Pose)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-[10px] uppercase font-bold tracking-widest outline-none"
              >
                {POSES.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
              </select>
            </div>
          </section>

          <button 
            onClick={handleSimulate} 
            disabled={isGenerating}
            className="w-full btn-gold py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl mt-auto disabled:opacity-50"
          >
            {isGenerating ? "Generando Render..." : "Renderizar en 8K"}
          </button>
        </aside>

        {/* WORKSHOP AREA */}
        <section className="flex-grow bg-[#020202] relative overflow-hidden flex flex-col">
          {activeTab === 'CatalogBook' ? (
             <div className="flex-grow flex flex-col p-8 animate-in fade-in duration-700">
               <nav className="flex gap-8 border-b border-white/5 pb-4 mb-8 overflow-x-auto no-scrollbar">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setActiveCategory(cat); setCatalogPage(0); }}
                      className={`text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${activeCategory === cat ? 'text-amber-500' : 'text-neutral-500 hover:text-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
               </nav>

               <div className="flex-grow flex items-center justify-center perspective-[2000px]">
                 <div className="relative w-full max-w-[1100px] aspect-[16/9] flex bg-neutral-900/50 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                    {currentItems.map((item, idx) => (
                      <div 
                        key={item.id} 
                        onClick={(e) => selectOutfit(item, e)}
                        className={`flex-1 relative group cursor-pointer border-r border-white/5 last:border-r-0 ${isSelected(item) ? 'selected-breathing' : ''}`}
                      >
                        <img src={item.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" alt={item.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-10 flex flex-col justify-end">
                           <h2 className="text-4xl font-serif gold-text mb-4">{item.name}</h2>
                           <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-relaxed max-w-xs">{item.description}</p>
                           {isSelected(item) && <span className="mt-4 text-[9px] text-amber-500 font-bold uppercase tracking-[0.2em]">✨ Seleccionado</span>}
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => navigateCatalog('prev')} 
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all"
                    >←</button>
                    <button 
                      onClick={() => navigateCatalog('next')} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all"
                    >→</button>
                 </div>
               </div>
             </div>
          ) : (
            <div className="p-8 lg:p-16 space-y-12">
               <header className="border-b border-white/10 pb-8">
                  <h2 className="text-6xl font-serif gold-text animate-pop">Diseño Coctel</h2>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-[0.5em] mt-4">Atelier Digital • Edición 2025</p>
               </header>
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
                 {filteredCatalog.slice(0, 10).map(item => (
                   <div 
                    key={item.id} 
                    onClick={(e) => selectOutfit(item, e)}
                    className={`aspect-[3/4] rounded-3xl overflow-hidden border transition-all duration-500 cursor-pointer group relative ${isSelected(item) ? 'selected-breathing scale-105 border-amber-500' : 'border-white/5 grayscale hover:grayscale-0'}`}
                   >
                     <img src={item.thumbnail} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                       <span className="text-[8px] text-amber-500 font-bold uppercase mb-1">{item.category}</span>
                       <h4 className="text-sm font-serif">{item.name}</h4>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </section>
      </main>

      {/* RENDER MODAL */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-in fade-in duration-700">
           <header className="h-20 glass flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">MASTER_STUDIO_RENDER_ACTIVE</span>
             </div>
             <button onClick={() => setIsStageOpen(false)} className="text-[9px] font-bold uppercase text-red-500 border border-red-500/20 px-6 py-2.5 rounded-full hover:bg-red-500/10 transition-colors">Cerrar Render</button>
           </header>

           <div className="flex-grow relative flex items-center justify-center overflow-hidden p-8">
              {/* Controls Panel */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 bg-black/80 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] shadow-2xl space-y-8 z-10">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[8px] uppercase font-bold text-neutral-500 tracking-widest">Óptica (Zoom)</span>
                       <span className="text-[10px] font-mono text-amber-500">{zoom.toFixed(1)}x</span>
                    </div>
                    <input type="range" min="1" max="4" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[8px] uppercase font-bold text-neutral-500 tracking-widest">Rotación</span>
                       <span className="text-[10px] font-mono text-amber-500">{rotation}°</span>
                    </div>
                    <input type="range" min="-180" max="180" step="1" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full" />
                 </div>
                 <button onClick={() => { setZoom(1); setRotation(0); }} className="w-full py-3 rounded-2xl border border-white/10 text-[9px] font-bold uppercase text-neutral-400 hover:text-white transition-colors">Resetear Cámara</button>
              </div>

              <div className="relative w-full max-w-[500px] aspect-[9/16] bg-neutral-950 rounded-[4rem] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)]">
                 {isGenerating ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-8">
                      <div className="w-20 h-20 border-t-2 border-amber-500 rounded-full animate-spin" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-amber-500 animate-pulse">Procesando Iluminación Cinematográfica</p>
                   </div>
                 ) : currentView ? (
                   <div className="w-full h-full" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                     <img src={currentView} className="w-full h-full object-cover" alt="Render" />
                   </div>
                 ) : null}
              </div>

              {/* Angle selector */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 bg-black/60 backdrop-blur-3xl p-4 rounded-full border border-white/10">
                 {ANGLES.map(a => (
                   <button 
                    key={a.name} 
                    onClick={() => setAngle(a.name as Angle)}
                    className={`px-8 py-3 rounded-full text-[9px] font-bold uppercase transition-all ${angle === a.name ? 'bg-amber-500 text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                   >
                     {a.name}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
