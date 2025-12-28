
import React, { useState, useEffect, useMemo } from 'react';
import { CATALOGO, MI_PERFIL, COLORS, POSES, ANGLES, MAKEUP_EYESHADOWS, MAKEUP_LIPSTICKS, MAKEUP_BLUSHES, MAKEUP_LIPSTICK_FINISHES, MAKEUP_LIP_CONTOURS } from './constants';
import { ClothingItem, Category, Season, Angle, Pose, GalleryItem, UserProfile, MakeupState } from './types';
import { geminiService } from './services/geminiService';

const ADMIN_CREDENTIALS = {
  username: 'jorb',
  password: 'dulce2025'
};

export default function App() {
  // --- Auth & Profile State ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [showWelcome, setShowWelcome] = useState(true);
  const [expertAdvice, setExpertAdvice] = useState<string>("");
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- Admin State ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // --- App Navigation & Selection State ---
  const [activeTab, setActiveTab] = useState<'Catalog' | 'Creator' | 'Admin'>('Catalog');
  const [activeSeason, setActiveSeason] = useState<Season>('Otoño/Invierno');
  const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
  const [bookPage, setBookPage] = useState(0);

  const [selectedTop, setSelectedTop] = useState<ClothingItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem | null>(null);
  const [selectedFull, setSelectedFull] = useState<ClothingItem | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<ClothingItem[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  
  const [topColor, setTopColor] = useState(COLORS[0].name);
  const [bottomColor, setBottomColor] = useState(COLORS[0].name);
  const [fullColor, setFullColor] = useState(COLORS[0].name);

  // --- Makeup State ---
  const [makeup, setMakeup] = useState<MakeupState>({
    eyeshadow: MAKEUP_EYESHADOWS[0].name,
    lipstick: MAKEUP_LIPSTICKS[0].name,
    lipstickFinish: MAKEUP_LIPSTICK_FINISHES[0].name,
    lipContour: MAKEUP_LIP_CONTOURS[0].name,
    blush: MAKEUP_BLUSHES[0].name
  });

  const [angle, setAngle] = useState<Angle>('Frente');
  const [pose, setPose] = useState<Pose>('Estándar');
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<string | null>(null);

  // --- Creator Tab State ---
  const [customPrompt, setCustomPrompt] = useState("");
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // --- Voice Recognition State ---
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  const categories: (Category | 'Todos')[] = ['Todos', 'Gala', 'Casual', 'Deportiva', 'Dormir', 'Jeans', 'Shorts', 'Accesorios'];

  // --- Effects ---
  useEffect(() => {
    if (currentUser && !expertAdvice && !isAdminMode) {
      setIsAdviceLoading(true);
      geminiService.getExpertAdvice(MI_PERFIL).then(advice => {
        setExpertAdvice(advice);
        setIsAdviceLoading(false);
      });
    }
  }, [currentUser, expertAdvice, isAdminMode]);

  useEffect(() => {
    if (isAdminMode) {
      loadAllUsers();
    }
  }, [isAdminMode]);

  const loadAllUsers = () => {
    const usersStr = localStorage.getItem('gala_vision_users');
    const usersObj = usersStr ? JSON.parse(usersStr) : {};
    setAllUsers(Object.values(usersObj));
  };

  // --- Auth Handlers ---
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const usersStr = localStorage.getItem('gala_vision_users');
    const users = usersStr ? JSON.parse(usersStr) : {};

    if (isLoginView) {
      if (authForm.username === ADMIN_CREDENTIALS.username && authForm.password === ADMIN_CREDENTIALS.password) {
        const adminUser: UserProfile = { username: 'Master Admin', gallery: [], referenceImg: null };
        setCurrentUser(adminUser);
        setIsAdminMode(true);
        setActiveTab('Admin');
        setShowWelcome(false);
        return;
      }

      const user = users[authForm.username];
      if (user && user.password === authForm.password) {
        setCurrentUser(user);
        setIsAdminMode(false);
        setShowWelcome(false);
      } else {
        setAuthError("Usuario o contraseña incorrectos.");
      }
    } else {
      if (authForm.username.length < 6) {
        setAuthError("El usuario debe tener al menos 6 caracteres.");
        return;
      }
      if (authForm.password.length < 8) {
        setAuthError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      if (users[authForm.username]) {
        setAuthError("El nombre de usuario ya está en uso.");
        return;
      }

      const newUser: UserProfile = {
        username: authForm.username,
        password: authForm.password,
        gallery: [],
        referenceImg: null
      };
      users[authForm.username] = newUser;
      localStorage.setItem('gala_vision_users', JSON.stringify(users));
      setCurrentUser(newUser);
      setIsAdminMode(false);
      setShowWelcome(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowWelcome(true);
    setAuthForm({ username: '', password: '' });
    setExpertAdvice("");
    setIsAdminMode(false);
    setAuthError(null);
  };

  const deleteUser = (username: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario "${username}"?`)) {
      const usersStr = localStorage.getItem('gala_vision_users');
      const users = usersStr ? JSON.parse(usersStr) : {};
      delete users[username];
      localStorage.setItem('gala_vision_users', JSON.stringify(users));
      loadAllUsers();
    }
  };

  const saveToUserProfile = (newItem: GalleryItem) => {
    if (!currentUser || isAdminMode) return;
    const usersStr = localStorage.getItem('gala_vision_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    const updatedUser = { ...currentUser, gallery: [newItem, ...currentUser.gallery] };
    users[currentUser.username] = updatedUser;
    localStorage.setItem('gala_vision_users', JSON.stringify(users));
    setCurrentUser(updatedUser);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser && !isAdminMode) {
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

  // --- Voice Handlers ---
  const startListening = (target: 'Command' | 'Prompt') => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return alert("Tu navegador no soporta reconocimiento de voz.");
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.onstart = () => { setIsListening(true); setVoiceFeedback("Escuchando..."); };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (target === 'Command') processVoiceCommand(transcript);
      else setCustomPrompt(transcript);
    };
    recognition.onend = () => { setIsListening(false); setTimeout(() => setVoiceFeedback(null), 2000); };
    recognition.start();
  };

  const processVoiceCommand = (cmd: string) => {
    if (isAdminMode) return;
    setVoiceFeedback(`Recibido: "${cmd}"`);
    
    COLORS.forEach(c => {
      if (cmd.includes(c.name.toLowerCase())) {
        if (cmd.includes("pantalón") || cmd.includes("inferior")) setBottomColor(c.name);
        else if (cmd.includes("top") || cmd.includes("superior")) setTopColor(c.name);
        else if (cmd.includes("vestido") || selectedFull) setFullColor(c.name);
      }
    });

    if (cmd.includes("catálogo")) setActiveTab('Catalog');
    if (cmd.includes("creador") || cmd.includes("diseñar")) setActiveTab('Creator');
    if (cmd.includes("primavera") || cmd.includes("verano")) setActiveSeason('Primavera/Verano');
    if (cmd.includes("otoño") || cmd.includes("invierno")) setActiveSeason('Otoño/Invierno');

    CATALOGO.forEach(item => {
      if (cmd.includes(item.name.toLowerCase())) handleSelect(item);
    });

    if (cmd.includes("modelar") || cmd.includes("ver cómo queda")) handleSimulate();
  };

  // --- Action Handlers ---
  const filteredItems = useMemo(() => {
    return CATALOGO.filter(item => {
      const matchCat = activeCategory === 'Todos' || item.category === activeCategory;
      const matchSea = item.category === 'Accesorios' || item.season === activeSeason;
      return matchCat && matchSea;
    });
  }, [activeCategory, activeSeason]);

  const itemsPerPage = 4;
  const currentItems = filteredItems.slice(bookPage * itemsPerPage, (bookPage + 1) * itemsPerPage);

  const handleSelect = (item: ClothingItem) => {
    if (isAdminMode) return;
    setLastSelectedId(item.id);
    // Clear last selected pulse after animation finishes
    setTimeout(() => setLastSelectedId(null), 400);

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
    if (isAdminMode) return;
    if (!currentUser?.referenceImg) return alert("Sube tu foto de perfil primero.");
    if (!selectedFull && !selectedTop && !selectedBottom) return alert("Selecciona algo para modelar.");
    setIsGenerating(true);
    setIsStageOpen(true);

    const activeMakeup = {
      eyeshadow: MAKEUP_EYESHADOWS.find(e => e.name === makeup.eyeshadow)?.prompt || makeup.eyeshadow,
      lipstick: MAKEUP_LIPSTICKS.find(l => l.name === makeup.lipstick)?.prompt || makeup.lipstick,
      lipstickFinish: MAKEUP_LIPSTICK_FINISHES.find(f => f.name === makeup.lipstickFinish)?.prompt || makeup.lipstickFinish,
      lipContour: MAKEUP_LIP_CONTOURS.find(c => c.name === makeup.lipContour)?.prompt || makeup.lipContour,
      blush: MAKEUP_BLUSHES.find(b => b.name === makeup.blush)?.prompt || makeup.blush
    };

    try {
      const url = await geminiService.generateOutfitPreview(
        MI_PERFIL, 
        selectedTop, selectedBottom, selectedFull,
        selectedAccessories,
        { top: topColor, bottom: bottomColor, full: fullColor },
        angle, pose,
        currentUser.referenceImg,
        activeMakeup
      );
      setCurrentView(url);
      const name = selectedFull ? selectedFull.name : `${selectedTop?.name || ''} ${selectedBottom?.name || ''}`.trim();
      saveToUserProfile({
        id: Date.now().toString(),
        url,
        outfitDetails: name,
        timestamp: new Date().toLocaleTimeString(),
        angle,
        pose
      });
    } catch (e) {
      alert("Error en el atelier digital.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomDesign = async () => {
    if (!customPrompt) return;
    setIsCreatingCustom(true);
    try {
      const url = await geminiService.generateCustomDesign(customPrompt);
      setCurrentView(url);
      setIsStageOpen(true);
      if (!isAdminMode) {
        saveToUserProfile({
          id: Date.now().toString(),
          url,
          outfitDetails: `Custom: ${customPrompt}`,
          timestamp: new Date().toLocaleTimeString(),
          angle: 'Frente',
          pose: 'Estándar'
        });
      }
    } catch (e) {
      alert("Error al crear el diseño.");
    } finally {
      setIsCreatingCustom(false);
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-amber-900/40 via-black to-black animate-pulse" />
        </div>
        <div className="z-10 text-center max-w-lg space-y-12 animate-fade">
          <div className="space-y-4">
            <div className="w-24 h-24 bg-gradient-to-tr from-amber-600 to-amber-200 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl">
              <span className="text-black text-5xl font-serif font-bold">G</span>
            </div>
            <h1 className="text-5xl font-serif gold-text tracking-widest">GALA VISION</h1>
            <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-bold">Atelier de Identidad Digital</p>
          </div>
          <div className="glass p-8 rounded-[2.5rem] border border-white/10">
            <h2 className="text-xl font-serif text-white mb-6">
              {isLoginView ? 'Bienvenida de Nuevo' : 'Crea tu Perfil Privado'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4 text-left">
              <input type="text" placeholder="Usuario" required className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:border-amber-500 outline-none" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
              <input type="password" placeholder="Contraseña" required className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:border-amber-500 outline-none" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              {authError && <p className="text-xs text-red-500 font-bold ml-1">{authError}</p>}
              <button className="w-full btn-gold py-4 rounded-xl text-black text-xs font-bold uppercase tracking-widest mt-4">
                {isLoginView ? 'Ingresar' : 'Registrarse'}
              </button>
            </form>
            <p className="mt-6 text-[10px] text-neutral-500 uppercase tracking-widest">
              {isLoginView ? '¿No tienes cuenta?' : '¿Ya eres usuario?'} 
              <button onClick={() => { setIsLoginView(!isLoginView); setAuthError(null); }} className="text-amber-500 ml-2 font-bold hover:underline">
                {isLoginView ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <header className="h-20 glass sticky top-0 z-[60] px-6 md:px-12 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-serif font-bold text-xl">G</div>
          <div>
            <h1 className="text-xs font-serif font-bold gold-text tracking-widest leading-none">GALA VISION</h1>
            <p className="text-[8px] uppercase tracking-widest text-neutral-600 font-bold mt-1">
              {isAdminMode ? <span className="text-amber-500">MASTER ADMIN ACCESS</span> : `Perfil: ${currentUser?.username}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {!isAdminMode && voiceFeedback && (
            <div className="hidden lg:block px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] text-amber-500 font-bold animate-pulse">
              {voiceFeedback}
            </div>
          )}
          {!isAdminMode && (
            <button onClick={() => startListening('Command')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/5 border border-white/10'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 3 3 3 0 01-3-3V4a3 3 0 013-3z"/></svg>
            </button>
          )}
          {!isAdminMode && (
            <label className="cursor-pointer">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/30 bg-neutral-900 shadow-xl flex items-center justify-center">
                {currentUser?.referenceImg ? <img src={currentUser.referenceImg} className="w-full h-full object-cover" /> : <span className="text-[8px] text-neutral-600">FOTO</span>}
              </div>
              <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
            </label>
          )}
          <button onClick={handleLogout} className="text-[10px] font-bold text-neutral-600 hover:text-red-500 transition-all uppercase">Cerrar Sesión</button>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
        <aside className="lg:col-span-4 xl:col-span-3 border-r border-white/5 flex flex-col bg-[#080808] h-full overflow-hidden">
          <div className="p-6 border-b border-white/5 space-y-4">
            <div className="flex gap-1">
              {isAdminMode ? (
                 <button className="flex-1 py-3 rounded-xl text-[9px] font-bold uppercase bg-amber-500 text-black">Master Console</button>
              ) : (
                (['Catalog', 'Creator'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase transition-all ${activeTab === tab ? 'bg-white text-black' : 'bg-white/5 text-neutral-500'}`}>
                    {tab === 'Catalog' ? 'Catálogo' : 'Atelier'}
                  </button>
                ))
              )}
            </div>
            {!isAdminMode && activeTab === 'Catalog' && (
              <>
                <div className="flex gap-1">
                  {(['Otoño/Invierno', 'Primavera/Verano'] as const).map(s => (
                    <button key={s} onClick={() => { setActiveSeason(s); setBookPage(0); }} className={`flex-1 py-2 rounded-lg text-[8px] font-bold uppercase transition-all ${activeSeason === s ? 'bg-amber-500 text-black' : 'bg-white/5 text-neutral-400'}`}>{s}</button>
                  ))}
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => { setActiveCategory(cat); setBookPage(0); }} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[8px] font-bold border transition-all ${activeCategory === cat ? 'bg-white text-black' : 'border-white/10 text-neutral-600'}`}>{cat}</button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex-grow flex flex-col p-6 overflow-hidden">
            {isAdminMode ? (
              <div className="space-y-4 overflow-y-auto no-scrollbar h-full">
                 <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-4">Usuarios del Sistema</h3>
                 {allUsers.length === 0 ? (
                   <p className="text-[10px] text-neutral-700 italic">No hay usuarios registrados.</p>
                 ) : (
                   allUsers.map(u => (
                     <div key={u.username} className="glass p-4 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold">{u.username[0].toUpperCase()}</div>
                          <div>
                            <p className="text-xs font-bold text-white">{u.username}</p>
                            <p className="text-[8px] text-neutral-500 uppercase">{u.gallery.length} Diseños</p>
                          </div>
                        </div>
                        <button onClick={() => deleteUser(u.username)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                     </div>
                   ))
                 )}
              </div>
            ) : activeTab === 'Catalog' ? (
              <div className="w-full h-full bg-[#0c0c0c] rounded-[2rem] border border-white/5 p-4 flex flex-col shadow-inner animate-in slide-in-from-left duration-500">
                <div className="flex-grow grid grid-cols-2 gap-3">
                  {currentItems.map(item => {
                    const isSelected = selectedFull?.id === item.id || selectedTop?.id === item.id || selectedBottom?.id === item.id || selectedAccessories.some(a => a.id === item.id);
                    return (
                      <button 
                        key={item.id} 
                        onClick={() => handleSelect(item)} 
                        className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${isSelected ? 'border-amber-500 ring-4 ring-amber-500/20 scale-95' : 'border-white/5 grayscale hover:grayscale-0 hover:scale-105 active:scale-90'} ${lastSelectedId === item.id ? 'selection-pulse' : ''}`}
                      >
                        <img src={item.thumbnail} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent p-3 flex flex-col justify-end">
                          <span className="text-[7px] text-amber-500 font-bold uppercase tracking-widest">{item.category}</span>
                          <h4 className="text-[9px] font-bold uppercase truncate">{item.name}</h4>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-xl animate-item-entry">
                            <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button disabled={bookPage === 0} onClick={() => setBookPage(p => p - 1)} className="w-8 h-8 rounded-full bg-white/5 disabled:opacity-10 transition-all hover:bg-white/10 active:scale-90">←</button>
                  <span className="text-[8px] text-neutral-700 font-bold uppercase">Pag {bookPage + 1}</span>
                  <button disabled={(bookPage + 1) * itemsPerPage >= filteredItems.length} onClick={() => setBookPage(p => p + 1)} className="w-8 h-8 rounded-full bg-white/5 disabled:opacity-10 transition-all hover:bg-white/10 active:scale-90">→</button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full glass rounded-[2rem] p-8 space-y-8 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                  <h3 className="text-xl font-serif gold-text">Atelier de Creación</h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">Describe tu diseño ideal o utiliza tu voz para darle vida a una prenda única.</p>
                </div>
                <div className="space-y-4">
                  <textarea placeholder="Ej: Un vestido de seda negra con hombros descubiertos..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs h-32 focus:border-amber-500 outline-none transition-all" value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={() => startListening('Prompt')} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95 ${isListening ? 'bg-red-500/20 text-red-500 border-red-500' : 'bg-white/5 hover:bg-white/10 text-neutral-400'}`}>
                      <span className="text-[9px] font-bold uppercase">Dictar</span>
                    </button>
                    <button onClick={handleCustomDesign} disabled={isCreatingCustom || !customPrompt} className="flex-[2] btn-gold rounded-2xl text-[9px] font-bold uppercase tracking-widest text-black flex items-center justify-center gap-2 active:scale-95">
                      {isCreatingCustom ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Crear Diseño'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="lg:col-span-8 xl:col-span-9 p-8 lg:p-12 flex flex-col items-center bg-[#020202] overflow-y-auto no-scrollbar">
          <div className="w-full max-w-6xl space-y-10">
            {isAdminMode ? (
              <div className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass p-8 rounded-3xl flex flex-col gap-2">
                      <span className="text-[10px] text-amber-500 uppercase font-bold tracking-widest">Usuarios Totales</span>
                      <span className="text-4xl font-serif text-white">{allUsers.length}</span>
                    </div>
                    <div className="glass p-8 rounded-3xl flex flex-col gap-2">
                      <span className="text-[10px] text-amber-500 uppercase font-bold tracking-widest">Galería Global</span>
                      <span className="text-4xl font-serif text-white">{allUsers.reduce((acc, u) => acc + u.gallery.length, 0)}</span>
                    </div>
                 </div>
                 <div className="glass p-12 rounded-[3rem] border border-amber-500/10 text-center">
                    <h2 className="text-3xl font-serif gold-text mb-6">Bienvenido, Master Administrador</h2>
                    <p className="text-sm text-neutral-400 max-w-2xl mx-auto italic">"Control total del atelier digital."</p>
                 </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass p-8 rounded-[2.5rem] md:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <h3 className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Consejo de Diseñador Experto</h3>
                    </div>
                    {isAdviceLoading ? <div className="h-20 animate-pulse bg-white/5 rounded-xl" /> : <p className="text-sm font-light leading-relaxed text-neutral-300 italic">"{expertAdvice}"</p>}
                  </div>
                  <div className="bg-amber-500/5 rounded-[2.5rem] border border-amber-500/20 p-8 flex flex-col items-center justify-center">
                    <button onClick={handleSimulate} disabled={isGenerating || !currentUser?.referenceImg} className={`w-full btn-gold py-6 rounded-2xl text-black font-bold uppercase tracking-[0.4em] text-[10px] ${(!currentUser?.referenceImg || isGenerating) && 'opacity-50'}`}>Modelar Look</button>
                    <p className="mt-6 text-[8px] text-neutral-600 uppercase font-bold tracking-widest text-center">Identidad Analizada:<br/>{MI_PERFIL.height} • {MI_PERFIL.skin}</p>
                  </div>
                </div>

                <div className="glass p-8 rounded-[2.5rem] space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="w-1.5 h-10 bg-amber-500 rounded-full" />
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">Estudio de Belleza</h3>
                      <p className="text-xs font-serif text-white">Configura tu maquillaje para la gala</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <div className="space-y-4">
                      <p className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest">Sombra de Ojos</p>
                      <div className="flex flex-wrap gap-2">
                        {MAKEUP_EYESHADOWS.map(e => (
                          <button key={e.name} onClick={() => setMakeup(prev => ({ ...prev, eyeshadow: e.name }))} className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase border transition-all active:scale-95 ${makeup.eyeshadow === e.name ? 'bg-white text-black border-white' : 'bg-white/5 text-neutral-500 border-white/10 hover:border-white/30'}`}>{e.name}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6 lg:col-span-2 xl:col-span-1">
                      <div className="space-y-4">
                        <p className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest">Labios: Color</p>
                        <div className="flex flex-wrap gap-3">
                          {MAKEUP_LIPSTICKS.map(l => (
                            <button key={l.name} onClick={() => setMakeup(prev => ({ ...prev, lipstick: l.name }))} className={`w-10 h-10 rounded-full border-2 transition-all active:scale-75 ${makeup.lipstick === l.name ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ backgroundColor: l.hex }} title={l.name} />
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <p className="text-[8px] text-neutral-500 uppercase font-bold tracking-widest">Acabado</p>
                          <div className="flex flex-wrap gap-1">
                            {MAKEUP_LIPSTICK_FINISHES.map(f => (
                              <button key={f.name} onClick={() => setMakeup(prev => ({ ...prev, lipstickFinish: f.name }))} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase border transition-all active:scale-95 ${makeup.lipstickFinish === f.name ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-neutral-500 border-white/10'}`}>{f.name}</button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[8px] text-neutral-500 uppercase font-bold tracking-widest">Contorno</p>
                          <select 
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[8px] font-bold uppercase outline-none transition-all focus:border-amber-500"
                            value={makeup.lipContour}
                            onChange={(e) => setMakeup(prev => ({ ...prev, lipContour: e.target.value }))}
                          >
                            {MAKEUP_LIP_CONTOURS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest">Rubor</p>
                      <div className="flex flex-wrap gap-3">
                        {MAKEUP_BLUSHES.map(b => (
                          <button key={b.name} onClick={() => setMakeup(prev => ({ ...prev, blush: b.name }))} className={`w-10 h-10 rounded-full border-2 transition-all active:scale-75 ${makeup.blush === b.name ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ backgroundColor: b.hex }} title={b.name} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass p-8 rounded-[2.5rem] space-y-6">
                    <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold border-b border-white/5 pb-2">Configuración de Color</h3>
                    <div className="space-y-6">
                      {(selectedFull || selectedTop) && (
                        <div className="space-y-3">
                          <p className="text-[9px] text-neutral-500 uppercase font-bold">{selectedFull ? 'Vestido/Enterizo' : 'Pieza Superior'}</p>
                          <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                              <button key={c.name} onClick={() => selectedFull ? setFullColor(c.name) : setTopColor(c.name)} className={`w-10 h-10 rounded-full border-2 transition-all active:scale-75 ${(selectedFull ? fullColor : topColor) === c.name ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ backgroundColor: c.hex }} />
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedBottom && (
                        <div className="space-y-3">
                          <p className="text-[9px] text-neutral-500 uppercase font-bold">Pieza Inferior</p>
                          <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                              <button key={c.name} onClick={() => setBottomColor(c.name)} className={`w-10 h-10 rounded-full border-2 transition-all active:scale-75 ${bottomColor === c.name ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ backgroundColor: c.hex }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem] space-y-6">
                    <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold border-b border-white/5 pb-2">Accesorios</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedAccessories.length === 0 && <p className="text-[10px] text-neutral-700 italic">No hay accesorios seleccionados...</p>}
                      {selectedAccessories.map(acc => (
                        <button key={acc.id} onClick={() => setSelectedAccessories(prev => prev.filter(a => a.id !== acc.id))} className="px-5 py-3 bg-white/5 rounded-2xl text-[9px] uppercase font-bold text-amber-500 border border-white/10 hover:border-red-500 hover:text-red-500 transition-all active:scale-95 animate-item-entry">{acc.name} ✕</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/5 space-y-8 pb-20">
                  <h3 className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-bold">Mi Colección Privada</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {currentUser?.gallery.map(item => (
                      <button key={item.id} onClick={() => { setCurrentView(item.url); setIsStageOpen(true); }} className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500 transition-all relative group shadow-2xl active:scale-90">
                        <img src={item.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-2 transition-opacity">
                          <span className="text-[7px] text-amber-500 font-bold uppercase text-center">{item.outfitDetails}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Modelling Studio Modal */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-500">
          <div className="h-20 glass border-b border-white/10 px-8 flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-xl font-serif gold-text tracking-widest uppercase">Estudio de Modelaje AI</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] text-neutral-500 uppercase font-bold tracking-[0.2em]">Cámara en Vivo • Render 4K</span>
              </div>
            </div>
            <button onClick={() => setIsStageOpen(false)} className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:text-red-500 transition-all active:scale-90">✕</button>
          </div>
          <div className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
            <aside className="lg:col-span-3 bg-[#080808] border-r border-white/10 p-8 space-y-10 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Ángulo</h3>
                <div className="grid grid-cols-2 gap-3">
                  {ANGLES.map(a => (
                    <button key={a.name} onClick={() => setAngle(a.name as Angle)} className={`py-4 rounded-xl text-[9px] font-bold border transition-all active:scale-95 ${angle === a.name ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-neutral-500 hover:border-white/30'}`}>{a.name}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Pose</h3>
                <div className="space-y-2">
                  {POSES.map(p => (
                    <button key={p.name} onClick={() => setPose(p.name as Pose)} className={`w-full px-5 py-4 rounded-xl text-[9px] font-bold border transition-all text-left flex items-center justify-between active:scale-95 ${pose === p.name ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-neutral-500 hover:border-white/30'}`}>{p.name}</button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-6">
                <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Retoque de Belleza</h3>
                <div className="space-y-3">
                  <p className="text-[8px] text-neutral-600 uppercase font-bold">Ojos y Rostro</p>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] uppercase font-bold outline-none transition-all focus:border-amber-500"
                    value={makeup.eyeshadow}
                    onChange={(e) => setMakeup(prev => ({ ...prev, eyeshadow: e.target.value }))}
                  >
                    {MAKEUP_EYESHADOWS.map(e => <option key={e.name} value={e.name}>{e.name} (Sombra)</option>)}
                  </select>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[8px] text-neutral-600 uppercase font-bold">Configuración de Labios</p>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] uppercase font-bold outline-none mb-2 focus:border-amber-500"
                    value={makeup.lipstick}
                    onChange={(e) => setMakeup(prev => ({ ...prev, lipstick: e.target.value }))}
                  >
                    {MAKEUP_LIPSTICKS.map(l => <option key={l.name} value={l.name}>{l.name} (Color)</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-[8px] uppercase font-bold outline-none focus:border-amber-500"
                      value={makeup.lipstickFinish}
                      onChange={(e) => setMakeup(prev => ({ ...prev, lipstickFinish: e.target.value as any }))}
                    >
                      {MAKEUP_LIPSTICK_FINISHES.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                    </select>
                    <select 
                      className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-[8px] uppercase font-bold outline-none focus:border-amber-500"
                      value={makeup.lipContour}
                      onChange={(e) => setMakeup(prev => ({ ...prev, lipContour: e.target.value }))}
                    >
                      {MAKEUP_LIP_CONTOURS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-8 pb-10">
                <button onClick={handleSimulate} disabled={isGenerating || isAdminMode} className="w-full btn-gold py-6 rounded-2xl text-black font-bold uppercase tracking-[0.3em] text-[9px] flex items-center justify-center gap-3 active:scale-95">
                  {isGenerating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Refrescar Render'}
                </button>
              </div>
            </aside>
            <section className="lg:col-span-9 bg-[#020202] relative flex items-center justify-center p-6 lg:p-12">
              <div className="w-full max-w-[550px] aspect-[9/16] relative">
                {isGenerating && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-2xl rounded-[4rem]"><div className="w-24 h-24 border-b-2 border-amber-500 rounded-full animate-spin mb-10" /><p className="text-[11px] uppercase tracking-[1em] text-amber-500 font-bold animate-pulse">Modelando...</p></div>}
                {currentView ? <div className="w-full h-full rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_0_150px_rgba(0,0,0,1)] relative group"><img src={currentView} className="w-full h-full object-cover animate-in zoom-in-95 duration-1000" /><div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"><button className="px-10 py-3 glass rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all">Descargar Look</button></div></div> : <div className="w-full h-full glass border border-dashed border-white/10 rounded-[4rem] flex items-center justify-center"><p className="text-neutral-700 uppercase tracking-widest text-[10px] font-bold">Iniciando Estudio...</p></div>}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
