import React, { useState } from 'react';
import { AlbumPlan, SeriesPreset, SyncSettings } from '../types';
import { checkHealth, fetchCollection, pushCollection } from '../services/remoteSync';

interface CloudSyncPanelProps {
  isOpen: boolean;
  onClose: () => void;
  syncSettings: SyncSettings;
  setSyncSettings: (s: SyncSettings) => void;
  seriesPresets: SeriesPreset[];
  setSeriesPresets: (p: SeriesPreset[]) => void;
  albumPlans: AlbumPlan[];
  setAlbumPlans: (p: AlbumPlan[]) => void;
}

const CloudSyncPanel: React.FC<CloudSyncPanelProps> = ({
  isOpen, onClose, syncSettings, setSyncSettings, seriesPresets, setSeriesPresets, albumPlans, setAlbumPlans,
}) => {
  const [local, setLocal] = useState<SyncSettings>(syncSettings);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  if (!isOpen) return null;

  const canConnect = local.apiUrl.trim() !== '' && local.apiKey.trim() !== '';

  const handleSave = () => {
    setSyncSettings(local);
    setStatus('Configuração salva.');
    setTimeout(() => setStatus(null), 2500);
  };

  const handleTest = async () => {
    setIsBusy(true);
    setError(null);
    setStatus(null);
    try {
      const ok = await checkHealth(local);
      setStatus(ok ? 'Conexão OK — API respondendo.' : 'A API respondeu, mas com erro.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível conectar. Verifique a URL.');
    } finally {
      setIsBusy(false);
    }
  };

  const handlePush = async () => {
    setIsBusy(true);
    setError(null);
    setStatus(null);
    try {
      await pushCollection(local, 'series_presets', seriesPresets);
      await pushCollection(local, 'album_plans', albumPlans);
      setStatus(`Enviado: ${seriesPresets.length} série(s) e ${albumPlans.length} álbum(ns) para a nuvem.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar para a nuvem.');
    } finally {
      setIsBusy(false);
    }
  };

  const handlePull = async () => {
    if (!window.confirm('Puxar da nuvem substitui o catálogo local deste navegador. Continuar?')) return;
    setIsBusy(true);
    setError(null);
    setStatus(null);
    try {
      const remotePresets = await fetchCollection<SeriesPreset>(local, 'series_presets');
      const remotePlans = await fetchCollection<AlbumPlan>(local, 'album_plans');
      setSeriesPresets(remotePresets);
      setAlbumPlans(remotePlans);
      setStatus(`Recebido: ${remotePresets.length} série(s) e ${remotePlans.length} álbum(ns) da nuvem.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao puxar da nuvem.');
    } finally {
      setIsBusy(false);
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
          <div>
            <h2 className="text-lg font-bold text-white">Sincronização em Nuvem</h2>
            <p className="text-xs text-gray-500 mt-1">Conecta este navegador à sua API própria (rodando na sua VPS)</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="sync-enabled" checked={local.enabled} onChange={(e) => setLocal({ ...local, enabled: e.target.checked })} />
          <label htmlFor="sync-enabled" className="text-sm text-gray-300">Ativar sincronização em nuvem</label>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">URL da API</label>
          <input value={local.apiUrl} onChange={(e) => setLocal({ ...local, apiUrl: e.target.value })}
            placeholder="http://187.77.13.177:8200"
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-suno-500 font-mono text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Chave da API</label>
          <input type="password" value={local.apiKey} onChange={(e) => setLocal({ ...local, apiKey: e.target.value })}
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-suno-500 font-mono text-sm" />
        </div>

        {status && <p className="text-sm text-green-400">{status}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-2 pt-2">
          <button onClick={handleSave} className="text-xs font-bold px-4 py-2.5 rounded-full bg-suno-600 hover:bg-suno-500 text-white">
            Salvar
          </button>
          <button onClick={handleTest} disabled={!canConnect || isBusy} className="text-xs font-bold px-4 py-2.5 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white disabled:opacity-50">
            Testar Conexão
          </button>
          <button onClick={handlePush} disabled={!canConnect || isBusy} className="text-xs font-bold px-4 py-2.5 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white disabled:opacity-50">
            Enviar Catálogo Local → Nuvem
          </button>
          <button onClick={handlePull} disabled={!canConnect || isBusy} className="text-xs font-bold px-4 py-2.5 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white disabled:opacity-50">
            Puxar Nuvem → Local
          </button>
        </div>

        <p className="text-[10px] text-gray-600 pt-2 border-t border-dark-700">
          Sincronização manual por enquanto — envie/puxe quando quiser. A chave fica salva só neste navegador (localStorage).
        </p>
      </div>
    </div>
  );
};

export default CloudSyncPanel;
