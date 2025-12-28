
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CATALOGO, COLORS, POSES, ANGLES, MAKEUP_EYESHADOWS, MAKEUP_LIPSTICKS, MAKEUP_BLUSHES, MAKEUP_LIPSTICK_FINISHES, MAKEUP_LIP_CONTOURS, MI_PERFIL } from './constants';
import { ClothingItem, Category, Angle, Pose, GalleryItem, UserProfile, MakeupState, Mood } from './types';
import { geminiService } from './services/geminiService';
import { GoogleGenAI, Modality, Type, FunctionDeclaration } from '@google/genai';

const ADMIN_CREDENTIALS = {
  username: 'jorb',
  password: 'dulce2025'
};

const LIGHTING_MODES = [
  'Cinematográfica de Estudio',
  'Alfombra Roja (Flash)',
  'Luz de Luna Suave',
  'Atardecer Dorado',
  'Neon Cyberpunk'
];

// Definición de funciones para que la IA controle la aplicación mediante voz
const controlAppFunctions: FunctionDeclaration[] = [
  {
    name: 'modificar_outfit',
    parameters: {
      type: Type.OBJECT,
      properties: {
        color: { type: Type.STRING, description: 'Color o estilo deseado (ej: rojo intenso, esmeralda, negro nocturno)' },
        tipo_prenda: { type: Type.STRING, description: 'Tipo de prenda o accesorio (ej: vestido, top, falda, bolso, lentes, zafiro)' }
      }
    }
  },
  {
    name: 'ajustar_maquillaje',
    parameters: {
      type: Type.OBJECT,
      properties: {
        parte: { type: Type.STRING, enum: ['labios', 'ojos', 'rubor'], description: 'Parte del rostro a maquillar' },
        estilo: { type: Type.STRING, description: 'Color o estilo (ej: rojo pasión, ahumado oscuro, natural, dorado)' }
      },
      required: ['parte', 'estilo']
    }
  },
  {
    name: 'renderizar_diseño',
    parameters: { type: Type.OBJECT, properties: {} },
    description: 'Genera la simulación final con los cambios actuales.'
  }
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

  // --- Voice Interaction State & Refs ---
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

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
    return () => stopVoice();
  }, []);

  const toggleVoice = async () => {
    if (isListening) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  const startVoice = async () => {
    try {
      setVoiceStatus('Iniciando sesión...');
      setIsListening(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'Eres el Director de Arte Senior del Atelier Gala Vision. Ayudas al usuario a diseñar su look de gala mediante voz. Puedes cambiar colores, añadir accesorios (bolsos, joyas), ajustar maquillaje de ojos y labios, y finalmente renderizar. Sé elegante y profesional. Si el usuario pide algo como "ponme labios rojos" o "cambia el color a rojo", usa las funciones para actualizar el estado de la app.',
          tools: [{ functionDeclarations: controlAppFunctions }]
        },
        callbacks: {
          onopen: () => {
            setVoiceStatus('Atelier Conectado: Escuchando...');
            setupMicStream(sessionPromise);
          },
          onmessage: async (message) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                console.log('Voice Command Received:', fc);
                handleVoiceCommand(fc);
                sessionPromise.then(s => s.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: { result: "Acción completada en el Atelier." } }
                }));
              }
            }
          },
          onclose: () => {
            console.log('Voice session closed');
            stopVoice();
          },
          onerror: (e) => {
            console.error('Voice error:', e);
            stopVoice();
          }
        }
      });
      sessionRef.current = sessionPromise;
    } catch (e) {
      console.error(e);
      stopVoice();
    }
  };

  const stopVoice = () => {
    if (sessionRef.current) {
        sessionRef.current.then((s: any) => {
            try { s.close(); } catch(e) {}
        });
    }
    if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    
    sessionRef.current = null;
    scriptProcessorRef.current = null;
    audioContextRef.current = null;
    
    setIsListening(false);
    setVoiceStatus('');
  };

  const setupMicStream = async (sessionPromise: Promise<any>) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
        
        const binary = String.fromCharCode(...new Uint8Array(int16.buffer));
        sessionPromise.then(s => {
          if (s) s.sendRealtimeInput({
            media: { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' }
          });
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (e) {
      console.error("Mic Error:", e);
      stopVoice();
    }
  };

  const handleVoiceCommand = (fc: any) => {
    const { name, args } = fc;
    switch (name) {
      case 'modificar_outfit':
        if (args.color) {
          const item = CATALOGO.find(i => 
            i.name.toLowerCase().includes(args.color.toLowerCase()) || 
            i.basePrompt.toLowerCase().includes(args.color.toLowerCase())
          );
          if (item) toggleSelection(item);
        }
        if (args.tipo_prenda) {
            const tp = args.tipo_prenda.toLowerCase();
            const matchingItem = CATALOGO.find(i => 
                i.subCategory?.toLowerCase().includes(tp) || 
                i.category.toLowerCase().includes(tp) ||
                i.name.toLowerCase().includes(tp)
            );
            if (matchingItem) toggleSelection(matchingItem);
        }
        break;
      case 'ajustar_maquillaje':
        const estilo = args.estilo || 'Natural';
        setMakeup(prev => {
          const next = { ...prev };
          if (args.parte === 'labios') next.lipstick = estilo;
          if (args.parte === 'ojos') next.eyeshadow = estilo;
          if (args.parte === 'rubor') next.blush = estilo;
          return next;
        });
        break;
      case 'renderizar_diseño':
        handleSimulate();
        break;
    }
  };

  // --- Auth & Profile Management ---
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
    if (!currentUser?.referenceImg) return alert("Sube tu foto de referencia primero.");
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
      console.error(e);
      alert("Error en el renderizado cinematográfico.");
    } finally {
      setIsGenerating(false);
    }
  };

  const logout = () => {
    stopVoice();
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
            <button className="w-full btn-gold py-5 rounded-2xl text-black font-bold uppercase tracking-widest text-xs mt-4">Acceder al Atelier</button>
          </form>
          <button onClick={() => setIsLoginView(!isLoginView)} className="mt-8 text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
            {isLoginView ? '¿Nuevo diseñador? Regístrate' : 'Ya tengo cuenta'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-serif font-bold text-black text-xl shadow-[0_0_15px_rgba(212,175,55,0.3)]">G</div>
          <h1 className="text-sm font-serif gold-text tracking-widest uppercase hidden sm:block">Atelier Digital Gala Vision</h1>
        </div>
        <nav className="flex items-center gap-2">
          {(['Lookbook', 'Gallery'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-neutral-500 hover:text-white'}`}>
              {tab === 'Lookbook' ? '📖 Catálogo' : '🖼️ Mis Creaciones'}
            </button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button onClick={logout} className="text-[10px] font-bold text-neutral-600 hover:text-red-500 uppercase px-4">Salir</button>
        </nav>
      </header>

      <main className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
        <aside className="lg:col-span-3 border-r border-white/5 bg-[#080808] flex flex-col overflow-y-auto no-scrollbar p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest flex items-center justify-between">
                1. Perfil Físico
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </h3>
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-neutral-900 border-2 border-dashed border-white/10 relative group">
              {currentUser?.referenceImg ? (
                <>
                  <img src={currentUser.referenceImg} className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-[9px] font-bold uppercase tracking-widest">Cambiar Referencia</span>
                    <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </label>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-8 text-center text-neutral-600 hover:text-amber-500 transition-colors">
                  <span className="text-4xl mb-4">📸</span>
                  <p className="text-[9px] font-bold uppercase tracking-widest">Sube tu foto de referencia</p>
                  <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                </label>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">2. Configuración Actual</h3>
            <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-neutral-600 font-bold uppercase">Vestimenta</span>
                <span className="text-[11px] font-bold text-white truncate">{selectedFull?.name || selectedTop?.name || 'Ninguna seleccionada'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-neutral-600 font-bold uppercase">Maquillaje de Labios</span>
                <span className="text-[11px] font-bold text-amber-500 truncate">{makeup.lipstick}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-neutral-600 font-bold uppercase">Accesorios</span>
                <span className="text-[10px] font-medium text-white/70">
                    {selectedAccessories.length > 0 ? selectedAccessories.map(a => a.name).join(', ') : 'Sin accesorios'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleSimulate} 
            disabled={isGenerating || !currentUser?.referenceImg}
            className="w-full btn-gold py-6 rounded-3xl text-black font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all"
          >
            {isGenerating ? 'Renderizando...' : '✨ Ver Simulación Real'}
          </button>
        </aside>

        <section className="lg:col-span-9 bg-[#020202] overflow-y-auto p-6 lg:p-12 no-scrollbar">
          {activeTab === 'Lookbook' ? (
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-4xl font-serif gold-text">Colección Exclusiva</h2>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold mt-2">Atelier Digital de Alta Costura</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10 overflow-x-auto no-scrollbar">
                  {['Gala', 'Casual', 'Accesorios'].map((cat: any) => (
                    <button key={cat} onClick={() => { setActiveCategory(cat); setCatalogPage(0); }} className={`px-8 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white text-black shadow-md' : 'text-neutral-500 hover:text-white'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {currentItems.map((item) => {
                  const isSelected = selectedFull?.id === item.id || selectedTop?.id === item.id || selectedAccessories.some(a => a.id === item.id);
                  return (
                    <div key={item.id} onClick={() => toggleSelection(item)} className={`group relative rounded-[3rem] overflow-hidden border-2 cursor-pointer transition-all duration-500 shadow-2xl ${isSelected ? 'border-amber-500 scale-[0.98]' : 'border-white/5 hover:border-white/20'}`}>
                      <img src={item.thumbnail} className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-2">{item.category}</span>
                        <h4 className="text-3xl font-serif text-white">{item.name}</h4>
                        <div className={`mt-6 w-full py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-center border transition-all ${isSelected ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/10 text-white border-white/10 backdrop-blur-md'}`}>
                          {isSelected ? '✓ Seleccionado' : 'Añadir al Diseño'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8">
              <h2 className="text-3xl font-serif gold-text border-b border-white/5 pb-6">Mi Galería de Estilo</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {currentUser?.gallery.map(item => (
                  <div key={item.id} className="aspect-[3/4] rounded-3xl overflow-hidden border border-white/5 group relative cursor-pointer" onClick={() => { setCurrentView(item.url); setIsStageOpen(true); }}>
                    <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white border border-white/20 px-4 py-2 rounded-full">Ver Master</span>
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
          <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between bg-black/60 backdrop-blur-2xl">
            <div className="flex items-center gap-8">
              <span className="flex items-center gap-2 text-[10px] font-mono text-red-600 animate-pulse font-bold tracking-[0.3em] uppercase">
                <span className="w-2 h-2 rounded-full bg-red-600" /> LIVE_STUDIO_SESSION
              </span>
              <div className="hidden md:flex gap-6 text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
                <span>BITRATE: 128KBPS</span>
                <span>FMT: PCM_RAW</span>
                <span>DSP: ACTIVE</span>
              </div>
            </div>
            <button onClick={() => { stopVoice(); setIsStageOpen(false); setCurrentView(null); }} className="px-6 py-2.5 rounded-xl bg-white/5 text-[10px] font-bold uppercase tracking-widest border border-white/10 hover:bg-red-500/20 hover:text-red-500 transition-all">Finalizar Sesión</button>
          </header>

          <div className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
            {/* Control Sidebar */}
            <aside className="lg:col-span-3 border-r border-white/5 p-8 space-y-10 bg-[#050505] overflow-y-auto no-scrollbar">
              <div className="space-y-6">
                <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 text-center space-y-6 shadow-inner">
                  <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-[0.2em]">Interacción por Voz</h3>
                  <button 
                    onClick={toggleVoice}
                    className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-500 relative group ${isListening ? 'bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)] scale-110' : 'bg-amber-500 shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105'}`}
                  >
                    {isListening ? (
                      <div className="flex items-center gap-1.5 h-10">
                        {[0, 0.2, 0.4, 0.6].map(delay => (
                            <div key={delay} className="w-2 bg-white rounded-full animate-bounce" style={{ height: '60%', animationDelay: `${delay}s` }} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-4xl group-hover:rotate-12 transition-transform">🎙️</span>
                    )}
                  </button>
                  <div className="space-y-1">
                    <p className="text-[10px] text-white font-bold uppercase tracking-widest">{isListening ? 'Director Escuchando...' : 'Modo Voz Desactivado'}</p>
                    <p className="text-[8px] text-neutral-500 font-mono italic">"{voiceStatus || 'Prueba: Cambia el labial a rojo'}"</p>
                  </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-[10px] uppercase font-bold text-neutral-600 tracking-widest border-b border-white/5 pb-2">Manual Override</h4>
                   <div className="space-y-3">
                      <label className="text-[8px] text-neutral-500 font-bold uppercase">Ángulo de Cámara</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ANGLES.map(a => (
                          <button key={a.name} onClick={() => setAngle(a.name as Angle)} className={`py-3 rounded-xl text-[9px] font-bold uppercase border transition-all ${angle === a.name ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-neutral-500 hover:border-white/30'}`}>{a.name}</button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[8px] text-neutral-500 font-bold uppercase">Esquema de Luz</label>
                      <div className="space-y-1.5">
                        {LIGHTING_MODES.map(l => (
                          <button key={l} onClick={() => setSelectedLighting(l)} className={`w-full px-5 py-3 rounded-xl text-[9px] font-bold uppercase text-left border transition-all ${selectedLighting === l ? 'bg-white/10 border-amber-500 text-white' : 'bg-transparent border-white/5 text-neutral-600 hover:text-neutral-400'}`}>{l}</button>
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              <button onClick={handleSimulate} disabled={isGenerating} className="w-full btn-gold py-6 rounded-2xl text-black font-bold uppercase text-[10px] tracking-widest shadow-2xl flex items-center justify-center gap-3">
                {isGenerating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : '📸 Renderizar Master'}
              </button>
            </aside>

            {/* Stage Viewport */}
            <section className="lg:col-span-9 flex items-center justify-center p-8 bg-[#030303] relative overflow-hidden">
              <div className="w-full h-full max-w-[420px] aspect-[9/16] relative bg-black rounded-[4rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/10 flex flex-col">
                
                <div className="flex-grow relative bg-[#080808]">
                  {isGenerating ? (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-3xl p-12 text-center gap-10">
                      <div className="relative">
                        <div className="w-28 h-28 border-t-2 border-amber-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center font-serif text-amber-500 text-4xl">G</div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[12px] uppercase font-bold tracking-[0.5em] text-amber-500">Procesando Look...</p>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-neutral-600 font-mono tracking-widest uppercase">MAPPING_FACE_MESH... OK</span>
                            <span className="text-[8px] text-neutral-600 font-mono tracking-widest uppercase">TEXTURE_GENERATION... 88%</span>
                        </div>
                      </div>
                    </div>
                  ) : currentView ? (
                    <div className="w-full h-full animate-in zoom-in-95 duration-1000 relative group">
                      <img src={currentView} className="w-full h-full object-cover" />
                      
                      {/* OSD (On Screen Display) de Cámara */}
                      <div className="absolute inset-x-8 top-10 flex justify-between pointer-events-none">
                         <div className="flex flex-col gap-1">
                             <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">4K_ULTRA_HD</span>
                             <span className="text-[8px] font-mono text-amber-500/60 uppercase">PROFILE: {MI_PERFIL.facialFeatures}</span>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                             <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">F/2.8</span>
                             <span className="text-[8px] font-mono text-white/40 uppercase">ISO 100</span>
                         </div>
                      </div>

                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        <button onClick={() => { const link = document.createElement('a'); link.href = currentView!; link.download = 'GalaVision_Master.png'; link.click(); }} className="px-10 py-4 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-500 transition-colors">Descargar HQ</button>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center gap-8 opacity-40">
                      <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-3xl">✨</div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-neutral-400 uppercase tracking-[0.4em] font-bold">Estudio Listo</p>
                        <p className="text-[9px] text-neutral-600 italic leading-relaxed">Usa el control de voz para pedir cambios en tiempo real o selecciona manualmente los ajustes.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Bar Inferior del Monitor */}
                <div className="h-20 bg-black/80 backdrop-blur-xl border-t border-white/5 px-10 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-serif gold-text">{selectedFull?.name || 'Nuevo Diseño'}</span>
                      <span className="text-[7px] font-mono text-neutral-700 uppercase">TIMESTAMP: {new Date().toLocaleTimeString()}</span>
                   </div>
                   <div className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/20" />)}
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
