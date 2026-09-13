import { AlbumSong, TrackPlan } from '../types';

/** Quebra a lista de faixas em blocos — chamadas sequenciais menores são mais confiáveis
 *  (evita truncamento de JSON em respostas grandes e reduz risco de rate-limit). */
export function chunkTracks<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

interface RawGeneratedItem {
  trackIndex: number;
  title: string;
  stylePrompt: string;
  lyrics?: string;
  imagePrompt16_9?: string;
}

/** Ordena e valida a resposta da IA por trackIndex, garantindo que todas as faixas voltaram exatamente uma vez. */
export function mergeAndSortAlbumSongs(
  allTracks: TrackPlan[],
  rawItemsByChunk: RawGeneratedItem[][]
): AlbumSong[] {
  const flat = rawItemsByChunk.flat();
  const byIndex = new Map<number, RawGeneratedItem>();

  for (const item of flat) {
    if (typeof item.trackIndex !== 'number') continue;
    byIndex.set(item.trackIndex, item);
  }

  const missing: number[] = [];
  const songs: AlbumSong[] = allTracks.map((track, i) => {
    const raw = byIndex.get(i);
    if (!raw) {
      missing.push(i);
      return {
        trackPlanId: track.id,
        trackIndex: i,
        title: track.name || `Faixa ${i + 1}`,
        stylePrompt: '',
        lyrics: '',
        imagePrompt16_9: '',
      };
    }
    return {
      trackPlanId: track.id,
      trackIndex: i,
      title: raw.title,
      stylePrompt: raw.stylePrompt,
      lyrics: raw.lyrics,
      imagePrompt16_9: raw.imagePrompt16_9,
    };
  });

  if (missing.length > 0) {
    throw new Error(
      `A IA não retornou ${missing.length} de ${allTracks.length} faixa(s) (índices: ${missing.join(', ')}). ` +
      `Tente gerar novamente — considere reduzir o número de faixas por lote se o problema persistir.`
    );
  }

  return songs;
}
