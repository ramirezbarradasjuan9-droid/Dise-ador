
import React, { useState, useEffect, useMemo } from 'react';
import { CATALOGO, COLORS, POSES, ANGLES, MAKEUP_EYESHADOWS, MAKEUP_LIPSTICKS, MAKEUP_BLUSHES, MAKEUP_LIPSTICK_FINISHES, MAKEUP_LIP_CONTOURS, MI_PERFIL } from './constants';
import { ClothingItem, Category, Angle, Pose, GalleryItem, UserProfile, MakeupState, Mood } from './types';
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
  // --- Perfil y Autenticación ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [showWelcome, setShowWelcome] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- Navegación del Lookbook ---
  const [activeTab, setActiveTab] = useState<'Lookbook' | 'Gallery'>('Lookbook');
  const [activeCategory, setActiveCategory] = useState<Category>('Gala');
  const [catalogPage, setCatalogPage] = useState(0);
  const itemsPerPage = 4;

  // --- Mi Composición (Lo que el usuario va eligiendo) ---
  const [selectedFull, setSelectedFull] = useState<ClothingItem | null>(null);
  const [selectedTop, setSelectedTop] = useState<ClothingItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<ClothingItem[]>([]);
  const [currentMood, setCurrentMood] = useState<Mood>('Carismático y Sonriente');
  const [makeup, setMakeup] = useState<MakeupState>({
    eyeshadow: MAKEUP_EYESHADOWS[0].name,
    lipstick: MAKEUP_LIPSTICKS[0].name,
    lipstickFinish: MAKEUP_LIPSTICK_FINISHES[0].name,
    lipContour: MAKEUP_LIP_CONTOURS[0].name,
    blush: MAKEUP_BLUSHES[0].name
  });

  // --- Simulador / Render ---
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [angle, setAngle] = useState<Angle>('Frente');
  const [pose, setPose] = useState<Pose>('Estándar');

  // --- Filtros de Catálogo ---
  const filteredCatalog = useMemo(() => {
    return CATALOGO.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  const currentItems = filteredCatalog.slice(catalogPage * itemsPerPage, (catalogPage + 1) * itemsPerPage);

  // --- Cargar usuario inicial si existe ---
  useEffect(() => {
    const savedUser = localStorage.getItem('gala_vision_active_user');
    if (savedUser) {
      const users = JSON.parse(localStorage.getItem('gala_vision_users') || '{}');
      if (users[savedUser]) {
        setCurrentUser(users[savedUser]);
        setShowWelcome(false);
      }
    }
  }, []);

  // --- Acciones ---
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const usersStr = localStorage.getItem('gala_vision_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    
    if (isLoginView) {
      if (authForm.username === ADMIN_CREDENTIALS.username && authForm.password === ADMIN_CREDENTIALS.password) {
        const adminUser = { username: 'Admin', gallery: [], referenceImg: null };
        setCurrentUser(adminUser);
        localStorage.setItem('gala_vision_active_user', 'Admin');
        setShowWelcome(false);
        return;
      }
      const user = users[authForm.username];
      if (user && user.password === authForm.password) {
        setCurrentUser(user);
        localStorage.setItem('gala_vision_active_user', authForm.username);
        setShowWelcome(false);
      } else setAuthError("Credenciales inválidas.");
    } else {
      const newUser = { username: authForm.username, password: authForm.password, gallery: [], referenceImg: null };
      users[authForm.username] = newUser;
      localStorage.setItem('gala_vision_users', JSON.stringify(users));
      setCurrentUser(newUser);
      localStorage.setItem('gala_vision_active_user', authForm.username);
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

  const toggleSelection = (item: ClothingItem) => {
    if (item.category === 'Accesorios') {
      const exists = selectedAccessories.find(a => a.id === item.id);
      if (exists) setSelectedAccessories(prev => prev.filter(a => a.id !== item.id));
      else setSelectedAccessories(prev => [...prev.filter(a => a.subCategory !== item.subCategory), item]);
    } else if (item.type === 'Completo') {
      setSelectedFull(item); setSelectedTop(null); setSelectedBottom(null);
    } else if (item.type === 'Superior') {
      setSelectedTop(item); setSelectedFull(null);
    } else if (item.type === 'Inferior') {
      setSelectedBottom(item); setSelectedFull(null);
    }
  };

  const handleSimulate = async () => {
    if (!currentUser?.referenceImg) return alert("Primero sube tu foto en el panel de 'Mi Identidad Real'.");
    setIsGenerating(true);
    setIsStageOpen(true);
    try {
      const url = await geminiService.generateOutfitPreview(
        MI_PERFIL, selectedTop, selectedBottom, selectedFull, selectedAccessories,
        { top: 'Negro', bottom: 'Negro', full: 'Gala' },
        angle, pose, currentUser.referenceImg, makeup, currentMood
      );
      setCurrentView(url);
      
      if (currentUser) {
        const usersStr = localStorage.getItem('gala_vision_users');
        const users = usersStr ? JSON.parse(usersStr) : {};
        const newItem: GalleryItem = {
          id: Date.now().toString(),
          url,
          outfitDetails: `${selectedFull?.name || 'Look Personalizado'} (${currentMood})`,
          timestamp: new Date().toLocaleString(),
          angle,
          pose,
          isFavorite: false
        };
        const updatedUser = { ...currentUser, gallery: [newItem, ...currentUser.gallery] };
        users[currentUser.username] = updatedUser;
        localStorage.setItem('gala_vision_users', JSON.stringify(users));
        setCurrentUser(updatedUser);
      }
    } catch (e) {
      alert("Error al procesar el diseño.");
      setIsStageOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('gala_vision_active_user');
    setShowWelcome(true);
    setCurrentUser(null);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full glass p-10 rounded-[3rem] border border-amber-500/20 text-center animate-fade">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <span className="text-black text-3xl font-serif font-bold">G</span>
          </div>
          <h1 className="text-2xl font-serif gold-text tracking-[0.4em] uppercase mb-8">Gala Vision</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="text" placeholder="Usuario" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-amber-500/50" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
            <input type="password" placeholder="Contraseña" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-amber-500/50" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            {authError && <p className="text-xs text-red-500">{authError}</p>}
            <button className="w-full btn-gold py-5 rounded-2xl text-black font-bold uppercase tracking-widest text-xs mt-4">Entrar al Atelier</button>
          </form>
          <button onClick={() => setIsLoginView(!isLoginView)} className="mt-8 text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
            {isLoginView ? '¿No tienes cuenta? Regístrate' : 'Ya tengo cuenta'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      {/* HEADER */}
      <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-serif font-bold text-black text-xl">G</div>
          <h1 className="text-sm font-serif gold-text tracking-widest uppercase hidden sm:block">Atelier Digital Gala Vision</h1>
        </div>
        
        <nav className="flex items-center gap-2">
          {(['Lookbook', 'Gallery'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-amber-500 text-black' : 'text-neutral-500 hover:text-white'}`}>
              {tab === 'Lookbook' ? '📖 Lookbook' : '🖼️ Mis Diseños'}
            </button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button onClick={logout} className="text-[10px] font-bold text-neutral-600 hover:text-red-500 uppercase">Salir</button>
        </nav>
      </header>

      <main className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
        
        {/* PANEL IZQUIERDO: COMPOSICIÓN Y MI FOTO */}
        <aside className="lg:col-span-3 border-r border-white/5 bg-[#080808] flex flex-col overflow-y-auto no-scrollbar">
          <div className="p-6 space-y-8">
            {/* MI FOTO BASE */}
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest flex items-center justify-between">
                1. Mi Identidad Real
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </h3>
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-neutral-900 border-2 border-dashed border-white/10 relative group">
                {currentUser?.referenceImg ? (
                  <>
                    <img src={currentUser.referenceImg} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <span className="text-[9px] font-bold uppercase">Cambiar Foto</span>
                      <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                    </label>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-8 text-center">
                    <span className="text-3xl mb-4">📸</span>
                    <p className="text-[10px] font-bold uppercase text-neutral-500">Sube tu foto para el simulador real</p>
                    <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </label>
                )}
              </div>
            </div>

            {/* SELECCIÓN ACTUAL */}
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">2. Mi Composición</h3>
              <div className="space-y-2">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[8px] text-neutral-500 font-bold uppercase">Outfit Principal</span>
                  <span className="text-[11px] font-bold text-white truncate">{selectedFull?.name || selectedTop?.name || 'Vacío'}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[8px] text-neutral-500 font-bold uppercase">Accesorios</span>
                  <span className="text-[11px] font-bold text-white truncate">
                    {selectedAccessories.length > 0 ? selectedAccessories.map(a => a.name).join(', ') : 'Ninguno'}
                  </span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[8px] text-neutral-500 font-bold uppercase">Actitud</span>
                  <span className="text-[11px] font-bold text-white">{currentMood}</span>
                </div>
              </div>
            </div>

            {/* BOTÓN RENDER */}
            <button 
              onClick={handleSimulate} 
              disabled={isGenerating || !currentUser?.referenceImg}
              className="w-full btn-gold py-6 rounded-[1.5rem] text-black font-bold uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isGenerating ? 'Generando...' : '✨ Revelar mi Look'}
            </button>
          </div>
        </aside>

        {/* CONTENIDO CENTRAL: LOOKBOOK O GALERÍA */}
        <section className="lg:col-span-9 bg-[#020202] overflow-y-auto no-scrollbar p-6 lg:p-12">
          {activeTab === 'Lookbook' ? (
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-4xl font-serif gold-text mb-2">Lookbook de Estilo</h2>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Hojea nuestras colecciones exclusivas</p>
                </div>
                {/* Selector de Capítulos */}
                <div className="flex bg-white/5 p-1.5 rounded-full border border-white/10 overflow-x-auto no-scrollbar">
                  {(['Gala', 'Casual', 'Deportiva', 'Accesorios'] as Category[]).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setActiveCategory(cat); setCatalogPage(0); }}
                      className={`px-8 py-3 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-white text-black shadow-lg' : 'hover:text-amber-500 text-neutral-500'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Estilo Revista */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {currentItems.map((item, idx) => {
                  const isSelected = selectedFull?.id === item.id || selectedTop?.id === item.id || selectedBottom?.id === item.id || selectedAccessories.some(a => a.id === item.id);
                  return (
                    <div 
                      key={item.id} 
                      className={`group relative magazine-page bg-neutral-900 rounded-[3rem] overflow-hidden border-2 transition-all cursor-pointer stagger-item shadow-2xl ${isSelected ? 'border-amber-500 scale-[0.98]' : 'border-white/5 hover:border-white/20'}`}
                      style={{ animationDelay: `${idx * 150}ms` }}
                      onClick={() => toggleSelection(item)}
                    >
                      <img src={item.thumbnail} className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-[0.4em] mb-3">{item.category}</span>
                        <h4 className="text-3xl font-serif text-white mb-3">{item.name}</h4>
                        <p className="text-xs text-neutral-400 font-light leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          {item.description}
                        </p>
                        <div className={`w-full py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-center transition-all ${isSelected ? 'bg-amber-500 text-black' : 'bg-white/10 backdrop-blur-md text-white border border-white/10'}`}>
                          {isSelected ? '✓ Seleccionado' : '+ Añadir a mi Look'}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-8 right-8 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold animate-in zoom-in">✓</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Controles de "Ojeo" de Libro */}
              <div className="pt-12 flex items-center justify-between border-t border-white/5">
                <button 
                  disabled={catalogPage === 0} 
                  onClick={() => setCatalogPage(p => p - 1)}
                  className="w-16 h-16 rounded-full glass border border-white/10 flex items-center justify-center text-xl hover:bg-white/5 transition-all disabled:opacity-10"
                >
                  ←
                </button>
                <div className="text-center">
                  <p className="text-[10px] text-neutral-600 font-bold uppercase mb-2">Colección {activeCategory}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-serif gold-text">Página {catalogPage + 1}</span>
                    <span className="text-neutral-700">/</span>
                    <span className="text-neutral-500 font-serif">{Math.ceil(filteredCatalog.length / itemsPerPage)}</span>
                  </div>
                </div>
                <button 
                  disabled={(catalogPage + 1) * itemsPerPage >= filteredCatalog.length} 
                  onClick={() => setCatalogPage(p => p + 1)}
                  className="w-16 h-16 rounded-full glass border border-white/10 flex items-center justify-center text-xl hover:bg-white/5 transition-all disabled:opacity-10"
                >
                  →
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="border-b border-white/5 pb-8">
                <h2 className="text-4xl font-serif gold-text mb-2">Mi Galería Personal</h2>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Tus creaciones guardadas en la nube</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {currentUser?.gallery.map(item => (
                  <div key={item.id} className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/5 bg-neutral-900 cursor-pointer" onClick={() => { setCurrentView(item.url); setIsStageOpen(true); }}>
                    <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                      <span className="text-[8px] font-bold uppercase tracking-widest mb-2">Ver en Detalle</span>
                      <button onClick={(e) => { e.stopPropagation(); const link = document.createElement('a'); link.href = item.url; link.download = 'GalaVision.png'; link.click(); }} className="w-10 h-10 bg-amber-500 text-black rounded-full flex items-center justify-center">⬇️</button>
                    </div>
                  </div>
                ))}
                {(!currentUser?.gallery || currentUser.gallery.length === 0) && (
                  <div className="col-span-full py-20 text-center text-neutral-600 font-serif italic text-xl">
                    Aún no has generado ningún diseño.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODAL SIMULADOR: ATELIER STAGE */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col animate-in fade-in duration-500">
          <header className="h-20 glass border-b border-white/10 px-8 flex items-center justify-between">
            <h2 className="text-xl font-serif gold-text uppercase tracking-[0.3em]">Atelier de Simulación Real</h2>
            <button onClick={() => { setIsStageOpen(false); setCurrentView(null); }} className="w-12 h-12 rounded-full glass flex items-center justify-center text-xl hover:text-red-500 transition-all">✕</button>
          </header>
          
          <div className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
            <aside className="lg:col-span-3 border-r border-white/5 p-8 space-y-8 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Ajustes de Escena</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[8px] text-neutral-500 font-bold uppercase">Ángulo</span>
                    <div className="grid grid-cols-2 gap-2">
                      {ANGLES.map(a => (
                        <button key={a.name} onClick={() => setAngle(a.name as Angle)} className={`py-3 rounded-xl text-[9px] font-bold uppercase border transition-all ${angle === a.name ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-neutral-500'}`}>{a.name}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[8px] text-neutral-500 font-bold uppercase">Pose Sugerida</span>
                    <div className="space-y-2">
                      {POSES.map(p => (
                        <button key={p.name} onClick={() => setPose(p.name as Pose)} className={`w-full px-5 py-4 rounded-xl text-[9px] font-bold uppercase border text-left transition-all ${pose === p.name ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-neutral-500'}`}>{p.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={handleSimulate} disabled={isGenerating} className="w-full btn-gold py-5 rounded-2xl text-black font-bold uppercase text-[10px] flex items-center justify-center gap-3">
                {isGenerating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : '📸 Repetir Simulación'}
              </button>
            </aside>

            <section className="lg:col-span-9 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]">
              <div className="w-full max-w-[500px] aspect-[9/16] relative bg-neutral-900 rounded-[4rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/5">
                {isGenerating ? (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-3xl p-12 text-center gap-6">
                    <div className="w-24 h-24 border-b-2 border-amber-500 rounded-full animate-spin" />
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase font-bold tracking-[0.5em] text-amber-500 animate-pulse">Analizando Identidad...</p>
                      <p className="text-[9px] text-neutral-500 font-light uppercase tracking-widest italic">Adaptando medidas a 1.60m</p>
                    </div>
                  </div>
                ) : currentView && (
                  <div className="w-full h-full group animate-in zoom-in-95 duration-1000">
                    <img src={currentView} className="w-full h-full object-cover" />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                      <button onClick={() => { const link = document.createElement('a'); link.href = currentView; link.download = 'GalaVision_Look.png'; link.click(); }} className="px-12 py-5 bg-amber-500 text-black rounded-full text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl">Guardar en Dispositivo</button>
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
