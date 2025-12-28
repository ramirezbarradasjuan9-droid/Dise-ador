
import React from 'react';
// Corrected: Import ClothingItem instead of non-existent Outfit
import { ClothingItem } from '../types';

interface OutfitCardProps {
  outfit: ClothingItem;
  isSelected: boolean;
  onSelect: (outfit: ClothingItem) => void;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(outfit)}
      className={`relative group overflow-hidden rounded-xl transition-all duration-300 transform ${
        isSelected ? 'ring-2 ring-amber-500 scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
    >
      <div className="aspect-[3/4] w-full">
        <img
          src={outfit.thumbnail}
          alt={outfit.name}
          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-1">
            {/* Corrected: Use category instead of style */}
            {outfit.category}
          </span>
          <h3 className="text-lg font-serif font-bold text-white leading-tight">
            {outfit.name}
          </h3>
          <p className="text-xs text-gray-300 mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {outfit.description}
          </p>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 bg-amber-500 rounded-full p-1 shadow-lg">
          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default OutfitCard;
