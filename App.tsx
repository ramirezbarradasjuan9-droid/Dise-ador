
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CATALOGO, ANGLES, MI_PERFIL } from './constants';
import { ClothingItem, Category, Angle, Pose, UserProfile } from './types';
import { geminiService } from './services/geminiService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [modal, setModal] = useState<{show: boolean, title: string, msg: string, type: 'info' | 'error'}>({ show: false, title: '', msg: '', type: 'info' });
  
  const [activeTab, setActiveTab] = useState<'Lookbook' | 'Gallery'>('Lookbook');
  const [activeCategory, setActiveCategory] = useState<Category>('Gala');
  const [catalogPage, setCatalogPage] = useState(0);
  const itemsPerPage = 4;

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
          const words = transcript.split(" ");
          const newColor = words[words.length - 1];
          setCustomColor(newColor);
          showInfo("Voz Detectada", `Color actualizado: ${newColor}`);
        }
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  // Regenerar automáticamente al cambiar parámetros por voz
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
      showInfo("Voz Activada", "Dime: 'Gira a la espalda' o 'Cambia el color a azul'");
    }
  };

  const handleSimulate = async (silent = false) => {
    if (!currentUser?.referenceImg) return showError("Identidad Necesaria", "Sube una foto antes de continuar.");
    if (!selectedFull && !selectedTop) return showError("Diseño No Seleccionado", "Elige una prenda del Lookbook.");
    
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
      showError("Error de Renderizado", e.message);
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
        showInfo("Identidad OK", "Referencia vinculada exitosamente.");
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSelection = (item: ClothingItem) => {
    if (item.type === 'Completo') { setSelectedFull(item); setSelectedTop(null); }
    else if (item.type === 'Superior') { setSelectedTop(item); setSelectedFull(null); }
    showInfo("Confirmado", `${item.name} listo para renderizar.`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* MODALES DEL SISTEMA */}
      {modal.show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setModal({...modal, show: false})} />
          <div className={`relative w-full max-w-sm p-8 rounded-[3rem] border ${modal.type === 'error' ? 'border-red-500/30' : 'border-amber-500/30'} bg-neutral-900 shadow-2xl text-center animate-in zoom-in-95`}>
            <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${modal.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
              <span className="text-xl font-bold">{modal.type === 'error' ? '!' : 'i'}</span>
            </div>
            <h3 className="text-lg font-serif gold-text mb-2 tracking-wide uppercase">{modal.title}</h3>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">{modal.msg}</p>
            <button onClick={() => setModal({...modal, show: false})} className="w-full btn-gold py-4 rounded-2xl text-[10px] uppercase font-bold tracking-[0.2em]">Cerrar</button>
          </div>
        </div>
      )}

      {/* HEADER RESPONSIVO */}
      <header className="h-20 lg:h-24 glass sticky top-0 z-[100] px-4 lg:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-6">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-500 rounded-xl flex items-center justify-center font-serif text-black text-xl lg:text-2xl font-bold">G</div>
          <div className="hidden xs:block">
            <h1 className="text-[10px] lg:text-[11px] font-serif gold-text tracking-[0.3em] uppercase">Gala Vision Master</h1>
            <span className="text-[7px] text-neutral-500 font-mono tracking-widest uppercase block">Cinema 8K</span>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <button onClick={() => setActiveTab('Lookbook')} className={`px-4 lg:px-8 py-2 lg:py-3 rounded-full text-[9px] lg:text-[10px] font-bold uppercase transition-all ${activeTab === 'Lookbook' ? 'bg-amber-500 text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}>Lookbook</button>
          <button onClick={() => setActiveTab('Gallery')} className={`px-4 lg:px-8 py-2 lg:py-3 rounded-full text-[9px] lg:text-[10px] font-bold uppercase transition-all ${activeTab === 'Gallery' ? 'bg-amber-500 text-black' : 'text-neutral-500'}`}>Archivo</button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL: Layout adaptable */}
      <main className="flex-grow flex flex-col lg:flex-row overflow-x-hidden">
        {/* PANEL DE CONTROL: Sidebar en PC, Top-Bar en Móvil */}
        <aside className="w-full lg:w-[350px] border-b lg:border-r lg:border-b-0 border-white/5 bg-[#050505] p-6 lg:p-10 space-y-8 lg:space-y-12 shrink-0">
          <div className="space-y-6">
            <h3 className="text-[9px] uppercase font-bold text-amber-500 tracking-widest text-center lg:text-left">Mi Identidad Digital</h3>
            <div 
              className="relative w-40 h-40 lg:w-full aspect-square lg:aspect-[4/5] mx-auto rounded-[2.5rem] lg:rounded-[3.5rem] bg-neutral-900 border border-white/5 overflow-hidden group cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
            >
              {currentUser?.referenceImg ? (
                <img src={currentUser.referenceImg} className="w-full h-full object-cover" alt="Perfil" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 p-6 text-center">
                  <span className="text-3xl mb-2">📸</span>
                  <p className="text-[8px] font-bold uppercase tracking-widest">Tocar para cargar</p>
                </div>
              )}
              {isUploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>

          <div className="space-y-4">
            <h3 className="text-[9px] uppercase font-bold text-amber-500 tracking-widest text-center lg:text-left">Personalizar Color</h3>
            <input 
              type="text" 
              placeholder="Ej: Azul Medianoche" 
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs lg:text-sm outline-none focus:border-amber-500 transition-colors text-center lg:text-left"
            />
          </div>

          <button 
            onClick={() => handleSimulate()} 
            className="w-full btn-gold py-5 lg:py-6 rounded-3xl text-[10px] lg:text-[11px] uppercase font-bold tracking-[0.3em] shadow-2xl active:scale-95 transition-transform"
          >
            Revelar Mi Gala
          </button>
        </aside>

        {/* CATALOGO / GALERIA */}
        <section className="flex-grow p-4 lg:p-12 bg-[#020202] overflow-y-auto no-scrollbar pb-24 lg:pb-12">
          {activeTab === 'Lookbook' ? (
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-12">
              {currentItems.map(item => (
                <div key={item.id} onClick={() => toggleSelection(item)} className="group relative aspect-[4/5] rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden border border-white/5 cursor-pointer shadow-xl">
                  <img src={item.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt={item.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent p-6 lg:p-10 flex flex-col justify-end">
                    <h4 className="text-xl lg:text-3xl font-serif text-white mb-2 lg:mb-4">{item.name}</h4>
                    <div className="w-fit px-4 lg:px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-[8px] lg:text-[9px] uppercase font-bold border border-white/10">Seleccionar Diseño</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 lg:py-40 opacity-20 text-center">
              <span className="text-4xl lg:text-6xl mb-4 lg:mb-8">🖼️</span>
              <p className="text-[10px] lg:text-[12px] font-bold uppercase tracking-widest">Archivo Visual Vacío</p>
            </div>
          )}
        </section>
      </main>

      {/* STUDIO VIEW: Pantalla completa optimizada */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col animate-in fade-in duration-500">
          <header className="h-16 lg:h-20 glass flex items-center justify-between px-4 lg:px-10 shrink-0">
            <div className="flex items-center gap-4 lg:gap-8">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[8px] lg:text-[10px] font-mono tracking-[0.2em] lg:tracking-[0.4em]">REC // 8K_LIVE</span>
              </div>
              <button 
                onClick={toggleVoice} 
                className={`px-4 lg:px-6 py-2 rounded-full border text-[8px] lg:text-[9px] font-bold uppercase tracking-widest transition-all ${isListening ? 'bg-amber-500 text-black border-amber-500 animate-pulse' : 'border-white/20 text-neutral-500'}`}
              >
                {isListening ? '🎙️ Escuchando' : '🎙️ Control de Voz'}
              </button>
            </div>
            <button onClick={() => setIsStageOpen(false)} className="text-[8px] lg:text-[10px] uppercase font-bold text-red-500 border border-red-500/20 px-4 py-2 rounded-xl">Cerrar</button>
          </header>

          <div className="flex-grow relative flex items-center justify-center bg-[#010101] p-4 lg:p-8 overflow-hidden">
            {/* HUD Cinematic Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-20 lg:opacity-100">
               <div className="absolute top-4 lg:top-10 left-4 lg:left-10 w-12 lg:w-20 h-12 lg:h-20 border-t border-l border-white/20 rounded-tl-3xl" />
               <div className="absolute bottom-4 lg:bottom-10 right-4 lg:right-10 w-12 lg:w-20 h-12 lg:h-20 border-b border-r border-white/20 rounded-br-3xl" />
            </div>

            {/* MONITOR DE RENDER */}
            <div className="relative w-full h-full max-w-[min(450px,95vw)] max-h-[85vh] aspect-[9/16] bg-neutral-900 rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 p-10 text-center gap-6 lg:gap-8">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 border-t-2 border-amber-500 rounded-full animate-spin flex items-center justify-center">
                    <span className="font-serif text-amber-500 text-2xl lg:text-3xl">G</span>
                  </div>
                  <div className="space-y-2 lg:space-y-4">
                    <p className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.4em] text-amber-500 animate-pulse">Renderizando Escena</p>
                    <p className="text-[8px] lg:text-[9px] font-mono text-neutral-600 uppercase">Ángulo: {angle}</p>
                  </div>
                </div>
              ) : currentView ? (
                <img src={currentView} className="w-full h-full object-cover animate-in zoom-in-95 duration-700" alt="Master Render" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <p className="text-[10px] uppercase font-bold tracking-widest">Sincronizando Cámara...</p>
                </div>
              )}
            </div>
            
            {/* CONTROLES DE ÁNGULO EN PANTALLA */}
            <div className="absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 flex gap-1 lg:gap-3 bg-black/60 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 max-w-[90vw] overflow-x-auto no-scrollbar">
               {ANGLES.map(a => (
                 <button 
                  key={a.name} 
                  onClick={() => setAngle(a.name as Angle)} 
                  className={`whitespace-nowrap px-4 lg:px-6 py-2 rounded-xl text-[8px] lg:text-[9px] font-bold uppercase transition-all ${angle === a.name ? 'bg-amber-500 text-black' : 'text-neutral-500'}`}
                 >
                  {a.name}
                 </button>
               ))}
            </div>
          </div>

          <footer className="h-16 lg:h-20 bg-black border-t border-white/10 px-6 lg:px-12 flex items-center justify-between shrink-0 safe-pb">
            <div className="flex flex-col">
              <span className="text-[10px] lg:text-[12px] font-serif gold-text tracking-widest truncate max-w-[200px]">{selectedFull?.name || 'Composición'} // {customColor}</span>
              <span className="text-[7px] lg:text-[8px] font-mono text-neutral-600 uppercase tracking-widest mt-0.5">Full Body Cinema Optic</span>
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
