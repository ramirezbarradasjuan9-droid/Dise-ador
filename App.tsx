
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CATALOGO, POSES, ANGLES, MAKEUP_EYESHADOWS, MI_PERFIL } from './constants';
import { ClothingItem, Category, Angle, Pose, GalleryItem, UserProfile, MakeupState } from './types';
import { geminiService } from './services/geminiService';

const ADMIN_CREDENTIALS = { username: 'jorb', password: 'dulce2025' };

const STUDIO_LIGHTS = [
  'Key Light Editorial',
  'Red Carpet Flash',
  'Cinematic Soft Box',
  'Night Glam Glow',
  'Golden Hour'
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
  const [selectedLighting, setSelectedLighting] = useState(STUDIO_LIGHTS[0]);
  const [makeup, setMakeup] = useState<MakeupState>({
    eyeshadow: MAKEUP_EYESHADOWS[0].name,
    lipstick: 'Nude',
    lipstickFinish: 'brillante',
    lipContour: 'Natural',
    blush: 'Melocotón'
  });

  const [isStageOpen, setIsStageOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [angle, setAngle] = useState<Angle>('Frente');
  const [pose, setPose] = useState<Pose>('Estándar');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setIsUploading(true);
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        
        // 1. Actualizar interfaz inmediatamente
        const updatedUser = { ...currentUser, referenceImg: base64 };
        setCurrentUser(updatedUser);
        setIsUploading(false);

        // 2. Intentar guardar en segundo plano sin bloquear
        try {
          const usersStr = localStorage.getItem('gala_vision_users');
          const users = usersStr ? JSON.parse(usersStr) : {};
          users[currentUser.username] = updatedUser;
          localStorage.setItem('gala_vision_users', JSON.stringify(users));
        } catch (storageError) {
          console.warn("Storage Quota Exceeded: Image too large for persistence, but ready for session.");
        }
        
        // Resetear input para permitir subir la misma foto si se desea
        if (fileInputRef.current) fileInputRef.current.value = "";
      };

      reader.onerror = () => {
        alert("Error de lectura de archivo.");
        setIsUploading(false);
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
    if (!currentUser?.referenceImg) return alert("Sube tu foto en el Monitor de Identidad para continuar.");
    if (!selectedFull && !selectedTop) return alert("Selecciona un diseño para renderizar.");
    
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
          outfitDetails: `${selectedFull?.name || 'Look Master Vision'}`,
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
      alert("Error en el render. Asegúrate de que tu rostro sea visible en la foto.");
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
        <div className="max-w-md w-full glass p-10 rounded-[4rem] border border-amber-500/20 text-center animate-fade shadow-[0_0_100px_rgba(0,0,0,1)]">
          <div className="w-20 h-20 bg-amber-500 rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-2xl">
            <span className="text-black text-4xl font-serif font-bold">G</span>
          </div>
          <h1 className="text-3xl font-serif gold-text tracking-[0.4em] uppercase mb-10">Gala Vision</h1>
          <form onSubmit={handleAuth} className="space-y-5">
            <input type="text" placeholder="ID de Usuario" required className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm outline-none focus:border-amber-500/50 transition-all" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
            <input type="password" placeholder="Contraseña" required className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm outline-none focus:border-amber-500/50 transition-all" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            {authError && <p className="text-xs text-red-500 font-bold tracking-widest uppercase">{authError}</p>}
            <button className="w-full btn-gold py-6 rounded-3xl text-black font-bold uppercase tracking-[0.3em] text-xs mt-6">Aceder al Atelier</button>
          </form>
          <button onClick={() => setIsLoginView(!isLoginView)} className="mt-10 text-[10px] text-neutral-500 uppercase font-bold tracking-[0.2em] hover:text-amber-500 transition-colors">
            {isLoginView ? 'Nueva Identidad: Registro' : 'Regresar al Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-amber-500/40">
      {/* HEADER DINÁMICO */}
      <header className="h-24 glass border-b border-white/5 flex items-center justify-between px-8 lg:px-16 sticky top-0 z-[100] shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center font-serif font-bold text-black text-2xl shadow-[0_0_30px_rgba(212,175,55,0.5)]">G</div>
          <div className="flex flex-col">
            <h1 className="text-[11px] font-serif gold-text tracking-[0.4em] uppercase">Gala Vision Master</h1>
            <span className="text-[7px] text-neutral-600 font-mono tracking-[0.3em] mt-1 uppercase">Atelier de Alta Costura AI</span>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          {(['Lookbook', 'Gallery'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-amber-500 text-black shadow-[0_10px_30px_rgba(212,175,55,0.3)] scale-105' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
              {tab === 'Lookbook' ? 'Colecciones' : 'Mi Archivo'}
            </button>
          ))}
          <div className="w-px h-8 bg-white/10 mx-4" />
          <button onClick={logout} className="text-[9px] font-bold text-neutral-600 hover:text-red-500 uppercase tracking-widest px-4">Logout</button>
        </nav>
      </header>

      <main className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden bg-[#020202]">
        
        {/* PANEL IZQUIERDO: MONITOR DE IDENTIDAD PROFESIONAL */}
        <aside className="lg:col-span-3 border-r border-white/5 bg-[#050505] flex flex-col overflow-y-auto no-scrollbar p-8 space-y-12 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-[0.3em]">Identidad Digital</h3>
              {currentUser?.referenceImg && (
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[8px] font-mono text-neutral-600 uppercase">Live_Sync</span>
                </div>
              )}
            </div>
            
            <div 
              className={`aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-neutral-900 border-2 relative group shadow-2xl transition-all ${currentUser?.referenceImg ? 'border-white/5' : 'border-dashed border-white/10 hover:border-amber-500/40'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl z-20">
                   <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-6" />
                   <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em] animate-pulse">Sincronizando Identidad...</p>
                </div>
              ) : currentUser?.referenceImg ? (
                <div className="relative w-full h-full group cursor-pointer">
                  <img src={currentUser.referenceImg} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Referencia de Usuario" />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500/50 animate-scan shadow-[0_0_20px_rgba(212,175,55,0.7)]" />
                    <div className="absolute inset-0 border border-amber-500/10" />
                  </div>
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/20">Actualizar Foto</span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center text-neutral-600 hover:text-amber-500 transition-colors cursor-pointer group">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-4xl grayscale opacity-30 group-hover:opacity-100 group-hover:grayscale-0 transition-all">📸</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] leading-relaxed">Vincular Identidad</p>
                  <p className="text-[8px] text-neutral-700 mt-4 italic uppercase tracking-widest">Preservación de rasgos al 100%</p>
                </div>
              )}
            </div>
            {/* Input oculto fuera del flujo para evitar conflictos */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-[0.3em]">Parámetros de Look</h3>
            <div className="space-y-3">
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col gap-2 shadow-inner">
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-[0.2em]">Selección Actual</span>
                <span className="text-[12px] font-serif gold-text truncate">{selectedFull?.name || selectedTop?.name || 'Esperando Diseño...'}</span>
              </div>
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col gap-2 shadow-inner">
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-[0.2em]">Atmósfera Lumínica</span>
                <span className="text-[10px] font-medium text-white/50 tracking-widest uppercase">{selectedLighting}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSimulate} 
            disabled={isGenerating || !currentUser?.referenceImg}
            className={`w-full py-7 rounded-[2.5rem] text-black font-bold uppercase tracking-[0.4em] text-[11px] shadow-2xl transition-all ${isGenerating || !currentUser?.referenceImg ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed opacity-50' : 'btn-gold hover:translate-y-[-4px] active:translate-y-1'}`}
          >
            {isGenerating ? <span className="animate-pulse">Calculando Píxeles...</span> : '✨ Revelar Mi Look'}
          </button>
        </aside>

        {/* CONTENIDO CENTRAL: LOOKBOOK CINEMATOGRÁFICO */}
        <section className="lg:col-span-9 overflow-y-auto no-scrollbar p-8 lg:p-20 relative">
          {activeTab === 'Lookbook' ? (
            <div className="max-w-7xl mx-auto space-y-16">
              <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-white/5 pb-16">
                <div className="space-y-4">
                  <h2 className="text-6xl font-serif gold-text tracking-tighter">Atelier de Gala</h2>
                  <p className="text-[11px] text-neutral-500 uppercase tracking-[0.5em] font-bold">Lookbook de Alta Costura Personalizado por AI</p>
                </div>
                <div className="flex bg-white/5 p-1.5 rounded-full border border-white/10 overflow-x-auto no-scrollbar shadow-2xl">
                  {(['Gala', 'Casual', 'Accesorios'] as Category[]).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setActiveCategory(cat); setCatalogPage(0); }}
                      className={`px-12 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeCategory === cat ? 'bg-white text-black shadow-2xl scale-105' : 'hover:text-amber-500 text-neutral-500'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {currentItems.map((item, idx) => {
                  const isSelected = selectedFull?.id === item.id || selectedTop?.id === item.id || selectedAccessories.some(a => a.id === item.id);
                  return (
                    <div 
                      key={item.id} 
                      className={`group relative bg-neutral-900 rounded-[4rem] overflow-hidden border-2 transition-all cursor-pointer shadow-[0_30px_80px_rgba(0,0,0,0.8)] ${isSelected ? 'border-amber-500 scale-[0.98]' : 'border-white/5 hover:border-white/20'}`}
                      style={{ animationDelay: `${idx * 150}ms` }}
                      onClick={() => toggleSelection(item)}
                    >
                      <img src={item.thumbnail} className="w-full aspect-[4/5] object-cover transition-transform duration-[1.5s] group-hover:scale-110 opacity-80 group-hover:opacity-100" alt={item.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-16 flex flex-col justify-end">
                        <span className="text-[11px] text-amber-500 font-bold uppercase tracking-[0.3em] mb-6">{item.category}</span>
                        <h4 className="text-4xl font-serif text-white mb-6 leading-[1.1]">{item.name}</h4>
                        <div className={`w-full py-5 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.4em] text-center transition-all ${isSelected ? 'bg-amber-500 text-black shadow-xl' : 'bg-white/10 backdrop-blur-xl text-white border border-white/20'}`}>
                          {isSelected ? '✓ Seleccionado' : 'Añadir al Diseño'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-20 flex items-center justify-between border-t border-white/5">
                <button disabled={catalogPage === 0} onClick={() => setCatalogPage(p => p - 1)} className="w-20 h-20 rounded-full glass border border-white/10 flex items-center justify-center text-2xl hover:bg-white/5 transition-all disabled:opacity-10 shadow-xl">←</button>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-neutral-600 uppercase tracking-[0.5em] mb-2 font-bold">Página</span>
                  <span className="text-2xl font-serif gold-text tracking-[0.3em]">{catalogPage + 1} / {Math.ceil(filteredCatalog.length / itemsPerPage)}</span>
                </div>
                <button disabled={(catalogPage + 1) * itemsPerPage >= filteredCatalog.length} onClick={() => setCatalogPage(p => p + 1)} className="w-20 h-20 rounded-full glass border border-white/10 flex items-center justify-center text-2xl hover:bg-white/5 transition-all disabled:opacity-10 shadow-xl">→</button>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-16">
              <h2 className="text-5xl font-serif gold-text border-b border-white/5 pb-16 tracking-tighter">Archivo Maestro de Visiones</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {currentUser?.gallery.map(item => (
                  <div key={item.id} className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/5 bg-neutral-900 cursor-pointer shadow-2xl transition-all hover:scale-105" onClick={() => { setCurrentView(item.url); setIsStageOpen(true); }}>
                    <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Archivo Histórico" />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                       <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 mb-3">{item.outfitDetails}</span>
                       <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
              {currentUser?.gallery.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 opacity-20">
                   <div className="text-6xl mb-10">🖼️</div>
                   <p className="text-[12px] font-bold uppercase tracking-[0.5em]">Sin Diseños Guardados</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* MODAL SIMULADOR: MASTER RENDER MONITOR 8K */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[100] bg-[#000000] flex flex-col animate-in fade-in duration-700">
          <header className="h-20 border-b border-white/10 px-10 flex items-center justify-between bg-black/40 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-4">
                 <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
                 <span className="text-[11px] font-mono text-white uppercase tracking-[0.5em] font-bold">SESSION_ID // RENDERING_HQ_8K</span>
              </div>
              <div className="hidden md:flex gap-8 text-[9px] font-mono text-neutral-600 uppercase tracking-[0.3em] border-l border-white/10 pl-10">
                <span>IDENTITY_LOCK: ACTIVE_100%</span>
                <span>PIXEL_PRECISION: ULTRA_STABLE</span>
              </div>
            </div>
            <button onClick={() => { setIsStageOpen(false); setCurrentView(null); }} className="px-8 py-3 rounded-2xl bg-red-600/10 hover:bg-red-600/30 text-red-500 text-[10px] font-bold transition-all uppercase tracking-[0.3em] border border-red-600/20 shadow-2xl">Finalizar Sesión</button>
          </header>
          
          <div className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden bg-[#020202]">
            {/* Controles del Master Render */}
            <aside className="lg:col-span-3 border-r border-white/5 p-10 space-y-16 bg-[#050505] overflow-y-auto no-scrollbar shadow-inner">
              <div className="space-y-14">
                <div className="space-y-10">
                  <h3 className="text-[10px] uppercase font-bold text-neutral-600 tracking-[0.4em] mb-8">Parámetros de Captura</h3>
                  <div className="space-y-10">
                    <div className="space-y-5">
                      <label className="text-[9px] text-white/30 font-bold uppercase tracking-[0.3em]">Ángulo del Atelier</label>
                      <div className="grid grid-cols-2 gap-3">
                        {ANGLES.map(a => (
                          <button key={a.name} onClick={() => setAngle(a.name as Angle)} className={`py-4 rounded-2xl text-[10px] font-bold uppercase border transition-all ${angle === a.name ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/5 text-neutral-500 hover:border-white/20'}`}>{a.name}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-5">
                      <label className="text-[9px] text-white/30 font-bold uppercase tracking-[0.3em]">Ambiente de Iluminación</label>
                      <div className="space-y-2.5">
                        {STUDIO_LIGHTS.map(l => (
                          <button key={l} onClick={() => setSelectedLighting(l)} className={`w-full px-6 py-5 rounded-2xl text-[10px] font-bold uppercase text-left border transition-all ${selectedLighting === l ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-inner' : 'bg-transparent border-white/5 text-neutral-600 hover:text-neutral-400'}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <h3 className="text-[10px] uppercase font-bold text-neutral-600 tracking-[0.4em]">Pose Cinematográfica</h3>
                  <div className="space-y-2.5">
                    {POSES.map(p => (
                      <button key={p.name} onClick={() => setPose(p.name as Pose)} className={`w-full px-6 py-5 rounded-2xl text-[10px] font-bold uppercase text-left border transition-all ${pose === p.name ? 'bg-white/10 border-white/20 text-white backdrop-blur-xl' : 'bg-white/5 border-white/5 text-neutral-500 hover:bg-white/10'}`}>{p.name}</button>
                    ))}
                  </div>
                </div>
              </div>
              
              <button onClick={handleSimulate} disabled={isGenerating} className="w-full btn-gold py-7 rounded-[2.5rem] text-black font-bold uppercase text-[11px] tracking-[0.5em] shadow-[0_20px_50px_rgba(212,175,55,0.4)] transition-all hover:scale-[1.03]">
                {isGenerating ? <span className="animate-pulse">Calculando Look...</span> : '📸 Iniciar Render'}
              </button>
            </aside>

            {/* Viewport Principal del Monitor de Referencia */}
            <section className="lg:col-span-9 flex items-center justify-center p-8 lg:p-16 bg-[#000000] relative overflow-hidden">
              <div className="w-full h-full max-w-[440px] aspect-[9/16] relative bg-[#050505] rounded-[5rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/10 flex flex-col group">
                <div className="flex-grow relative overflow-hidden bg-[#080808]">
                  {isGenerating ? (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/98 backdrop-blur-[100px] p-16 text-center gap-12">
                      <div className="relative">
                        <div className="w-40 h-40 border-t-2 border-amber-500/50 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-serif text-amber-500 text-6xl italic animate-pulse">G</span>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <p className="text-[13px] uppercase font-bold tracking-[0.6em] text-amber-500">Mapeando Identidad Master</p>
                        <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-[0.3em] italic">Afinando texturas 8K para {currentUser?.username}</p>
                        <div className="flex gap-2 justify-center mt-10">
                           <div className="w-2 h-2 rounded-full bg-amber-500/40 animate-bounce" />
                           <div className="w-2 h-2 rounded-full bg-amber-500/40 animate-bounce delay-100" />
                           <div className="w-2 h-2 rounded-full bg-amber-500/40 animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  ) : currentView ? (
                    <div className="w-full h-full animate-in zoom-in-95 duration-1000 relative">
                      <img src={currentView} className="w-full h-full object-cover" alt="Simulación Final" />
                      
                      {/* Technical Monitoring Overlays */}
                      <div className="absolute top-12 left-12 pointer-events-none opacity-40">
                         <div className="text-[10px] font-mono text-white/60 mb-2 tracking-widest">SIGNAL: STABLE_4K</div>
                         <div className="text-[9px] font-mono text-amber-500 uppercase tracking-[0.4em]">LUT_PROFILE: GALA_PREMIUM_V5</div>
                      </div>

                      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-6 group-hover:translate-y-0">
                        <button onClick={() => { const link = document.createElement('a'); link.href = currentView!; link.download = 'GalaVision_Capture.png'; link.click(); }} className="px-14 py-6 bg-white text-black rounded-full text-[12px] font-bold uppercase tracking-[0.4em] shadow-[0_30px_60px_rgba(255,255,255,0.2)] hover:bg-amber-500 transition-all active:scale-95">Descargar Master 8K</button>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-16 text-center gap-16">
                      <div className="w-32 h-32 rounded-[3.5rem] bg-white/5 border border-white/5 flex items-center justify-center text-6xl shadow-inner animate-pulse">✨</div>
                      <div className="space-y-6">
                        <p className="text-[14px] text-neutral-400 uppercase tracking-[0.5em] font-bold">Monitor de Salida</p>
                        <p className="text-[11px] text-neutral-600 leading-relaxed max-w-[260px] uppercase font-bold tracking-[0.2em]">Inicia el render para ver tu look personalizado con preservación de identidad 100%.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer del Monitor con Telemetría */}
                <div className="h-24 bg-black border-t border-white/10 px-14 flex items-center justify-between shadow-2xl relative z-40">
                   <div className="flex flex-col">
                      <span className="text-[14px] font-serif gold-text tracking-widest">{selectedFull?.name || 'Composición Maestro'}</span>
                      <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.4em] mt-1">REF_ID: {currentUser?.username} // LOCK_ACTIVE</span>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40 shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/5" />
                   </div>
                </div>
              </div>
              
              {/* Cinematic Corner Accents */}
              <div className="absolute top-16 left-16 w-32 h-32 border-t-2 border-l-2 border-white/5 rounded-tl-[6rem] pointer-events-none" />
              <div className="absolute top-16 right-16 w-32 h-32 border-t-2 border-r-2 border-white/5 rounded-tr-[6rem] pointer-events-none" />
              <div className="absolute bottom-16 left-16 w-32 h-32 border-b-2 border-l-2 border-white/5 rounded-bl-[6rem] pointer-events-none" />
              <div className="absolute bottom-16 right-16 w-32 h-32 border-b-2 border-r-2 border-white/5 rounded-br-[6rem] pointer-events-none" />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
