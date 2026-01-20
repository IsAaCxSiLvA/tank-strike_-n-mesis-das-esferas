
import React from 'react';
import { getXPForNextLevel, getMilitaryRank } from '../App';

interface GameOverProps {
  score: number;
  highScore: number;
  report: string;
  isLoadingReport: boolean;
  onSave: (name: string) => void;
  onRestart: () => void;
  defaultName: string;
  xpGained: number;
  vpGained: number;
  currentLevel: number;
  currentXp: number;
  levelsCleared: number;
}

const GameOver: React.FC<GameOverProps> = ({ 
  score, report, isLoadingReport, onSave, onRestart, defaultName, xpGained, vpGained, currentLevel, currentXp, levelsCleared 
}) => {
  const nextThreshold = getXPForNextLevel(currentLevel);
  const xpPct = (currentXp / nextThreshold) * 100;
  const rank = getMilitaryRank(currentLevel);

  return (
    <div className="z-20 w-[94%] max-w-md max-h-[92dvh] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-900 border border-red-500/20 shadow-[0_0_100px_rgba(239,68,68,0.1)] flex flex-col items-center animate-in fade-in zoom-in duration-500 overflow-hidden">
      
      {/* Header Fixo */}
      <div className="flex flex-col items-center shrink-0 mb-4 sm:mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/20 mb-4 shadow-xl">
          <i className="fas fa-radiation text-3xl sm:text-4xl text-red-500 animate-pulse"></i>
        </div>
        <h2 className="text-2xl sm:text-4xl font-orbitron font-black text-red-500 mb-1 tracking-tighter uppercase italic text-center">MISSÃO FALHOU</h2>
        <p className="text-zinc-500 font-black uppercase text-[8px] sm:text-[10px] tracking-[0.4em] opacity-60">Status: Blindagem Comprometida</p>
      </div>
      
      {/* Conteúdo Scrollável */}
      <div className="w-full flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4 sm:space-y-6 mb-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-black/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-800 text-center shadow-inner">
            <span className="text-[7px] sm:text-[9px] text-zinc-600 font-black uppercase tracking-widest block mb-1 leading-none">Setores</span>
            <span className="text-xl sm:text-3xl font-orbitron font-black text-white">{levelsCleared}</span>
          </div>
          <div className="bg-black/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-800 text-center shadow-inner">
            <span className="text-[7px] sm:text-[9px] text-zinc-600 font-black uppercase tracking-widest block mb-1 leading-none">XP Coletado</span>
            <span className="text-xl sm:text-3xl font-orbitron font-black text-emerald-500">+{xpGained}</span>
          </div>
        </div>

        <div className="bg-zinc-800/40 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-lg">
          <div className="flex justify-between items-end mb-3">
            <div className="flex flex-col">
              <span className={`text-[8px] sm:text-[10px] font-black uppercase ${rank.color} mb-1 leading-none`}>{rank.title}</span>
              <span className="text-emerald-500 text-[10px] sm:text-xs font-black font-orbitron leading-none uppercase">NÍVEL {currentLevel}</span>
            </div>
            <span className="text-zinc-500 text-[8px] sm:text-[10px] font-mono font-bold leading-none">{Math.floor(xpPct)}%</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
             <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-1000" style={{ width: `${xpPct}%` }}></div>
          </div>
        </div>

        <div className="bg-emerald-500/5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-emerald-500/10 relative overflow-hidden shadow-inner">
          <p className="text-emerald-500 text-[8px] sm:text-[10px] font-black uppercase mb-2 tracking-widest flex items-center gap-2">
            <i className="fas fa-satellite animate-pulse"></i> Relatório de Campo
          </p>
          <div className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-mono italic opacity-90">
            {isLoadingReport ? "Interceptando transmissões inimigas..." : `"${report}"`}
          </div>
        </div>
      </div>

      {/* Footer Fixo */}
      <div className="w-full flex flex-col gap-3 shrink-0">
        <button 
          onClick={onRestart}
          className="group relative w-full py-4 sm:py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron font-black rounded-xl sm:rounded-2xl shadow-[0_15px_30px_rgba(16,185,129,0.2)] transition-all active:scale-95 border-b-[4px] sm:border-b-[6px] border-emerald-800 active:border-b-0 uppercase text-xs sm:text-sm tracking-[0.2em]"
        >
          TENTAR NOVAMENTE
        </button>
        <button 
          onClick={() => onSave(defaultName)}
          className="w-full py-3 sm:py-4 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 hover:text-white font-black rounded-xl sm:rounded-2xl border border-zinc-800 transition-all uppercase text-[9px] sm:text-[11px] tracking-[0.3em] active:scale-95"
        >
          DESISTIR E SAIR
        </button>
      </div>
    </div>
  );
};

export default GameOver;
