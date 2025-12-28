
import React, { useState, useEffect, useMemo } from 'react';
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
    if (!currentUser?.referenceImg) return alert("Por favor, sube tu foto de referencia en 'IDENTIDAD ACTUAL'.");
    if (!selectedFull && !selectedTop) return alert("Elige un diseño del Lookbook para simular.");
    
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
          outfitDetails: `${selectedFull?.name || 'Composición Personalizada'}`,
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
      alert("Error en el motor de renderizado. Intenta con una foto más clara.");
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
            {authError && <p className="text-xs text-red-500 font-bold">{authError}</p>}
            <button className="w-full btn-gold py-5 rounded-2xl text-black font-bold uppercase tracking-widest text-xs mt-4">Entrar al Atelier</button>
          </form>
          <button onClick={() => setIsLoginView(!isLoginView)} className="mt-8 text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
            {isLoginView ? '¿No tienes cuenta? Regístrate' : 'Regresar al Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-sans selection:bg-amber-500/30">
      {/* HEADER */}
      <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-[60]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-serif font-bold text-black text-xl shadow-[0_0_15px_rgba(212,175,55,0.4)]">G</div>
          <h1 className="text-xs font-serif gold-text tracking-widest uppercase hidden sm:block">Atelier Cinematográfico Gala Vision</h1>
        </div>
        <nav className="flex items-center gap-3">
          {(['Lookbook', 'Gallery'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-neutral-500 hover:text-white'}`}>
              {tab === 'Lookbook' ? '📖 Colecciones' : '🖼️ Mi Galería'}
            </button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button onClick={logout} className="text-[10px] font-bold text-neutral-600 hover:text-red-500 uppercase px-3">Salir</button>
        </nav>
      </header>

      <main className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
        
        {/* PANEL IZQUIERDO: GESTIÓN DE IDENTIDAD */}
        <aside className="lg:col-span-3 border-r border-white/5 bg-[#050505] flex flex-col overflow-y-auto no-scrollbar p-6 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Identidad Actual</h3>
              <label className="text-[9px] font-bold text-white/40 hover:text-amber-500 cursor-pointer transition-colors flex items-center gap-1 uppercase">
                <span className="text-xs">🔄</span> Cambiar
                <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
              </label>
            </div>
            
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-neutral-900 border border-white/10 relative group shadow-2xl">
              {currentUser?.referenceImg ? (
                <img src={currentUser.referenceImg} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-8 text-center text-neutral-600 hover:text-amber-500 transition-colors">
                  <span className="text-4xl mb-4">📸</span>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] leading-loose">Sube tu foto de referencia<br/>(Rasgos conservados 100%)</p>
                  <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                </label>
              )}
              {/* Overlay de Escaneo Cinematográfico */}
              <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5">
                 <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-amber-500/30" />
                 <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-amber-500/30" />
                 <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-amber-500/30" />
                 <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-amber-500/30" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Composición de Look</h3>
            <div className="space-y-2">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest">Base</span>
                <span className="text-[11px] font-bold text-white truncate">{selectedFull?.name || selectedTop?.name || 'Vacio'}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest">Complementos</span>
                <span className="text-[10px] font-medium text-white/50">
                    {selectedAccessories.length > 0 ? selectedAccessories.map(a => a.name).join(', ') : 'Ninguno'}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSimulate} 
            disabled={isGenerating || !currentUser?.referenceImg}
            className="w-full btn-gold py-6 rounded-3xl text-black font-bold uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all hover:translate-y-[-2px] active:translate-y-1"
          >
            {isGenerating ? 'Calculando Geometría...' : '✨ Generar Simulación'}
          </button>
        </aside>

        {/* CONTENIDO CENTRAL */}
        <section className="lg:col-span-9 bg-[#020202] overflow-y-auto no-scrollbar p-6 lg:p-12 relative">
          {activeTab === 'Lookbook' ? (
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                <div>
                  <h2 className="text-5xl font-serif gold-text tracking-tight">Atelier Digital</h2>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-bold mt-4">Diseños de gala y alta costura nocturna</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10 overflow-x-auto no-scrollbar">
                  {(['Gala', 'Casual', 'Accesorios'] as Category[]).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setActiveCategory(cat); setCatalogPage(0); }}
                      className={`px-8 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white text-black shadow-xl shadow-white/10' : 'hover:text-amber-500 text-neutral-500'}`}
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
                      className={`group relative bg-neutral-900 rounded-[3rem] overflow-hidden border-2 transition-all cursor-pointer shadow-2xl ${isSelected ? 'border-amber-500 scale-[0.98]' : 'border-white/5 hover:border-white/20'}`}
                      style={{ animationDelay: `${idx * 150}ms` }}
                      onClick={() => toggleSelection(item)}
                    >
                      <img src={item.thumbnail} className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent p-12 flex flex-col justify-end">
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-4">{item.category}</span>
                        <h4 className="text-3xl font-serif text-white mb-4 leading-tight">{item.name}</h4>
                        <div className={`w-full py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-center transition-all ${isSelected ? 'bg-amber-500 text-black' : 'bg-white/10 backdrop-blur-md text-white border border-white/10'}`}>
                          {isSelected ? '✓ Seleccionado' : 'Añadir al Look'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-12 flex items-center justify-between border-t border-white/5">
                <button disabled={catalogPage === 0} onClick={() => setCatalogPage(p => p - 1)} className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-xl transition-all disabled:opacity-10">←</button>
                <span className="text-lg font-serif gold-text tracking-[0.2em]">Página {catalogPage + 1} de {Math.ceil(filteredCatalog.length / itemsPerPage)}</span>
                <button disabled={(catalogPage + 1) * itemsPerPage >= filteredCatalog.length} onClick={() => setCatalogPage(p => p + 1)} className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-xl transition-all disabled:opacity-10">→</button>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-12">
              <h2 className="text-4xl font-serif gold-text border-b border-white/5 pb-10">Archivo de Simulaciones Master</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {currentUser?.gallery.map(item => (
                  <div key={item.id} className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/5 bg-neutral-900 cursor-pointer shadow-xl" onClick={() => { setCurrentView(item.url); setIsStageOpen(true); }}>
                    <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                       <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-amber-500 mb-2">{item.outfitDetails}</span>
                       <span className="text-[7px] font-mono text-white/50 uppercase">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODAL SIMULADOR: STUDIO REFERENCE MONITOR */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[100] bg-[#010101] flex flex-col animate-in fade-in duration-500">
          {/* Studio Top Bar */}
          <header className="h-16 border-b border-white/10 px-8 flex items-center justify-between bg-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                 <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                 <span className="text-[10px] font-mono text-white uppercase tracking-[0.3em]">STUDIO_REF_01 // RENDERING</span>
              </div>
              <div className="hidden md:flex gap-6 text-[8px] font-mono text-neutral-600 uppercase tracking-widest border-l border-white/10 pl-6">
                <span>IDENTITY_LOCK: TRUE</span>
                <span>PIXEL_PRESERVE: 100%</span>
                <span>COLOR_SPACE: ACES_CG</span>
              </div>
            </div>
            <button onClick={() => { setIsStageOpen(false); setCurrentView(null); }} className="px-5 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/30 text-red-500 text-[10px] font-bold transition-all uppercase tracking-widest border border-red-600/20">Finalizar Sesión</button>
          </header>
          
          <div className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
            {/* Controles de Renderizado */}
            <aside className="lg:col-span-3 border-r border-white/5 p-8 space-y-12 bg-[#050505] overflow-y-auto no-scrollbar shadow-inner">
              <div className="space-y-10">
                <div>
                  <h3 className="text-[9px] uppercase font-bold text-neutral-600 tracking-widest mb-6">Configuración de Escena</h3>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Ángulo Cinematográfico</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ANGLES.map(a => (
                          <button key={a.name} onClick={() => setAngle(a.name as Angle)} className={`py-3 rounded-xl text-[9px] font-bold uppercase border transition-all ${angle === a.name ? 'bg-white text-black border-white shadow-2xl' : 'bg-white/5 border-white/5 text-neutral-500 hover:border-white/20'}`}>{a.name}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Esquema de Iluminación</label>
                      <div className="space-y-2">
                        {STUDIO_LIGHTS.map(l => (
                          <button key={l} onClick={() => setSelectedLighting(l)} className={`w-full px-4 py-3 rounded-xl text-[9px] font-bold uppercase text-left border transition-all ${selectedLighting === l ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' : 'bg-transparent border-white/5 text-neutral-600 hover:text-neutral-400'}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-[9px] uppercase font-bold text-neutral-600 tracking-widest mb-6">Pose de Referencia</h3>
                  <div className="space-y-2">
                    {POSES.map(p => (
                      <button key={p.name} onClick={() => setPose(p.name as Pose)} className={`w-full px-4 py-3 rounded-xl text-[9px] font-bold uppercase text-left border transition-all ${pose === p.name ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-neutral-500'}`}>{p.name}</button>
                    ))}
                  </div>
                </div>
              </div>
              
              <button onClick={handleSimulate} disabled={isGenerating} className="w-full btn-gold py-6 rounded-2xl text-black font-bold uppercase text-[10px] tracking-[0.4em] shadow-2xl transition-all">
                {isGenerating ? <span className="animate-pulse">Calculando Look...</span> : '📸 Renderizar Master'}
              </button>
            </aside>

            {/* Viewport del Monitor de Referencia */}
            <section className="lg:col-span-9 flex items-center justify-center p-4 lg:p-10 bg-[#020202] relative">
              <div className="w-full h-full max-w-[420px] aspect-[9/16] relative bg-black rounded-[4rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/10 flex flex-col group">
                
                <div className="flex-grow relative overflow-hidden bg-[#080808]">
                  {isGenerating ? (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl p-12 text-center gap-10">
                      <div className="relative">
                        <div className="w-28 h-28 border-t-[1px] border-amber-500/40 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center font-serif text-amber-500 text-4xl italic">G</div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-amber-500">Mapeando Identidad Master</p>
                        <p className="text-[8px] text-neutral-600 font-mono uppercase tracking-widest">Preservando rasgos faciales al 100%</p>
                        <p className="text-[7px] text-white/20 font-mono uppercase tracking-widest mt-4">Calculando texturas de seda 4K...</p>
                      </div>
                    </div>
                  ) : currentView ? (
                    <div className="w-full h-full animate-in zoom-in-95 duration-1000 relative">
                      <img src={currentView} className="w-full h-full object-cover" />
                      
                      {/* Overlay Técnico Cinematográfico */}
                      <div className="absolute top-10 left-10 pointer-events-none opacity-40">
                         <div className="text-[8px] font-mono text-white/60 mb-1">DATA: HIGH_FIDELITY</div>
                         <div className="text-[8px] font-mono text-amber-500/80">LUT: GALA_PREMIUM_V3</div>
                      </div>

                      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        <button onClick={() => { const link = document.createElement('a'); link.href = currentView!; link.download = 'GalaVision_MasterCapture.png'; link.click(); }} className="px-10 py-4 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl hover:bg-amber-500 transition-colors">Exportar Master</button>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center gap-10">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-inner animate-pulse">✨</div>
                      <div className="space-y-3">
                        <p className="text-[11px] text-neutral-400 uppercase tracking-[0.4em] font-bold">Monitor de Salida</p>
                        <p className="text-[9px] text-neutral-600 leading-relaxed max-w-[220px] uppercase font-bold">Inicia el renderizado para aplicar el diseño de gala conservando tu identidad original.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer del Monitor */}
                <div className="h-20 bg-black/80 backdrop-blur-md border-t border-white/10 px-10 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-serif gold-text">{selectedFull?.name || 'Composición'}</span>
                      <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest">IDENTIDAD: {currentUser?.username} | ID_VERIFIED</span>
                   </div>
                   <div className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                   </div>
                </div>
              </div>
              
              {/* Corner Framing Marks */}
              <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-white/10 rounded-tl-[4rem] pointer-events-none" />
              <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-white/10 rounded-tr-[4rem] pointer-events-none" />
              <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-white/10 rounded-bl-[4rem] pointer-events-none" />
              <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-white/10 rounded-br-[4rem] pointer-events-none" />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
