import React, { useEffect, useState } from 'react';
import { SeriesPreset, StudioLanguage, DEFAULT_COVER_FIELDS } from '../types';
import { generateId } from '../utils/id';

interface SeriesPresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  presets: SeriesPreset[];
  onChange: (presets: SeriesPreset[]) => void;
}

const blankPreset = (): SeriesPreset => ({
  id: generateId(),
  name: 'Nova Série',
  language: 'pt',
  defaultMode: 'full',
  instrumentKit: '',
  vocalProfile: '',
  bpmMin: 60,
  bpmMax: 90,
  dynamicArc: '',
  colorPalette: '',
  coverDefaults: { ...DEFAULT_COVER_FIELDS },
  notes: '',
  isCustom: true,
});

const SeriesPresetManager: React.FC<SeriesPresetManagerProps> = ({ isOpen, onClose, presets, onChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(presets[0]?.id ?? null);
  const [draft, setDraft] = useState<SeriesPreset | null>(null);

  useEffect(() => {
    if (isOpen) {
      const first = presets[0]?.id ?? null;
      setSelectedId(first);
      setDraft(presets.find(p => p.id === first) ?? null);
    }
  }, [isOpen]);

  useEffect(() => {
    setDraft(presets.find(p => p.id === selectedId) ?? null);
  }, [selectedId, presets]);

  if (!isOpen) return null;

  const handleSelect = (id: string) => setSelectedId(id);

  const handleNew = () => {
    const p = blankPreset();
    onChange([...presets, p]);
    setSelectedId(p.id);
  };

  const handleDelete = (id: string) => {
    const next = presets.filter(p => p.id !== id);
    onChange(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  };

  const handleSaveDraft = () => {
    if (!draft) return;
    onChange(presets.map(p => (p.id === draft.id ? draft : p)));
  };

  const updateDraft = <K extends keyof SeriesPreset>(key: K, value: SeriesPreset[K]) => {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700 bg-gradient-to-r from-dark-900 to-dark-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Presets de Série / Franquia</h2>
            <p className="text-xs text-gray-500">Identidade sonora fixa reutilizada entre volumes</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 border-r border-dark-700 overflow-y-auto custom-scrollbar">
            <button onClick={handleNew} className="w-full text-left px-4 py-3 text-sm font-bold text-suno-400 hover:bg-dark-700 border-b border-dark-700/50">
              + Nova Série
            </button>
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`w-full text-left px-4 py-3 text-sm border-l-4 transition-all ${
                  selectedId === p.id ? 'bg-dark-700 text-white border-suno-500' : 'text-gray-400 border-transparent hover:bg-dark-700/50'
                }`}
              >
                <div className="font-bold">{p.name}</div>
                <div className="text-[10px] text-gray-500 uppercase">{p.language} · {p.bpmMin}-{p.bpmMax} BPM</div>
              </button>
            ))}
          </div>

          <div className="w-2/3 p-5 overflow-y-auto custom-scrollbar space-y-4">
            {draft ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nome da Série</label>
                  <input value={draft.name} onChange={(e) => updateDraft('name', e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-suno-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Idioma</label>
                    <select value={draft.language} onChange={(e) => updateDraft('language', e.target.value as StudioLanguage)}
                      className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none">
                      <option value="pt">Português</option>
                      <option value="es">Espanhol</option>
                      <option value="en">Inglês</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Modo Padrão</label>
                    <select value={draft.defaultMode} onChange={(e) => updateDraft('defaultMode', e.target.value as 'full' | 'instrumental')}
                      className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none">
                      <option value="full">Canção Completa</option>
                      <option value="instrumental">Instrumental</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">BPM Mínimo</label>
                    <input type="number" value={draft.bpmMin} onChange={(e) => updateDraft('bpmMin', Number(e.target.value))}
                      className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">BPM Máximo</label>
                    <input type="number" value={draft.bpmMax} onChange={(e) => updateDraft('bpmMax', Number(e.target.value))}
                      className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Kit de Instrumentos (fixo entre volumes)</label>
                  <textarea rows={2} value={draft.instrumentKit} onChange={(e) => updateDraft('instrumentKit', e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Perfil Vocal</label>
                  <input value={draft.vocalProfile} onChange={(e) => updateDraft('vocalProfile', e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Arco de Dinâmica do Álbum</label>
                  <textarea rows={2} value={draft.dynamicArc} onChange={(e) => updateDraft('dynamicArc', e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Paleta de Cor (para capas)</label>
                  <input value={draft.colorPalette} onChange={(e) => updateDraft('colorPalette', e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Notas</label>
                  <textarea rows={2} value={draft.notes || ''} onChange={(e) => updateDraft('notes', e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                  <button onClick={() => handleDelete(draft.id)} className="text-sm font-bold text-red-400 hover:text-red-300">
                    Excluir Série
                  </button>
                  <button onClick={handleSaveDraft} className="bg-gradient-to-r from-suno-600 to-purple-600 text-white font-bold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all">
                    Salvar Série
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">Nenhuma série selecionada. Crie uma nova.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesPresetManager;
