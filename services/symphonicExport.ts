import { AlbumPlan, DistributionMetadata, GeneratedAlbumResult } from '../types';

/**
 * Export de referência para preencher o upload do Symphonic Distribution mais rápido.
 * Campos baseados no Help Desk oficial do Symphonic (Full upload guide / Metadata Guidelines):
 * Release Title, Track Title, Primary Artist, Label, Genre, Subgenre, Metadata Language,
 * ISRC/UPC (Symphonic atribui automaticamente se deixado em branco), Composer/Writer
 * (nome legal completo, obrigatório), Explicit Content.
 * IMPORTANTE: isto NÃO é o schema oficial de bulk-import XML do Symphonic — é uma tabela de
 * referência para agilizar o preenchimento manual do formulário deles.
 */

function csvEscape(value: string): string {
  const v = (value ?? '').replace(/"/g, '""');
  return `"${v}"`;
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeFileName(s: string): string {
  return s.replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
}

const LANGUAGE_LABEL: Record<string, string> = { pt: 'Portuguese', es: 'Spanish', en: 'English' };

export function exportSymphonicMetadataCSV(plan: AlbumPlan, result: GeneratedAlbumResult, distribution: DistributionMetadata) {
  const header = [
    'Release Title', 'Track #', 'Track Title', 'Primary Artist', 'Label',
    'Genre', 'Subgenre', 'Metadata Language', 'ISRC', 'UPC',
    'Composer/Writer (legal name)', 'Explicit Content', 'Release Date',
  ];

  const releaseTitle = `${plan.title} ${plan.volumeLabel}`.trim();
  const sortedSongs = [...result.songs].sort((a, b) => a.trackIndex - b.trackIndex);

  const rows = sortedSongs.map((song) => [
    releaseTitle,
    String(song.trackIndex + 1),
    song.title,
    distribution.primaryArtist,
    distribution.label,
    distribution.primaryGenre,
    distribution.subGenre,
    LANGUAGE_LABEL[plan.language] ?? plan.language,
    '(atribuído automaticamente pelo Symphonic)',
    distribution.upc || '(atribuído automaticamente pelo Symphonic)',
    distribution.composerName,
    distribution.explicit ? 'Yes' : 'No',
    distribution.releaseDate,
  ]);

  const csv = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\r\n');
  downloadTextFile(`Symphonic_${safeFileName(releaseTitle)}.csv`, csv, 'text/csv');
}
