import React, { useState } from 'react';
import { AppSettings, Song, StudioLanguage } from '../types';
import TrackArtModal from './TrackArtModal';
import SocialCaptionModal from './SocialCaptionModal';
import { getCharLimitStatus, SUNO_LYRICS_LIMIT, SUNO_STYLE_PROMPT_LIMIT } from '../services/trackQualityCheck';

interface SongCardProps {
  song: Song;
  index: number;
  albumTitle?: string;
  metaLine?: string;
  warnings?: string[];
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  copiedToSuno?: boolean;
  onToggleCopied?: () => void;
  socialCaptionContext?: { albumConcept: string; language: StudioLanguage; settings: AppSettings };
}

const CHAR_STATUS_COLOR: Record<string, string> = {
  ok: 'text-gray-500',
  warning: 'text-amber-400',
  over: 'text-red-400',
};

const SongCard: React.FC<SongCardProps> = ({
  song, index, albumTitle, metaLine, warnings, onRegenerate, isRegenerating,
  copiedToSuno, onToggleCopied, socialCaptionContext,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const [isArtOpen, setIsArtOpen] = useState(false);
  const [isCaptionOpen, setIsCaptionOpen] = useState(false);

  // Verifica se é instrumental (letra vazia, curta demais ou explícita [Instrumental])
  const isInstrumental = !song.lyrics || song.lyrics.length < 20 || song.lyrics.toLowerCase().includes('[instrumental]');

  const styleLength = song.stylePrompt?.length ?? 0;
  const styleStatus = getCharLimitStatus(styleLength, SUNO_STYLE_PROMPT_LIMIT);
  const lyricsLength = song.lyrics?.length ?? 0;
  const lyricsStatus = getCharLimitStatus(lyricsLength, SUNO_LYRICS_LIMIT);

  const markCopiedIfNeeded = () => {
    if (onToggleCopied && !copiedToSuno) onToggleCopied();
  };

  const copyToClipboard = async (text: string, type: 'prompt' | 'lyrics') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'prompt') {
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
      } else {
        setCopiedLyrics(true);
        setTimeout(() => setCopiedLyrics(false), 2000);
      }
      markCopiedIfNeeded();
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-lg hover:shadow-suno-500/10 transition-all duration-300 flex flex-col h-full group">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-700 to-dark-800 p-4 border-b border-dark-700 flex items-center space-x-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-suno-600 flex items-center justify-center text-white font-bold font-mono shadow-md shadow-suno-900/50">
          {index + 1}
        </div>
        <h3 className="text-lg font-bold text-white truncate w-full" title={song.title}>
          {song.title}
        </h3>
        {isInstrumental && (
          <span className="text-[10px] bg-dark-900 border border-dark-600 text-gray-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
            Inst
          </span>
        )}
        {warnings && warnings.length > 0 && (
          <span
            title={warnings.join('\n')}
            className="text-[10px] bg-amber-900/40 border border-amber-700 text-amber-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider flex items-center gap-1 shrink-0 cursor-help"
          >
            ⚠ {warnings.length}
          </span>
        )}
        {onToggleCopied && (
          <button
            onClick={onToggleCopied}
            title={copiedToSuno ? 'Marcada como colada no Suno — clique para desmarcar' : 'Ainda não colada no Suno — clique para marcar'}
            className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0 border transition-all ${
              copiedToSuno
                ? 'bg-green-900/40 border-green-700 text-green-400'
                : 'bg-dark-900 border-dark-600 text-gray-500 hover:text-gray-300'
            }`}
          >
            {copiedToSuno ? '✓ Suno' : 'Pendente'}
          </button>
        )}
      </div>

      {metaLine && (
        <div className="px-4 pt-3 text-[11px] text-gray-500 font-mono border-b border-dark-700/50 pb-3">
          {metaLine}
        </div>
      )}

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col gap-4">
        
        {/* Suno Prompt Section (Highlighted for Instrumental) */}
        <div className={`bg-dark-900 rounded-lg p-3 border border-dark-700 relative group/prompt ${isInstrumental ? 'flex-1 flex flex-col justify-center' : ''}`}>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
              Ritmo / Estilo
            </label>
            <button
              onClick={() => copyToClipboard(song.stylePrompt, 'prompt')}
              className={`text-xs px-4 py-1.5 rounded-full font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                copiedPrompt 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white hover:shadow-purple-500/20 shadow-md'
              }`}
            >
              {copiedPrompt ? (
                 <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  Copiar Ritmo
                </>
              )}
            </button>
          </div>
          <p className={`text-suno-100 font-mono leading-relaxed break-words bg-dark-800/50 p-2 rounded border border-dark-700/50 ${isInstrumental ? 'text-lg text-center py-6' : 'text-xs'}`}>
            {song.stylePrompt}
          </p>
          <p className={`text-[10px] font-mono mt-1 text-right ${CHAR_STATUS_COLOR[styleStatus]}`}>
            {styleLength}/{SUNO_STYLE_PROMPT_LIMIT} caracteres
          </p>
        </div>

        {/* Lyrics Section (Hidden if Instrumental) */}
        {!isInstrumental && song.lyrics && (
          <div className="flex-1 flex flex-col min-h-[200px]">
             <div className="flex justify-between items-center mb-2">
              <label className="text-xs uppercase tracking-wider text-suno-300 font-bold flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Letra Formatada
              </label>
               <button
                onClick={() => copyToClipboard(song.lyrics!, 'lyrics')}
                className={`text-xs px-4 py-1.5 rounded-full font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  copiedLyrics
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                    : 'bg-dark-700 hover:bg-suno-600 text-gray-200 hover:text-white border border-dark-600 hover:border-suno-500'
                }`}
              >
                {copiedLyrics ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Copiado!
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copiar Letra
                  </>
                )}
              </button>
            </div>
            <div className="bg-dark-900/80 rounded-lg p-4 h-64 overflow-y-auto border border-dark-700 text-sm text-gray-300 whitespace-pre-line font-medium leading-relaxed shadow-inner scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-transparent hover:scrollbar-thumb-dark-500">
              {song.lyrics}
            </div>
            <p className={`text-[10px] font-mono mt-1 text-right ${CHAR_STATUS_COLOR[lyricsStatus]}`}>
              {lyricsLength}/{SUNO_LYRICS_LIMIT} caracteres
            </p>
          </div>
        )}

        {/* Botões Arte 16:9 e Regenerar */}
        <div className="mt-auto pt-4 border-t border-dark-700/50 flex gap-2">
          <button
            onClick={() => setIsArtOpen(true)}
            className="flex-1 bg-gradient-to-r from-dark-700 to-dark-800 hover:from-purple-900/50 hover:to-indigo-900/50 text-gray-300 hover:text-purple-400 border border-dark-600 hover:border-purple-500/50 rounded-lg py-2.5 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Visualizar Arte 16:9
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              title="Regenerar só esta faixa"
              className="px-3 bg-gradient-to-r from-dark-700 to-dark-800 hover:from-suno-900/50 hover:to-purple-900/50 text-gray-300 hover:text-suno-400 border border-dark-600 hover:border-suno-500/50 rounded-lg py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {isRegenerating ? '...' : 'Regenerar'}
            </button>
          )}
          {socialCaptionContext && (
            <button
              onClick={() => setIsCaptionOpen(true)}
              title="Gerar legenda para redes sociais"
              className="px-3 bg-gradient-to-r from-dark-700 to-dark-800 hover:from-pink-900/50 hover:to-purple-900/50 text-gray-300 hover:text-pink-400 border border-dark-600 hover:border-pink-500/50 rounded-lg py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
              Legenda
            </button>
          )}
        </div>

        {/* Modal do Slide */}
        <TrackArtModal
          isOpen={isArtOpen}
          onClose={() => setIsArtOpen(false)}
          song={song}
          albumTitle={albumTitle || 'Álbum / Projeto'}
        />

        {socialCaptionContext && (
          <SocialCaptionModal
            isOpen={isCaptionOpen}
            onClose={() => setIsCaptionOpen(false)}
            songTitle={song.title}
            albumConcept={socialCaptionContext.albumConcept}
            language={socialCaptionContext.language}
            settings={socialCaptionContext.settings}
          />
        )}

      </div>
    </div>
  );
};

export default SongCard;