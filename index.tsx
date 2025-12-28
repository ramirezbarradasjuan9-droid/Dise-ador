
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Tipos y Configuración ---
interface Persona {
  height: string;
  hair: string;
  skin: string;
  build: string;
}

interface Outfit {
  id: string;
  name: string;
  style: string;
  description: string;
  prompt: string;
  thumbnail: string;
}

interface GalleryItem {
  id: string;
  url: string;
  outfitName: string;
  timestamp: string;
}

const MI_PERFIL: Persona = {
  height: "1.60m",
  hair: "Cabello negro lacio y sedoso",
  skin: "Morena cálida radiante",
  build: "Delgada y con figura delineada"
};

const CATALOGO: Outfit[] = [
  {
    id: 'gala-oro',
    name: 'Diosa de Oro',
    style: 'Gala Nocturna',
    description: 'Vestido largo en seda dorada con drapeado frontal.',
    thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400',
    prompt: 'Full body fashion shot of a beautiful 1.60m tall slim morena woman with long straight black hair wearing a magnificent liquid gold silk floor-length evening gown, luxury ballroom, warm nocturnal lighting, hyper-realistic.'
  },
  {
    id: 'coctel-rubi',
    name: 'Rubí Imperial',
    style: 'Cóctel Elegante',
    description: 'Corte midi en terciopelo rojo con hombros descubiertos.',
    thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400',
    prompt: 'Medium shot of a beautiful slim woman, 1.60m, morena skin, long black hair, wearing a sophisticated ruby red velvet off-the-shoulder cocktail dress, high-end lounge ambient, professional photography.'
  },
  {
    id: 'noche-esmeralda',
    name: 'Esmeralda Mística',
    style: 'Gala de Gala',
    description: 'Vestido de seda verde esmeralda con abertura lateral.',
    thumbnail: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=400',
    prompt: 'Full body shot of a defined figure slim woman, 1.60m, long straight black hair, morena skin, wearing a flowing emerald green silk gown, high side slit, moonlit luxury garden, cinematic lighting.'
  }
];

// --- Componentes ---

const App = () => {
  const [selected, setSelected] = useState<Outfit>(CATALOGO[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [viewingFromGallery, setViewingFromGallery] = useState(false);

  const handleSimulate = async () => {
    setIsGenerating(true);
    setViewingFromGallery(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: selected.prompt }] },
        config: { imageConfig: { aspectRatio: "9:16" } }
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData) {
        const url = `data:image/png;base64,${part.inlineData.data}`;
        setCurrentView(url);
        
        // Guardar en galería
        const newItem: GalleryItem = {
          id: Date.now().toString(),
          url: url,
          outfitName: selected.name,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setGallery(prev => [newItem, ...prev]);
      }
    } catch (error) {
      console.error("Error en simulación:", error);
      alert("Hubo un problema al conectar con el atelier. Inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Estilo Boutique */}
      <header className="h-20 glass border-b border-white/5 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-200 flex items-center justify-center font-serif text-black font-bold text-xl">G</div>
          <div>
            <h1 className="text-xl font-serif font-bold uppercase tracking-widest gold-text">Gala Vision</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Simulador AI de Alta Costura</p>
          </div>
        </div>
        <div className="hidden lg:flex gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
          <span className="text-amber-500 cursor-default">Simulador</span>
          <a href="#" className="hover:text-white transition-colors">Tendencias</a>
          <a href="#" className="hover:text-white transition-colors">Personalizar</a>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Sidebar: Perfil y Catálogo */}
        <aside className="lg:col-span-3 border-r border-white/5 p-6 md:p-8 space-y-10 overflow-y-auto max-h-[calc(100vh-80px)]">
          
          <section className="animate-fade" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold mb-4">Perfil de Usuario</h2>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500 uppercase">Estatura</span>
                <span className="text-white font-semibold">{MI_PERFIL.height}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500 uppercase">Figura</span>
                <span className="text-white font-semibold italic">{MI_PERFIL.build}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500 uppercase">Tono</span>
                <span className="text-white font-semibold">{MI_PERFIL.skin}</span>
              </div>
            </div>
          </section>

          <section className="animate-fade" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold mb-4">Selección de Diseños</h2>
            <div className="space-y-4">
              {CATALOGO.map(outfit => (
                <button
                  key={outfit.id}
                  onClick={() => setSelected(outfit)}
                  className={`w-full group text-left rounded-2xl overflow-hidden border transition-all duration-500 ${selected.id === outfit.id ? 'border-amber-500 bg-white/10 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'border-transparent hover:bg-white/5'}`}
                >
                  <div className="flex gap-4 p-2">
                    <img src={outfit.thumbnail} className="w-16 h-20 object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all" />
                    <div className="flex flex-col justify-center">
                      <p className="text-[9px] uppercase font-bold text-amber-500/60 mb-1">{outfit.style}</p>
                      <h3 className="font-serif text-sm text-white group-hover:text-amber-200 transition-colors">{outfit.name}</h3>
                      <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1 italic">{outfit.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Galería Dinámica */}
          <section className="animate-fade pt-6 border-t border-white/5" style={{ animationDelay: '0.3s' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs uppercase tracking-[0.3em] text-white font-bold">Mi Galería</h2>
              <span className="text-[10px] text-neutral-600 font-mono">[{gallery.length}]</span>
            </div>
            {gallery.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {gallery.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentView(item.url); setViewingFromGallery(true); }}
                    className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 hover:border-amber-500 transition-all hover:scale-105 relative group"
                  >
                    <img src={item.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-[8px] uppercase text-white font-bold">Ver</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-[10px] uppercase text-neutral-700 tracking-[0.2em]">Atelier Vacío</p>
              </div>
            )}
          </section>
        </aside>

        {/* Simulador / Visualizador */}
        <section className="lg:col-span-9 bg-[#020202] flex flex-col p-6 md:p-10 relative">
          <div className="flex-grow glass rounded-[3rem] overflow-hidden relative flex items-center justify-center shadow-2xl border border-white/5">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-8 animate-fade">
                <div className="relative">
                  <div className="w-20 h-20 border-b-2 border-amber-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-serif text-amber-500 text-2xl">G</div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-serif text-2xl italic">Creando tu reflejo...</h3>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">Ajustando diseño para 1.60m</p>
                </div>
              </div>
            ) : currentView ? (
              <div className="w-full h-full relative group">
                <img src={currentView} className="w-full h-full object-contain md:object-cover animate-in fade-in duration-1000" />
                <div className="absolute top-8 left-8 flex gap-3">
                  <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-amber-500">
                      {viewingFromGallery ? 'Archivo de Galería' : 'Simulación AI'}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-10 left-10 text-left">
                  <h4 className="text-4xl font-serif text-white drop-shadow-2xl mb-2">{selected.name}</h4>
                  <p className="text-xs text-neutral-300 font-light tracking-[0.1em] drop-shadow-lg">A medida para perfil morena delgada</p>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-md px-10 space-y-8 animate-fade">
                <div className="w-24 h-24 mx-auto bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 rotate-3 shadow-inner">
                   <svg className="w-10 h-10 text-amber-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-serif gold-text font-bold">Bienvenida a tu Atelier</h2>
                  <p className="text-neutral-500 text-sm leading-relaxed font-light italic">
                    "Hemos configurado nuestro simulador para tus rasgos únicos. Elige un diseño del catálogo y observa cómo la inteligencia artificial lo adapta a tu silueta de 1.60m y tono de piel."
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSimulate}
              disabled={isGenerating}
              className="group relative btn-gold px-24 py-5 rounded-full text-black font-bold uppercase tracking-[0.4em] text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">{isGenerating ? 'DISEÑANDO...' : 'PROBAR ATUENDO'}</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="h-14 border-t border-white/5 flex items-center justify-center text-[8px] uppercase tracking-[0.5em] text-neutral-700 bg-black">
        Gala Vision © 2024 • Inteligencia Artificial Aplicada a la Moda
      </footer>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
