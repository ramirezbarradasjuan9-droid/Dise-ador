
import React, { useState, useEffect, useMemo } from 'react';
import { CATALOGO, MI_PERFIL, COLORS, POSES, ANGLES, MAKEUP_EYESHADOWS, MAKEUP_LIPSTICKS, MAKEUP_BLUSHES, MAKEUP_LIPSTICK_FINISHES, MAKEUP_LIP_CONTOURS } from './constants';
import { ClothingItem, Category, Season, Angle, Pose, GalleryItem, UserProfile, MakeupState, Mood } from './types';
import { geminiService } from './services/geminiService';

const ADMIN_CREDENTIALS = {
  username: 'jorb',
  password: 'dulce2025'
};

const MOODS: { id: Mood, icon: string }[] = [
  { id: 'Serio y Profesional', icon: '👔' },
  { id: 'Carismático y Sonriente', icon: '✨' },
  { id: 'Risueño y Divertido', icon: '😂' },
  { id: 'Misterioso', icon: '👤' }
];

export default function App() {
  // --- Estados de Perfil ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [showWelcome, setShowWelcome] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- Estados de Navegación del Catálogo ---
  const [activeTab, setActiveTab] = useState<'Catalog' | 'Gallery' | 'Admin'>('Catalog');
  const [activeCategory, setActiveCategory] = useState<Category>('Gala');
  const [catalogPage, setCatalogPage] = useState(0);
  const itemsPerPage = 4;

  // --- Mi Selección (Composición del Look) ---
  const [selectedFull, setSelectedFull] = useState<ClothingItem | null>(null);
  const [selectedTop, setSelectedTop] = useState<ClothingItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<ClothingItem[]>([]);
  const [currentMood, setCurrentMood] = useState<Mood>('Carismático y Sonriente');
  
  const [lookColors, setLookColors] = useState({ top: COLORS[0].name, bottom: COLORS[0].name, full: COLORS[0].name });

  // --- Maquillaje ---
  const [makeup, setMakeup] = useState<MakeupState>({
    eyeshadow: MAKEUP_EYESHADOWS[0].name, lipstick: MAKEUP_LIPSTICKS[0].name,
    lipstickFinish: MAKEUP_LIPSTICK_FINISHES[0].name, lipContour: MAKEUP_LIP_CONTOURS[0].name, blush: MAKEUP_BLUSHES[0].name
  });

  // --- Estados del Render / Modal ---
  const [angle, setAngle] = useState<Angle>('Frente');
  const [pose, setPose] = useState<Pose>('Estándar');
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [expertAdvice, setExpertAdvice] = useState<string>("");

  // --- Lógica de Catálogo ---
  const filteredCatalog = useMemo(() => {
    return CATALOGO.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  const currentItems = filteredCatalog.slice(catalogPage * itemsPerPage, (catalogPage + 1) * itemsPerPage);

  // --- Handlers ---
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const usersStr = localStorage.getItem('gala_vision_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    if (isLoginView) {
      if (authForm.username === ADMIN_CREDENTIALS.username && authForm.password === ADMIN_CREDENTIALS.password) {
        setCurrentUser({ username: 'Admin', gallery: [], referenceImg: null });
        setShowWelcome(false);
        return;
      }
      const user = users[authForm.username];
      if (user && user.password === authForm.password) {
        setCurrentUser(user);
        setShowWelcome(false);
      } else setAuthError("Credenciales incorrectas.");
    } else {
      const newUser = { username: authForm.username, password: authForm.password, gallery: [], referenceImg: null };
      users[authForm.username] = newUser;
      localStorage.setItem('gala_vision_users', JSON.stringify(users));
      setCurrentUser(newUser);
      setShowWelcome(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const usersStr = localStorage.getItem('gala_vision_users');
        const users = usersStr ? JSON.parse(usersStr) : {};
        const updatedUser = { ...currentUser, referenceImg: base64 };
        users[currentUser.username] = updatedUser;
        localStorage.setItem('gala_vision_users', JSON.stringify(users));
        setCurrentUser(updatedUser);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleAccessory = (acc: ClothingItem) => {
    const exists = selectedAccessories.find(a => a.id === acc.id);
    if (exists) setSelectedAccessories(prev => prev.filter(a => a.id !== acc.id));
    else setSelectedAccessories(prev => [...prev.filter(a => a.subCategory !== acc.subCategory), acc]);
  };

  const handleSelectOutfit = (item: ClothingItem) => {
    if (item.type === 'Completo') { setSelectedFull(item); setSelectedTop(null); setSelectedBottom(null); }
    else if (item.type === 'Superior') { setSelectedTop(item); setSelectedFull(null); }
    else if (item.type === 'Inferior') { setSelectedBottom(item); setSelectedFull(null); }
  };

  const handleSimulate = async () => {
    if (!currentUser?.referenceImg) return alert("Sube tu foto primero en el panel de 'Identidad'.");
    setIsGenerating(true);
    setIsStageOpen(true);
    try {
      const url = await geminiService.generateOutfitPreview(
        MI_PERFIL, selectedTop, selectedBottom, selectedFull, selectedAccessories,
        { top: lookColors.top, bottom: lookColors.bottom, full: lookColors.full },
        angle, pose, currentUser.referenceImg, makeup, currentMood
      );
      setCurrentView(url);
      if (currentUser) {
        const usersStr = localStorage.getItem('gala_vision_users');
        const users = usersStr ? JSON.parse(usersStr) : {};
        const newItem: GalleryItem = { 
          id: Date.now().toString(), url, 
          outfitDetails: `${selectedFull?.name || 'Look Personalizado'}`, 
          timestamp: new Date().toLocaleTimeString(), angle, pose 
        };
        const updatedUser = { ...currentUser, gallery: [newItem, ...currentUser.gallery] };
        users[currentUser.username] = updatedUser;
        localStorage.setItem('gala_vision_users', JSON.stringify(users));
        setCurrentUser(updatedUser);
      }
    } catch (e) { alert("Error al renderizar."); }
    finally { setIsGenerating(false); }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full glass p-10 rounded-[3rem] border border-amber-500/20 text-center animate-fade">
          <div className="w-20 h-20 bg-amber-500 rounded-3xl mx-auto flex items-center justify-center mb-6"><span className="text-black text-4xl font-serif font-bold">G</span></div>
          <h1 className="text-3xl font-serif gold-text tracking-widest mb-8">GALA VISION</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="text" placeholder="Usuario" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
            <input type="password" placeholder="Contraseña" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            {authError && <p className="text-xs text-red-500">{authError}</p>}
            <button className="w-full btn-gold py-5 rounded-2xl text-black font-bold uppercase tracking-widest text-xs mt-4">Ingresar al Atelier</button>
          </form>
          <button onClick={() => setIsLoginView(!isLoginView)} className="mt-8 text-[10px] text-neutral-500 uppercase font-bold tracking-widest">{isLoginView ? '¿Nuevo? Regístrate' : 'Ya tengo cuenta'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-serif font-bold text-black">G</div>
          <h1 className="text-sm font-serif gold-text tracking-widest uppercase hidden sm:block">Gala Vision Studio</h1>
        </div>
        <div className="flex gap-4">
          {(['Catalog', 'Gallery'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-amber-500 text-black' : 'hover:text-amber-500'}`}>{tab === 'Catalog' ? 'Atelier' : 'Mi Galería'}</button>
          ))}
          <button onClick={() => setShowWelcome(true)} className="text-[10px] font-bold text-neutral-600 hover:text-red-500 uppercase tracking-widest">Salir</button>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
        
        {/* LADO IZQUIERDO: COMPOSTOR DEL LOOK */}
        <aside className="lg:col-span-3 border-r border-white/5 bg-[#080808] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest mb-4">1. Identidad Digital</h3>
            <div className="aspect-square rounded-[2rem] overflow-hidden bg-neutral-900 border-2 border-dashed border-white/5 relative group">
              {currentUser?.referenceImg ? (
                <img src={currentUser.referenceImg} className="w-full h-full object-cover" />
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                  <span className="text-3xl mb-2">📸</span>
                  <span className="text-[9px] font-bold uppercase text-neutral-500">Haz clic para subir tu foto base</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                </label>
              )}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">2. Tu Selección Actual</h3>
              <div className="space-y-2">
                {[
                  { label: 'Outfit', val: selectedFull?.name || selectedTop?.name || 'Vacio' },
                  { label: 'Inferior', val: selectedBottom?.name || '-' },
                  { label: 'Accesorios', val: selectedAccessories.length > 0 ? `${selectedAccessories.length} ítems` : 'Ninguno' }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[8px] uppercase font-bold text-neutral-500">{row.label}</span>
                    <span className="text-[9px] font-bold text-white truncate max-w-[100px]">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">3. Personalidad</h3>
              <div className="grid grid-cols-2 gap-2">
                {MOODS.map(m => (
                  <button key={m.id} onClick={() => setCurrentMood(m.id)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${currentMood === m.id ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/5 text-neutral-600'}`}>
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-[7px] font-bold uppercase text-center">{m.id.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-black">
            <button onClick={handleSimulate} disabled={isGenerating || !currentUser?.referenceImg} className="w-full btn-gold py-5 rounded-2xl text-black font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all">
              {isGenerating ? 'Procesando...' : '✨ Revelar mi Look'}
            </button>
          </div>
        </aside>

        {/* CENTRO: CATÁLOGO TIPO LIBRO (FLIP-BOOK STYLE) */}
        <section className="lg:col-span-9 p-8 lg:p-12 bg-[#020202] overflow-y-auto no-scrollbar">
          {activeTab === 'Catalog' ? (
            <div className="max-w-6xl mx-auto space-y-10">
              {/* Selector de Categoría (Capítulos del Libro) */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 border-b border-white/5">
                {(['Gala', 'Casual', 'Deportiva', 'Accesorios'] as Category[]).map(cat => (
                  <button key={cat} onClick={() => { setActiveCategory(cat); setCatalogPage(0); }} className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${activeCategory === cat ? 'bg-white text-black border-white' : 'border-white/10 text-neutral-500 hover:border-white/30'}`}>{cat}</button>
                ))}
              </div>

              {/* Libro de Diseños */}
              <div className="relative group">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right duration-500">
                  {currentItems.map(item => {
                    const isSelected = selectedFull?.id === item.id || selectedTop?.id === item.id || selectedBottom?.id === item.id || selectedAccessories.some(a => a.id === item.id);
                    return (
                      <div key={item.id} className={`group relative bg-neutral-900 rounded-[2.5rem] overflow-hidden border-2 transition-all cursor-pointer ${isSelected ? 'border-amber-500 ring-8 ring-amber-500/10' : 'border-white/5 hover:border-white/20'}`} onClick={() => item.category === 'Accesorios' ? handleToggleAccessory(item) : handleSelectOutfit(item)}>
                        <img src={item.thumbnail} className="w-full aspect-[4/5] object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-8 flex flex-col justify-end">
                          <h4 className="text-xl font-serif text-white mb-2">{item.name}</h4>
                          <p className="text-[9px] text-neutral-400 uppercase tracking-widest mb-4">{item.description}</p>
                          <div className={`w-full py-3 rounded-xl text-[8px] font-bold uppercase text-center transition-all ${isSelected ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}>
                            {isSelected ? '✓ Seleccionado' : '+ Agregar al Look'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Controles de "Ojeo" de Libro */}
                <div className="mt-12 flex items-center justify-between">
                  <button disabled={catalogPage === 0} onClick={() => setCatalogPage(p => p - 1)} className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center disabled:opacity-10 hover:bg-white/5 transition-all">←</button>
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-600 font-bold uppercase mb-1">Capítulo {activeCategory}</p>
                    <span className="text-[12px] font-serif gold-text">Página {catalogPage + 1} de {Math.ceil(filteredCatalog.length / itemsPerPage)}</span>
                  </div>
                  <button disabled={(catalogPage + 1) * itemsPerPage >= filteredCatalog.length} onClick={() => setCatalogPage(p => p + 1)} className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center disabled:opacity-10 hover:bg-white/5 transition-all">→</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-10">
              <h2 className="text-3xl font-serif gold-text">Mi Galería Privada</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {currentUser?.gallery.map(item => (
                  <div key={item.id} className="aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 relative group cursor-pointer" onClick={() => { setCurrentView(item.url); setIsStageOpen(true); }}>
                    <img src={item.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                      <span className="text-[8px] font-bold uppercase tracking-widest mb-2">Ver en Grande</span>
                      <button onClick={(e) => { e.stopPropagation(); geminiService.generateCustomDesign(item.outfitDetails).then(url => { const a = document.createElement('a'); a.href = url; a.download = 'GalaVision.png'; a.click(); }); }} className="bg-amber-500 text-black p-2 rounded-full">⬇️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODAL SIMULADOR: VISTA DE CUERPO ENTERO */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-500">
          <header className="h-20 glass border-b border-white/10 px-8 flex items-center justify-between">
            <h2 className="text-xl font-serif gold-text uppercase tracking-widest">Vista Previa de Identidad</h2>
            <button onClick={() => setIsStageOpen(false)} className="w-12 h-12 rounded-full glass flex items-center justify-center text-xl hover:text-red-500 transition-all">✕</button>
          </header>
          <div className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
            <aside className="lg:col-span-3 border-r border-white/5 p-8 space-y-8 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Ángulo de Captura</h3>
                <div className="grid grid-cols-2 gap-2">
                  {ANGLES.map(a => (
                    <button key={a.name} onClick={() => setAngle(a.name as Angle)} className={`py-4 rounded-xl text-[9px] font-bold uppercase border transition-all ${angle === a.name ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-neutral-500'}`}>{a.name}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Pose Sugerida</h3>
                <div className="space-y-2">
                  {POSES.map(p => (
                    <button key={p.name} onClick={() => setPose(p.name as Pose)} className={`w-full px-5 py-4 rounded-xl text-[9px] font-bold uppercase border text-left transition-all ${pose === p.name ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-neutral-500'}`}>{p.name}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleSimulate} disabled={isGenerating} className="w-full btn-gold py-5 rounded-2xl text-black font-bold uppercase text-[10px] flex items-center justify-center gap-3">
                {isGenerating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : '📸 Repetir Render'}
              </button>
            </aside>
            <section className="lg:col-span-9 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
              <div className="w-full max-w-[500px] aspect-[9/16] relative bg-neutral-900 rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.2)]">
                {isGenerating ? (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-3xl p-12 text-center gap-6">
                    <div className="w-20 h-20 border-b-2 border-amber-500 rounded-full animate-spin" />
                    <p className="text-[11px] uppercase font-bold tracking-[0.5em] text-amber-500 animate-pulse">Procesando Identidad Digital...</p>
                  </div>
                ) : currentView && (
                  <div className="w-full h-full group">
                    <img src={currentView} className="w-full h-full object-cover animate-in zoom-in-95 duration-1000" />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                      <button onClick={() => { const a = document.createElement('a'); a.href = currentView; a.download = 'GalaLook.png'; a.click(); }} className="px-10 py-4 bg-amber-500 text-black rounded-full text-[10px] font-bold uppercase tracking-widest">Descargar Imagen</button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
