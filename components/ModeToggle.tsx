import React from 'react';
import { AppMode } from '../types';

interface ModeToggleProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
  return (
    <div className="bg-dark-900 p-1 rounded-xl border border-dark-700 flex gap-1">
      <button
        type="button"
        onClick={() => onChange('quick')}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
          mode === 'quick'
            ? 'bg-gradient-to-r from-suno-600 to-purple-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-dark-700'
        }`}
      >
        Rápido
      </button>
      <button
        type="button"
        onClick={() => onChange('planner')}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
          mode === 'planner'
            ? 'bg-gradient-to-r from-suno-600 to-purple-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-dark-700'
        }`}
      >
        Planejador de Álbum
      </button>
    </div>
  );
};

export default ModeToggle;
