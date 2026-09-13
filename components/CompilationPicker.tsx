import React, { useState } from 'react';
import { AIProvider, AlbumPlan, AlbumSong, GeneratedAlbumResult, TrackPlan } from '../types';
import { generateId } from '../utils/id';

interface CompilationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  albumPlans: AlbumPlan[];
  defaultProvider: AIProvider;
  onCreate: (plan: AlbumPlan) => void;
}

interface CatalogTrackEntry {
  key: string;
  sourceAlbum: AlbumPlan;
  trackPlan: TrackPlan;
  song: AlbumSong;
}

const CompilationPicker: React.FC<CompilationPickerProps> = ({ isOpen, onClose, albumPlans, defaultProvider, onCreate }) => {
  const [title, setTitle] = useState("Coletânea 'Os Essenciais'");
  const [volumeLabel, setVolumeLabel] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const trackById = (plan: AlbumPlan) => new Map(plan.tracks.map(t => [t.id, t]));

  const entries: CatalogTrackEntry[] = albumPlans
    .filter(p => p.result && p.result.songs.length > 0)
    .flatMap(p => {
      const byId = trackById(p);
      return p.result!.songs
        .slice()
        .sort((a, b) => a.trackIndex - b.trackIndex)
        .map(song => {
          const trackPlan = byId.get(song.trackPlanId);
          if (!trackPlan) return null;
          return { key: `${p.id}:${song.trackPlanId}`, sourceAlbum: p, trackPlan, song };
        })
        .filter((e): e is CatalogTrackEntry => e !== null);
    });

  const grouped = new Map<string, CatalogTrackEntry[]>();
  entries.forEach(e => {
    const label = `${e.sourceAlbum.title} ${e.sourceAlbum.volumeLabel}`;
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label)!.push(e);
  });

  const toggle = (key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleClose = () => {
    setSelectedKeys(new Set());
    setTitle("Coletânea 'Os Essenciais'");
    setVolumeLabel('');
    onClose();
  };

  const handleCreate = () => {
    const selected = entries.filter(e => selectedKeys.has(e.key));
    if (selected.length === 0) return;

    const now = new Date().toISOString();
    const newTracks: TrackPlan[] = [];
    const newSongs: AlbumSong[] = [];

    selected.forEach((e, i) => {
      const newTrackId = generateId();
      newTracks.push({ ...e.trackPlan, id: newTrackId });
      newSongs.push({ ...e.song, trackPlanId: newTrackId, trackIndex: i });
    });

    const result: GeneratedAlbumResult = {
      songs: newSongs,
      albumCoverPrompts: [],
      generatedAt: now,
      provider: defaultProvider,
    };

    const newPlan: AlbumPlan = {
      id: generateId(),
      title,
      volumeLabel,
      seriesPresetId: null,
      language: selected[0].sourceAlbum.language,
      tracks: newTracks,
      coverFieldSets: [],
      result,
      pipelineStage: 'production',
      createdAt: now,
      updatedAt: now,
    };

    onCreate(newPlan);
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700 bg-gradient-to-r from-dark-900 to-dark-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Montar Coletânea</h2>
            <p className="text-xs text-gray-500">Reaproveita faixas já geradas de qualquer álbum do catálogo — sem gastar nenhuma chamada de IA</p>
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da coletânea"
              className="bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-suno-500" />
            <input value={volumeLabel} onChange={(e) => setVolumeLabel(e.target.value)} placeholder="Volume / rótulo (opcional)"
              className="bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-suno-500" />
          </div>

          {entries.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-10">Nenhuma faixa gerada no catálogo ainda. Gere pelo menos um álbum primeiro.</p>
          )}

          {Array.from(grouped.entries()).map(([albumLabel, items]) => (
            <div key={albumLabel} className="space-y-2">
              <h4 className="text-xs font-bold text-suno-400 uppercase tracking-wider">{albumLabel}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map(e => (
                  <label key={e.key} className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedKeys.has(e.key) ? 'bg-suno-900/20 border-suno-600' : 'bg-dark-900 border-dark-700 hover:border-gray-500'
                  }`}>
                    <input type="checkbox" checked={selectedKeys.has(e.key)} onChange={() => toggle(e.key)} className="mt-1" />
                    <div>
                      <div className="text-sm text-gray-200 font-bold">{e.song.title}</div>
                      <div className="text-[10px] text-gray-500">BPM {e.trackPlan.bpm || '-'} · Ref: {e.trackPlan.referenceHymn || '-'}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700 bg-dark-900/50 shrink-0">
          <span className="text-xs text-gray-500">{selectedKeys.size} faixa(s) selecionada(s)</span>
          <button
            onClick={handleCreate}
            disabled={selectedKeys.size === 0 || !title.trim()}
            className="bg-gradient-to-r from-suno-600 to-purple-600 text-white font-bold px-6 py-2.5 rounded-lg hover:shadow-lg disabled:opacity-50 transition-all"
          >
            Criar Coletânea
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompilationPicker;
