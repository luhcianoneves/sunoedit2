import React, { useState } from 'react';
import { HYMN_DATA, HymnItem } from '../data/hymnLibrary';

interface HymnLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHymn: (item: HymnItem) => void;
}

const HymnLibrary: React.FC<HymnLibraryProps> = ({ isOpen, onClose, onSelectHymn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hovered, setHovered] = useState<HymnItem | null>(null);

  if (!isOpen) return null;

  const term = searchTerm.toLowerCase();
  const filteredCategories = HYMN_DATA.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.theme.toLowerCase().includes(term) ||
      item.suggestedUseCases.toLowerCase().includes(term)
    ),
  })).filter(cat => cat.items.length > 0);

  const handlePick = (item: HymnItem) => {
    onSelectHymn(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-800 w-full max-w-5xl max-h-[85vh] rounded-2xl border border-dark-600 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-dark-700 bg-dark-900/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-suno-500">✝</span> Biblioteca de Hinos
            </h2>
            <p className="text-gray-400 text-sm mt-1">Referências de clima/andamento — não copiar letra ou melodia.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-dark-800 p-2 rounded-full hover:bg-dark-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4 bg-dark-800 border-b border-dark-700 shrink-0">
          <input
            type="text"
            placeholder="Buscar hino, tema ou uso (ex: 'sono', 'gratidão', 'celebração')..."
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-suno-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 md:w-3/5 overflow-y-auto p-4 custom-scrollbar border-r border-dark-700">
            {filteredCategories.map(cat => (
              <div key={cat.name} className="mb-6">
                <h3 className="text-md font-bold text-suno-400 mb-3 uppercase tracking-wider">{cat.name}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {cat.items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePick(item)}
                      onMouseEnter={() => setHovered(item)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        hovered?.name === item.name
                          ? 'bg-dark-700 border-suno-500 shadow-lg translate-x-1'
                          : 'bg-dark-900/40 border-dark-700 hover:border-gray-500'
                      }`}
                    >
                      <span className="font-bold text-gray-200">{item.name}</span>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.theme}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <div className="text-center py-10 text-gray-500">Nenhum hino encontrado para "{searchTerm}"</div>
            )}
          </div>

          <div className="hidden lg:block w-2/5 bg-dark-900 p-6 overflow-y-auto custom-scrollbar">
            {hovered ? (
              <div className="space-y-5">
                <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-suno-400 to-purple-400">{hovered.name}</h2>
                {hovered.alternateTitles && <p className="text-xs text-gray-500">{hovered.alternateTitles}</p>}
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Tema</h4>
                  <p className="text-sm text-gray-300">{hovered.theme}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-1">Clima / Andamento</h4>
                  <p className="text-sm text-gray-300">{hovered.moodTempo}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-green-400 font-bold mb-1">Onde Usar</h4>
                  <p className="text-sm text-gray-300">{hovered.suggestedUseCases}</p>
                </div>
                <p className="text-xs text-gray-600 italic">{hovered.publicDomainNote}</p>
                <button
                  onClick={() => handlePick(hovered)}
                  className="w-full bg-suno-600 hover:bg-suno-500 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95"
                >
                  Selecionar {hovered.name}
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 opacity-50">
                <p className="text-lg font-medium">Passe o mouse sobre um hino</p>
                <p className="text-sm">Veja tema, clima e sugestões de uso aqui.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HymnLibrary;
