import React from 'react';
import { AlbumPlan, SeriesPreset } from '../types';

interface CatalogSummaryProps {
  albumPlans: AlbumPlan[];
  seriesPresets: SeriesPreset[];
}

const CatalogSummary: React.FC<CatalogSummaryProps> = ({ albumPlans, seriesPresets }) => {
  if (albumPlans.length === 0) return null;

  const totalAlbums = albumPlans.length;
  const totalTracksPlanned = albumPlans.reduce((sum, p) => sum + p.tracks.length, 0);
  const totalTracksGenerated = albumPlans.reduce((sum, p) => sum + (p.result?.songs.length ?? 0), 0);

  const bySeries = new Map<string, number>();
  albumPlans.forEach(p => {
    const name = seriesPresets.find(s => s.id === p.seriesPresetId)?.name ?? 'Sem série';
    bySeries.set(name, (bySeries.get(name) ?? 0) + 1);
  });

  const byLanguage = new Map<string, number>();
  albumPlans.forEach(p => {
    byLanguage.set(p.language, (byLanguage.get(p.language) ?? 0) + 1);
  });

  const generatedDates = albumPlans
    .map(p => p.result?.generatedAt)
    .filter((d): d is string => !!d)
    .sort();
  const lastGeneratedAt = generatedDates[generatedDates.length - 1];

  const stat = (label: string, value: React.ReactNode) => (
    <div className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 flex-1 min-w-[140px]">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">{label}</div>
    </div>
  );

  return (
    <div className="bg-dark-800/60 border border-dark-700 rounded-2xl p-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        {stat('Álbuns no Catálogo', totalAlbums)}
        {stat('Faixas Planejadas', totalTracksPlanned)}
        {stat('Faixas Geradas', totalTracksGenerated)}
        {stat('Último Gerado', lastGeneratedAt ? new Date(lastGeneratedAt).toLocaleDateString('pt-BR') : '—')}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-gray-400 px-1">
        <div>
          <span className="text-gray-500 font-bold uppercase tracking-wider mr-2">Por série:</span>
          {Array.from(bySeries.entries()).map(([name, count]) => (
            <span key={name} className="mr-3">{name} <span className="text-suno-400 font-bold">×{count}</span></span>
          ))}
        </div>
        <div>
          <span className="text-gray-500 font-bold uppercase tracking-wider mr-2">Por idioma:</span>
          {Array.from(byLanguage.entries()).map(([lang, count]) => (
            <span key={lang} className="mr-3">{lang.toUpperCase()} <span className="text-suno-400 font-bold">×{count}</span></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogSummary;
