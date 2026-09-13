import React, { useState } from 'react';
import { AppSettings, CoverPromptFields } from '../types';
import { buildCoverPrompt } from '../services/coverPromptBuilder';
import { suggestCoverFields } from '../services/geminiService';
import { suggestCoverFieldsOpenRouter } from '../services/openrouterService';

interface CoverPromptBuilderProps {
  label: string;
  fields: CoverPromptFields;
  onChange: (fields: CoverPromptFields) => void;
  albumConcept: string;
  settings: AppSettings;
  onRemove?: () => void;
}

const FIELD_CONFIG: { key: keyof CoverPromptFields; label: string; placeholder: string }[] = [
  { key: 'gender', label: 'Gênero', placeholder: 'man / woman / group' },
  { key: 'ageRange', label: 'Idade', placeholder: '50s' },
  { key: 'expressionAction', label: 'Expressão / Ação', placeholder: 'eyes closed in deep emotion, mouth open mid-note singing' },
  { key: 'wardrobeProp', label: 'Roupa / Prop', placeholder: 'wearing a worn vintage suit vest, holding a resonator guitar' },
  { key: 'setting', label: 'Cenário', placeholder: 'smoky dim juke-joint background' },
  { key: 'colorPalette', label: 'Paleta de Cor', placeholder: 'Warm sepia and amber tones' },
  { key: 'mood', label: 'Humor / Iluminação', placeholder: 'soft golden rim light' },
];

const CoverPromptBuilder: React.FC<CoverPromptBuilderProps> = ({ label, fields, onChange, albumConcept, settings, onRemove }) => {
  const [copied, setCopied] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const prompt = buildCoverPrompt(fields);

  const updateField = (key: keyof CoverPromptFields, value: string) => {
    onChange({ ...fields, [key]: value });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    setSuggestError(null);
    try {
      const suggestion = settings.provider === 'openrouter'
        ? await suggestCoverFieldsOpenRouter(albumConcept, fields, settings.openrouterApiKey, settings.openrouterModel)
        : await suggestCoverFields(albumConcept, fields);
      onChange({ ...fields, ...suggestion });
    } catch (err: unknown) {
      setSuggestError(err instanceof Error ? err.message : 'Erro ao sugerir campos com IA.');
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider">{label}</h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSuggest}
            disabled={isSuggesting}
            className="text-xs px-3 py-1.5 rounded-full font-bold bg-dark-700 hover:bg-dark-600 text-gray-200 hover:text-white border border-dark-600 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            {isSuggesting ? 'Sugerindo...' : '✨ Sugerir com IA'}
          </button>
          {onRemove && (
            <button type="button" onClick={onRemove} className="text-xs px-2 py-1.5 rounded-full text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all">
              Remover
            </button>
          )}
        </div>
      </div>

      {suggestError && <p className="text-xs text-red-400">{suggestError}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELD_CONFIG.map(({ key, label: fieldLabel, placeholder }) => (
          <div key={key} className={key === 'expressionAction' || key === 'setting' || key === 'wardrobeProp' ? 'sm:col-span-2' : ''}>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">{fieldLabel}</label>
            <input
              type="text"
              value={fields[key] || ''}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={placeholder}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-suno-500 outline-none transition-all"
            />
          </div>
        ))}
      </div>

      <div className="bg-dark-800 border border-dark-700/50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Preview do Prompt</label>
          <button
            type="button"
            onClick={handleCopy}
            className={`text-xs px-3 py-1 rounded-full font-bold transition-all duration-200 ${
              copied ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            {copied ? 'Copiado!' : 'Copiar Prompt'}
          </button>
        </div>
        <p className="text-xs font-mono text-gray-300 leading-relaxed">{prompt}</p>
      </div>
    </div>
  );
};

export default CoverPromptBuilder;
