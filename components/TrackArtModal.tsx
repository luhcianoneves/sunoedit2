import React, { useState } from 'react';
import { Song } from '../types';

interface TrackArtModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  albumTitle: string;
}

const TrackArtModal: React.FC<TrackArtModalProps> = ({ isOpen, onClose, song, albumTitle }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !song) return null;

  const handleCopyPrompt = async () => {
    if (song.imagePrompt16_9) {
      try {
        await navigator.clipboard.writeText(song.imagePrompt16_9);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy prompt:', err);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-5xl bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-700 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-500">📺</span> Visualizador de Arte 16:9
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Mockup visual de exibição da canção</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors bg-dark-700 hover:bg-dark-600 p-2 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 16:9 Canvas Mockup */}
        <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#0f172a] via-[#1e1e24] to-[#0d0d11] rounded-xl overflow-hidden relative shadow-2xl border border-dark-600 group select-none flex items-center justify-center">
          
          {/* Logo Good Shepherd Studios (Topo Esquerdo) */}
          <div className="absolute top-6 left-8 flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border-2 border-yellow-600 bg-black/60 flex items-center justify-center relative shadow-md shadow-black/40">
              {/* Ovelhinha SVG */}
              <svg className="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.1 0-2.12.3-3 .83A5 5 0 003 8.5C3 11.12 4.9 13.3 7.35 13.82l-.47.94a1 1 0 00.89 1.45h2.46c.3 1.13 1.25 2 2.43 2.15l-.26 1a.5.5 0 00.92.36l1.24-2.48a4.95 4.95 0 003.02-3.05 5 5 0 001.35-6.69 5 5 0 00-5.93-3.05c-.88-.53-1.9-.83-3-.83z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </div>
            <div className="text-[9px] font-bold tracking-widest text-yellow-500/90 leading-tight uppercase font-sans">
              Good Shepherd<br/><span className="text-gray-400 text-[7px]">Studios</span>
            </div>
          </div>

          {/* Letra no lado esquerdo */}
          <div className="absolute left-8 top-20 bottom-16 w-1/2 flex flex-col justify-start overflow-y-auto scrollbar-none pr-4 text-left">
            <div className="text-gray-100 font-medium whitespace-pre-line text-xs sm:text-sm leading-relaxed tracking-wide shadow-text font-sans">
              {song.lyrics || '[Faixa Instrumental]'}
            </div>
          </div>

          {/* Canto Inferior Direito: Logo Plataformas, Título e Mini Capa */}
          <div className="absolute right-8 bottom-6 flex items-end gap-4">
            {/* Texto Título/Álbum + Ícones */}
            <div className="flex flex-col items-end gap-1.5 text-right">
              {/* Ícones Streaming */}
              <div className="flex items-center gap-2 mb-1">
                {/* Spotify SVG */}
                <svg className="w-5 h-5 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.378 0 0 5.378 0 12s5.378 12 12 12 12-5.378 12-12S18.622 0 12 0zm5.504 17.31c-.223.358-.691.474-1.05.251-2.877-1.758-6.497-2.157-10.762-1.18-.41.093-.815-.164-.908-.574-.094-.41.164-.815.574-.908 4.671-1.067 8.652-.613 11.895 1.368.36.223.477.69.251 1.043zm1.467-3.264c-.28.455-.877.6-1.332.32-3.292-2.023-8.31-2.613-12.202-1.432-.513.155-1.048-.143-1.203-.655-.155-.513.143-1.048.655-1.203 4.453-1.353 10.003-.7 13.762 1.613.456.28.602.878.32 1.357zm.143-3.395C15.222 8.278 8.795 8.064 5.066 9.198c-.62.188-1.272-.163-1.46-.782-.188-.619.163-1.271.782-1.46 4.282-1.3 11.378-1.045 15.86 1.614.557.33.74.1.74 1.053-.33.556-.1 1.226-.556 1.226z"/>
                </svg>
                {/* Deezer SVG */}
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.5 12h-4v4h4v-4zm0-6h-4v4h4V6zm-6 12h-4v4h4v-4zm0-6h-4v4h4v-4zm0-6h-4v4h4V6zm-6 18h-4v4h4v-4zm0-6h-4v4h4v-4zm0-6h-4v4h4V12zm0-6h-4v4h4V6zm18 12h-4v4h4v-4zm0-6h-4v4h4v-4z"/>
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide shadow-text font-sans">
                {song.title}
              </h3>
              <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider font-sans opacity-90">
                {albumTitle || 'Álbum / Single'}
              </p>
            </div>

            {/* Mini Capa de Álbum (1:1) */}
            <div className="w-14 h-14 bg-gradient-to-tr from-purple-800 to-indigo-700 rounded shadow-md border border-white/10 flex items-center justify-center p-1 relative overflow-hidden">
              <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            </div>
          </div>

          {/* Sombra interna para leitura */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/60 pointer-events-none"></div>
        </div>

        {/* Prompt de Imagem para gerar o fundo */}
        {song.imagePrompt16_9 && (
          <div className="bg-dark-900 border border-dark-600 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase font-bold tracking-widest text-purple-400 flex items-center gap-1.5">
                <span>🎨</span> Prompt para Imagem de Fundo (16:9)
              </label>
              <button
                onClick={handleCopyPrompt}
                className={`text-xs px-3 py-1 rounded-full font-bold transition-all duration-200 flex items-center gap-1 ${
                  copied ? 'bg-green-600 text-white' : 'bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white'
                }`}
              >
                {copied ? 'Copiado!' : 'Copiar Prompt'}
              </button>
            </div>
            <p className="text-sm text-gray-300 font-mono leading-relaxed bg-dark-800 p-3 rounded border border-dark-700 select-all">
              {song.imagePrompt16_9}
            </p>
            <span className="text-[10px] text-gray-500 italic block">💡 Use este prompt no Midjourney, Leonardo AI ou DALL-E 3 para gerar o cenário real.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackArtModal;
