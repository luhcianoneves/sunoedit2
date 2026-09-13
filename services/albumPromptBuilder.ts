import { AlbumPlan, SeriesPreset, TrackPlan, StudioLanguage } from '../types';

export const LANGUAGE_LABEL: Record<StudioLanguage, string> = {
  pt: 'Portuguese (Brazil)',
  es: 'Spanish',
  en: 'English',
};

/** Bloco de identidade da série — reusado tanto pelo prompt do Gemini quanto do OpenRouter. */
export function buildSeriesIdentityBlock(preset: SeriesPreset | null, language: StudioLanguage): string {
  if (!preset) {
    return `LANGUAGE: Write all titles and lyrics in ${LANGUAGE_LABEL[language]}.`;
  }
  return `
ALBUM SERIES IDENTITY (keep consistent across every track — this is what makes volumes of the same series recognizable):
- Instrument kit (fixed): ${preset.instrumentKit}
- Vocal profile: ${preset.vocalProfile}
- BPM range: ${preset.bpmMin}-${preset.bpmMax}
- Album dynamic arc: ${preset.dynamicArc}
- LANGUAGE: Write all titles and lyrics in ${LANGUAGE_LABEL[language]}.
${preset.notes ? `- Series notes: ${preset.notes}` : ''}
`.trim();
}

/** Monta a tabela de faixas planejadas (nome, bpm, estilo, hino de referência, nota de produção) como texto. */
export function buildTrackBriefsBlock(tracks: TrackPlan[], startIndex: number): string {
  return tracks
    .map((t, i) => {
      const idx = startIndex + i;
      return `
TRACK ${idx} (trackIndex=${idx}):
- Working name/theme: ${t.name || '(sem nome sugerido — crie um título criativo coerente com o resto)'}
- Target BPM: ${t.bpm || '(usar a faixa de BPM da série)'}
- Style/instrumentation hint: ${t.styleInstrumentation || '(seguir o kit de instrumentos da série)'}
- Reference hymn/theme (mood & tempo direction ONLY — do NOT copy its lyrics or melody, write fully original lyrics): ${t.referenceHymn || '(nenhuma referência específica)'}
- Production note: ${t.productionNote || '(nenhuma nota específica)'}
`.trim();
    })
    .join('\n\n');
}

/** Instrução comum sobre o uso do hino de referência, para evitar paráfrase indevida. */
export const HYMN_REFERENCE_GUARDRAIL =
  'IMPORTANT: reference hymns/themes listed per track are ONLY a mood/tempo/emotional direction for the AI to draw ' +
  'inspiration from. Do NOT reproduce or closely paraphrase their original lyrics or melody — write fully original lyrics ' +
  'and a fully original melody direction in the style prompt.';

export function buildAlbumContextHeader(albumPlan: AlbumPlan, preset: SeriesPreset | null): string {
  return `
ALBUM: "${albumPlan.title}" ${albumPlan.volumeLabel}
${buildSeriesIdentityBlock(preset, albumPlan.language)}
${HYMN_REFERENCE_GUARDRAIL}
`.trim();
}
