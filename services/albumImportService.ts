import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AppSettings, ParsedAlbumImport } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const IMPORT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    albumTitleGuess: { type: Type.STRING },
    volumeLabelGuess: { type: Type.STRING },
    languageGuess: { type: Type.STRING, description: "'pt', 'es' or 'en'" },
    tracks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          bpm: { type: Type.STRING },
          styleInstrumentation: { type: Type.STRING },
          referenceHymn: { type: Type.STRING },
          productionNote: { type: Type.STRING },
        },
        required: ["name"],
      },
    },
  },
  required: ["tracks"],
};

const IMPORT_INSTRUCTIONS = `
You extract structured album/tracklist data from raw pasted text (usually copied from a PDF release plan).
Extract ONLY what is explicitly present in the text. Do NOT invent hymn references, BPM values or production
notes that are not in the text — leave the field as an empty string if not present. Field mapping (columns may
be in Portuguese or Spanish): "Faixa"/"Track"/"Pista" -> name; "BPM" -> bpm; "Estilo/Instrumentação" -> styleInstrumentation;
"Hino/música de referência" -> referenceHymn; "Nota de produção" -> productionNote.
Return ONLY valid JSON matching the given schema.
`.trim();

/** Parser via Gemini — extrai TrackPlan[] de texto colado (ex: copiado de um PDF de plano de lançamento). */
async function parseWithGemini(rawText: string): Promise<ParsedAlbumImport> {
  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${IMPORT_INSTRUCTIONS}\n\nTEXT TO PARSE:\n"""\n${rawText}\n"""`,
    config: {
      responseMimeType: "application/json",
      responseSchema: IMPORT_SCHEMA,
      temperature: 0.1,
    },
  });
  const jsonText = response.text;
  if (!jsonText) throw new Error("Nenhum dado retornado pelo Gemini ao tentar interpretar o texto.");
  return JSON.parse(jsonText) as ParsedAlbumImport;
}

/** Parser via OpenRouter — mesmo objetivo, via prompt textual pedindo JSON. */
async function parseWithOpenRouter(rawText: string, apiKey: string, model: string): Promise<ParsedAlbumImport> {
  if (!apiKey) {
    throw new Error("Chave da API do OpenRouter não configurada. Vá em Configurações e insira sua chave.");
  }
  const userPrompt = `${IMPORT_INSTRUCTIONS}

Return ONLY a JSON object with this exact shape:
{
  "albumTitleGuess": "string",
  "volumeLabelGuess": "string",
  "languageGuess": "pt|es|en",
  "tracks": [
    { "name": "string", "bpm": "string", "styleInstrumentation": "string", "referenceHymn": "string", "productionNote": "string" }
  ]
}

TEXT TO PARSE:
"""
${rawText}
"""`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        { role: "system", content: "You extract structured data as JSON only. Never include markdown code fences or explanations." },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
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
  if (!content) throw new Error("Resposta vazia do OpenRouter.");

  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned) as ParsedAlbumImport;
  } catch {
    console.error("Failed to parse OpenRouter JSON:", cleaned);
    throw new Error("O modelo retornou um JSON inválido ao interpretar o texto. Tente outro modelo gratuito.");
  }
}

export async function parseAlbumPlanFromText(rawText: string, settings: AppSettings): Promise<ParsedAlbumImport> {
  if (!rawText.trim()) {
    throw new Error("Cole o texto do plano de álbum antes de importar.");
  }
  if (settings.provider === 'openrouter') {
    return parseWithOpenRouter(rawText, settings.openrouterApiKey, settings.openrouterModel);
  }
  return parseWithGemini(rawText);
}
