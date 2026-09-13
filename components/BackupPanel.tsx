import React, { useRef, useState } from 'react';
import { AlbumPlan, SeriesPreset } from '../types';

interface BackupPanelProps {
  seriesPresets: SeriesPreset[];
  albumPlans: AlbumPlan[];
  onImport: (data: { seriesPresets: SeriesPreset[]; albumPlans: AlbumPlan[] }) => void;
}

const BACKUP_VERSION = 1;

const BackupPanel: React.FC<BackupPanelProps> = ({ seriesPresets, albumPlans, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    const payload = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      seriesPresets,
      albumPlans,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suno_architect_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage('Backup exportado.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed.seriesPresets) || !Array.isArray(parsed.albumPlans)) {
          throw new Error('Formato inválido: esperado { seriesPresets: [], albumPlans: [] }');
        }
        const confirmed = window.confirm(
          `Importar ${parsed.seriesPresets.length} série(s) e ${parsed.albumPlans.length} álbum(ns)? ` +
          `Isso substitui os dados atuais salvos neste navegador.`
        );
        if (confirmed) {
          onImport({ seriesPresets: parsed.seriesPresets, albumPlans: parsed.albumPlans });
          setMessage('Backup importado com sucesso.');
          setTimeout(() => setMessage(null), 3000);
        }
      } catch (err) {
        setMessage(err instanceof Error ? `Erro: ${err.message}` : 'Arquivo de backup inválido.');
        setTimeout(() => setMessage(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-2">
      <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
      <button onClick={handleExport} type="button"
        className="text-xs font-bold px-3 py-2 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500">
        Exportar Backup (JSON)
      </button>
      <button onClick={handleImportClick} type="button"
        className="text-xs font-bold px-3 py-2 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white hover:border-suno-500">
        Importar Backup
      </button>
      {message && <span className="text-xs text-suno-400">{message}</span>}
    </div>
  );
};

export default BackupPanel;
