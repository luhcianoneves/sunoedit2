import React from 'react';
import { AlbumPlan, PIPELINE_STAGES, PipelineStage } from '../types';
import { exportAlbumPDF } from '../services/pdfExportService';

interface AlbumCardProps {
  plan: AlbumPlan;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCreateNextVolume: () => void;
  onStageChange: (stage: PipelineStage) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ plan, onOpen, onDuplicate, onDelete, onCreateNextVolume, onStageChange }) => {
  const hasResult = !!plan.result;
  const stage = plan.pipelineStage ?? 'planned';
  const stageInfo = PIPELINE_STAGES.find(s => s.value === stage) ?? PIPELINE_STAGES[0];

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 flex flex-col gap-3 hover:border-suno-600/50 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-bold text-white">{plan.title || 'Sem título'}</h4>
          <p className="text-xs text-gray-500">{plan.volumeLabel} · {plan.tracks.length} faixas · {plan.language.toUpperCase()}</p>
        </div>
        <select
          value={stage}
          onChange={(e) => onStageChange(e.target.value as PipelineStage)}
          onClick={(e) => e.stopPropagation()}
          className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0 border outline-none cursor-pointer ${stageInfo.color}`}
        >
          {PIPELINE_STAGES.map(s => (
            <option key={s.value} value={s.value} className="bg-dark-800 text-white">{s.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-dark-700/50">
        <button onClick={onOpen} className="text-xs font-bold px-3 py-1.5 rounded-full bg-suno-600 hover:bg-suno-500 text-white">
          Abrir
        </button>
        {hasResult && (
          <button onClick={() => exportAlbumPDF(plan, plan.result!)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white">
            Exportar PDF
          </button>
        )}
        <button onClick={onCreateNextVolume} title="Duplica este álbum, mantém a série e incrementa o volume"
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white">
          Próximo Volume
        </button>
        <button onClick={onDuplicate} className="text-xs font-bold px-3 py-1.5 rounded-full bg-dark-900 border border-dark-600 text-gray-300 hover:text-white">
          Duplicar
        </button>
        <button onClick={onDelete} className="text-xs font-bold px-3 py-1.5 rounded-full bg-dark-900 border border-dark-600 text-red-400 hover:text-red-300">
          Excluir
        </button>
      </div>
    </div>
  );
};

export default AlbumCard;
