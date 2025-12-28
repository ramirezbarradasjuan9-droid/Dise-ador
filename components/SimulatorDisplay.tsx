
import React from 'react';
// Corrected: Import ClothingItem instead of non-existent Outfit
import { ClothingItem, Persona } from '../types';

interface SimulatorDisplayProps {
  isLoading: boolean;
  generatedImageUrl: string | null;
  selectedOutfit: ClothingItem | null;
  persona: Persona;
  onGenerate: () => void;
  isViewingFromGallery?: boolean;
}

const SimulatorDisplay: React.FC<SimulatorDisplayProps> = ({
  isLoading,
  generatedImageUrl,
  selectedOutfit,
  persona,
  onGenerate,
  isViewingFromGallery = false
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-grow bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-8 p-12 text-center">
            <div className="relative">
              <div className="w-32 h-32 border-[1px] border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-amber-500/5 rounded-full animate-pulse flex items-center justify-center">
                   <span className="text-amber-500 font-serif text-3xl">G</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-amber-500">Renderizando tu Elegancia</h3>
              <p className="text-sm text-neutral-500 max-w-xs font-light tracking-wide italic">Estamos adaptando el diseño a tus medidas y facciones...</p>
            </div>
          </div>
        ) : generatedImageUrl ? (
          <div className="w-full h-full relative group">
            <img
              src={generatedImageUrl}
              alt="Simulación de Gala"
              className="w-full h-full object-cover animate-in fade-in duration-1000"
            />
            {/* Overlay Info */}
            <div className="absolute top-8 left-8 flex gap-2">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                  {isViewingFromGallery ? 'Archivo de Galería' : 'Nueva Creación AI'}
                </p>
              </div>
              {!isViewingFromGallery && (
                <div className="bg-amber-500/20 backdrop-blur-xl border border-amber-500/50 px-4 py-2 rounded-full">
                  <p className="text-[10px] text-amber-200 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" /> Guardado
                  </p>
                </div>
              )}
            </div>
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
              <div className="space-y-1">
                <h4 className="text-2xl font-serif text-white drop-shadow-lg">{selectedOutfit?.name || 'Diseño de Gala'}</h4>
                <p className="text-xs text-neutral-300 drop-shadow-md">Simulación personalizada para 1.60m - Morena</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 space-y-8 animate-in fade-in duration-700">
            <div className="w-24 h-24 mx-auto bg-gradient-to-t from-neutral-800 to-neutral-700 rounded-3xl flex items-center justify-center border border-neutral-600 shadow-2xl rotate-3">
              <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-serif text-white">Reflejo de Gala</h2>
              <p className="text-neutral-500 max-w-md mx-auto leading-relaxed font-light">
                Selecciona una de las propuestas. Mi inteligencia creativa adaptará la prenda a tu físico de <span className="text-amber-500/80 font-medium">1.60m, cabello negro y piel morena</span>.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={onGenerate}
          disabled={isLoading || !selectedOutfit}
          className={`group relative px-16 py-5 rounded-full font-bold uppercase tracking-[0.3em] text-xs transition-all duration-500 overflow-hidden ${
            isLoading || !selectedOutfit
              ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed opacity-50'
              : 'bg-white text-black hover:bg-amber-500 hover:scale-105 active:scale-95'
          }`}
        >
          <span className="relative z-10">{isLoading ? 'Diseñando...' : 'Crear Simulación'}</span>
          {!isLoading && selectedOutfit && (
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SimulatorDisplay;
