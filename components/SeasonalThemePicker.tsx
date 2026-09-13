import React from 'react';
import { SEASONAL_THEMES, SeasonalTheme } from '../data/seasonalThemes';

interface SeasonalThemePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (theme: SeasonalTheme) => void;
}

const SeasonalThemePicker: React.FC<SeasonalThemePickerProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700 bg-gradient-to-r from-dark-900 to-dark-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Tema Sazonal</h2>
            <p className="text-xs text-gray-500">Ponto de partida rápido pra um álbum pontual — preenche título e sugestões de hino por faixa</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar space-y-2">
          {SEASONAL_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => { onSelect(theme); onClose(); }}
              className="w-full text-left p-4 rounded-xl border border-dark-700 bg-dark-900 hover:border-suno-500 hover:bg-dark-700/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{theme.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-suno-400 font-bold">{theme.period}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{theme.suggestedConcept}</p>
              <p className="text-[10px] text-gray-600 mt-1">Sugestões: {theme.suggestedHymns.join(' · ')}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeasonalThemePicker;
