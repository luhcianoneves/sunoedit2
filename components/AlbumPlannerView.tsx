import React, { useState } from 'react';
import { AlbumPlan, AppSettings, GeneratedAlbumResult, PIPELINE_STAGES, PipelineStage, SeriesPreset, SyncSettings } from '../types';
import { generateId } from '../utils/id';
import { incrementVolumeLabel } from '../utils/volumeLabel';
import { buildCoverPrompt } from '../services/coverPromptBuilder';
import { generateAlbumSongs, regenerateAlbumTrack } from '../services/geminiService';
import { generateAlbumSongsOpenRouter, regenerateAlbumTrackOpenRouter } from '../services/openrouterService';
import AlbumPlannerForm from './AlbumPlannerForm';
import AlbumResultsView from './AlbumResultsView';
import AlbumCard from './AlbumCard';
import SeriesPresetManager from './SeriesPresetManager';
import BackupPanel from './BackupPanel';
import LoadingState from './LoadingState';
import CatalogSummary from './CatalogSummary';
import CompilationPicker from './CompilationPicker';
import CloudSyncPanel from './CloudSyncPanel';

interface AlbumPlannerViewProps {
  seriesPresets: SeriesPreset[];
  setSeriesPresets: (presets: SeriesPreset[]) => void;
  albumPlans: AlbumPlan[];
  setAlbumPlans: (plans: AlbumPlan[]) => void;
  settings: AppSettings;
  syncSettings: SyncSettings;
  setSyncSettings: (s: SyncSettings) => void;
}

const blankPlan = (): AlbumPlan => {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: '',
    volumeLabel: '',
    seriesPresetId: null,
    language: 'pt',
    tracks: [],
    coverFieldSets: [],
    pipelineStage: 'planned',
    createdAt: now,
    updatedAt: now,
  };
};

const AlbumPlannerView: React.FC<AlbumPlannerViewProps> = ({
  seriesPresets, setSeriesPresets, albumPlans, setAlbumPlans, settings, syncSettings, setSyncSettings,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const [isCompilationOpen, setIsCompilationOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [regeneratingTrackIndex, setRegeneratingTrackIndex] = useState<number | null>(null);

  const selectedPlan = albumPlans.find(p => p.id === selectedPlanId) ?? null;

  const updatePlan = (plan: AlbumPlan) => {
    setAlbumPlans(albumPlans.map(p => (p.id === plan.id ? plan : p)));
  };

  const handleCreateNew = () => {
    const plan = blankPlan();
    setAlbumPlans([...albumPlans, plan]);
    setSelectedPlanId(plan.id);
    setGenerationError(null);
  };

  const handleDuplicate = (plan: AlbumPlan) => {
    const now = new Date().toISOString();
    const copy: AlbumPlan = {
      ...plan,
      id: generateId(),
      title: `${plan.title} (Cópia)`,
      tracks: plan.tracks.map(t => ({ ...t, id: generateId() })),
      result: undefined,
      pipelineStage: 'planned',
      createdAt: now,
      updatedAt: now,
    };
    setAlbumPlans([...albumPlans, copy]);
  };

  /** #1 — Duplica o álbum mais recente de uma série, incrementa o volume e limpa faixas/resultado. */
  const handleCreateNextVolume = (plan: AlbumPlan) => {
    const now = new Date().toISOString();
    const nextPlan: AlbumPlan = {
      id: generateId(),
      title: plan.title,
      volumeLabel: incrementVolumeLabel(plan.volumeLabel || 'Vol. 1'),
      seriesPresetId: plan.seriesPresetId,
      language: plan.language,
      tracks: [],
      coverFieldSets: plan.coverFieldSets,
      pipelineStage: 'planned',
      createdAt: now,
      updatedAt: now,
    };
    setAlbumPlans([...albumPlans, nextPlan]);
    setSelectedPlanId(nextPlan.id);
    setGenerationError(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Excluir este álbum planejado? Essa ação não pode ser desfeita.')) return;
    setAlbumPlans(albumPlans.filter(p => p.id !== id));
    if (selectedPlanId === id) setSelectedPlanId(null);
  };

  /** #2 — Atualiza o estágio de pipeline de um álbum (Planejado → ... → Acompanhado). */
  const handleStageChange = (plan: AlbumPlan, stage: PipelineStage) => {
    updatePlan({ ...plan, pipelineStage: stage, updatedAt: new Date().toISOString() });
  };

  const handleGenerate = async () => {
    if (!selectedPlan) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const preset = seriesPresets.find(p => p.id === selectedPlan.seriesPresetId) ?? null;
      const mode = preset?.defaultMode ?? 'full';

      const songs = settings.provider === 'openrouter'
        ? await generateAlbumSongsOpenRouter(selectedPlan, preset, mode, settings.openrouterApiKey, settings.openrouterModel)
        : await generateAlbumSongs(selectedPlan, preset, mode);

      const albumCoverPrompts = selectedPlan.coverFieldSets.map(buildCoverPrompt);

      const result: GeneratedAlbumResult = {
        songs,
        albumCoverPrompts,
        generatedAt: new Date().toISOString(),
        provider: settings.provider,
      };

      const nextStage = selectedPlan.pipelineStage === 'planned' ? 'production' : selectedPlan.pipelineStage;
      updatePlan({ ...selectedPlan, result, pipelineStage: nextStage, updatedAt: new Date().toISOString() });
    } catch (err: unknown) {
      setGenerationError(err instanceof Error ? err.message : 'Erro ao gerar o álbum. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  /** #4 — Regenera só uma faixa do álbum já gerado, sem tocar nas demais. */
  const handleRegenerateTrack = async (trackIndex: number) => {
    if (!selectedPlan || !selectedPlan.result) return;
    setRegeneratingTrackIndex(trackIndex);
    setGenerationError(null);
    try {
      const preset = seriesPresets.find(p => p.id === selectedPlan.seriesPresetId) ?? null;
      const mode = preset?.defaultMode ?? 'full';

      const newSong = settings.provider === 'openrouter'
        ? await regenerateAlbumTrackOpenRouter(selectedPlan, preset, mode, trackIndex, settings.openrouterApiKey, settings.openrouterModel)
        : await regenerateAlbumTrack(selectedPlan, preset, mode, trackIndex);

      const updatedSongs = selectedPlan.result.songs.map(s => (s.trackIndex === trackIndex ? newSong : s));
      updatePlan({
        ...selectedPlan,
        result: { ...selectedPlan.result, songs: updatedSongs },
        updatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      setGenerationError(err instanceof Error ? err.message : 'Erro ao regenerar a faixa. Tente novamente.');
    } finally {
      setRegeneratingTrackIndex(null);
    }
  };

  const handleImportBackup = (data: { seriesPresets: SeriesPreset[]; albumPlans: AlbumPlan[] }) => {
    setSeriesPresets(data.seriesPresets);
    setAlbumPlans(data.albumPlans);
    setSelectedPlanId(null);
  };

  /** #8 — Cria uma coletânea a partir de faixas já geradas em outros álbuns, sem chamar a IA. */
  const handleCreateCompilation = (plan: AlbumPlan) => {
    setAlbumPlans([...albumPlans, plan]);
  };

  /** #6 — Marca/desmarca uma faixa como já colada no Suno. */
  const handleToggleCopied = (trackIndex: number) => {
    if (!selectedPlan || !selectedPlan.result) return;
    const updatedSongs = selectedPlan.result.songs.map(s =>
      s.trackIndex === trackIndex ? { ...s, copiedToSuno: !s.copiedToSuno } : s
    );
    updatePlan({ ...selectedPlan, result: { ...selectedPlan.result, songs: updatedSongs }, updatedAt: new Date().toISOString() });
  };

  /** #7 — Adiciona ao catálogo um álbum traduzido para outro idioma e abre ele. */
  const handleCreateTranslation = (newPlan: AlbumPlan) => {
    setAlbumPlans([...albumPlans, newPlan]);
    setSelectedPlanId(newPlan.id);
  };

  /** #10 — Filtros do catálogo. */
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeriesId, setFilterSeriesId] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterStage, setFilterStage] = useState('');

  const filteredAlbumPlans = albumPlans.filter(plan => {
    if (searchTerm && !`${plan.title} ${plan.volumeLabel}`.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterSeriesId && plan.seriesPresetId !== filterSeriesId) return false;
    if (filterLanguage && plan.language !== filterLanguage) return false;
    if (filterStage && (plan.pipelineStage ?? 'planned') !== filterStage) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <SeriesPresetManager
        isOpen={isPresetManagerOpen}
        onClose={() => setIsPresetManagerOpen(false)}
        presets={seriesPresets}
        onChange={setSeriesPresets}
      />

      <CompilationPicker
        isOpen={isCompilationOpen}
        onClose={() => setIsCompilationOpen(false)}
        albumPlans={albumPlans}
        defaultProvider={settings.provider}
        onCreate={handleCreateCompilation}
      />

      <CloudSyncPanel
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        syncSettings={syncSettings}
        setSyncSettings={setSyncSettings}
        seriesPresets={seriesPresets}
        setSeriesPresets={setSeriesPresets}
        albumPlans={albumPlans}
        setAlbumPlans={setAlbumPlans}
      />

      {/* Catálogo de álbuns */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="bg-suno-600 w-2 h-8 rounded-full"></span>
          Catálogo de Álbuns
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <BackupPanel seriesPresets={seriesPresets} albumPlans={albumPlans} onImport={handleImportBackup} />
          <button onClick={() => setIsCloudSyncOpen(true)}
            className={`text-xs font-bold px-4 py-2.5 rounded-full border ${
              syncSettings.enabled ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-dark-900 border-dark-600 text-gray-300 hover:text-white hover:border-suno-500'
            }`}>
            {syncSettings.enabled ? '☁ Nuvem Ativa' : 'Sincronização em Nuvem'}
          </button>
          <button onClick={() => setIsCompilationOpen(true)}
            className="text-xs font-bold px-4 py-2.5 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500">
            Nova Coletânea
          </button>
          <button onClick={handleCreateNew}
            className="bg-gradient-to-r from-suno-600 to-purple-700 text-white font-bold px-5 py-2.5 rounded-full shadow-lg">
            + Novo Álbum
          </button>
        </div>
      </div>

      <CatalogSummary albumPlans={albumPlans} seriesPresets={seriesPresets} />

      {albumPlans.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center bg-dark-800/60 border border-dark-700 rounded-xl p-3">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título ou volume..."
            className="flex-1 min-w-[160px] bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-suno-500"
          />
          <select value={filterSeriesId} onChange={(e) => setFilterSeriesId(e.target.value)}
            className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white outline-none">
            <option value="">Todas as séries</option>
            {seriesPresets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)}
            className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white outline-none">
            <option value="">Todos os idiomas</option>
            <option value="pt">Português</option>
            <option value="es">Espanhol</option>
            <option value="en">Inglês</option>
          </select>
          <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}
            className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white outline-none">
            <option value="">Todos os estágios</option>
            {PIPELINE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      )}

      {filteredAlbumPlans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAlbumPlans.map(plan => (
            <AlbumCard
              key={plan.id}
              plan={plan}
              onOpen={() => { setSelectedPlanId(plan.id); setGenerationError(null); }}
              onDuplicate={() => handleDuplicate(plan)}
              onDelete={() => handleDelete(plan.id)}
              onCreateNextVolume={() => handleCreateNextVolume(plan)}
              onStageChange={(stage) => handleStageChange(plan, stage)}
            />
          ))}
        </div>
      )}

      {albumPlans.length === 0 && (
        <div className="text-center py-12 opacity-40">
          <p className="text-lg font-medium text-gray-400">Nenhum álbum planejado ainda. Clique em "Novo Álbum" para começar.</p>
        </div>
      )}

      {albumPlans.length > 0 && filteredAlbumPlans.length === 0 && (
        <div className="text-center py-12 opacity-40">
          <p className="text-lg font-medium text-gray-400">Nenhum álbum encontrado com esses filtros.</p>
        </div>
      )}

      {/* Editor do álbum selecionado */}
      {selectedPlan && (
        <div className="pt-6 border-t border-dark-700 space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedPlanId(null)} className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1">
              ← Voltar ao Catálogo
            </button>
          </div>

          <AlbumPlannerForm
            plan={selectedPlan}
            onChange={updatePlan}
            seriesPresets={seriesPresets}
            onOpenPresetManager={() => setIsPresetManagerOpen(true)}
            settings={settings}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            allAlbumPlans={albumPlans}
          />

          {generationError && (
            <div className="bg-red-900/20 border border-red-800 text-red-300 px-6 py-4 rounded-lg text-center">
              {generationError}
            </div>
          )}

          {isGenerating && (
            <LoadingState
              title="Compondo o álbum..."
              subtitle={`Gerando ${selectedPlan.tracks.length} faixas com a identidade da série. Álbuns maiores podem levar mais tempo (geração em lotes).`}
            />
          )}

          {!isGenerating && selectedPlan.result && (
            <AlbumResultsView
              plan={selectedPlan}
              result={selectedPlan.result}
              seriesPreset={seriesPresets.find(p => p.id === selectedPlan.seriesPresetId) ?? null}
              settings={settings}
              onRegenerateTrack={handleRegenerateTrack}
              regeneratingTrackIndex={regeneratingTrackIndex}
              onToggleCopied={handleToggleCopied}
              onCreateTranslation={handleCreateTranslation}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumPlannerView;
