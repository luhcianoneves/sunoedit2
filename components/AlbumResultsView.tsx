import React, { useState } from 'react';
import { AlbumPlan, AppSettings, DEFAULT_DISTRIBUTION_METADATA, GeneratedAlbumResult, SeriesPreset } from '../types';
import SongCard from './SongCard';
import { exportAlbumPDF } from '../services/pdfExportService';
import { buildAlbumCopyText, exportAlbumCSV, exportAlbumTxt } from '../services/albumTextExport';
import { validateAlbumSong } from '../services/trackQualityCheck';
import { exportSymphonicMetadataCSV } from '../services/symphonicExport';
import { exportReleaseChecklistICS } from '../services/icsExport';
import TranslateAlbumModal from './TranslateAlbumModal';

interface AlbumResultsViewProps {
  plan: AlbumPlan;
  result: GeneratedAlbumResult;
  seriesPreset: SeriesPreset | null;
  settings: AppSettings;
  onRegenerateTrack?: (trackIndex: number) => void;
  regeneratingTrackIndex?: number | null;
  onToggleCopied?: (trackIndex: number) => void;
  onCreateTranslation?: (newPlan: AlbumPlan) => void;
}

const AlbumResultsView: React.FC<AlbumResultsViewProps> = ({
  plan, result, seriesPreset, settings, onRegenerateTrack, regeneratingTrackIndex, onToggleCopied, onCreateTranslation,
}) => {
  const [copiedAlbum, setCopiedAlbum] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [icsError, setIcsError] = useState<string | null>(null);
  const trackById = new Map(plan.tracks.map(t => [t.id, t]));
  const sortedSongs = [...result.songs].sort((a, b) => a.trackIndex - b.trackIndex);
  const copiedCount = sortedSongs.filter(s => s.copiedToSuno).length;
  const distribution = plan.distribution ?? { ...DEFAULT_DISTRIBUTION_METADATA, ...(seriesPreset?.distributionDefaults || {}) };

  const handleCopyAlbum = async () => {
    try {
      await navigator.clipboard.writeText(buildAlbumCopyText(plan, result));
      setCopiedAlbum(true);
      setTimeout(() => setCopiedAlbum(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportICS = () => {
    setIcsError(null);
    try {
      exportReleaseChecklistICS(plan);
    } catch (err: unknown) {
      setIcsError(err instanceof Error ? err.message : 'Erro ao exportar cronograma.');
    }
  };

  return (
    <div className="animate-fade-in-up pb-12 space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="bg-suno-600 w-2 h-8 rounded-full"></span>
            {plan.title} {plan.volumeLabel} — {sortedSongs.length} Faixas Prontas
          </h2>
          <p className="text-xs text-gray-500 mt-1 ml-4">
            {copiedCount}/{sortedSongs.length} já coladas no Suno
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={handleCopyAlbum}
            className={`font-bold py-2 px-5 rounded-full shadow-lg flex items-center gap-2 transition-all text-sm ${
              copiedAlbum ? 'bg-green-600 text-white' : 'bg-dark-800 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500'
            }`}
          >
            {copiedAlbum ? 'Álbum Copiado!' : 'Copiar Álbum Inteiro'}
          </button>
          <button
            onClick={() => exportAlbumTxt(plan, result)}
            className="bg-dark-800 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500 font-bold py-2 px-5 rounded-full shadow-lg transition-all text-sm"
          >
            TXT
          </button>
          <button
            onClick={() => exportAlbumCSV(plan, result)}
            className="bg-dark-800 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500 font-bold py-2 px-5 rounded-full shadow-lg transition-all text-sm"
          >
            CSV
          </button>
          <button
            onClick={() => exportSymphonicMetadataCSV(plan, result, distribution)}
            title="Referência de metadados pro upload no Symphonic Distribution"
            className="bg-dark-800 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500 font-bold py-2 px-5 rounded-full shadow-lg transition-all text-sm"
          >
            Symphonic
          </button>
          <button
            onClick={handleExportICS}
            title="Cronograma D-10 a D+7 (.ics) — importável em Google Calendar, Outlook, Apple Calendar"
            className="bg-dark-800 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500 font-bold py-2 px-5 rounded-full shadow-lg transition-all text-sm"
          >
            Cronograma
          </button>
          {onCreateTranslation && (
            <button
              onClick={() => setIsTranslateOpen(true)}
              className="bg-dark-800 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500 font-bold py-2 px-5 rounded-full shadow-lg transition-all text-sm"
            >
              Traduzir
            </button>
          )}
          <button
            onClick={() => exportAlbumPDF(plan, result)}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-5 rounded-full shadow-lg shadow-green-900/20 flex items-center gap-2 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            PDF
          </button>
        </div>
      </div>

      {icsError && (
        <div className="bg-red-900/20 border border-red-800 text-red-300 px-6 py-3 rounded-lg text-center text-sm">
          {icsError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {sortedSongs.map((song) => {
          const trackPlan = trackById.get(song.trackPlanId);
          const metaLine = trackPlan
            ? `BPM ${trackPlan.bpm || '-'} · Ref: ${trackPlan.referenceHymn || '-'}`
            : undefined;
          return (
            <SongCard
              key={song.trackPlanId}
              song={song}
              index={song.trackIndex}
              albumTitle={`${plan.title} ${plan.volumeLabel}`}
              metaLine={metaLine}
              warnings={validateAlbumSong(song)}
              onRegenerate={onRegenerateTrack ? () => onRegenerateTrack(song.trackIndex) : undefined}
              isRegenerating={regeneratingTrackIndex === song.trackIndex}
              copiedToSuno={song.copiedToSuno}
              onToggleCopied={onToggleCopied ? () => onToggleCopied(song.trackIndex) : undefined}
              socialCaptionContext={{ albumConcept: `${plan.title} ${plan.volumeLabel}`, language: plan.language, settings }}
            />
          );
        })}
      </div>

      {result.albumCoverPrompts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
            <span className="bg-purple-600 w-2 h-8 rounded-full"></span>
            Prompts de Capa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {result.albumCoverPrompts.map((prompt, idx) => (
              <div key={idx} className="bg-dark-800 border border-dark-700 rounded-xl p-4 text-xs font-mono text-gray-300 leading-relaxed">
                {prompt}
              </div>
            ))}
          </div>
        </div>
      )}

      {onCreateTranslation && (
        <TranslateAlbumModal
          isOpen={isTranslateOpen}
          onClose={() => setIsTranslateOpen(false)}
          sourcePlan={plan}
          sourceResult={result}
          seriesPreset={seriesPreset}
          settings={settings}
          onCreated={onCreateTranslation}
        />
      )}
    </div>
  );
};

export default AlbumResultsView;
