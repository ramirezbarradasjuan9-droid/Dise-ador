
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CATALOGO, COLORS, POSES, ANGLES, MAKEUP_EYESHADOWS, MAKEUP_LIPSTICKS, MAKEUP_BLUSHES, MAKEUP_LIPSTICK_FINISHES, MAKEUP_LIP_CONTOURS, MI_PERFIL } from './constants';
import { ClothingItem, Category, Angle, Pose, GalleryItem, UserProfile, MakeupState, Mood } from './types';
import { geminiService } from './services/geminiService';

const ADMIN_CREDENTIALS = {
  username: 'jorb',
  password: 'dulce2025'
};

const LIGHTING_MODES = [
  'Studio Key Light (Contraste Alto)',
  'Gala Red Carpet (Flash Frontal)',
  'Soft Cinematic (Luz Natural)',
  'Midnight Glam (Sombras Dramáticas)',
  'Vogue Editorial (Suave)'
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [showWelcome, setShowWelcome] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'Lookbook' | 'Gallery'>('Lookbook');
  const [activeCategory, setActiveCategory] = useState<Category>('Gala');
  const [catalogPage, setCatalogPage] = useState(0);
  const itemsPerPage = 4;

  const [selectedFull, setSelectedFull] = useState<ClothingItem | null>(null);
  const [selectedTop, setSelectedTop] = useState<ClothingItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<ClothingItem[]>([]);
  const [selectedLighting, setSelectedLighting] = useState(LIGHTING_MODES[0]);
  const [makeup, setMakeup] = useState<MakeupState>({
    eyeshadow: MAKEUP_EYESHADOWS[0].name,
    lipstick: MAKEUP_LIPSTICKS[0].name,
    lipstickFinish: 'brillante',
    lipContour: 'Natural',
    blush: MAKEUP_BLUSHES[0].name
  });

  const [isStageOpen, setIsStageOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [angle, setAngle] = useState<Angle>('Frente');
  const [pose, setPose] = useState<Pose>('Estándar');

  const filteredCatalog = useMemo(() => CATALOGO.filter(item => item.category === activeCategory), [activeCategory]);
  const currentItems = filteredCatalog.slice(catalogPage * itemsPerPage, (catalogPage + 1) * itemsPerPage);

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

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const usersStr = localStorage.getItem('gala_vision_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    if (isLoginView) {
      if (authForm.username === ADMIN_CREDENTIALS.username && authForm.password === ADMIN_CREDENTIALS.password) {
        const user = { username: 'Admin', gallery: [], referenceImg: null };
        setCurrentUser(user);
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
      setSelectedAccessories(prev => {
        const exists = prev.find(a => a.id === item.id);
        if (exists) return prev.filter(a => a.id !== item.id);
        return [...prev.filter(a => a.subCategory !== item.subCategory), item];
      });
    } else if (item.type === 'Completo') {
      setSelectedFull(item); setSelectedTop(null); setSelectedBottom(null);
    } else if (item.type === 'Superior') {
      setSelectedTop(item); setSelectedFull(null);
    } else if (item.type === 'Inferior') {
      setSelectedBottom(item); setSelectedFull(null);
    }
  };

  const handleSimulate = async () => {
    if (!currentUser?.referenceImg) return alert("Sube tu foto de referencia en el panel lateral.");
    if (!selectedFull && !selectedTop) return alert("Selecciona una prenda del catálogo.");
    
    setIsGenerating(true);
    setIsStageOpen(true);
    try {
      const url = await geminiService.generateOutfitPreview(
        MI_PERFIL, selectedTop, selectedBottom, selectedFull, selectedAccessories,
        { top: 'Negro', bottom: 'Negro', full: 'Gala' },
        angle, pose, currentUser.referenceImg, makeup, 'Carismático y Sonriente', selectedLighting
      );
      setCurrentView(url);
      
      if (currentUser) {
        const usersStr = localStorage.getItem('gala_vision_users');
        const users = usersStr ? JSON.parse(usersStr) : {};
        const newItem: GalleryItem = {
          id: Date.now().toString(),
          url,
          outfitDetails: `${selectedFull?.name || 'Look Combinado'}`,
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
      alert("Error al procesar el diseño. Por favor, verifica tu conexión o el formato de tu imagen.");
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
            <button className="w-full btn-gold py-5 rounded-2xl text-black font-bold uppercase tracking-widest text-xs mt-4 shadow-xl">Entrar al Atelier</button>
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
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-serif font-bold text-black text-xl shadow-[0_0_20px_rgba(212,175,55,0.3)]">G</div>
          <h1 className="text-sm font-serif gold-text tracking-widest uppercase hidden sm:block">Atelier Digital Gala Vision</h1>
        </div>
        <nav className="flex items-center gap-2">
          {(['Lookbook', 'Gallery'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-neutral-500 hover:text-white'}`}>
              {tab === 'Lookbook' ? '📖 Catálogo' : '🖼️ Mis Diseños'}
            </button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button onClick={logout} className="text-[10px] font-bold text-neutral-600 hover:text-red-500 uppercase px-4">Cerrar Sesión</button>
        </nav>
      </header>

      <main className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
        
        {/* PANEL IZQUIERDO: PERFIL Y ESTADO */}
        <aside className="lg:col-span-3 border-r border-white/5 bg-[#080808] flex flex-col overflow-y-auto no-scrollbar p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest flex items-center justify-between">
              1. Referencia de Identidad
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </h3>
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-neutral-900 border-2 border-dashed border-white/10 relative group">
              {currentUser?.referenceImg ? (
                <>
                  <img src={currentUser.referenceImg} className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-[9px] font-bold uppercase tracking-widest">Cambiar Identidad</span>
                    <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </label>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-8 text-center text-neutral-600 hover:text-amber-500 transition-colors">
                  <span className="text-4xl mb-4">📸</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Sube tu foto para conservar tus rasgos</p>
                  <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">2. Mi Composición</h3>
            <div className="space-y-2">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                <span className="text-[8px] text-neutral-600 font-bold uppercase">Outfit</span>
                <span className="text-[11px] font-bold text-white truncate">{selectedFull?.name || selectedTop?.name || 'Vacio'}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                <span className="text-[8px] text-neutral-600 font-bold uppercase">Accesorios</span>
                <span className="text-[11px] font-bold text-white/70">
                    {selectedAccessories.length > 0 ? selectedAccessories.map(a => a.name).join(', ') : 'Ninguno'}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSimulate} 
            disabled={isGenerating || !currentUser?.referenceImg}
            className="w-full btn-gold py-6 rounded-3xl text-black font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all"
          >
            {isGenerating ? 'Generando Master...' : '✨ Revelar Look Real'}
          </button>
        </aside>

        {/* CONTENIDO CENTRAL */}
        <section className="lg:col-span-9 bg-[#020202] overflow-y-auto no-scrollbar p-6 lg:p-12">
          {activeTab === 'Lookbook' ? (
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-4xl font-serif gold-text">Colección de Gala</h2>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold mt-2">Selección exclusiva para noche</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10 overflow-x-auto no-scrollbar">
                  {(['Gala', 'Casual', 'Accesorios'] as Category[]).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setActiveCategory(cat); setCatalogPage(0); }}
                      className={`px-8 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white text-black shadow-lg' : 'hover:text-amber-500 text-neutral-500'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {currentItems.map((item, idx) => {
                  const isSelected = selectedFull?.id === item.id || selectedTop?.id === item.id || selectedAccessories.some(a => a.id === item.id);
                  return (
                    <div 
                      key={item.id} 
                      className={`group relative magazine-page bg-neutral-900 rounded-[3rem] overflow-hidden border-2 transition-all cursor-pointer shadow-2xl ${isSelected ? 'border-amber-500 scale-[0.98]' : 'border-white/5 hover:border-white/20'}`}
                      onClick={() => toggleSelection(item)}
                    >
                      <img src={item.thumbnail} className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-3">{item.category}</span>
                        <h4 className="text-3xl font-serif text-white mb-3">{item.name}</h4>
                        <div className={`w-full py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-center transition-all ${isSelected ? 'bg-amber-500 text-black' : 'bg-white/10 backdrop-blur-md text-white border border-white/10'}`}>
                          {isSelected ? '✓ Seleccionado' : '+ Añadir al Look'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-12 flex items-center justify-between border-t border-white/5">
                <button disabled={catalogPage === 0} onClick={() => setCatalogPage(p => p - 1)} className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-xl hover:bg-white/5 transition-all disabled:opacity-10">←</button>
                <span className="text-lg font-serif gold-text tracking-widest">Página {catalogPage + 1} de {Math.ceil(filteredCatalog.length / itemsPerPage)}</span>
                <button disabled={(catalogPage + 1) * itemsPerPage >= filteredCatalog.length} onClick={() => setCatalogPage(p => p + 1)} className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-xl hover:bg-white/5 transition-all disabled:opacity-10">→</button>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-12">
              <h2 className="text-4xl font-serif gold-text border-b border-white/5 pb-8">Mis Creaciones Master</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {currentUser?.gallery.map(item => (
                  <div key={item.id} className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/5 bg-neutral-900 cursor-pointer" onClick={() => { setCurrentView(item.url); setIsStageOpen(true); }}>
                    <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white border border-white/20 px-4 py-2 rounded-full">Ver Digital Master</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODAL SIMULADOR: CINEMATIC STUDIO MODE */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[100] bg-[#020202] flex flex-col animate-in fade-in duration-500">
          {/* Top Info Bar */}
          <header className="h-16 border-b border-white/10 px-8 flex items-center justify-between bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> LIVE_RENDER_ENGINE_V3
              </span>
              <div className="hidden md:flex gap-4 text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
                <span>BITRATE: 8K_EXTREME</span>
                <span>ID_LOCK: ACTIVE</span>
                <span>F_SCAN: 100%</span>
              </div>
            </div>
            <button onClick={() => { setIsStageOpen(false); setCurrentView(null); }} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-[10px] font-bold transition-all uppercase tracking-widest border border-white/10">Cerrar Sesión Studio</button>
          </header>
          
          <div className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
            {/* Controles de Renderizado Izquierda */}
            <aside className="lg:col-span-3 border-r border-white/5 p-8 space-y-10 bg-[#050505] overflow-y-auto no-scrollbar">
              <div className="space-y-8">
                <div>
                  <h3 className="text-[9px] uppercase font-bold text-neutral-600 tracking-widest mb-4">Parámetros de Captura</h3>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[8px] text-neutral-400 font-bold uppercase">Ángulo de Referencia</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ANGLES.map(a => (
                          <button key={a.name} onClick={() => setAngle(a.name as Angle)} className={`py-3 rounded-xl text-[9px] font-bold uppercase border transition-all ${angle === a.name ? 'bg-white text-black border-white shadow-xl shadow-white/5' : 'bg-white/5 border-white/10 text-neutral-500 hover:border-white/30'}`}>{a.name}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[8px] text-neutral-400 font-bold uppercase">Iluminación de Estudio</label>
                      <div className="space-y-1.5">
                        {LIGHTING_MODES.map(l => (
                          <button key={l} onClick={() => setSelectedLighting(l)} className={`w-full px-4 py-3 rounded-xl text-[9px] font-bold uppercase text-left border transition-all ${selectedLighting === l ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-transparent border-white/5 text-neutral-600 hover:text-neutral-400'}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-[9px] uppercase font-bold text-neutral-600 tracking-widest mb-4">Pose para Render</h3>
                  <div className="space-y-1.5">
                    {POSES.map(p => (
                      <button key={p.name} onClick={() => setPose(p.name as Pose)} className={`w-full px-4 py-3 rounded-xl text-[9px] font-bold uppercase text-left border transition-all ${pose === p.name ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-neutral-500'}`}>{p.name}</button>
                    ))}
                  </div>
                </div>
              </div>
              
              <button onClick={handleSimulate} disabled={isGenerating} className="w-full btn-gold py-6 rounded-2xl text-black font-bold uppercase text-[10px] tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3">
                {isGenerating ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : '📸 Renderizar Escena'}
              </button>
            </aside>

            {/* Viewport del Monitor de Referencia */}
            <section className="lg:col-span-9 flex items-center justify-center p-6 lg:p-12 bg-[#030303] relative overflow-hidden">
              <div className="w-full h-full max-w-[440px] aspect-[9/16] relative bg-[#080808] rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10 flex flex-col">
                
                <div className="flex-grow relative">
                  {isGenerating ? (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-3xl p-12 text-center gap-8">
                      <div className="relative">
                        <div className="w-24 h-24 border-t-2 border-amber-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center font-serif text-amber-500 text-3xl">G</div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase font-bold tracking-[0.4em] text-amber-500">Mapeando Rasgos Faciales...</p>
                        <p className="text-[8px] text-neutral-600 font-mono uppercase tracking-widest italic">Preservando ID de {currentUser?.username}</p>
                      </div>
                    </div>
                  ) : currentView ? (
                    <div className="w-full h-full animate-in zoom-in-95 duration-1000 relative group">
                      <img src={currentView} className="w-full h-full object-cover" />
                      
                      {/* Technical Overlays */}
                      <div className="absolute top-8 left-8 flex flex-col gap-1 pointer-events-none">
                         <span className="text-[9px] font-mono text-white/40 uppercase">RAW_OUTPUT_4K</span>
                         <span className="text-[7px] font-mono text-amber-500/50 uppercase">COLOR_SPACE: sRGB_D65</span>
                      </div>
                      <div className="absolute top-8 right-8 pointer-events-none">
                         <span className="text-[9px] font-mono text-white/40 uppercase">REC_READY</span>
                      </div>

                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        <button onClick={() => { const link = document.createElement('a'); link.href = currentView!; link.download = 'GalaVision_MasterLook.png'; link.click(); }} className="px-10 py-4 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-500 transition-colors">Exportar Master HQ</button>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center gap-8 opacity-40">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">✨</div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-bold">Monitor Listo</p>
                        <p className="text-[9px] text-neutral-700 italic max-w-[220px]">Ajusta la iluminación y el ángulo para iniciar el renderizado cinematográfico.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Bar Inferior del Monitor */}
                <div className="h-20 bg-black/60 backdrop-blur-md border-t border-white/10 px-10 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-serif gold-text">{selectedFull?.name || 'Composición Digital'}</span>
                      <span className="text-[7px] font-mono text-neutral-700 uppercase">IDENTIDAD: {MI_PERFIL.height} | {MI_PERFIL.skin}</span>
                   </div>
                   <div className="flex gap-1.5">
                      {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />)}
                   </div>
                </div>
              </div>
              
              {/* Cinematic Corner Marks */}
              <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2 border-white/10 rounded-tl-[3rem] pointer-events-none" />
              <div className="absolute top-12 right-12 w-16 h-16 border-t-2 border-r-2 border-white/10 rounded-tr-[3rem] pointer-events-none" />
              <div className="absolute bottom-12 left-12 w-16 h-16 border-b-2 border-l-2 border-white/10 rounded-bl-[3rem] pointer-events-none" />
              <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2 border-white/10 rounded-br-[3rem] pointer-events-none" />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
