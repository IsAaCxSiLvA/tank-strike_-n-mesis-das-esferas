
import React, { useState } from 'react';
import { ScoreEntry } from '../types';
import { getMilitaryRank } from '../App';

interface RankingViewProps {
  leaderboard: ScoreEntry[];
  onBack: () => void;
  onViewProfile: (username: string) => void;
}

const RankingView: React.FC<RankingViewProps> = ({ leaderboard, onBack, onViewProfile }) => {
  const [filter, setFilter] = useState<'SCORE' | 'LEVEL'>('LEVEL');
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (filter === 'LEVEL') {
      return (b.level || 0) - (a.level || 0) || b.score - a.score;
    }
    return b.score - a.score;
  });

  return (
    <div className="z-20 w-[94%] max-w-xl h-[90dvh] flex flex-col p-4 sm:p-8 rounded-3xl bg-zinc-950 border border-amber-500/10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
      
      <div className="flex justify-between items-start mb-6 shrink-0 relative z-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-orbitron font-black text-amber-500 flex items-center gap-3 italic">
            <i className="fas fa-trophy text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"></i> ELITE COMMAND
          </h2>
          <p className="text-[8px] sm:text-[9px] text-zinc-500 uppercase font-black tracking-[0.3em] mt-1">Quadro de Honra Global</p>
        </div>
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-xl text-zinc-500 hover:text-white border border-zinc-800 transition-all">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="flex bg-black/40 p-1 rounded-2xl mb-6 shrink-0 border border-zinc-800/50 relative z-10">
        <button onClick={() => setFilter('LEVEL')} className={`flex-1 py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'LEVEL' ? 'bg-amber-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}>Ranking Nível</button>
        <button onClick={() => setFilter('SCORE')} className={`flex-1 py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'SCORE' ? 'bg-amber-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}>Ranking Score</button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 mb-6 relative z-10">
        {sortedLeaderboard.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-800 font-black uppercase text-[10px] opacity-20">
            <i className="fas fa-database text-4xl mb-4"></i> Sem registros oficiais
          </div>
        ) : (
          sortedLeaderboard.map((entry, idx) => {
            const isTop3 = idx < 3;
            const rank = getMilitaryRank(entry.level || 1);
            const medals = ['text-amber-400', 'text-zinc-300', 'text-amber-700'];
            return (
              <div 
                key={entry.id} 
                onClick={() => onViewProfile(entry.name)}
                className={`flex items-center justify-between p-3 sm:p-5 rounded-[1.5rem] border cursor-pointer active:scale-[0.98] transition-all hover:bg-zinc-900/50 ${isTop3 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-zinc-900/20 border-zinc-800/40'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-center">
                    {isTop3 ? <i className={`fas fa-crown text-xl ${medals[idx]}`}></i> : <span className="font-black font-orbitron text-zinc-700 text-sm">#{idx + 1}</span>}
                  </div>
                  <div className="relative shrink-0">
                    <div className={`absolute -inset-1 bg-gradient-to-br ${rank.badgeBg} opacity-20 rounded-xl blur-sm`}></div>
                    <img src={entry.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.name}`} className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 relative z-10" />
                    <div className="absolute -bottom-1 -right-1 bg-zinc-900 text-white text-[8px] px-2 py-0.5 border border-zinc-700 rounded-full font-black z-20">LV.{entry.level || 1}</div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white font-black text-xs sm:text-sm uppercase truncate max-w-[100px] sm:max-w-[180px]">{entry.name}</span>
                    <span className={`text-[8px] sm:text-[10px] font-mono font-bold uppercase truncate flex items-center gap-2 ${rank.color}`}>
                      <i className={`fas ${rank.icon} text-[10px]`}></i> {rank.title}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-amber-500 font-orbitron font-black text-xs sm:text-sm leading-none">{filter === 'LEVEL' ? `SETOR ${entry.maxLevelReached || 0}` : entry.score.toLocaleString()}</span>
                  <span className="text-[7px] text-zinc-700 font-black uppercase tracking-tighter mt-1">{filter === 'LEVEL' ? 'CONQUISTAS' : 'PONTUAÇÃO'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={onBack} className="w-full py-5 bg-zinc-900 hover:bg-zinc-800 text-white font-orbitron font-black rounded-3xl transition-all uppercase text-[11px] tracking-[0.4em] border border-zinc-800 shrink-0 shadow-2xl active:scale-95 z-10">Retornar ao QG</button>
    </div>
  );
};

export default RankingView;
