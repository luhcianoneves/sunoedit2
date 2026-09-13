import { AlbumPlan, GeneratedAlbumResult } from '../types';

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

/** Monta letra + style prompt de todas as faixas em um único bloco de texto, pronto para colar no Suno. */
export function buildAlbumCopyText(plan: AlbumPlan, result: GeneratedAlbumResult): string {
  const sorted = [...result.songs].sort((a, b) => a.trackIndex - b.trackIndex);
  const trackById = new Map(plan.tracks.map(t => [t.id, t]));

  const header = `${plan.title} ${plan.volumeLabel}\n${'='.repeat(60)}\n\n`;

  const body = sorted
    .map((song) => {
      const trackPlan = trackById.get(song.trackPlanId);
      const isInstrumental = !song.lyrics || song.lyrics.toLowerCase().includes('[instrumental]');
      return [
        `=== FAIXA ${song.trackIndex + 1}: ${song.title} ===`,
        trackPlan ? `BPM ${trackPlan.bpm || '-'} · Ref: ${trackPlan.referenceHymn || '-'}` : '',
        '',
        'STYLE PROMPT:',
        song.stylePrompt,
        '',
        'LETRA:',
        isInstrumental ? '[Instrumental]' : (song.lyrics || ''),
        '',
      ].filter(Boolean).join('\n');
    })
    .join('\n\n');

  const covers = result.albumCoverPrompts.length > 0
    ? `\n\n=== PROMPTS DE CAPA ===\n\n${result.albumCoverPrompts.map((p, i) => `Opção ${i + 1}: ${p}`).join('\n\n')}`
    : '';

  return header + body + covers;
}

export function exportAlbumTxt(plan: AlbumPlan, result: GeneratedAlbumResult) {
  const content = buildAlbumCopyText(plan, result);
  downloadTextFile(`${safeFileName(plan.title)}_${safeFileName(plan.volumeLabel)}.txt`, content, 'text/plain');
}

function csvEscape(value: string): string {
  const v = (value ?? '').replace(/"/g, '""');
  return `"${v}"`;
}

/** Export CSV com a tracklist completa (input planejado + conteúdo gerado) — fácil de colar em planilha. */
export function exportAlbumCSV(plan: AlbumPlan, result?: GeneratedAlbumResult) {
  const songByTrackId = new Map((result?.songs ?? []).map(s => [s.trackPlanId, s]));
  const header = ['#', 'Faixa', 'BPM', 'Estilo/Instrumentação', 'Hino de Referência', 'Nota de Produção', 'Título Gerado', 'Style Prompt', 'Letra'];

  const rows = plan.tracks.map((t, i) => {
    const song = songByTrackId.get(t.id);
    return [
      String(i + 1),
      t.name,
      t.bpm,
      t.styleInstrumentation,
      t.referenceHymn,
      t.productionNote,
      song?.title || '',
      song?.stylePrompt || '',
      song?.lyrics || '',
    ];
  });

  const csv = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\r\n');
  downloadTextFile(`${safeFileName(plan.title)}_${safeFileName(plan.volumeLabel)}.csv`, csv, 'text/csv');
}
