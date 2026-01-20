
import React from 'react';
import { ScoreEntry, UserProfile, GameMode } from '../types';
import { getMilitaryRank, getXPForNextLevel } from '../App';

interface MainMenuProps {
  onPlay: (mode: GameMode) => void;
  onShowRanking: () => void;
  onShowCredits: () => void;
  onShowProfile: () => void;
  onShowFeedback: () => void;
  highScore: number;
  top3: ScoreEntry[];
  user: UserProfile | null;
  onLogout: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ 
  onPlay, onShowRanking, onShowCredits, onShowProfile, onShowFeedback, highScore, top3, user, onLogout 
}) => {
  const level = user?.level || 1;
  const rank = getMilitaryRank(level);
  const xp = user?.xp || 0;
  const nextXP = getXPForNextLevel(level);
  const xpPct = (xp / nextXP) * 100;

  return (
    <div className="z-20 w-full h-[100dvh] p-4 sm:p-6 bg-zinc-950/95 backdrop-blur-3xl flex flex-col items-center animate-in fade-in zoom-in duration-700 relative overflow-hidden">
      
      {/* Glow Decorativo de Fundo */}
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Perfil Header - Fixo no Topo */}
      <div className="w-full max-w-5xl shrink-0 mb-4 flex justify-between items-center bg-zinc-900/50 p-3 sm:p-4 rounded-2xl border border-zinc-900 shadow-inner group">
        <div className="flex items-center gap-3 sm:gap-5 cursor-pointer" onClick={onShowProfile}>
          <div className="relative">
            <div className={`absolute -inset-1 bg-gradient-to-br ${rank.badgeBg} opacity-20 rounded-xl blur-sm`}></div>
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`} 
              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-zinc-900 border-2 ${rank.borderColor.replace('border-', 'border-opacity-30 border-')} group-hover:border-opacity-100 transition-all shadow-2xl relative z-10`}
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br ${rank.badgeBg} text-white rounded-lg flex items-center justify-center text-[8px] sm:text-[10px] shadow-lg z-20 border border-white/20`}>
               <i className={`fas ${rank.icon}`}></i>
            </div>
          </div>
          <div className="flex flex-col">
            <div className={`text-[6px] sm:text-[8px] font-black uppercase tracking-[0.3em] ${rank.color} leading-none mb-1`}>{rank.title}</div>
            <div className="text-sm sm:text-lg font-orbitron font-black text-white leading-none tracking-tight group-hover:text-emerald-400 transition-colors uppercase italic">{user?.username}</div>
          </div>
        </div>
        <button onClick={onLogout} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-red-950/20 hover:text-red-500 text-zinc-700 transition-all border border-zinc-800 active:scale-90">
          <i className="fas fa-power-off text-sm sm:text-base"></i>
        </button>
      </div>

      {/* Logo Section - Flex-1 e Shrink garantem que o conteúdo se adapte à altura da tela do tablet */}
      <div className="text-center mb-4 flex-1 shrink min-h-0 flex flex-col justify-center overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full mb-2 sm:mb-4 self-center scale-90 sm:scale-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-500 text-[8px] sm:text-[10px] font-black tracking-[0.4em] uppercase">SISTEMA_ATIVO</span>
        </div>
        <h1 className="text-4xl sm:text-7xl lg:text-9xl font-orbitron font-black text-white tracking-tighter italic leading-none uppercase shrink">
          TANK<span className="text-emerald-500">STRIKE</span>
        </h1>
        <p className="text-zinc-600 text-[8px] sm:text-[12px] font-mono tracking-[0.6em] uppercase mt-2 font-bold opacity-60">Operação Nêmesis Blindada</p>
      </div>

      {/* Grid de Ação Principal - Shrink-0 para manter legibilidade dos botões */}
      <div className="w-full max-w-2xl flex flex-col gap-3 sm:gap-4 mb-6 shrink-0">
        <button 
          onClick={() => onPlay('OFFLINE')}
          className="group relative w-full h-16 sm:h-24 bg-emerald-600 hover:bg-emerald-500 rounded-2xl transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] border-b-[6px] border-emerald-800 active:border-b-0 active:translate-y-1 flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60"></div>
          <div className="flex flex-col items-center z-10">
            <span className="text-white font-orbitron font-black text-xl sm:text-3xl tracking-[0.2em] italic uppercase group-hover:scale-105 transition-transform">Engajar Batalha</span>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
          <button onClick={onShowRanking} className="flex items-center justify-center gap-3 py-4 sm:py-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl hover:bg-zinc-900 transition-all group active:scale-95 shadow-xl">
            <i className="fas fa-trophy text-amber-500 text-base sm:text-xl"></i>
            <span className="text-[10px] sm:text-xs font-orbitron font-black text-zinc-500 uppercase tracking-widest group-hover:text-white">Elite</span>
          </button>
          <button onClick={onShowProfile} className="flex items-center justify-center gap-3 py-4 sm:py-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl hover:bg-zinc-900 transition-all group active:scale-95 shadow-xl">
            <i className="fas fa-id-badge text-emerald-400 text-base sm:text-xl"></i>
            <span className="text-[10px] sm:text-xs font-orbitron font-black text-zinc-500 uppercase tracking-widest group-hover:text-white">Dossiê</span>
          </button>
        </div>
      </div>

      {/* Footer - Ancorado na base, sem margens externas que causem scroll */}
      <div className="w-full max-w-2xl pt-4 border-t border-zinc-900 mt-auto shrink-0 pb-2 sm:pb-4">
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
            <span className="text-[7px] sm:text-[9px] text-zinc-600 font-black uppercase tracking-widest leading-none mb-1">Status de Carreira</span>
            <span className="text-[10px] sm:text-lg text-white font-orbitron font-bold leading-none uppercase tracking-tighter">Nível {level} — {rank.title}</span>
          </div>
          <span className="text-[10px] sm:text-lg text-emerald-500 font-black font-mono leading-none">{Math.floor(xpPct)}%</span>
        </div>
        <div className="w-full h-1.5 sm:h-2 bg-black rounded-full overflow-hidden border border-zinc-900 p-[1px]">
          <div className="h-full bg-emerald-500 transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${xpPct}%` }}></div>
        </div>
        
        <div className="mt-4 flex justify-between opacity-30">
           <button onClick={onShowFeedback} className="text-[8px] sm:text-[10px] font-black text-zinc-600 hover:text-amber-500 uppercase tracking-[0.2em]">Protocolo_Erro</button>
           <button onClick={onShowCredits} className="text-[8px] sm:text-[10px] font-black text-zinc-600 hover:text-blue-500 uppercase tracking-[0.2em]">Créditos_Dev</button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
