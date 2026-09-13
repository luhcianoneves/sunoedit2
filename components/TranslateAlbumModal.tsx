import React, { useState } from 'react';
import { AlbumPlan, AlbumSong, AppSettings, GeneratedAlbumResult, SeriesPreset, StudioLanguage, TrackPlan } from '../types';
import { translateAlbumSongs } from '../services/geminiService';
import { translateAlbumSongsOpenRouter } from '../services/openrouterService';
import { generateId } from '../utils/id';

interface TranslateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePlan: AlbumPlan;
  sourceResult: GeneratedAlbumResult;
  seriesPreset: SeriesPreset | null;
  settings: AppSettings;
  onCreated: (newPlan: AlbumPlan) => void;
}

const LANGUAGE_OPTIONS: { value: StudioLanguage; label: string }[] = [
  { value: 'pt', label: 'Português' },
  { value: 'es', label: 'Espanhol' },
  { value: 'en', label: 'Inglês' },
];

const TranslateAlbumModal: React.FC<TranslateAlbumModalProps> = ({
  isOpen, onClose, sourcePlan, sourceResult, seriesPreset, settings, onCreated,
}) => {
  const [targetLanguage, setTargetLanguage] = useState<StudioLanguage>(
    LANGUAGE_OPTIONS.find(o => o.value !== sourcePlan.language)?.value ?? 'es'
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTranslate = async () => {
    setIsTranslating(true);
    setError(null);
    try {
      const translated = settings.provider === 'openrouter'
        ? await translateAlbumSongsOpenRouter(sourceResult.songs, targetLanguage, seriesPreset, settings.openrouterApiKey, settings.openrouterModel)
        : await translateAlbumSongs(sourceResult.songs, targetLanguage, seriesPreset);

      const translatedByIndex = new Map(translated.map(t => [t.trackIndex, t]));
      const sourceSongByIndex = new Map(sourceResult.songs.map(s => [s.trackIndex, s]));
      const sourceTrackById = new Map(sourcePlan.tracks.map(t => [t.id, t]));

      const now = new Date().toISOString();
      const newTracks: TrackPlan[] = [];
      const newSongs: AlbumSong[] = [];

      sourceResult.songs
        .slice()
        .sort((a, b) => a.trackIndex - b.trackIndex)
        .forEach((song, i) => {
          const sourceTrack = sourceTrackById.get(song.trackPlanId);
          const t = translatedByIndex.get(song.trackIndex);
          const newTrackId = generateId();
          newTracks.push({
            id: newTrackId,
            name: t?.title || sourceTrack?.name || song.title,
            bpm: sourceTrack?.bpm || '',
            styleInstrumentation: sourceTrack?.styleInstrumentation || '',
            referenceHymn: sourceTrack?.referenceHymn || '',
            productionNote: sourceTrack?.productionNote || '',
          });
          newSongs.push({
            trackPlanId: newTrackId,
            trackIndex: i,
            title: t?.title || song.title,
            stylePrompt: t?.stylePrompt || song.stylePrompt,
            lyrics: t?.lyrics ?? song.lyrics,
            imagePrompt16_9: sourceSongByIndex.get(song.trackIndex)?.imagePrompt16_9,
          });
        });

      const newPlan: AlbumPlan = {
        id: generateId(),
        title: `${sourcePlan.title} (${LANGUAGE_OPTIONS.find(o => o.value === targetLanguage)?.label})`,
        volumeLabel: sourcePlan.volumeLabel,
        seriesPresetId: sourcePlan.seriesPresetId,
        language: targetLanguage,
        tracks: newTracks,
        coverFieldSets: sourcePlan.coverFieldSets,
        result: {
          songs: newSongs,
          albumCoverPrompts: sourceResult.albumCoverPrompts,
          generatedAt: now,
          provider: settings.provider,
        },
        pipelineStage: 'production',
        createdAt: now,
        updatedAt: now,
      };

      onCreated(newPlan);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao traduzir o álbum.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Traduzir Álbum</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Cria uma cópia deste álbum adaptada para outro idioma — mantém BPM, hino de referência e identidade sonora; letra e título são traduzidos/adaptados pela IA.
        </p>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Idioma de Destino</label>
          <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value as StudioLanguage)}
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-suno-500">
            {LANGUAGE_OPTIONS.filter(o => o.value !== sourcePlan.language).map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="w-full bg-gradient-to-r from-suno-600 to-purple-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-all"
        >
          {isTranslating ? 'Traduzindo álbum...' : `Traduzir ${sourceResult.songs.length} Faixas`}
        </button>
      </div>
    </div>
  );
};

export default TranslateAlbumModal;
