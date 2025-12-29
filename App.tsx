
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CATALOGO, ANGLES, MI_PERFIL } from './constants';
import { ClothingItem, Category, Angle, Pose, UserProfile } from './types';
import { geminiService } from './services/geminiService';

const CATEGORIES: Category[] = ['Gala', 'Casual', 'Deportiva', 'Dormir', 'Jeans', 'Shorts', 'Accesorios'];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [modal, setModal] = useState<{show: boolean, title: string, msg: string, type: 'info' | 'error'}>({ show: false, title: '', msg: '', type: 'info' });
  
  const [activeTab, setActiveTab] = useState<'Lookbook' | 'Gallery' | 'CatalogBook'>('Lookbook');
  const [activeCategory, setActiveCategory] = useState<Category>('Gala');
  const [catalogPage, setCatalogPage] = useState(0);
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const itemsPerPage = isMobile ? 1 : 2;

  const [selectedFull, setSelectedFull] = useState<ClothingItem | null>(null);
  const [selectedTop, setSelectedTop] = useState<ClothingItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<ClothingItem[]>([]);
  const [customColor, setCustomColor] = useState('Negro');
  
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [angle, setAngle] = useState<Angle>('Frente');
  const [pose, setPose] = useState<Pose>('Estándar');

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        else if (transcript.includes("lado")) setAngle("Lado");
        else if (transcript.includes("45 grados")) setAngle("45 Grados");
        else if (transcript.includes("cambia el color a")) {
          const color = transcript.split(" a ")[1] || transcript.split(" ").pop();
          if (color) {
            setCustomColor(color);
            showInfo("Voz Detectada", `Diseño actualizado a color: ${color}`);
          }
        }
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (isStageOpen && !isGenerating && currentUser?.referenceImg && (selectedFull || selectedTop)) {
      handleSimulate(true);
    }
  }, [angle, customColor]);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      showInfo("Voz Activada", "Puedes decir: 'Gira a la espalda' o 'Cambia el color a azul'");
    }
  };

  const handleSimulate = async (silent = false) => {
    if (!currentUser?.referenceImg) return showError("Identidad Necesaria", "Sube una foto antes de continuar.");
    if (!selectedFull && !selectedTop) return showError("Diseño No Seleccionado", "Elige una prenda del catálogo.");
    
    setIsGenerating(true);
    if (!silent) setIsStageOpen(true);
    try {
      const url = await geminiService.generateOutfitPreview(
        MI_PERFIL, selectedTop, selectedBottom, selectedFull, selectedAccessories,
        customColor, angle, pose, currentUser.referenceImg, 
        { eyeshadow: 'Natural', lipstick: 'Nude', lipstickFinish: 'brillante', lipContour: 'Natural', blush: 'Melocotón' }
      );
      setCurrentView(url);
    } catch (e: any) {
      showError("Error de Render", "La IA no pudo procesar la imagen en este momento.");
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
        setCurrentUser({ username: 'Invitado', referenceImg: ev.target?.result as string, gallery: [] });
        setIsUploading(false);
        showInfo("Identidad OK", "Tu referencia física ha sido vinculada.");
      };
      reader.readAsDataURL(file);
    }
  };

  const selectOutfit = (item: ClothingItem) => {
    if (item.type === 'Accesorio') {
      // Regla especial para lentes: solo uno a la vez
      if (item.subCategory === 'Lentes') {
        setSelectedAccessories(prev => {
          const others = prev.filter(a => a.subCategory !== 'Lentes');
          return prev.some(a => a.id === item.id) ? others : [...others, item];
        });
      } else {
        setSelectedAccessories(prev => prev.some(a => a.id === item.id) ? prev.filter(a => a.id !== item.id) : [...prev, item]);
      }
    } else if (item.type === 'Completo') {
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
    showInfo("Añadido", `${item.name} se ha configurado en tu look.`);
  };

  const isSelected = (item: ClothingItem) => {
    if (item.type === 'Accesorio') return selectedAccessories.some(a => a.id === item.id);
    return selectedFull?.id === item.id || selectedTop?.id === item.id || selectedBottom?.id === item.id;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#010101] text-white">
      {/* MODALES */}
      {modal.show && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setModal({...modal, show: false})} />
          <div className={`relative w-full max-w-sm p-8 rounded-[3rem] border ${modal.type === 'error' ? 'border-red-500/30' : 'border-amber-500/30'} bg-neutral-950 shadow-2xl text-center animate-in zoom-in-95 duration-300`}>
            <h3 className="text-lg font-serif gold-text mb-4 tracking-[0.2em] uppercase">{modal.title}</h3>
            <p className="text-[11px] text-neutral-400 mb-8 leading-relaxed italic">{modal.msg}</p>
            <button onClick={() => setModal({...modal, show: false})} className="w-full btn-gold py-4 rounded-2xl text-[10px] uppercase font-bold tracking-[0.3em]">Continuar</button>
          </div>
        </div>
      )}

      {/* HEADER ELITE */}
      <header className="h-20 glass sticky top-0 z-[500] px-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-serif text-black font-bold text-xl">G</div>
          <div className="hidden xs:block">
            <h1 className="text-[11px] font-serif gold-text tracking-[0.3em] uppercase">Gala Vision Elite</h1>
            <p className="text-[7px] text-neutral-500 font-mono tracking-widest uppercase">Cinema Optic 8K</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('Lookbook')} className={`px-5 py-2.5 rounded-full text-[9px] font-bold uppercase transition-all ${activeTab === 'Lookbook' ? 'bg-amber-500 text-black' : 'text-neutral-500 hover:text-white'}`}>Taller</button>
          <button onClick={() => setActiveTab('CatalogBook')} className={`px-5 py-2.5 rounded-full text-[9px] font-bold uppercase transition-all ${activeTab === 'CatalogBook' ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'text-neutral-500 hover:text-white'}`}>Catálogo de Moda</button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow flex flex-col lg:flex-row relative">
        {/* PANEL DE CONTROL */}
        <aside className="w-full lg:w-[350px] bg-[#050505] border-b lg:border-r border-white/5 p-8 flex flex-col gap-8 shrink-0">
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest text-center lg:text-left">Identidad Digital</h3>
            <div 
              className="relative w-40 h-40 lg:w-full aspect-square lg:aspect-[4/5] mx-auto rounded-[3rem] bg-neutral-900 border border-white/10 overflow-hidden cursor-pointer group shadow-2xl"
              onClick={() => fileInputRef.current?.click()}
            >
              {currentUser?.referenceImg ? (
                <img src={currentUser.referenceImg} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Identity" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 p-10 text-center">
                  <span className="text-4xl mb-3">✨</span>
                  <p className="text-[9px] font-bold uppercase tracking-widest">Vincular Referencia</p>
                </div>
              )}
              {isUploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest text-center lg:text-left">Look Actual</h3>
            <div className="flex flex-wrap gap-2">
              {selectedFull && <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] uppercase">{selectedFull.name}</span>}
              {selectedTop && <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] uppercase">{selectedTop.name}</span>}
              {selectedAccessories.map(a => (
                <span key={a.id} className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[8px] uppercase text-amber-500">{a.name}</span>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="Ej: Azul Zafiro" 
              value={customColor}
              onChange={e => setCustomColor(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs outline-none focus:border-amber-500 transition-colors text-center lg:text-left font-mono"
            />
            <button onClick={() => handleSimulate()} className="w-full btn-gold py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-transform">Revelar Master Render</button>
          </div>
        </aside>

        {/* CONTENIDO DINÁMICO (LIBRO O TALLER) */}
        <section className="flex-grow bg-[#010101] overflow-y-auto no-scrollbar relative">
          {activeTab === 'CatalogBook' ? (
            <div className="fixed inset-0 lg:inset-y-0 lg:left-[350px] lg:right-0 bg-[#020202] z-[600] flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
               <nav className="h-16 border-b border-white/5 bg-black/40 flex items-center px-4 overflow-x-auto no-scrollbar gap-2">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setActiveCategory(cat); setCatalogPage(0); }} 
                      className={`whitespace-nowrap px-6 py-2 rounded-full text-[9px] font-bold uppercase transition-all ${activeCategory === cat ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
                  <button onClick={() => setActiveTab('Lookbook')} className="ml-auto text-red-500 text-[10px] uppercase font-bold pr-4">Cerrar Libro</button>
               </nav>

               <div className="flex-grow flex items-center justify-center p-4 lg:p-12 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
                  <div className="relative w-full max-w-6xl h-full lg:max-h-[85%] flex flex-col lg:flex-row bg-[#080808] rounded-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/5 group">
                     
                     <div className="flex-1 relative flex flex-col border-r border-white/5 overflow-hidden">
                        {currentItems[0] && (
                          <div className="flex-grow overflow-hidden relative">
                             <img src={currentItems[0].thumbnail} className="w-full h-full object-cover animate-in fade-in duration-1000" alt={currentItems[0].name} />
                             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-80" />
                             <div className="absolute bottom-10 left-10 right-10">
                                <span className="text-amber-500 text-[8px] font-mono tracking-widest uppercase">
                                  {currentItems[0].subCategory || 'Elite Design'} 00{catalogPage * itemsPerPage + 1}
                                </span>
                                <h2 className="text-3xl lg:text-5xl font-serif gold-text mt-2">{currentItems[0].name}</h2>
                                <p className="text-[10px] text-neutral-400 mt-4 leading-relaxed font-light line-clamp-3">{currentItems[0].description}</p>
                                <button onClick={() => selectOutfit(currentItems[0])} className={`mt-8 px-8 py-4 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors ${isSelected(currentItems[0]) ? 'bg-amber-500 text-black' : 'bg-white text-black hover:bg-amber-500'}`}>
                                   {isSelected(currentItems[0]) ? '✓ Seleccionado' : 'Seleccionar'}
                                </button>
                             </div>
                          </div>
                        )}
                        <div className="h-1 bg-amber-500 w-full animate-scan" />
                     </div>

                     {!isMobile && (
                        <div className="flex-1 relative flex flex-col overflow-hidden bg-[#0a0a0a]">
                           {currentItems[1] ? (
                              <div className="flex-grow overflow-hidden relative">
                                 <img src={currentItems[1].thumbnail} className="w-full h-full object-cover" alt={currentItems[1].name} />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-80" />
                                 <div className="absolute bottom-10 left-10 right-10">
                                    <span className="text-amber-500 text-[8px] font-mono tracking-widest uppercase">
                                      {currentItems[1].subCategory || 'Elite Design'} 00{catalogPage * itemsPerPage + 2}
                                    </span>
                                    <h2 className="text-3xl lg:text-5xl font-serif gold-text mt-2">{currentItems[1].name}</h2>
                                    <p className="text-[10px] text-neutral-400 mt-4 leading-relaxed font-light line-clamp-3">{currentItems[1].description}</p>
                                    <button onClick={() => selectOutfit(currentItems[1])} className={`mt-8 px-8 py-4 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors ${isSelected(currentItems[1]) ? 'bg-amber-500 text-black' : 'bg-white text-black hover:bg-amber-500'}`}>
                                       {isSelected(currentItems[1]) ? '✓ Seleccionado' : 'Seleccionar'}
                                    </button>
                                 </div>
                              </div>
                           ) : (
                              <div className="flex-grow flex flex-col items-center justify-center p-20 text-center opacity-10">
                                 <div className="w-32 h-32 bg-amber-500 rounded-full mb-10" />
                                 <p className="text-2xl font-serif uppercase tracking-widest">Fin de Sección</p>
                              </div>
                           )}
                           <div className="h-1 bg-amber-500 w-full opacity-30" />
                        </div>
                     )}

                     <div className="absolute inset-y-0 left-0 flex items-center px-4">
                        <button disabled={catalogPage === 0} onClick={() => setCatalogPage(p => p - 1)} className="w-12 h-12 rounded-full bg-black/80 border border-white/10 flex items-center justify-center disabled:opacity-0 transition-opacity hover:border-amber-500">←</button>
                     </div>
                     <div className="absolute inset-y-0 right-0 flex items-center px-4">
                        <button disabled={catalogPage >= totalPages - 1} onClick={() => setCatalogPage(p => p + 1)} className="w-12 h-12 rounded-full bg-black/80 border border-white/10 flex items-center justify-center disabled:opacity-0 transition-opacity hover:border-amber-500">→</button>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="p-8 lg:p-16 max-w-6xl mx-auto space-y-12 pb-32">
               <header className="flex flex-col gap-2">
                  <h2 className="text-3xl lg:text-5xl font-serif gold-text">{activeCategory} Studio</h2>
                  <p className="text-neutral-500 text-[10px] uppercase tracking-[0.4em]">Explorando Tendencias Globales</p>
               </header>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCatalog.slice(0, 6).map(item => (
                    <div key={item.id} onClick={() => selectOutfit(item)} className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/5 bg-neutral-900 cursor-pointer shadow-2xl">
                       <img src={item.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" alt={item.name} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent p-10 flex flex-col justify-end">
                          <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest mb-2">{item.subCategory}</span>
                          <h4 className="text-2xl font-serif text-white">{item.name}</h4>
                          <div className={`mt-4 px-6 py-2 rounded-full text-[8px] font-bold uppercase transition-all ${isSelected(item) ? 'bg-amber-500 text-black' : 'bg-white/10 text-white border border-white/10'}`}>
                             {isSelected(item) ? 'Seleccionado' : 'Elegir'}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="py-20 flex flex-col items-center gap-6 text-center border-t border-white/5 mt-20">
                  <p className="text-neutral-600 text-[10px] uppercase font-bold tracking-[0.3em]">Accede a nuestra colección completa</p>
                  <button onClick={() => setActiveTab('CatalogBook')} className="btn-gold px-12 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl">Abrir Catálogo Luxury (Incluye Lentes de Sol)</button>
               </div>
            </div>
          )}
        </section>
      </main>

      {/* STUDIO VIEW */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-in fade-in duration-500">
          <header className="h-16 lg:h-20 glass flex items-center justify-between px-6 shrink-0">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                   <span className="text-[10px] font-mono tracking-widest uppercase">8K_RAW_STREAM</span>
                </div>
                <button onClick={toggleVoice} className={`px-5 py-2 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all ${isListening ? 'bg-amber-500 text-black border-amber-500 animate-pulse' : 'border-white/20 text-neutral-500'}`}>
                   {isListening ? '🎙️ Escuchando Comandos' : '🎙️ Control de Voz'}
                </button>
             </div>
             <button onClick={() => setIsStageOpen(false)} className="text-[10px] font-bold uppercase text-red-500 border border-red-500/20 px-6 py-2 rounded-xl">Cerrar Monitor</button>
          </header>

          <div className="flex-grow relative flex items-center justify-center p-6 bg-[#010101] overflow-hidden">
             <div className="relative w-full h-full max-w-[420px] aspect-[9/16] bg-neutral-900 rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] border border-white/10 group">
                {isGenerating ? (
                  <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-12 text-center gap-8">
                     <div className="w-16 h-16 border-t-2 border-amber-500 rounded-full animate-spin flex items-center justify-center">
                        <span className="font-serif text-amber-500 text-3xl">G</span>
                     </div>
                     <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-amber-500 animate-pulse">Adaptando Estilo...</p>
                  </div>
                ) : currentView ? (
                  <img src={currentView} className="w-full h-full object-cover animate-in zoom-in-95 duration-1000" alt="Master Look" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                     <p className="text-[10px] uppercase font-bold tracking-widest">Sincronizando...</p>
                  </div>
                )}
             </div>

             <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 max-w-[90vw] overflow-x-auto no-scrollbar">
                {ANGLES.map(a => (
                   <button key={a.name} onClick={() => setAngle(a.name as Angle)} className={`whitespace-nowrap px-6 py-2 rounded-xl text-[9px] font-bold uppercase transition-all ${angle === a.name ? 'bg-amber-500 text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}>{a.name}</button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
