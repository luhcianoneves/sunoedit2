import React, { useState } from 'react';
import { AppSettings, ParsedAlbumImport, TrackPlan } from '../types';
import { parseAlbumPlanFromText } from '../services/albumImportService';
import { generateId } from '../utils/id';

interface ImportTracksModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onApply: (result: { albumTitleGuess?: string; volumeLabelGuess?: string; languageGuess?: string; tracks: TrackPlan[] }) => void;
}

const ImportTracksModal: React.FC<ImportTracksModalProps> = ({ isOpen, onClose, settings, onApply }) => {
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedAlbumImport | null>(null);
  const [reviewTracks, setReviewTracks] = useState<TrackPlan[]>([]);

  if (!isOpen) return null;

  const handleParse = async () => {
    setIsParsing(true);
    setError(null);
    try {
      const result = await parseAlbumPlanFromText(rawText, settings);
      setParsed(result);
      setReviewTracks(result.tracks.map(t => ({ id: generateId(), ...t })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao interpretar o texto.');
    } finally {
      setIsParsing(false);
    }
  };

  const updateTrack = (id: string, field: keyof TrackPlan, value: string) => {
    setReviewTracks(prev => prev.map(t => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const removeTrack = (id: string) => {
    setReviewTracks(prev => prev.filter(t => t.id !== id));
  };

  const handleApply = () => {
    if (!parsed) return;
    onApply({
      albumTitleGuess: parsed.albumTitleGuess,
      volumeLabelGuess: parsed.volumeLabelGuess,
      languageGuess: parsed.languageGuess,
      tracks: reviewTracks,
    });
    setRawText('');
    setParsed(null);
    setReviewTracks([]);
    onClose();
  };

  const handleClose = () => {
    setRawText('');
    setParsed(null);
    setReviewTracks([]);
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700 bg-gradient-to-r from-dark-900 to-dark-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Importar Tracklist de um Texto/PDF</h2>
            <p className="text-xs text-gray-500">Cole o texto da tabela do plano — a IA interpreta, você revisa antes de aplicar</p>
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar space-y-4">
          {!parsed && (
            <>
              <textarea
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Cole aqui o texto da tabela de faixas (Faixa | BPM | Estilo/Instrumentação | Hino de Referência | Nota de Produção)..."
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:ring-2 focus:ring-suno-500 font-mono resize-none"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                onClick={handleParse}
                disabled={isParsing || !rawText.trim()}
                className="w-full bg-gradient-to-r from-suno-600 to-purple-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-all"
              >
                {isParsing ? 'Interpretando com IA...' : 'Interpretar Texto'}
              </button>
            </>
          )}

          {parsed && (
            <>
              <div className="bg-dark-900 border border-dark-700 rounded-lg p-3 text-sm text-gray-300 space-y-1">
                <p><span className="text-gray-500">Título detectado:</span> {parsed.albumTitleGuess || '-'}</p>
                <p><span className="text-gray-500">Volume detectado:</span> {parsed.volumeLabelGuess || '-'}</p>
                <p><span className="text-gray-500">Idioma detectado:</span> {parsed.languageGuess || '-'}</p>
              </div>

              <p className="text-xs text-gray-500">Revise cada faixa antes de aplicar — a IA pode ter interpretado algo incorretamente.</p>

              <div className="space-y-3">
                {reviewTracks.map((t, i) => (
                  <div key={t.id} className="bg-dark-900 border border-dark-700 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-suno-400">Faixa {i + 1}</span>
                      <button onClick={() => removeTrack(t.id)} className="text-xs text-red-400 hover:text-red-300">Remover</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input value={t.name} onChange={(e) => updateTrack(t.id, 'name', e.target.value)} placeholder="Nome"
                        className="sm:col-span-2 bg-dark-800 border border-dark-600 rounded px-2 py-1.5 text-xs text-white outline-none" />
                      <input value={t.bpm} onChange={(e) => updateTrack(t.id, 'bpm', e.target.value)} placeholder="BPM"
                        className="bg-dark-800 border border-dark-600 rounded px-2 py-1.5 text-xs text-white outline-none" />
                      <input value={t.referenceHymn} onChange={(e) => updateTrack(t.id, 'referenceHymn', e.target.value)} placeholder="Hino de referência"
                        className="bg-dark-800 border border-dark-600 rounded px-2 py-1.5 text-xs text-white outline-none" />
                    </div>
                    <input value={t.styleInstrumentation} onChange={(e) => updateTrack(t.id, 'styleInstrumentation', e.target.value)} placeholder="Estilo/Instrumentação"
                      className="w-full bg-dark-800 border border-dark-600 rounded px-2 py-1.5 text-xs text-white outline-none" />
                    <input value={t.productionNote} onChange={(e) => updateTrack(t.id, 'productionNote', e.target.value)} placeholder="Nota de produção"
                      className="w-full bg-dark-800 border border-dark-600 rounded px-2 py-1.5 text-xs text-white outline-none" />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => { setParsed(null); setReviewTracks([]); }} className="text-sm font-bold text-gray-400 hover:text-white">
                  Voltar
                </button>
                <button
                  onClick={handleApply}
                  disabled={reviewTracks.length === 0}
                  className="bg-gradient-to-r from-suno-600 to-purple-600 text-white font-bold px-6 py-2.5 rounded-lg hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  Aplicar {reviewTracks.length} Faixa(s)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportTracksModal;
