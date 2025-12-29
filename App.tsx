
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CATALOGO, POSES, ANGLES, MAKEUP_EYESHADOWS, MI_PERFIL } from './constants';
import { ClothingItem, Category, Angle, Pose, GalleryItem, UserProfile, MakeupState } from './types';
import { geminiService } from './services/geminiService';

const STUDIO_LIGHTS = ['Key Light Cinema', 'Red Carpet Flash', 'Soft Box 8K', 'Dramatic Rim'];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
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

  // --- Sistema de Modales ---
  const showInfo = (title: string, msg: string) => setModal({ show: true, title, msg, type: 'info' });
  const showError = (title: string, msg: string) => setModal({ show: true, title, msg, type: 'error' });

  // --- Reconocimiento de Voz ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'es-ES';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Voz detectada:", transcript);

        if (transcript.includes("frente")) setAngle("Frente");
        else if (transcript.includes("espalda")) setAngle("Espalda");
        else if (transcript.includes("lado")) setAngle("Lado");
        else if (transcript.includes("45 grados")) setAngle("45 Grados");
        else if (transcript.includes("cambia el color a")) {
          const words = transcript.split(" ");
          const newColor = words[words.length - 1];
          setCustomColor(newColor);
          showInfo("Voz Detectada", `Cambiando color a: ${newColor}`);
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  // Escuchar cambios para regenerar en modo Studio
  useEffect(() => {
    if (isStageOpen && !isGenerating && currentUser?.referenceImg && (selectedFull || selectedTop)) {
      handleSimulate();
    }
  }, [angle, customColor]);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      showInfo("Voz Activada", "Di 'Gira a la espalda' o 'Cambia el color a azul'");
    }
  };

  const handleSimulate = async () => {
    if (!currentUser?.referenceImg) return showError("Falta Identidad", "Sube tu foto primero.");
    if (!selectedFull && !selectedTop) return showError("Diseño Vacío", "Selecciona una prenda.");
    
    setIsGenerating(true);
    setIsStageOpen(true);
    try {
      const url = await geminiService.generateOutfitPreview(
        MI_PERFIL, selectedTop, selectedBottom, selectedFull, selectedAccessories,
        customColor, angle, pose, currentUser.referenceImg, 
        { eyeshadow: 'Natural', lipstick: 'Nude', lipstickFinish: 'brillante', lipContour: 'Natural', blush: 'Melocotón' }
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
        setCurrentUser({ username: 'Invitado', referenceImg: ev.target?.result as string, gallery: [] });
        setIsUploading(false);
        showInfo("Identidad Vinculada", "Foto cargada correctamente para el estudio.");
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSelection = (item: ClothingItem) => {
    if (item.type === 'Completo') { setSelectedFull(item); setSelectedTop(null); }
    else if (item.type === 'Superior') { setSelectedTop(item); setSelectedFull(null); }
    showInfo("Diseño", `${item.name} seleccionado.`);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
      {/* MODAL SYSTEM */}
      {modal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setModal({...modal, show: false})} />
          <div className={`relative max-w-sm w-full p-8 rounded-[2.5rem] border ${modal.type === 'error' ? 'border-red-500/50' : 'border-amber-500/50'} bg-[#0a0a0a] shadow-2xl text-center transform animate-in zoom-in-95`}>
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${modal.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
              {modal.type === 'error' ? '!' : 'i'}
            </div>
            <h3 className="text-xl font-serif gold-text mb-3">{modal.title}</h3>
            <p className="text-sm text-neutral-400 mb-8">{modal.msg}</p>
            <button onClick={() => setModal({...modal, show: false})} className="w-full btn-gold py-4 rounded-2xl text-[10px] uppercase font-bold tracking-widest">Entendido</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="h-24 glass border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center font-serif text-black text-2xl font-bold">G</div>
          <div>
            <h1 className="text-[11px] font-serif gold-text tracking-[0.4em] uppercase">Gala Vision Master</h1>
            <span className="text-[7px] text-neutral-600 font-mono tracking-widest uppercase">Cinema Studio 8K</span>
          </div>
        </div>
        <nav className="flex gap-4">
          <button onClick={() => setActiveTab('Lookbook')} className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase transition-all ${activeTab === 'Lookbook' ? 'bg-amber-500 text-black' : 'text-neutral-500'}`}>Lookbook</button>
          <button onClick={() => setActiveTab('Gallery')} className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase transition-all ${activeTab === 'Gallery' ? 'bg-amber-500 text-black' : 'text-neutral-500'}`}>Archivo</button>
        </nav>
      </header>

      <main className="lg:grid lg:grid-cols-12 h-[calc(100vh-6rem)] overflow-hidden">
        {/* PANEL DE CONTROL */}
        <aside className="lg:col-span-3 border-r border-white/5 bg-[#050505] p-8 space-y-12 overflow-y-auto no-scrollbar">
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Identidad Modelado</h3>
            <div className="aspect-[4/5] rounded-[3rem] bg-neutral-900 border-2 border-white/5 overflow-hidden relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {currentUser?.referenceImg ? (
                <img src={currentUser.referenceImg} className="w-full h-full object-cover" alt="Identidad" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                  <span className="text-4xl mb-4">📸</span>
                  <p className="text-[9px] font-bold uppercase tracking-widest">Cargar Referencia</p>
                </div>
              )}
              {isUploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Diseño & Color</h3>
              <span className="text-[8px] font-mono text-white/30">{customColor}</span>
            </div>
            <input 
              type="text" 
              placeholder="Ej: Rojo Pasión" 
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs outline-none focus:border-amber-500"
            />
          </div>

          <button onClick={handleSimulate} className="w-full btn-gold py-6 rounded-3xl text-[11px] uppercase font-bold tracking-[0.3em] shadow-2xl">Visualizar Master</button>
        </aside>

        {/* LOOKBOOK O ARCHIVO */}
        <section className="lg:col-span-9 p-12 overflow-y-auto no-scrollbar bg-[#020202]">
          {activeTab === 'Lookbook' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {currentItems.map(item => (
                <div key={item.id} onClick={() => toggleSelection(item)} className="group relative aspect-[4/5] rounded-[3.5rem] overflow-hidden border-2 border-white/5 cursor-pointer">
                  <img src={item.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt={item.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent p-12 flex flex-col justify-end">
                    <h4 className="text-3xl font-serif text-white mb-4">{item.name}</h4>
                    <div className="w-fit px-6 py-2 bg-white/10 rounded-full text-[9px] uppercase font-bold border border-white/10">Seleccionar</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 opacity-20"><p className="text-[12px] font-bold uppercase tracking-widest">Galería de renders no disponible</p></div>
          )}
        </section>
      </main>

      {/* STUDIO VIEW MODAL (CINE SET) */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-500">
          <header className="h-20 glass border-b border-white/10 px-10 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.4em]">LIVE // CINEMA_MONITOR</span>
              </div>
              <button onClick={toggleVoice} className={`px-6 py-2 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all ${isListening ? 'bg-amber-500 text-black border-amber-500 animate-pulse' : 'border-white/20 text-neutral-500 hover:text-white'}`}>
                {isListening ? '🎙️ Escuchando...' : '🎙️ Activar Voz'}
              </button>
            </div>
            <button onClick={() => setIsStageOpen(false)} className="text-[10px] uppercase font-bold text-red-500 tracking-widest px-6 py-2 border border-red-500/20 rounded-xl">Cerrar Monitor</button>
          </header>

          <div className="flex-grow relative flex items-center justify-center bg-[#010101] overflow-hidden">
            {/* Visual Cinema Studio */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-white/5 rounded-tl-[3rem]" />
              <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-white/5 rounded-br-[3rem]" />
              {/* Luces de estudio simuladas */}
              <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-[80%] bg-white/5 blur-[100px]" />
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-[80%] bg-amber-500/5 blur-[100px]" />
            </div>

            <div className="relative w-full h-full max-w-[500px] aspect-[9/16] bg-neutral-900 rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-12 text-center gap-8">
                  <div className="w-24 h-24 border-t-2 border-amber-500 rounded-full animate-spin flex items-center justify-center">
                    <span className="font-serif text-amber-500 text-3xl">G</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-amber-500 animate-pulse">Renderizando Perspectiva de {angle}...</p>
                </div>
              ) : currentView ? (
                <img src={currentView} className="w-full h-full object-cover animate-in zoom-in-95 duration-1000" alt="Master Cinema Render" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center opacity-30">
                  <p className="text-xs uppercase font-bold tracking-widest mb-4">Esperando Señal de Render</p>
                  <p className="text-[9px] font-mono text-neutral-500 italic">Distancia de cámara: Full Body Shot (Cinema Standard)</p>
                </div>
              )}

              {/* HUD Cinematic Overlay */}
              <div className="absolute top-12 left-10 pointer-events-none opacity-40">
                <div className="text-[10px] font-mono text-white mb-1">FPS: 24.0</div>
                <div className="text-[9px] font-mono text-amber-500 tracking-widest uppercase">Angle: {angle}</div>
              </div>
            </div>
            
            {/* Controles Rápidos en el Set */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 bg-black/40 backdrop-blur-xl p-3 rounded-3xl border border-white/10">
               {ANGLES.map(a => (
                 <button key={a.name} onClick={() => setAngle(a.name as Angle)} className={`px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase transition-all ${angle === a.name ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}>{a.name}</button>
               ))}
            </div>
          </div>

          <footer className="h-20 bg-black border-t border-white/10 px-12 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-serif gold-text tracking-widest">{selectedFull?.name || 'Composición'} // {customColor}</span>
              <span className="text-[8px] font-mono text-neutral-600 uppercase">Procesamiento AI de Cuerpo Completo Activado</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500/30" />
              <div className="w-2 h-2 rounded-full bg-amber-500/60" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
