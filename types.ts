export interface Song {
  title: string;
  stylePrompt: string;
  lyrics?: string; // Opcional, pois pode ser instrumental
  imagePrompt16_9?: string;
}

export interface SongGenerationResponse {
  songs: Song[];
  albumCovers?: string[];
}

export type GenerationMode = 'full' | 'instrumental';

export interface GeneratorFormData {
  topic: string;
  rhythm: string;
  mode: GenerationMode;
  quantity: 1 | 10;
}

export type AIProvider = 'gemini' | 'openrouter';

export interface AppSettings {
  provider: AIProvider;
  openrouterApiKey: string;
  openrouterModel: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  provider: 'gemini',
  openrouterApiKey: '',
  openrouterModel: 'mistralai/mistral-7b-instruct:free',
};

export const OPENROUTER_FREE_MODELS = [
  { id: 'mistralai/mistral-7b-instruct:free', label: 'Mistral 7B Instruct (Free)' },
  { id: 'meta-llama/llama-3-8b-instruct:free', label: 'Llama 3 8B Instruct (Free)' },
  { id: 'google/gemma-3-1b-it:free', label: 'Google Gemma 3 1B (Free)' },
  { id: 'google/gemma-3-4b-it:free', label: 'Google Gemma 3 4B (Free)' },
  { id: 'google/gemma-3-12b-it:free', label: 'Google Gemma 3 12B (Free)' },
  { id: 'google/gemma-3-27b-it:free', label: 'Google Gemma 3 27B (Free)' },
  { id: 'deepseek/deepseek-r1:free', label: 'DeepSeek R1 (Free)' },
  { id: 'deepseek/deepseek-v3-base:free', label: 'DeepSeek V3 Base (Free)' },
  { id: 'qwen/qwen3-8b:free', label: 'Qwen3 8B (Free)' },
  { id: 'qwen/qwen3-14b:free', label: 'Qwen3 14B (Free)' },
  { id: 'qwen/qwen3-32b:free', label: 'Qwen3 32B (Free)' },
  { id: 'microsoft/phi-4-reasoning:free', label: 'Microsoft Phi-4 Reasoning (Free)' },
];

// ============================================================
// PLANEJADOR DE ÁLBUM — tipos usados pelo modo "Planejador"
// ============================================================

export type StudioLanguage = 'pt' | 'es' | 'en';

/**
 * Metadados de distribuição no formato pedido pelo Symphonic Distribution — campos confirmados
 * no Help Desk oficial deles (release title, track title, primary artist, label, genre/subgenre,
 * metadata language, ISRC/UPC — atribuídos automaticamente pelo Symphonic se deixados em branco,
 * composer/writer com nome legal, explicit content). Não é o schema oficial de bulk-import XML
 * do Symphonic — serve como referência para preencher o formulário manualmente mais rápido.
 */
export interface DistributionMetadata {
  primaryArtist: string;
  label: string;
  primaryGenre: string;
  subGenre: string;
  composerName: string;
  explicit: boolean;
  upc: string;
  releaseDate: string; // ISO date (YYYY-MM-DD) — também usada para o cronograma D-10..D+7
}

export const DEFAULT_DISTRIBUTION_METADATA: DistributionMetadata = {
  primaryArtist: '',
  label: '',
  primaryGenre: '',
  subGenre: '',
  composerName: '',
  explicit: false,
  upc: '',
  releaseDate: '',
};

/** Identidade sonora fixa de uma franquia/série (ex: "Gospel Blues 1950's"). */
export interface SeriesPreset {
  id: string;
  name: string;
  language: StudioLanguage;
  defaultMode: GenerationMode;
  instrumentKit: string;
  vocalProfile: string;
  bpmMin: number;
  bpmMax: number;
  dynamicArc: string;
  colorPalette: string;
  coverDefaults?: Partial<CoverPromptFields>;
  distributionDefaults?: Partial<DistributionMetadata>;
  notes?: string;
  isCustom?: boolean;
}

/** Input estruturado de uma faixa dentro de um álbum planejado (espelha a tabela do plano de lançamentos). */
export interface TrackPlan {
  id: string;
  name: string;
  bpm: string;
  styleInstrumentation: string;
  referenceHymn: string;
  productionNote: string;
  modeOverride?: GenerationMode;
}

/** Campos do construtor de prompt de capa (fórmula fotográfica fixa). */
export interface CoverPromptFields {
  gender: string;
  ageRange: string;
  expressionAction: string;
  wardrobeProp: string;
  setting: string;
  colorPalette: string;
  mood: string;
  aspectFormat?: string;
}

export const DEFAULT_COVER_FIELDS: CoverPromptFields = {
  gender: 'man',
  ageRange: '50s',
  expressionAction: 'eyes closed in deep emotion, mouth open mid-note singing',
  wardrobeProp: 'wearing a worn vintage suit vest, holding a resonator guitar',
  setting: 'smoky dim juke-joint background with a vintage microphone stand',
  colorPalette: 'Warm sepia and amber tones',
  mood: 'soft golden rim light, nostalgic atmosphere',
  aspectFormat: 'square format',
};

/** Uma faixa já gerada pela IA, ligada de volta ao TrackPlan de origem. */
export interface AlbumSong extends Song {
  trackPlanId: string;
  trackIndex: number;
  copiedToSuno?: boolean;
}

export interface GeneratedAlbumResult {
  songs: AlbumSong[];
  albumCoverPrompts: string[];
  generatedAt: string;
  provider: AIProvider;
}

/** Estágios do checklist de execução por lançamento (Parte 1.3 do plano). */
export type PipelineStage =
  | 'planned'
  | 'production'
  | 'cover'
  | 'metadata'
  | 'distributed'
  | 'released'
  | 'tracked';

export const PIPELINE_STAGES: { value: PipelineStage; label: string; color: string }[] = [
  { value: 'planned', label: 'Planejado', color: 'bg-dark-700 text-gray-300 border-dark-600' },
  { value: 'production', label: 'Produção', color: 'bg-amber-900/40 text-amber-400 border-amber-800' },
  { value: 'cover', label: 'Capa', color: 'bg-purple-900/40 text-purple-400 border-purple-800' },
  { value: 'metadata', label: 'Metadados', color: 'bg-blue-900/40 text-blue-400 border-blue-800' },
  { value: 'distributed', label: 'Distribuído', color: 'bg-indigo-900/40 text-indigo-400 border-indigo-800' },
  { value: 'released', label: 'Lançado', color: 'bg-green-900/40 text-green-400 border-green-800' },
  { value: 'tracked', label: 'Acompanhado', color: 'bg-suno-900/40 text-suno-400 border-suno-800' },
];

/** Um álbum planejado — o objeto central persistido no catálogo local. */
export interface AlbumPlan {
  id: string;
  title: string;
  volumeLabel: string;
  seriesPresetId: string | null;
  language: StudioLanguage;
  tracks: TrackPlan[];
  coverFieldSets: CoverPromptFields[];
  result?: GeneratedAlbumResult;
  pipelineStage: PipelineStage;
  distribution?: DistributionMetadata;
  createdAt: string;
  updatedAt: string;
}

/** Saída do parser de "colar texto do plano" (ex: copiado de um PDF). */
export interface ParsedAlbumImport {
  albumTitleGuess?: string;
  volumeLabelGuess?: string;
  languageGuess?: StudioLanguage;
  tracks: Omit<TrackPlan, 'id'>[];
}

export type AppMode = 'quick' | 'planner';

// ============================================================
// SINCRONIZAÇÃO EM NUVEM (opcional — API própria na VPS do usuário)
// ============================================================

export interface SyncSettings {
  enabled: boolean;
  apiUrl: string;
  apiKey: string;
}

export const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  enabled: false,
  apiUrl: '',
  apiKey: '',
};
