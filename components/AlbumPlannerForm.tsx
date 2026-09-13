import React, { useState } from 'react';
import { AlbumPlan, AppSettings, CoverPromptFields, DEFAULT_COVER_FIELDS, DEFAULT_DISTRIBUTION_METADATA, DistributionMetadata, SeriesPreset, StudioLanguage, TrackPlan } from '../types';
import { generateId } from '../utils/id';
import HymnLibrary from './HymnLibrary';
import ImportTracksModal from './ImportTracksModal';
import CoverPromptBuilder from './CoverPromptBuilder';
import SeasonalThemePicker from './SeasonalThemePicker';
import { HymnItem } from '../data/hymnLibrary';
import { PRODUCTION_NOTE_CATEGORIES } from '../data/productionNotes';
import { SeasonalTheme } from '../data/seasonalThemes';
import { countHymnReferenceElsewhere, countTrackNameElsewhere } from '../services/catalogRepetitionCheck';

const NOTE_PICKER_SENTINEL = '__pick_note__';

interface AlbumPlannerFormProps {
  plan: AlbumPlan;
  onChange: (plan: AlbumPlan) => void;
  seriesPresets: SeriesPreset[];
  onOpenPresetManager: () => void;
  settings: AppSettings;
  onGenerate: () => void;
  isGenerating: boolean;
  allAlbumPlans: AlbumPlan[];
}

const blankTrack = (): TrackPlan => ({
  id: generateId(),
  name: '',
  bpm: '',
  styleInstrumentation: '',
  referenceHymn: '',
  productionNote: '',
});

const AlbumPlannerForm: React.FC<AlbumPlannerFormProps> = ({
  plan, onChange, seriesPresets, onOpenPresetManager, settings, onGenerate, isGenerating, allAlbumPlans,
}) => {
  const [hymnPickerTrackId, setHymnPickerTrackId] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSeasonalOpen, setIsSeasonalOpen] = useState(false);

  const selectedPreset = seriesPresets.find(p => p.id === plan.seriesPresetId) ?? null;
  const distribution: DistributionMetadata = plan.distribution ?? { ...DEFAULT_DISTRIBUTION_METADATA, ...(selectedPreset?.distributionDefaults || {}) };

  const updatePlan = (patch: Partial<AlbumPlan>) => {
    onChange({ ...plan, ...patch, updatedAt: new Date().toISOString() });
  };

  const updateDistribution = (patch: Partial<DistributionMetadata>) => {
    updatePlan({ distribution: { ...distribution, ...patch } });
  };

  const updateTrack = (id: string, patch: Partial<TrackPlan>) => {
    updatePlan({ tracks: plan.tracks.map(t => (t.id === id ? { ...t, ...patch } : t)) });
  };

  const addTrack = () => updatePlan({ tracks: [...plan.tracks, blankTrack()] });
  const addTenTracks = () => updatePlan({ tracks: [...plan.tracks, ...Array.from({ length: 10 }, blankTrack)] });
  const removeTrack = (id: string) => updatePlan({ tracks: plan.tracks.filter(t => t.id !== id) });

  const handleSeriesChange = (seriesId: string) => {
    const preset = seriesPresets.find(p => p.id === seriesId) ?? null;
    updatePlan({
      seriesPresetId: seriesId || null,
      language: preset?.language ?? plan.language,
      coverFieldSets: plan.coverFieldSets.length > 0 || !preset?.coverDefaults
        ? plan.coverFieldSets
        : [{ ...DEFAULT_COVER_FIELDS, ...preset.coverDefaults }],
    });
  };

  const handleHymnSelect = (item: HymnItem) => {
    if (hymnPickerTrackId) {
      updateTrack(hymnPickerTrackId, { referenceHymn: item.name });
    }
    setHymnPickerTrackId(null);
  };

  const handleImportApply = (result: { albumTitleGuess?: string; volumeLabelGuess?: string; languageGuess?: string; tracks: TrackPlan[] }) => {
    updatePlan({
      title: plan.title || result.albumTitleGuess || plan.title,
      volumeLabel: plan.volumeLabel || result.volumeLabelGuess || plan.volumeLabel,
      language: (result.languageGuess as StudioLanguage) || plan.language,
      tracks: [...plan.tracks, ...result.tracks],
    });
  };

  const handleSeasonalSelect = (theme: SeasonalTheme) => {
    const newTracks: TrackPlan[] = theme.suggestedHymns.map(hymn => ({
      id: generateId(),
      name: '',
      bpm: '',
      styleInstrumentation: '',
      referenceHymn: hymn,
      productionNote: '',
    }));
    updatePlan({
      title: plan.title || theme.suggestedTitle,
      tracks: [...plan.tracks, ...newTracks],
    });
  };

  const addCoverFieldSet = () => {
    updatePlan({
      coverFieldSets: [
        ...plan.coverFieldSets,
        { ...DEFAULT_COVER_FIELDS, ...(selectedPreset?.coverDefaults || {}) },
      ],
    });
  };

  const updateCoverFieldSet = (index: number, fields: CoverPromptFields) => {
    updatePlan({ coverFieldSets: plan.coverFieldSets.map((f, i) => (i === index ? fields : f)) });
  };

  const removeCoverFieldSet = (index: number) => {
    updatePlan({ coverFieldSets: plan.coverFieldSets.filter((_, i) => i !== index) });
  };

  const canGenerate = plan.tracks.length > 0 && plan.title.trim() !== '' && !isGenerating;

  return (
    <div className="space-y-6">
      <HymnLibrary isOpen={hymnPickerTrackId !== null} onClose={() => setHymnPickerTrackId(null)} onSelectHymn={handleHymnSelect} />
      <ImportTracksModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} settings={settings} onApply={handleImportApply} />
      <SeasonalThemePicker isOpen={isSeasonalOpen} onClose={() => setIsSeasonalOpen(false)} onSelect={handleSeasonalSelect} />

      {/* Metadados do álbum */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Título do Álbum / Série</label>
            <input value={plan.title} onChange={(e) => updatePlan({ title: e.target.value })}
              placeholder="Ex: Gospel Blues 1950's | Harpa Cristã"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-suno-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Volume</label>
            <input value={plan.volumeLabel} onChange={(e) => updatePlan({ volumeLabel: e.target.value })}
              placeholder="Vol. 6"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-suno-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Série / Franquia (identidade sonora)</label>
            <div className="flex gap-2">
              <select value={plan.seriesPresetId ?? ''} onChange={(e) => handleSeriesChange(e.target.value)}
                className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-suno-500">
                <option value="">Sem série (ad-hoc)</option>
                {seriesPresets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button onClick={onOpenPresetManager} type="button"
                className="px-4 py-3 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white border border-dark-600 text-sm font-bold whitespace-nowrap">
                Gerenciar Séries
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Idioma</label>
            <select value={plan.language} onChange={(e) => updatePlan({ language: e.target.value as StudioLanguage })}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-suno-500">
              <option value="pt">Português</option>
              <option value="es">Espanhol</option>
              <option value="en">Inglês</option>
            </select>
          </div>
        </div>

        {selectedPreset && (
          <div className="bg-suno-900/10 border border-suno-800/30 rounded-xl p-3 text-xs text-suno-300">
            <strong>Identidade da série:</strong> {selectedPreset.instrumentKit} · BPM {selectedPreset.bpmMin}-{selectedPreset.bpmMax} · {selectedPreset.dynamicArc}
          </div>
        )}
      </div>

      {/* Tabela de faixas */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white">Faixas ({plan.tracks.length})</h3>
          <div className="flex gap-2">
            <button onClick={() => setIsSeasonalOpen(true)} type="button"
              className="text-xs font-bold px-3 py-2 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500">
              Tema Sazonal
            </button>
            <button onClick={() => setIsImportOpen(true)} type="button"
              className="text-xs font-bold px-3 py-2 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500">
              Importar de Texto/PDF
            </button>
            <button onClick={addTrack} type="button"
              className="text-xs font-bold px-3 py-2 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500">
              + Faixa
            </button>
            <button onClick={addTenTracks} type="button"
              className="text-xs font-bold px-3 py-2 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500">
              + 10 Faixas
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {plan.tracks.map((track, i) => {
            const nameRepeatCount = countTrackNameElsewhere(allAlbumPlans, plan.id, track.name);
            const hymnRepeatCount = countHymnReferenceElsewhere(allAlbumPlans, plan.id, track.referenceHymn);
            return (
            <div key={track.id} className="bg-dark-900 border border-dark-700 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-suno-400">Faixa {i + 1}</span>
                <button onClick={() => removeTrack(track.id)} className="text-xs text-red-400 hover:text-red-300">Remover</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                <div className="sm:col-span-3 relative">
                  <input value={track.name} onChange={(e) => updateTrack(track.id, { name: e.target.value })} placeholder="Nome da faixa"
                    className="w-full bg-dark-800 border border-dark-600 rounded px-2 py-2 text-sm text-white outline-none" />
                  {nameRepeatCount > 0 && (
                    <span title="Já existe uma faixa com esse nome em outro álbum do catálogo" className="absolute -top-1.5 -right-1.5 text-[9px] bg-amber-900/60 border border-amber-700 text-amber-400 px-1.5 rounded-full cursor-help">
                      ⚠ {nameRepeatCount}
                    </span>
                  )}
                </div>
                <input value={track.bpm} onChange={(e) => updateTrack(track.id, { bpm: e.target.value })} placeholder="BPM"
                  className="bg-dark-800 border border-dark-600 rounded px-2 py-2 text-sm text-white outline-none" />
                <div className="sm:col-span-2 flex gap-1 relative">
                  <input value={track.referenceHymn} onChange={(e) => updateTrack(track.id, { referenceHymn: e.target.value })} placeholder="Hino de referência"
                    className="flex-1 bg-dark-800 border border-dark-600 rounded px-2 py-2 text-sm text-white outline-none" />
                  <button type="button" onClick={() => setHymnPickerTrackId(track.id)}
                    className="px-2 rounded bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white border border-dark-600 text-xs">
                    ✝
                  </button>
                  {hymnRepeatCount > 0 && (
                    <span title={`Hino já usado em ${hymnRepeatCount} outra(s) faixa(s) do catálogo (reuso é esperado dentro da mesma série)`} className="absolute -top-1.5 left-2 text-[9px] bg-dark-700 border border-dark-600 text-gray-400 px-1.5 rounded-full cursor-help">
                      🔁 {hymnRepeatCount}
                    </span>
                  )}
                </div>
              </div>
              <input value={track.styleInstrumentation} onChange={(e) => updateTrack(track.id, { styleInstrumentation: e.target.value })}
                placeholder="Estilo/Instrumentação (ex: Blues lento em 12 compassos, guitarra slide, órgão Hammond)"
                className="w-full bg-dark-800 border border-dark-600 rounded px-2 py-2 text-sm text-white outline-none" />
              <div className="flex gap-1">
                <input value={track.productionNote} onChange={(e) => updateTrack(track.id, { productionNote: e.target.value })}
                  placeholder="Nota de produção (ex: voz rouca e grave; caixa com escova marcando o balanço)"
                  className="flex-1 bg-dark-800 border border-dark-600 rounded px-2 py-2 text-sm text-white outline-none" />
                <select
                  value={NOTE_PICKER_SENTINEL}
                  onChange={(e) => {
                    if (e.target.value === NOTE_PICKER_SENTINEL) return;
                    const merged = track.productionNote ? `${track.productionNote}; ${e.target.value}` : e.target.value;
                    updateTrack(track.id, { productionNote: merged });
                  }}
                  title="Inserir nota rápida"
                  className="px-2 rounded bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white border border-dark-600 text-xs outline-none cursor-pointer"
                >
                  <option value={NOTE_PICKER_SENTINEL}>+ Nota rápida</option>
                  {PRODUCTION_NOTE_CATEGORIES.map(cat => (
                    <optgroup key={cat.name} label={cat.name}>
                      {cat.notes.map(note => <option key={note} value={note}>{note}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            );
          })}
          {plan.tracks.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-6">Nenhuma faixa ainda. Adicione manualmente ou importe de um texto/PDF.</p>
          )}
        </div>
      </div>

      {/* Prompts de capa */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Prompts de Capa ({plan.coverFieldSets.length})</h3>
          <button onClick={addCoverFieldSet} type="button"
            className="text-xs font-bold px-3 py-2 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500">
            + Opção de Capa
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {plan.coverFieldSets.map((fields, i) => (
            <CoverPromptBuilder
              key={i}
              label={`Opção ${i + 1}`}
              fields={fields}
              onChange={(f) => updateCoverFieldSet(i, f)}
              albumConcept={`${plan.title} ${plan.volumeLabel}`.trim()}
              settings={settings}
              onRemove={() => removeCoverFieldSet(i)}
            />
          ))}
        </div>
        {plan.coverFieldSets.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-4">Nenhum prompt de capa ainda. Adicione uma opção.</p>
        )}
      </div>

      {/* Metadados de Distribuição (Symphonic + Cronograma) */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white">Metadados de Distribuição</h3>
          <p className="text-xs text-gray-500 mt-1">
            Referência para o upload no Symphonic Distribution (campos confirmados no Help Desk oficial deles) e para o cronograma de lançamento.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Primary Artist</label>
            <input value={distribution.primaryArtist} onChange={(e) => updateDistribution({ primaryArtist: e.target.value })}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-suno-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Label</label>
            <input value={distribution.label} onChange={(e) => updateDistribution({ label: e.target.value })}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-suno-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Genre</label>
            <input value={distribution.primaryGenre} onChange={(e) => updateDistribution({ primaryGenre: e.target.value })}
              placeholder="Ex: Gospel"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-suno-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Subgenre</label>
            <input value={distribution.subGenre} onChange={(e) => updateDistribution({ subGenre: e.target.value })}
              placeholder="Ex: Blues"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-suno-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Composer/Writer (nome legal)</label>
            <input value={distribution.composerName} onChange={(e) => updateDistribution({ composerName: e.target.value })}
              title="Symphonic exige nome legal completo de pelo menos um compositor/letrista"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-suno-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">UPC (opcional)</label>
            <input value={distribution.upc} onChange={(e) => updateDistribution({ upc: e.target.value })}
              placeholder="Deixe em branco — o Symphonic atribui automaticamente"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-suno-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Data de Lançamento</label>
            <input type="date" value={distribution.releaseDate} onChange={(e) => updateDistribution({ releaseDate: e.target.value })}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-suno-500" />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="explicit-check" checked={distribution.explicit} onChange={(e) => updateDistribution({ explicit: e.target.checked })} />
            <label htmlFor="explicit-check" className="text-sm text-gray-300">Conteúdo explícito</label>
          </div>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className={`w-full py-5 rounded-xl font-bold text-xl shadow-lg transition-all duration-200 ${
          canGenerate
            ? 'bg-gradient-to-r from-suno-600 to-purple-700 text-white hover:scale-[1.01] border border-suno-500/50'
            : 'bg-dark-700 text-gray-500 cursor-not-allowed border border-dark-600'
        }`}
      >
        {isGenerating ? 'Compondo o Álbum...' : `Gerar Álbum Completo (${plan.tracks.length} faixas)`}
      </button>
    </div>
  );
};

export default AlbumPlannerForm;
