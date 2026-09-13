import React, { useState } from 'react';
import { AppSettings, StudioLanguage } from '../types';
import { suggestSocialCaption } from '../services/geminiService';
import { suggestSocialCaptionOpenRouter } from '../services/openrouterService';

interface SocialCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle: string;
  albumConcept: string;
  language: StudioLanguage;
  settings: AppSettings;
}

const SocialCaptionModal: React.FC<SocialCaptionModalProps> = ({ isOpen, onClose, songTitle, albumConcept, language, settings }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = settings.provider === 'openrouter'
        ? await suggestSocialCaptionOpenRouter(songTitle, albumConcept, language, settings.openrouterApiKey, settings.openrouterModel)
        : await suggestSocialCaption(songTitle, albumConcept, language);
      setCaption(result.caption);
      setHashtags(result.hashtags);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar legenda.');
    } finally {
      setIsLoading(false);
    }
  };

  const fullText = `${caption}\n\n${hashtags.map(h => `#${h.replace(/^#/, '')}`).join(' ')}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Legenda para Redes Sociais</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-xs text-gray-500">Para clipes de 15-30s (Reels/TikTok/Shorts) da faixa "{songTitle}"</p>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!caption && (
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-suno-600 to-purple-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Gerando...' : 'Gerar Legenda + Hashtags'}
          </button>
        )}

        {caption && (
          <>
            <div className="bg-dark-900 border border-dark-700 rounded-lg p-4 text-sm text-gray-200 whitespace-pre-line">
              {caption}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map(h => (
                <span key={h} className="text-xs bg-dark-900 border border-dark-700 text-suno-400 px-2 py-1 rounded-full">#{h.replace(/^#/, '')}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleGenerate} disabled={isLoading} className="flex-1 text-xs font-bold px-3 py-2 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white disabled:opacity-50">
                {isLoading ? 'Gerando...' : 'Gerar Outra Versão'}
              </button>
              <button onClick={handleCopy} className={`flex-1 text-xs font-bold px-3 py-2 rounded-full transition-all ${copied ? 'bg-green-600 text-white' : 'bg-suno-600 hover:bg-suno-500 text-white'}`}>
                {copied ? 'Copiado!' : 'Copiar Tudo'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SocialCaptionModal;
