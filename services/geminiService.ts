import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SongGenerationResponse, GenerationMode, AlbumPlan, AlbumSong, SeriesPreset, CoverPromptFields, StudioLanguage } from "../types";
import { buildAlbumContextHeader, buildTrackBriefsBlock, LANGUAGE_LABEL } from "./albumPromptBuilder";
import { chunkTracks, mergeAndSortAlbumSongs } from "./albumGenerationHelpers";

// Inicialização lazy: só cria o cliente quando for realmente chamar o Gemini
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Função para criar o Schema dinâmico baseado na quantidade e modo
const createSchema = (mode: GenerationMode, quantity: number): Schema => {
  const itemProperties = {
    title: { type: Type.STRING, description: mode === 'instrumental' ? "Creative title for the instrumental track." : "The creative title of the song." },
    stylePrompt: { type: Type.STRING, description: "Optimized Suno AI style prompt." },
    lyrics: { type: Type.STRING, description: mode === 'instrumental' ? "Leave empty or put [Instrumental]." : "Full lyrics with metatags." },
    imagePrompt16_9: { type: Type.STRING, description: "Detailed 16:9 cinematic/photography background prompt for track art. 8k, ultra realistic. No text allowed." }
  };

  const requiredFields = ["title", "stylePrompt", "imagePrompt16_9"];
  if (mode === 'full') requiredFields.push("lyrics");

  return {
    type: Type.OBJECT,
    properties: {
      songs: {
        type: Type.ARRAY,
        description: `A list of exactly ${quantity} generated ${mode === 'instrumental' ? 'instrumental tracks' : 'songs'}.`,
        items: {
          type: Type.OBJECT,
          properties: itemProperties,
          required: requiredFields
        }
      },
      albumCovers: {
        type: Type.ARRAY,
        description: "Exactly 3 ultra-realistic, 8k, highly detailed image prompts for album covers based on the album vibe and style. Do not include ANY written text in the image.",
        items: {
          type: Type.STRING
        }
      }
    },
    required: ["songs", "albumCovers"]
  };
};

export const generateSongs = async (
  topic: string,
  rhythm: string,
  mode: GenerationMode,
  quantity: number
): Promise<SongGenerationResponse> => {
  try {
    let userPrompt = "";

    // Configuração dinâmica do Prompt
    if (mode === 'instrumental') {
      userPrompt = `
        Act as a Suno AI Architect. I need exactly ${quantity} INSTRUMENTAL tracks based on:
        THEME/VIBE: "${topic}"
        RHYTHM/STYLE: "${rhythm}"

        For each track provide:
        1. A Creative Title fitting the vibe.
        2. A Suno Style Prompt: Highly optimized string of keywords (Instruments, BPM, Vibe) that creates the perfect instrumental.
        3. Leave lyrics empty or use "[Instrumental]".
        4. imagePrompt16_9: A highly detailed, widescreen (16:9) cinematic photography background image prompt that captures the mood/vibe of this specific track. Use extreme realism, 8k, vivid textures. Do NOT include any written text on the image.

        Additionally, generate exactly 3 album cover image prompts. The prompts MUST be for 1:1 aspect ratio, extremely high-quality, ultra-realistic, 8k, photography, with extreme realism and textures. Do NOT include any written text, numbers, or letters on the covers.
      `;
    } else {
      userPrompt = `
        Act as a Suno AI Architect. I need exactly ${quantity} songs based on:
        THEME: "${topic}"
        RHYTHM: "${rhythm}"

        For each song provide:
        1. Creative Title.
        2. High-Quality Lyrics: formatted for Suno ([Verse], [Chorus]).
        3. Suno Style Prompt: Keywords for Genre, Vibe, Instruments, BPM.
        4. imagePrompt16_9: A highly detailed, widescreen (16:9) cinematic photography background image prompt that captures the story or vibe of this specific track. Use extreme realism, 8k, vivid textures. Do NOT include any written text on the image.

        Additionally, generate exactly 3 album cover image prompts. The prompts MUST be for 1:1 aspect ratio, extremely high-quality, ultra-realistic, 8k, photography, with extreme realism and textures. Do NOT include any written text, numbers, or letters on the covers.
      `;
    }

    const schema = createSchema(mode, quantity);

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: `You are an expert music producer for Generative Audio. Output valid JSON containing exactly ${quantity} items and 3 album cover prompts.`,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.85,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from Gemini.");

    return JSON.parse(jsonText) as SongGenerationResponse;

  } catch (error) {
    console.error("Error generating songs:", error);
    throw error;
  }
};

// ============================================================
// GERAÇÃO EM LOTE POR ÁLBUM (Planejador de Álbum)
// ============================================================

const GEMINI_ALBUM_CHUNK_SIZE = 10; // Gemini 2.5 Flash tolera bem um álbum inteiro em 1 chamada

const createAlbumSchema = (mode: GenerationMode, trackCount: number): Schema => {
  const itemProperties = {
    trackIndex: { type: Type.NUMBER, description: "0-based index matching the input track order. MUST match exactly, do not reorder or invent indices." },
    title: { type: Type.STRING, description: mode === 'instrumental' ? "Creative title for the instrumental track." : "The creative title of the song." },
    stylePrompt: { type: Type.STRING, description: "Optimized Suno AI style prompt (genre, vibe, instruments, BPM)." },
    lyrics: { type: Type.STRING, description: mode === 'instrumental' ? "Leave empty or put [Instrumental]." : "Full lyrics with Suno metatags ([Verse], [Chorus], [Bridge], [Outro])." },
    imagePrompt16_9: { type: Type.STRING, description: "Detailed 16:9 cinematic/photography background prompt for track art. 8k, ultra realistic. No text allowed." }
  };
  const requiredFields = ["trackIndex", "title", "stylePrompt", "imagePrompt16_9"];
  if (mode === 'full') requiredFields.push("lyrics");

  return {
    type: Type.OBJECT,
    properties: {
      songs: {
        type: Type.ARRAY,
        description: `Exactly ${trackCount} items, one per input track, each tagged with its correct trackIndex.`,
        items: { type: Type.OBJECT, properties: itemProperties, required: requiredFields }
      }
    },
    required: ["songs"]
  };
};

/**
 * Gera todas as faixas de um álbum planejado de uma vez, usando o contexto estruturado
 * de cada faixa (BPM, hino de referência, nota de produção) e a identidade fixa da série.
 * Faz chamadas sequenciais por lote (não paralelas) para não estourar rate-limit.
 */
export const generateAlbumSongs = async (
  albumPlan: AlbumPlan,
  seriesPreset: SeriesPreset | null,
  mode: GenerationMode
): Promise<AlbumSong[]> => {
  const tracks = albumPlan.tracks;
  const chunks = chunkTracks(tracks, GEMINI_ALBUM_CHUNK_SIZE);
  const rawChunks: any[][] = [];

  let cursor = 0;
  for (const chunk of chunks) {
    const contextHeader = buildAlbumContextHeader(albumPlan, seriesPreset);
    const trackBriefs = buildTrackBriefsBlock(chunk, cursor);
    const userPrompt = `
Act as a Suno AI Architect / music producer. Generate the following tracks for this album.

${contextHeader}

TRACKS TO GENERATE:
${trackBriefs}

For each track, return: trackIndex (matching exactly), a creative title, a Suno style prompt, ${mode === 'full' ? 'full lyrics with metatags,' : '[Instrumental] as lyrics,'} and a 16:9 cinematic image prompt for the track background (no written text on the image).
`.trim();

    const schema = createAlbumSchema(mode, chunk.length);

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: `You are an expert music producer for Generative Audio, producing a cohesive album where every track shares the same sonic identity. Output valid JSON with exactly ${chunk.length} items.`,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.85,
        maxOutputTokens: 8192,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Nenhum dado retornado pelo Gemini para este lote de faixas.");

    const parsed = JSON.parse(jsonText) as { songs: any[] };
    rawChunks.push(parsed.songs || []);
    cursor += chunk.length;
  }

  return mergeAndSortAlbumSongs(tracks, rawChunks);
};

/** Regenera uma única faixa do álbum (mantendo as outras intactas), usando a mesma identidade de série. */
export const regenerateAlbumTrack = async (
  albumPlan: AlbumPlan,
  seriesPreset: SeriesPreset | null,
  mode: GenerationMode,
  trackIndex: number
): Promise<AlbumSong> => {
  const track = albumPlan.tracks[trackIndex];
  if (!track) throw new Error(`Faixa de índice ${trackIndex} não encontrada no álbum.`);

  const contextHeader = buildAlbumContextHeader(albumPlan, seriesPreset);
  const trackBriefs = buildTrackBriefsBlock([track], trackIndex);
  const userPrompt = `
Act as a Suno AI Architect / music producer. Regenerate this single track for an existing album (write a fresh, different take).

${contextHeader}

TRACK TO REGENERATE:
${trackBriefs}

Return: trackIndex (matching exactly), a creative title, a Suno style prompt, ${mode === 'full' ? 'full lyrics with metatags,' : '[Instrumental] as lyrics,'} and a 16:9 cinematic image prompt for the track background (no written text on the image).
`.trim();

  const schema = createAlbumSchema(mode, 1);

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: `You are an expert music producer for Generative Audio. Output valid JSON with exactly 1 item.`,
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.95,
      maxOutputTokens: 4096,
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("Nenhum dado retornado pelo Gemini ao regenerar a faixa.");

  const parsed = JSON.parse(jsonText) as { songs: any[] };
  const raw = parsed.songs?.find(s => s.trackIndex === trackIndex) ?? parsed.songs?.[0];
  if (!raw) throw new Error("O Gemini não retornou a faixa regenerada.");

  return {
    trackPlanId: track.id,
    trackIndex,
    title: raw.title,
    stylePrompt: raw.stylePrompt,
    lyrics: raw.lyrics,
    imagePrompt16_9: raw.imagePrompt16_9,
  };
};

// ============================================================
// TRADUÇÃO DE ÁLBUM (expansão de mercado — ex: PT -> ES)
// ============================================================

export interface TranslatedTrackContent {
  trackIndex: number;
  title: string;
  stylePrompt: string;
  lyrics?: string;
}

const TRANSLATION_CHUNK_SIZE = 10;

const createTranslationSchema = (count: number): Schema => ({
  type: Type.OBJECT,
  properties: {
    songs: {
      type: Type.ARRAY,
      description: `Exactly ${count} translated items, each tagged with its correct trackIndex.`,
      items: {
        type: Type.OBJECT,
        properties: {
          trackIndex: { type: Type.NUMBER, description: "0-based index matching the input order. MUST match exactly." },
          title: { type: Type.STRING },
          stylePrompt: { type: Type.STRING },
          lyrics: { type: Type.STRING },
        },
        required: ["trackIndex", "title", "stylePrompt", "lyrics"],
      },
    },
  },
  required: ["songs"],
});

/** Traduz/adapta título, letra e style prompt de faixas já geradas para outro idioma, preservando metatags e identidade sonora. */
export const translateAlbumSongs = async (
  sourceSongs: AlbumSong[],
  targetLanguage: StudioLanguage,
  seriesPreset: SeriesPreset | null
): Promise<TranslatedTrackContent[]> => {
  const sorted = [...sourceSongs].sort((a, b) => a.trackIndex - b.trackIndex);
  const chunks = chunkTracks(sorted, TRANSLATION_CHUNK_SIZE);
  const results: TranslatedTrackContent[] = [];

  for (const chunk of chunks) {
    const tracksBlock = chunk.map(s => `
TRACK (trackIndex=${s.trackIndex}):
Original Title: ${s.title}
Original Style Prompt: ${s.stylePrompt}
Original Lyrics:
${s.lyrics || '[Instrumental]'}
`.trim()).join('\n\n---\n\n');

    const userPrompt = `
Act as a professional music localization translator. Translate/culturally adapt the following tracks into ${LANGUAGE_LABEL[targetLanguage]}.
${seriesPreset ? `Series identity to preserve: instruments — ${seriesPreset.instrumentKit}; vocal — ${seriesPreset.vocalProfile}.` : ''}

Rules:
- Translate titles and lyrics naturally (not literal word-for-word), keeping the same meaning, emotional tone, and singability in the target language.
- Keep Suno structural metatags exactly as-is in English brackets ([Verse], [Chorus], [Bridge], [Outro]) — never translate the tags themselves, only the lyric lines between them.
- Keep the style prompt's instrument/genre/BPM keywords intact; only adapt language-specific descriptors (e.g. vocal language) to reflect the new language.
- If original lyrics are "[Instrumental]", keep lyrics as "[Instrumental]".

TRACKS TO TRANSLATE:
${tracksBlock}
`.trim();

    const schema = createTranslationSchema(chunk.length);

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: `You are a professional music localization translator. Output valid JSON with exactly ${chunk.length} items.`,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Nenhum dado retornado pelo Gemini ao traduzir o álbum.");

    const parsed = JSON.parse(jsonText) as { songs: TranslatedTrackContent[] };
    results.push(...(parsed.songs || []));
  }

  return results;
};

const COVER_SUGGESTION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    ageRange: { type: Type.STRING },
    expressionAction: { type: Type.STRING },
    wardrobeProp: { type: Type.STRING },
    setting: { type: Type.STRING },
    mood: { type: Type.STRING },
  },
  required: ["ageRange", "expressionAction", "wardrobeProp", "setting", "mood"],
};

/** Sugere só os campos variáveis do prompt de capa (idade/expressão/roupa/cenário/humor), preservando o template fixo. */
export const suggestCoverFields = async (
  albumConcept: string,
  baseFields: CoverPromptFields
): Promise<Partial<CoverPromptFields>> => {
  const userPrompt = `
Album concept: "${albumConcept}"
Current gender: ${baseFields.gender}
Current color palette: ${baseFields.colorPalette}

Suggest creative, photorealistic variation for these fields of an album cover photograph prompt (keep them short, in English, descriptive phrases only — no full sentences with subject):
- ageRange (e.g. "50s")
- expressionAction (facial expression + action)
- wardrobeProp (clothing/props)
- setting (background scene)
- mood (lighting/atmosphere)
`.trim();

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: "You are an art director suggesting variations for a consistent album cover photography series.",
      responseMimeType: "application/json",
      responseSchema: COVER_SUGGESTION_SCHEMA,
      temperature: 0.9,
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("Nenhuma sugestão retornada pelo Gemini.");
  return JSON.parse(jsonText) as Partial<CoverPromptFields>;
};

const SOCIAL_CAPTION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    caption: { type: Type.STRING },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["caption", "hashtags"],
};

/** Legenda curta + hashtags para redes sociais de uma faixa específica (clipes de 15-30s). */
export const suggestSocialCaption = async (
  songTitle: string,
  albumConcept: string,
  language: StudioLanguage
): Promise<{ caption: string; hashtags: string[] }> => {
  const userPrompt = `
Track title: "${songTitle}"
Album concept: "${albumConcept}"
Language: ${LANGUAGE_LABEL[language]}

Write a short, engaging social media caption (2-3 sentences max, hook-driven, in ${LANGUAGE_LABEL[language]}) for a 15-30s Reels/TikTok/Shorts clip promoting this track, plus 8-12 relevant hashtags (no # symbol needed, just the words).
`.trim();

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: "You are a social media copywriter for a music label.",
      responseMimeType: "application/json",
      responseSchema: SOCIAL_CAPTION_SCHEMA,
      temperature: 0.9,
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("Nenhuma legenda retornada pelo Gemini.");
  return JSON.parse(jsonText) as { caption: string; hashtags: string[] };
};
