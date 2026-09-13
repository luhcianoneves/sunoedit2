import { SongGenerationResponse, GenerationMode, AlbumPlan, AlbumSong, SeriesPreset, CoverPromptFields, StudioLanguage } from "../types";
import { buildAlbumContextHeader, buildTrackBriefsBlock, LANGUAGE_LABEL } from "./albumPromptBuilder";
import { chunkTracks, mergeAndSortAlbumSongs } from "./albumGenerationHelpers";
import { TranslatedTrackContent } from "./geminiService";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const buildPrompt = (topic: string, rhythm: string, mode: GenerationMode, quantity: number): string => {
    if (mode === 'instrumental') {
        return `Act as a Suno AI Architect. Generate exactly ${quantity} INSTRUMENTAL tracks based on:
THEME/VIBE: "${topic}"
RHYTHM/STYLE: "${rhythm}"

For each track provide:
1. A Creative Title fitting the vibe.
2. A Suno Style Prompt: Highly optimized string of keywords (Instruments, BPM, Vibe) that creates the perfect instrumental.
3. Leave lyrics empty or use "[Instrumental]".
4. imagePrompt16_9: A highly detailed, widescreen (16:9) cinematic photography background image prompt that captures the mood/vibe of this specific track. Use extreme realism, 8k, vivid textures. Do NOT include any written text on the image.

Additionally, generate exactly 3 highly detailed album cover prompts (1:1 aspect ratio, photography, ultra-realistic, 8k, with extreme textures and vivid realism, no written text allowed in the image).

You MUST return a valid JSON object with this exact structure:
{
  "songs": [
    {
      "title": "string",
      "stylePrompt": "string",
      "lyrics": "[Instrumental]",
      "imagePrompt16_9": "string (16:9 prompt)"
    }
  ],
  "albumCovers": [
    "prompt 1",
    "prompt 2",
    "prompt 3"
  ]
}
Return ONLY the JSON object, no markdown, no explanation.`;
    }

    return `Act as a Suno AI Architect. Generate exactly ${quantity} songs based on:
THEME: "${topic}"
RHYTHM: "${rhythm}"

For each song provide:
1. Creative Title.
2. High-Quality Lyrics: formatted for Suno with metatags like [Verse], [Chorus], [Bridge], [Outro].
3. Suno Style Prompt: Keywords for Genre, Vibe, Instruments, BPM.
4. imagePrompt16_9: A highly detailed, widescreen (16:9) cinematic photography background image prompt that captures the story/vibe of this specific track. Use extreme realism, 8k, vivid textures. Do NOT include any written text on the image.

Additionally, generate exactly 3 highly detailed album cover prompts (1:1 aspect ratio, photography, ultra-realistic, 8k, with extreme textures and vivid realism, no written text allowed in the image).

You MUST return a valid JSON object with this exact structure:
{
  "songs": [
    {
      "title": "string",
      "stylePrompt": "string",
      "lyrics": "string with full lyrics and metatags",
      "imagePrompt16_9": "string (16:9 prompt)"
    }
  ],
  "albumCovers": [
    "prompt 1",
    "prompt 2",
    "prompt 3"
  ]
}
Return ONLY the JSON object, no markdown, no explanation.`;
};

export const generateSongsOpenRouter = async (
    topic: string,
    rhythm: string,
    mode: GenerationMode,
    quantity: number,
    apiKey: string,
    model: string
): Promise<SongGenerationResponse> => {
    if (!apiKey) {
        throw new Error("Chave da API do OpenRouter não configurada. Vá em Configurações e insira sua chave.");
    }

    const prompt = buildPrompt(topic, rhythm, mode, quantity);

    const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://suno-architect.app",
            "X-Title": "Suno Architect",
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: "system",
                    content: `You are an expert music producer for Generative Audio. Output valid JSON containing exactly ${quantity} items. Never include markdown code fences or any text outside the JSON object.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.85,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("OpenRouter API error:", errorBody);
        throw new Error(`Erro na API do OpenRouter (${response.status}). Verifique sua chave e o modelo selecionado.`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("Resposta vazia do OpenRouter. Tente outro modelo.");
    }

    // Strip possible code fences from some models
    const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
        const parsed = JSON.parse(cleaned) as SongGenerationResponse;
        if (!parsed.songs || !Array.isArray(parsed.songs)) {
            throw new Error("Formato de resposta inválido.");
        }
        return parsed;
    } catch {
        console.error("Failed to parse OpenRouter JSON:", cleaned);
        throw new Error("O modelo retornou um JSON inválido. Tente outro modelo gratuito.");
    }
};

// ============================================================
// GERAÇÃO EM LOTE POR ÁLBUM (Planejador de Álbum) — via OpenRouter
// ============================================================

const OPENROUTER_ALBUM_CHUNK_SIZE = 4; // modelos free truncam/alucinam mais fácil em lotes grandes

/** Chamada genérica ao chat/completions do OpenRouter pedindo JSON puro de volta. */
async function callOpenRouterJson(systemPrompt: string, userPrompt: string, apiKey: string, model: string): Promise<any> {
    if (!apiKey) {
        throw new Error("Chave da API do OpenRouter não configurada. Vá em Configurações e insira sua chave.");
    }

    const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://suno-architect.app",
            "X-Title": "Suno Architect",
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.85,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("OpenRouter API error:", errorBody);
        throw new Error(`Erro na API do OpenRouter (${response.status}). Verifique sua chave e o modelo selecionado.`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("Resposta vazia do OpenRouter. Tente outro modelo.");
    }

    const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        console.error("Failed to parse OpenRouter JSON:", cleaned);
        throw new Error("O modelo retornou um JSON inválido. Tente outro modelo gratuito.");
    }
}

/** Equivalente a generateAlbumSongs (geminiService), mas via OpenRouter — lotes menores por chunk. */
export const generateAlbumSongsOpenRouter = async (
    albumPlan: AlbumPlan,
    seriesPreset: SeriesPreset | null,
    mode: GenerationMode,
    apiKey: string,
    model: string
): Promise<AlbumSong[]> => {
    const tracks = albumPlan.tracks;
    const chunks = chunkTracks(tracks, OPENROUTER_ALBUM_CHUNK_SIZE);
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

You MUST return a valid JSON object with this exact structure:
{
  "songs": [
    {
      "trackIndex": 0,
      "title": "string",
      "stylePrompt": "string",
      "lyrics": "${mode === 'full' ? 'string with full lyrics and metatags' : '[Instrumental]'}",
      "imagePrompt16_9": "string (16:9 prompt)"
    }
  ]
}
Return exactly ${chunk.length} items, each with the correct trackIndex matching the input. Return ONLY the JSON object, no markdown, no explanation.
`.trim();

        const systemPrompt = `You are an expert music producer for Generative Audio, producing a cohesive album where every track shares the same sonic identity. Output valid JSON containing exactly ${chunk.length} items. Never include markdown code fences or any text outside the JSON object.`;

        const parsed = await callOpenRouterJson(systemPrompt, userPrompt, apiKey, model);
        if (!parsed.songs || !Array.isArray(parsed.songs)) {
            throw new Error("Formato de resposta inválido do OpenRouter para este lote de faixas.");
        }
        rawChunks.push(parsed.songs);
        cursor += chunk.length;
    }

    return mergeAndSortAlbumSongs(tracks, rawChunks);
};

/** Equivalente a regenerateAlbumTrack (geminiService), mas via OpenRouter. */
export const regenerateAlbumTrackOpenRouter = async (
    albumPlan: AlbumPlan,
    seriesPreset: SeriesPreset | null,
    mode: GenerationMode,
    trackIndex: number,
    apiKey: string,
    model: string
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

You MUST return a valid JSON object with this exact structure:
{
  "songs": [
    {
      "trackIndex": ${trackIndex},
      "title": "string",
      "stylePrompt": "string",
      "lyrics": "${mode === 'full' ? 'string with full lyrics and metatags' : '[Instrumental]'}",
      "imagePrompt16_9": "string (16:9 prompt)"
    }
  ]
}
Return ONLY the JSON object, no markdown, no explanation.
`.trim();

    const systemPrompt = "You are an expert music producer for Generative Audio. Output valid JSON with exactly 1 item. Never include markdown code fences or any text outside the JSON object.";

    const parsed = await callOpenRouterJson(systemPrompt, userPrompt, apiKey, model);
    const raw = parsed?.songs?.find((s: any) => s.trackIndex === trackIndex) ?? parsed?.songs?.[0];
    if (!raw) throw new Error("O OpenRouter não retornou a faixa regenerada.");

    return {
        trackPlanId: track.id,
        trackIndex,
        title: raw.title,
        stylePrompt: raw.stylePrompt,
        lyrics: raw.lyrics,
        imagePrompt16_9: raw.imagePrompt16_9,
    };
};

/** Equivalente a suggestCoverFields (geminiService), mas via OpenRouter. */
export const suggestCoverFieldsOpenRouter = async (
    albumConcept: string,
    baseFields: CoverPromptFields,
    apiKey: string,
    model: string
): Promise<Partial<CoverPromptFields>> => {
    const userPrompt = `
Album concept: "${albumConcept}"
Current gender: ${baseFields.gender}
Current color palette: ${baseFields.colorPalette}

Suggest creative, photorealistic variation for these fields of an album cover photograph prompt (short descriptive phrases only, in English, no full sentences with subject): ageRange, expressionAction, wardrobeProp, setting, mood.

Return ONLY a JSON object: {"ageRange": "...", "expressionAction": "...", "wardrobeProp": "...", "setting": "...", "mood": "..."}
`.trim();

    const systemPrompt = "You are an art director suggesting variations for a consistent album cover photography series. Output valid JSON only, no markdown.";
    return callOpenRouterJson(systemPrompt, userPrompt, apiKey, model) as Promise<Partial<CoverPromptFields>>;
};

const TRANSLATION_CHUNK_SIZE_OR = 10;

/** Equivalente a translateAlbumSongs (geminiService), mas via OpenRouter. */
export const translateAlbumSongsOpenRouter = async (
    sourceSongs: AlbumSong[],
    targetLanguage: StudioLanguage,
    seriesPreset: SeriesPreset | null,
    apiKey: string,
    model: string
): Promise<TranslatedTrackContent[]> => {
    const sorted = [...sourceSongs].sort((a, b) => a.trackIndex - b.trackIndex);
    const chunks = chunkTracks(sorted, TRANSLATION_CHUNK_SIZE_OR);
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
- Translate titles and lyrics naturally (not literal word-for-word), keeping meaning, emotional tone, and singability.
- Keep Suno structural metatags exactly as-is in English brackets ([Verse], [Chorus], [Bridge], [Outro]) — never translate the tags, only the lyric lines.
- Keep the style prompt's instrument/genre/BPM keywords intact; only adapt language-specific descriptors.
- If original lyrics are "[Instrumental]", keep lyrics as "[Instrumental]".

TRACKS TO TRANSLATE:
${tracksBlock}

You MUST return a valid JSON object with this exact structure:
{
  "songs": [
    { "trackIndex": 0, "title": "string", "stylePrompt": "string", "lyrics": "string" }
  ]
}
Return ONLY the JSON object, no markdown, no explanation.
`.trim();

        const systemPrompt = `You are a professional music localization translator. Output valid JSON with exactly ${chunk.length} items. Never include markdown code fences or any text outside the JSON object.`;

        const parsed = await callOpenRouterJson(systemPrompt, userPrompt, apiKey, model);
        if (!parsed.songs || !Array.isArray(parsed.songs)) {
            throw new Error("Formato de resposta inválido do OpenRouter ao traduzir o álbum.");
        }
        results.push(...parsed.songs);
    }

    return results;
};

/** Legenda curta + hashtags para redes sociais de uma faixa específica. */
export const suggestSocialCaptionOpenRouter = async (
    songTitle: string,
    albumConcept: string,
    language: StudioLanguage,
    apiKey: string,
    model: string
): Promise<{ caption: string; hashtags: string[] }> => {
    const userPrompt = `
Track title: "${songTitle}"
Album concept: "${albumConcept}"
Language: ${LANGUAGE_LABEL[language]}

Write a short, engaging social media caption (2-3 sentences max, hook-driven, in ${LANGUAGE_LABEL[language]}) for a 15-30s Reels/TikTok/Shorts clip promoting this track, plus 8-12 relevant hashtags (no # symbol needed in the array, just the words).

Return ONLY a JSON object: {"caption": "...", "hashtags": ["...", "..."]}
`.trim();

    const systemPrompt = "You are a social media copywriter for a music label. Output valid JSON only, no markdown.";
    const result = await callOpenRouterJson(systemPrompt, userPrompt, apiKey, model);
    return { caption: result.caption || '', hashtags: Array.isArray(result.hashtags) ? result.hashtags : [] };
};
