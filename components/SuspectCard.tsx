
import React from 'react';
import { Suspect } from '../types';

interface SuspectCardProps {
  suspect: Suspect;
  onGuess?: (name: string) => void;
  disabled?: boolean;
}

export const SuspectCard: React.FC<SuspectCardProps> = ({ suspect, onGuess, disabled }) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden transition-all hover:border-red-500/50 group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={suspect.image} 
          alt={suspect.name} 
          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className="absolute bottom-2 left-3">
          <h3 className="text-xl font-bold text-white">{suspect.name}</h3>
          <p className="text-xs text-red-400 uppercase tracking-widest font-semibold">{suspect.role}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-300 leading-relaxed italic mb-4">
          "{suspect.description}"
        </p>
        {onGuess && (
          <button
            onClick={() => onGuess(suspect.name)}
            disabled={disabled}
            className="w-full py-2 bg-slate-800 hover:bg-red-900 text-slate-200 hover:text-white rounded border border-slate-700 hover:border-red-500 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ACCUSE SUSPECT
          </button>
        )}
      </div>
    </div>
  );
};
