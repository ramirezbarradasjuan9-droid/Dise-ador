
import React, { useState, useRef } from 'react';
import { CATALOGO, MI_PERFIL } from './constants';
import { Outfit, GalleryItem } from './types';
import { geminiService } from './services/geminiService';

export default function App() {
  const [selected, setSelected] = useState<Outfit>(CATALOGO[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [referenceImg, setReferenceImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImg(reader.result as string);
        // Al cargar una foto nueva, limpiamos la vista previa actual para invitar a generar una nueva
        setCurrentView(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSimulate = async () => {
    if (!referenceImg) return;
    setIsGenerating(true);
    try {
      const url = await geminiService.generateOutfitPreview(MI_PERFIL, selected, referenceImg);
      setCurrentView(url);
      
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        url: url,
        outfitName: selected.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setGallery(prev => [newItem, ...prev]);
    } catch (error) {
      alert("Error en el taller digital. Verifica tu conexión o intenta con otra foto.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      {/* Header Boutique */}
      <header className="h-20 glass border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-200 flex items-center justify-center font-serif text-black font-bold text-xl">G</div>
          <div>
            <h1 className="text-xl font-serif font-bold uppercase tracking-widest gold-text">Gala Vision Studio</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Personal Designer AI</p>
          </div>
        </div>
        <div className="hidden lg:flex gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
          <span className="text-amber-500">Atelier Virtual</span>
          <span className="hover:text-white cursor-pointer">Colecciones Modernas</span>
          <span className="hover:text-white cursor-pointer">Ajuste de Silueta</span>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Sidebar: Referencia y Catálogo */}
        <aside className="lg:col-span-3 border-r border-white/5 p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-80px)] bg-[#080808]">
          
          {/* Zona de Carga de Modelo - REDISEÑADA */}
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold">1. Cargar Modelo</h2>
            <div className="relative group">
              <button 
                onClick={triggerUpload}
                className={`w-full aspect-square rounded-3xl overflow-hidden border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center ${
                  referenceImg ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 bg-white/5 hover:border-amber-500/30'
                }`}
              >
                {referenceImg ? (
                  <div className="w-full h-full relative">
                    <img src={referenceImg} className="w-full h-full object-cover rounded-2xl" alt="Modelo de referencia" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white">Cambiar Foto</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-[11px] text-white font-bold uppercase tracking-widest mb-1">Presiona para subir</p>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-tighter">Sube la foto de la modelo de 1.60m</p>
                  </>
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
                capture="environment"
              />
            </div>
            {referenceImg && (
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] text-amber-200 leading-relaxed italic">
                  ✓ Foto lista. La IA aplicará los diseños sobre sus facciones y cuerpo de 1.60m.
                </p>
              </div>
            )}
          </section>

          {/* Catálogo */}
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.3em] text-white font-bold">2. Elegir Diseño</h2>
            <div className="space-y-3">
              {CATALOGO.map(outfit => (
                <button
                  key={outfit.id}
                  onClick={() => setSelected(outfit)}
                  className={`w-full group p-3 rounded-2xl border transition-all duration-300 ${selected.id === outfit.id ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 hover:bg-white/5'}`}
                >
                  <div className="flex gap-4">
                    <img src={outfit.thumbnail} className="w-14 h-14 object-cover rounded-xl grayscale group-hover:grayscale-0" alt={outfit.name} />
                    <div className="text-left">
                      <p className="text-[8px] uppercase font-bold text-amber-500 mb-1">{outfit.designer}</p>
                      <h3 className="text-sm font-serif">{outfit.name}</h3>
                      <p className="text-[9px] text-neutral-500 italic mt-1">{outfit.style}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Galería */}
          {gallery.length > 0 && (
            <section className="pt-6 border-t border-white/5">
              <h2 className="text-xs uppercase tracking-[0.3em] text-white font-bold mb-4">Simulaciones Guardadas</h2>
              <div className="grid grid-cols-3 gap-2">
                {gallery.map(item => (
                  <div key={item.id} onClick={() => setCurrentView(item.url)} className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-amber-500 transition-all">
                    <img src={item.url} className="w-full h-full object-cover" alt="Resultado" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Visualizador Principal */}
        <section className="lg:col-span-9 bg-[#020202] p-6 md:p-12 flex flex-col relative">
          <div className="flex-grow glass rounded-[3rem] overflow-hidden relative flex items-center justify-center border border-white/5 shadow-2xl bg-gradient-to-b from-neutral-900/20 to-transparent">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 border-b-2 border-amber-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-serif text-amber-500 text-3xl">G</div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-serif italic text-amber-500">Vistiendo a la modelo...</h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] mt-2">Adaptando {selected.name} a su fisionomía</p>
                </div>
              </div>
            ) : currentView ? (
              <div className="w-full h-full relative animate-in fade-in duration-1000">
                <img src={currentView} className="w-full h-full object-contain" alt="Resultado de simulación" />
                <div className="absolute bottom-12 left-12">
                  <span className="text-amber-500 text-[10px] uppercase tracking-[0.3em] font-bold">Diseño Final</span>
                  <h4 className="text-4xl font-serif text-white mt-1">{selected.name}</h4>
                  <p className="text-sm text-neutral-400 font-light italic mt-2">Personalizado para estatura 1.60m</p>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-lg space-y-8 p-12">
                <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-white/10 animate-pulse">
                  <svg className="w-10 h-10 text-amber-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-serif gold-text">Estudio de Imagen</h2>
                  <p className="text-neutral-500 text-sm leading-relaxed italic">
                    "Para comenzar, sube la foto de la mujer en el paso 1 a la izquierda. Mi sistema IA utilizará su rostro y proporciones para mostrarte cómo luce cada vestido."
                  </p>
                </div>
                {!referenceImg && (
                  <button 
                    onClick={triggerUpload}
                    className="inline-flex items-center gap-3 px-8 py-3 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Haga clic aquí para subir la foto
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSimulate}
              disabled={isGenerating || !referenceImg}
              className={`group relative px-24 py-5 rounded-full font-bold uppercase tracking-[0.4em] text-[10px] transition-all duration-500 ${
                isGenerating || !referenceImg 
                ? 'bg-neutral-900 text-neutral-600 opacity-50 cursor-not-allowed' 
                : 'btn-gold text-black hover:scale-105 shadow-[0_10px_40px_rgba(212,175,55,0.2)]'
              }`}
            >
              <span className="relative z-10">{!referenceImg ? 'SUBE UNA FOTO A LA IZQUIERDA' : isGenerating ? 'DISEÑANDO...' : 'VESTIR A LA MODELO'}</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="h-12 border-t border-white/5 flex items-center justify-center text-[8px] uppercase tracking-[0.5em] text-neutral-700">
        ATELIER DIGITAL GALA VISION • ALTA COSTURA PERSONALIZADA
      </footer>
    </div>
  );
}
