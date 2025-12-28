
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

  const handleSimulate = async () => {
    if (!referenceImg) {
      alert("Por favor, sube primero la foto de la modelo usando el botón de la cámara.");
      return;
    }
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
      console.error(error);
      alert("Hubo un error al generar el diseño. Intenta nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-amber-500/30 font-sans">
      {/* Navbar Premium */}
      <header className="h-20 glass border-b border-white/10 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-200 flex items-center justify-center font-serif text-black font-bold text-2xl shadow-lg shadow-amber-500/20">G</div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-serif font-bold uppercase tracking-[0.2em] gold-text">Gala Vision Studio</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-bold tracking-widest">Personal Designer AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* BOTÓN DE CARGA EXPLÍCITO EN NAVBAR */}
          <label htmlFor="navbar-upload" className="cursor-pointer px-6 py-2 rounded-full border border-amber-500/40 bg-amber-500/5 text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {referenceImg ? 'Cambiar Foto' : 'Subir Foto'}
            <input id="navbar-upload" type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
          </label>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Panel Izquierdo: Modelo y Catálogo */}
        <aside className="lg:col-span-3 border-r border-white/5 p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-80px)] bg-[#080808]">
          
          <section className="space-y-4">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-bold">1. Tu Referencia</h2>
            
            {/* USAMOS LABEL PARA QUE EL CLIC SEA NATIVO Y NO FALLE */}
            <label htmlFor="sidebar-upload" className={`relative block aspect-[3/4] rounded-3xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group bg-neutral-900/50 ${
                referenceImg ? 'border-amber-500/40' : 'border-white/10 hover:border-amber-500/30'
              }`}>
              {referenceImg ? (
                <>
                  <img src={referenceImg} className="w-full h-full object-cover" alt="Tu Referencia" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Cambiar Imagen</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-2">Subir Foto</h3>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-tighter">Toca para abrir la cámara o galería</p>
                </div>
              )}
              <input id="sidebar-upload" type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
            </label>
            
            {referenceImg && (
              <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Modelo lista</span>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-white font-bold">2. Atuendos de Gala</h2>
            <div className="space-y-3">
              {CATALOGO.map(outfit => (
                <button
                  key={outfit.id}
                  onClick={() => setSelected(outfit)}
                  className={`w-full group p-3 rounded-2xl border transition-all text-left ${
                    selected.id === outfit.id ? 'border-amber-500 bg-amber-500/5' : 'border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="flex gap-4">
                    <img src={outfit.thumbnail} className="w-14 h-14 object-cover rounded-xl grayscale group-hover:grayscale-0" />
                    <div className="flex flex-col justify-center">
                      <p className="text-[8px] uppercase font-bold text-amber-500/70 mb-1">{outfit.designer}</p>
                      <h4 className="text-sm font-serif text-white">{outfit.name}</h4>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {gallery.length > 0 && (
            <section className="pt-6 border-t border-white/5">
              <h2 className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold mb-4 tracking-[0.4em]">Galería</h2>
              <div className="grid grid-cols-3 gap-2">
                {gallery.map(item => (
                  <div key={item.id} onClick={() => setCurrentView(item.url)} className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-amber-500 transition-all">
                    <img src={item.url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Panel Central: Visualización */}
        <section className="lg:col-span-9 bg-[#020202] flex flex-col p-6 md:p-12 relative overflow-hidden items-center justify-center">
          
          <div className="w-full max-w-4xl aspect-[9/16] md:aspect-auto md:flex-grow glass rounded-[2.5rem] overflow-hidden relative flex items-center justify-center border border-white/10 shadow-2xl bg-neutral-900/30">
            {isGenerating ? (
              <div className="text-center p-12 space-y-6">
                <div className="w-24 h-24 border-b-2 border-amber-500 rounded-full animate-spin mx-auto"></div>
                <h3 className="text-2xl font-serif text-amber-500 italic">Diseñando para ti...</h3>
              </div>
            ) : currentView ? (
              <div className="w-full h-full relative group">
                <img src={currentView} className="h-full w-full object-contain md:object-cover animate-in fade-in duration-1000" alt="Vista" />
                <div className="absolute bottom-10 left-10 p-6 glass rounded-2xl border border-white/10">
                   <h4 className="text-3xl font-serif text-white">{selected.name}</h4>
                   <p className="text-xs text-amber-500 uppercase tracking-widest mt-2">Personalizado - 1.60m</p>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-lg px-8 space-y-10">
                {!referenceImg ? (
                  <label htmlFor="main-upload" className="block p-12 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                    <h2 className="text-3xl font-serif text-white mb-4">Empieza aquí</h2>
                    <p className="text-neutral-500 text-sm leading-relaxed italic">
                      "Para poder ver los vestidos sobre tu cuerpo de 1.60m y rasgos específicos, necesitamos una foto de referencia. Toca aquí para subirla."
                    </p>
                    <input id="main-upload" type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </label>
                ) : (
                  <div className="space-y-6">
                    <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                      <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h2 className="text-4xl font-serif gold-text">¡Foto lista!</h2>
                    <p className="text-neutral-400">Has seleccionado el atuendo: <span className="text-white font-bold">{selected.name}</span></p>
                    <p className="text-neutral-500 text-xs italic">Presiona el botón inferior para ver el resultado</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleSimulate}
              disabled={isGenerating || !referenceImg}
              className={`px-20 py-5 rounded-full font-bold uppercase tracking-[0.4em] text-[10px] transition-all duration-500 ${
                isGenerating || !referenceImg 
                ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed opacity-50' 
                : 'btn-gold text-black hover:scale-105 shadow-xl'
              }`}
            >
              {isGenerating ? 'GENERANDO...' : referenceImg ? 'PROBAR VESTIDO' : 'FALTA FOTO DE MODELO'}
            </button>
          </div>
        </section>
      </main>

      <footer className="h-12 border-t border-white/5 flex items-center justify-center text-[8px] uppercase tracking-[0.5em] text-neutral-700 bg-black">
        GALA VISION STUDIO • ALTA COSTURA CON INTELIGENCIA ARTIFICIAL
      </footer>
    </div>
  );
}
