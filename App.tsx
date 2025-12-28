
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

// Definición de funciones para que la IA controle la aplicación
const controlAppFunctions: FunctionDeclaration[] = [
  {
    name: 'modificar_outfit',
    parameters: {
      type: Type.OBJECT,
      properties: {
        color: { type: Type.STRING, description: 'Color deseado (ej: rojo, negro, esmeralda)' },
        tipo_prenda: { type: Type.STRING, description: 'Tipo de prenda (ej: vestido, top, falda, bolso)' }
      }
    }
  },
  {
    name: 'ajustar_maquillaje',
    parameters: {
      type: Type.OBJECT,
      properties: {
        parte: { type: Type.STRING, enum: ['labios', 'ojos', 'rubor'], description: 'Parte del rostro a maquillar' },
        estilo: { type: Type.STRING, description: 'Color o estilo (ej: rojo intenso, ahumado, natural)' }
      },
      required: ['parte', 'estilo']
    }
  },
  {
    name: 'renderizar_diseño',
    parameters: { type: Type.OBJECT, properties: {} }
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

  // --- Voice Interaction State ---
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
  }, []);

  // --- Lógica de Gemini Live (Voz) ---
  const toggleVoice = async () => {
    if (isListening) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  const startVoice = async () => {
    try {
      setVoiceStatus('Iniciando...');
      setIsListening(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'Eres el Director Creativo del Atelier Gala Vision. Ayudas al usuario a cambiar colores de ropa, maquillaje (labios, ojos) y accesorios mediante voz. Usa las herramientas disponibles. Si te piden renderizar o "ver el resultado", llama a renderizar_diseño.',
          tools: [{ functionDeclarations: controlAppFunctions }]
        },
        callbacks: {
          onopen: () => {
            setVoiceStatus('Escuchando...');
            setupMicStream(sessionPromise);
          },
          onmessage: async (message) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                handleVoiceCommand(fc);
                sessionPromise.then(s => s.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: { result: "Comando ejecutado con éxito" } }
                }));
              }
            }
          },
          onclose: () => stopVoice(),
          onerror: () => stopVoice()
        }
      });
      sessionRef.current = sessionPromise;
    } catch (e) {
      console.error(e);
      stopVoice();
    }
  };

  const stopVoice = () => {
    if (sessionRef.current) sessionRef.current.then((s: any) => s.close());
    if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    setIsListening(false);
    setVoiceStatus('');
  };

  const setupMicStream = async (sessionPromise: Promise<any>) => {
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
      sessionPromise.then(s => s.sendRealtimeInput({
        media: { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' }
      }));
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  };

  const handleVoiceCommand = (fc: any) => {
    const { name, args } = fc;
    switch (name) {
      case 'modificar_outfit':
        if (args.color) {
          const item = CATALOGO.find(i => i.name.toLowerCase().includes(args.color.toLowerCase()) || i.basePrompt.toLowerCase().includes(args.color.toLowerCase()));
          if (item) toggleSelection(item);
        }
        if (args.tipo_prenda && args.tipo_prenda.toLowerCase().includes('bolso')) {
          const bag = CATALOGO.find(i => i.subCategory === 'Bolso');
          if (bag) toggleSelection(bag);
        }
        break;
      case 'ajustar_maquillaje':
        const style = args.estilo || 'Natural';
        setMakeup(prev => {
          const next = { ...prev };
          if (args.parte === 'labios') next.lipstick = style;
          if (args.parte === 'ojos') next.eyeshadow = style;
          if (args.parte === 'rubor') next.blush = style;
          return next;
        });
        break;
      case 'renderizar_diseño':
        handleSimulate();
        break;
    }
  };

  // --- Lógica Estándar (Auth, Files, Selection) ---
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
    if (!currentUser?.referenceImg) return alert("Sube tu foto para el simulador.");
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
          outfitDetails: `${selectedFull?.name || 'Composición Voz'}`,
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
      alert("Error en la simulación. Intenta de nuevo.");
      setIsStageOpen(false);
    } finally {
      setIsGenerating(false);
    }
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
        <aside className="lg:col-span-3 border-r border-white/5 bg-[#080808] flex flex-col overflow-y-auto no-scrollbar p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">1. Mi Identidad Real</h3>
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
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-8 text-center text-neutral-500">
                  <span className="text-3xl mb-4">📸</span>
                  <p className="text-[10px] font-bold uppercase">Sube tu foto</p>
                  <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                </label>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">2. Selección Actual</h3>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-neutral-600 font-bold uppercase">Outfit</span>
                <span className="text-[11px] font-bold text-white truncate">{selectedFull?.name || selectedTop?.name || 'Vacío'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-neutral-600 font-bold uppercase">Maquillaje Labios</span>
                <span className="text-[11px] font-bold text-white truncate">{makeup.lipstick}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleSimulate} 
            disabled={isGenerating || !currentUser?.referenceImg}
            className="w-full btn-gold py-6 rounded-2xl text-black font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all"
          >
            {isGenerating ? 'Procesando...' : '✨ Ver Simulación'}
          </button>
        </aside>

        <section className="lg:col-span-9 bg-[#020202] overflow-y-auto p-6 lg:p-12 no-scrollbar">
          {activeTab === 'Lookbook' ? (
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <h2 className="text-4xl font-serif gold-text">Lookbook</h2>
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                  {['Gala', 'Casual', 'Accesorios'].map((cat: any) => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white text-black' : 'text-neutral-500'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentItems.map((item) => {
                  const isSelected = selectedFull?.id === item.id || selectedTop?.id === item.id || selectedAccessories.some(a => a.id === item.id);
                  return (
                    <div key={item.id} onClick={() => toggleSelection(item)} className={`group relative rounded-[2.5rem] overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? 'border-amber-500' : 'border-white/5'}`}>
                      <img src={item.thumbnail} className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-8 flex flex-col justify-end">
                        <h4 className="text-2xl font-serif text-white">{item.name}</h4>
                        <p className="text-[9px] text-amber-500 uppercase tracking-widest mt-1">{item.category}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
              {currentUser?.gallery.map(item => (
                <div key={item.id} className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 group relative" onClick={() => { setCurrentView(item.url); setIsStageOpen(true); }}>
                  <img src={item.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white">Ver Ampliado</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL SIMULADOR CINEMATOGRÁFICO CON COMANDOS DE VOZ */}
      {isStageOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
          <header className="h-16 border-b border-white/10 px-8 flex items-center justify-between bg-black/80 backdrop-blur-xl">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-[10px] font-mono text-red-600 animate-pulse font-bold tracking-[0.2em] uppercase">
                <span className="w-2 h-2 rounded-full bg-red-600" /> REC: STUDIO_MODE
              </span>
              <div className="hidden md:flex gap-4 text-[9px] font-mono text-neutral-600 uppercase">
                <span>BITRATE: 48kbps</span>
                <span>ENC: H.265</span>
                <span>VOL: {isListening ? 'ACTIVE' : 'MUTE'}</span>
              </div>
            </div>
            <button onClick={() => { stopVoice(); setIsStageOpen(false); setCurrentView(null); }} className="px-6 py-2 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-widest border border-white/10 hover:bg-red-500/20 transition-all">Salir del Estudio</button>
          </header>

          <div className="flex-grow flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
            <aside className="lg:col-span-3 border-r border-white/5 p-6 space-y-8 bg-[#050505] overflow-y-auto no-scrollbar">
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 text-center space-y-4">
                  <h3 className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Control por Voz Inteligente</h3>
                  <button 
                    onClick={toggleVoice}
                    className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all shadow-2xl relative ${isListening ? 'bg-red-600 shadow-red-600/40 scale-110' : 'bg-amber-500 shadow-amber-500/20 hover:scale-105'}`}
                  >
                    {isListening ? (
                      <div className="w-8 h-8 flex items-center justify-center gap-1">
                        <div className="w-1.5 h-6 bg-white rounded-full animate-bounce" />
                        <div className="w-1.5 h-10 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-6 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    ) : (
                      <span className="text-3xl">🎙️</span>
                    )}
                  </button>
                  <p className="text-[9px] text-neutral-400 font-mono uppercase tracking-widest italic">{voiceStatus || 'Presiona para hablar'}</p>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[9px] uppercase font-bold text-neutral-600 tracking-widest border-b border-white/5 pb-2">Manual Adjustments</h4>
                   <div className="space-y-2">
                      <label className="text-[8px] text-neutral-500 font-bold uppercase">Ángulo</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ANGLES.map(a => (
                          <button key={a.name} onClick={() => setAngle(a.name as Angle)} className={`py-2.5 rounded-lg text-[9px] font-bold uppercase border transition-all ${angle === a.name ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-neutral-500'}`}>{a.name}</button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[8px] text-neutral-500 font-bold uppercase">Atmósfera</label>
                      <div className="space-y-1.5">
                        {LIGHTING_MODES.map(l => (
                          <button key={l} onClick={() => setSelectedLighting(l)} className={`w-full px-4 py-3 rounded-lg text-[9px] font-bold uppercase text-left border transition-all ${selectedLighting === l ? 'bg-white/10 border-amber-500' : 'bg-transparent border-white/5 text-neutral-600'}`}>{l}</button>
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              <button onClick={handleSimulate} disabled={isGenerating} className="w-full btn-gold py-5 rounded-xl text-black font-bold uppercase text-[10px] shadow-2xl flex items-center justify-center gap-3">
                {isGenerating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : '📸 Render Final'}
              </button>
            </aside>

            <section className="lg:col-span-9 flex items-center justify-center p-6 bg-[#020202] relative">
              <div className="w-full max-w-[450px] aspect-[9/16] relative bg-[#0a0a0a] rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)] border border-white/10">
                {isGenerating ? (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl p-12 text-center gap-8">
                    <div className="relative">
                      <div className="w-24 h-24 border-b-2 border-amber-500 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center font-serif text-amber-500 text-3xl">G</div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase font-bold tracking-[0.6em] text-amber-500 animate-pulse">Analizando Identidad...</p>
                      <p className="text-[8px] text-neutral-500 font-mono tracking-widest uppercase">Texturizado 4K en curso</p>
                    </div>
                  </div>
                ) : currentView ? (
                  <div className="w-full h-full group animate-in zoom-in-95 duration-1000 relative">
                    <img src={currentView} className="w-full h-full object-cover" />
                    <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                       <span className="text-[8px] font-mono text-white/60 uppercase tracking-widest">ISO 800 · SHUTTER 1/125</span>
                    </div>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                      <button onClick={() => { const link = document.createElement('a'); link.href = currentView!; link.download = 'GalaVision_Look.png'; link.click(); }} className="px-10 py-4 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl">Descargar Master</button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center gap-6 opacity-40">
                    <div className="text-6xl">📽️</div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] max-w-[250px]">Presiona el micrófono y di: "Ponme un vestido rojo y maquilla mis labios" para comenzar.</p>
                  </div>
                )}

                {/* Marcas de Cámara */}
                <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-xl pointer-events-none" />
                <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-xl pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-xl pointer-events-none" />
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
