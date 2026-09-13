import { AlbumSong } from '../types';

/** Limites práticos observados no Suno AI — usados só como aviso visual, não bloqueiam nada. */
export const SUNO_STYLE_PROMPT_LIMIT = 200;
export const SUNO_LYRICS_LIMIT = 3000;

export type CharLimitStatus = 'ok' | 'warning' | 'over';

export function getCharLimitStatus(length: number, limit: number): CharLimitStatus {
  if (length > limit) return 'over';
  if (length > limit * 0.85) return 'warning';
  return 'ok';
}

/** Roda checagens simples de qualidade numa faixa recém-gerada e retorna avisos legíveis. */
export function validateAlbumSong(song: AlbumSong): string[] {
  const warnings: string[] = [];
  const isInstrumental = !song.lyrics || song.lyrics.toLowerCase().includes('[instrumental]') || song.lyrics.trim().length < 20;

  if (!song.title || song.title.trim().length === 0) {
    warnings.push('Sem título');
  }
  if (!song.stylePrompt || song.stylePrompt.trim().length < 10) {
    warnings.push('Style prompt vazio ou muito curto');
  }
  if (song.stylePrompt && song.stylePrompt.length > SUNO_STYLE_PROMPT_LIMIT) {
    warnings.push(`Style prompt acima de ${SUNO_STYLE_PROMPT_LIMIT} caracteres (pode ser cortado no Suno)`);
  }
  if (!isInstrumental) {
    if (!song.lyrics || !/\[[^\]]+\]/.test(song.lyrics)) {
      warnings.push('Letra sem metatags ([Verse], [Chorus]...)');
    }
    if (song.lyrics && song.lyrics.length > SUNO_LYRICS_LIMIT) {
      warnings.push(`Letra acima de ${SUNO_LYRICS_LIMIT} caracteres (pode ser cortada no Suno)`);
    }
  }
  if (!song.imagePrompt16_9 || song.imagePrompt16_9.trim().length < 10) {
    warnings.push('Prompt de imagem 16:9 vazio');
  }

  return warnings;
}
