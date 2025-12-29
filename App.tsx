
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CATALOGO, ANGLES, MI_PERFIL } from './constants';
import { ClothingItem, Category, Angle, Pose, UserProfile } from './types';
import { geminiService } from './services/geminiService';

const CATEGORIES: Category[] = ['Gala', 'Casual', 'Deportiva', 'Dormir', 'Jeans', 'Shorts', 'Accesorios'];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [modal, setModal] = useState<{show: boolean, title: string, msg: string, type: 'info' | 'error'}>({ show: false, title: '', msg: '', type: 'info' });
  
  const [activeTab, setActiveTab] = useState<'Lookbook' | 'Gallery'>('Lookbook');
  const [activeCategory, setActiveCategory] = useState<Category>('Gala');
  const [catalogPage, setCatalogPage] = useState(0);
  const itemsPerPage = 2; // Para emular páginas de revista

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
            showInfo("Voz Detectada", `Sincronizando diseño en color: ${color}`);
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
      showInfo("Voz Activada", "Di el ángulo o 'cambia el color a azul'");
    }
  };

  const handleSimulate = async (silent = false) => {
    if (!currentUser?.referenceImg) return showError("Identidad", "Sube tu foto primero.");
    if (!selectedFull && !selectedTop) return showError("Diseño", "Elige una prenda del catálogo.");
    
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
      showError("Error", "No se pudo renderizar la imagen.");
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
        showInfo("Éxito", "Identidad vinculada correctamente.");
      };
      reader.readAsDataURL(file);
    }
  };

  const selectOutfit = (item: ClothingItem) => {
    if (item.type === 'Completo' || item.type === 'Accesorio') {
      if (item.category === 'Accesorios') {
        setSelectedAccessories(prev => prev.some(a => a.id === item.id) ? prev.filter(a => a.id !== item.id) : [...prev, item]);
      } else {
        setSelectedFull(item);
        setSelectedTop(null);
        setSelectedBottom(null);
      }
    } else if (item.type === 'Superior') {
      setSelectedTop(item);
      setSelectedFull(null);
    } else if (item.type === 'Inferior') {
      setSelectedBottom(item);
      setSelectedFull(null);
    }
    showInfo("Añadido", `${item.name} se ha configurado para tu look.`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020202] overflow-x-hidden">
      {/* MODAL SYSTEM */}
      {modal.show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setModal({...modal, show: false})} />
          <div className={`relative w-full max-w-xs p-6 rounded-[2.5rem] border ${modal.type === 'error' ? 'border-red-500/30' : 'border-amber-500/30'} bg-neutral-900 shadow-2xl text-center animate-in zoom-in-95`}>
            <h3 className="text-sm font-serif gold-text mb-2 tracking-widest uppercase">{modal.title}</h3>
            <p className="text-[10px] text-neutral-400 mb-6">{modal.msg}</p>
            <button onClick={() => setModal({...modal, show: false})} className="w-full btn-gold py-3 rounded-xl text-[9px] uppercase font-bold tracking-widest">Cerrar</button>
          </div>
        </div>
      )}

      {/* HEADER COMPACTO */}
      <header className="h-16 lg:h-20 glass sticky top-0 z-[100] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-serif text-black font-bold">G</div>
          <span className="text-[9px] lg:text-[11px] font-serif gold-text tracking-[0.2em] uppercase">Gala Vision Master</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('Lookbook')} className={`px-4 py-2 rounded-full text-[8px] font-bold uppercase ${activeTab === 'Lookbook' ? 'bg-amber-500 text-black' : 'text-neutral-500'}`}>Libro</button>
          <button onClick={() => setActiveTab('Gallery')} className={`px-4 py-2 rounded-full text-[8px] font-bold uppercase ${activeTab === 'Gallery' ? 'bg-amber-500 text-black' : 'text-neutral-500'}`}>Archivo</button>
        </div>
      </header>

      {/* CATEGORY SELECTOR (Horizontal Scroll en móvil) */}
      <nav className="bg-black/40 border-b border-white/5 px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar sticky top-16 lg:top-20 z-[90]">
        {CATEGORIES.map(cat => (
          <button 
            key={cat} 
            onClick={() => { setActiveCategory(cat); setCatalogPage(0); }} 
            className={`whitespace-nowrap px-6 py-2 rounded-full text-[9px] font-bold uppercase transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-neutral-500 hover:text-white'}`}
          >
            {cat}
          </button>
        ))}
      </nav>

      <main className="flex-grow flex flex-col lg:flex-row">
        {/* IDENTIDAD Y ACCIÓN (Lateral en PC, Top en Móvil) */}
        <aside className="w-full lg:w-[320px] bg-[#050505] border-b lg:border-r border-white/5 p-6 flex flex-col gap-6 shrink-0">
          <div className="flex lg:flex-col items-center gap-4">
            <div 
              className="w-24 h-24 lg:w-full aspect-square lg:aspect-[4/5] rounded-3xl bg-neutral-900 border border-white/10 overflow-hidden relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {currentUser?.referenceImg ? (
                <img src={currentUser.referenceImg} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 text-center p-2">
                  <span className="text-xl">📸</span>
                  <p className="text-[7px] font-bold uppercase tracking-widest">Foto</p>
                </div>
              )}
              {isUploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><div className="w-4 h-4 border border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}
            </div>
            <div className="flex-grow lg:w-full space-y-4">
              <input 
                type="text" 
                placeholder="Color: Ej. Azul" 
                value={customColor}
                onChange={e => setCustomColor(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] outline-none focus:border-amber-500"
              />
              <button onClick={() => handleSimulate()} className="w-full btn-gold py-4 rounded-xl text-[9px] font-bold uppercase tracking-widest">Renderizar Master</button>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
        </aside>

        {/* LOOKBOOK INTERACTIVO (Revista) */}
        <section className="flex-grow bg-[#020202] p-4 lg:p-12 relative overflow-y-auto no-scrollbar pb-32">
          {activeTab === 'Lookbook' ? (
            <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-2xl lg:text-4xl font-serif gold-text">{activeCategory} Collection</h2>
                <div className="flex gap-2">
                   <button disabled={catalogPage === 0} onClick={() => setCatalogPage(p => p - 1)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center disabled:opacity-20">←</button>
                   <span className="text-[10px] font-mono flex items-center">PAG {catalogPage + 1} / {totalPages}</span>
                   <button disabled={catalogPage >= totalPages - 1} onClick={() => setCatalogPage(p => p + 1)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center disabled:opacity-20">→</button>
                </div>
              </div>

              {/* Revista Spread (Doble página en PC, Single en Móvil) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                {currentItems.map(item => (
                  <div key={item.id} className="group relative bg-[#080808] rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col shadow-2xl">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img src={item.thumbnail} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110" alt={item.name} />
                    </div>
                    <div className="p-6 lg:p-10 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xl lg:text-2xl font-serif text-white">{item.name}</h4>
                          <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">{item.type} // {item.season}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2 font-light leading-relaxed">{item.description}</p>
                      <button 
                        onClick={() => selectOutfit(item)}
                        className={`w-full py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${selectedFull?.id === item.id || selectedTop?.id === item.id ? 'bg-amber-500 text-black' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                      >
                        {selectedFull?.id === item.id || selectedTop?.id === item.id ? '✓ Seleccionado' : 'Elegir para Render'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 opacity-20 text-center">
              <span className="text-4xl mb-4">🖼️</span>
              <p className="text-[10px] font-bold uppercase tracking-widest">Archivo Visual Vacío</p>
            </div>
          )}
        </section>
      </main>

      {/* STUDIO VIEW (CINE MONITOR) */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col animate-in fade-in duration-500">
          <header className="h-16 glass flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={toggleVoice} className={`px-4 py-2 rounded-full border text-[8px] font-bold uppercase transition-all ${isListening ? 'bg-amber-500 text-black border-amber-500 animate-pulse' : 'border-white/20 text-neutral-500'}`}>
                {isListening ? '🎙️ Escuchando' : '🎙️ Activar Voz'}
              </button>
            </div>
            <button onClick={() => setIsStageOpen(false)} className="text-[9px] uppercase font-bold text-red-500 px-4 py-2 border border-red-500/20 rounded-xl">Cerrar</button>
          </header>

          <div className="flex-grow relative flex items-center justify-center bg-[#010101] p-4 overflow-hidden">
            <div className="relative w-full h-full max-w-[420px] aspect-[9/16] bg-neutral-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 p-10 text-center gap-6">
                  <div className="w-12 h-12 border-t-2 border-amber-500 rounded-full animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 animate-pulse">Procesando {angle}...</p>
                </div>
              ) : currentView ? (
                <img src={currentView} className="w-full h-full object-cover animate-in zoom-in-95 duration-700" alt="Master Render" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-20"><p className="text-[10px] uppercase font-bold">Cargando...</p></div>
              )}
              
              {/* Overlay HUD en el monitor */}
              <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none opacity-50">
                <span className="text-[8px] font-mono text-white">MODE: CINEMA_MASTER</span>
                <span className="text-[8px] font-mono text-amber-500">COLOR_SYNC: {customColor}</span>
              </div>
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 max-w-[90vw] overflow-x-auto no-scrollbar">
               {ANGLES.map(a => (
                 <button key={a.name} onClick={() => setAngle(a.name as Angle)} className={`whitespace-nowrap px-4 py-2 rounded-xl text-[8px] font-bold uppercase transition-all ${angle === a.name ? 'bg-amber-500 text-black' : 'text-neutral-500'}`}>{a.name}</button>
               ))}
            </div>
          </div>

          <footer className="h-16 bg-black border-t border-white/10 px-6 flex items-center justify-between shrink-0 safe-pb">
            <div className="flex flex-col">
              <span className="text-[11px] font-serif gold-text tracking-widest truncate max-w-[150px]">{selectedFull?.name || 'Composición'}</span>
              <span className="text-[7px] font-mono text-neutral-600 uppercase mt-0.5">8K Full Body Perspective</span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
