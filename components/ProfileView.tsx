
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { getMilitaryRank, getXPForNextLevel, MILITARY_HIERARCHY } from '../gameConstants';
import { db } from '../services/db';

interface ProfileViewProps {
  user: UserProfile;
  viewer?: UserProfile | null; 
  onUpdate: (user: UserProfile) => void;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user: initialUser, viewer, onUpdate, onBack }) => {
  const [user, setUser] = useState(initialUser);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRankManual, setShowRankManual] = useState(false);
  
  const isOwnProfile = !viewer || viewer.username === user.username;
  
  const rank = getMilitaryRank(user.level || 1);
  const nextXP = getXPForNextLevel(user.level || 1);
  const xpPct = ((user.xp || 0) / nextXP) * 100;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleAction = async (action: 'LIKE' | 'FOLLOW' | 'FRIEND') => {
    if (!viewer || isProcessing) return;
    setIsProcessing(true);
    
    try {
      if (action === 'LIKE') {
        const updated = await db.users.toggleLike(user.username, viewer.username);
        setUser(updated);
        onUpdate(updated);
      } else if (action === 'FOLLOW') {
        await db.users.toggleFollow(user.username, viewer.username);
        const updated = db.users.getByUsername(user.username);
        if (updated) {
          setUser(updated);
          onUpdate(updated);
        }
      } else if (action === 'FRIEND') {
        await db.users.toggleFriend(user.username, viewer.username);
        const updated = db.users.getByUsername(user.username);
        if (updated) {
          setUser(updated);
          onUpdate(updated);
        }
      }
    } catch (e) {
      console.error("Erro na ação social:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLiked = viewer ? (user.likedBy || []).includes(viewer.username) : false;
  const isFollowing = viewer ? (user.followers || []).includes(viewer.username) : false;
  const isFriend = viewer ? (user.friends || []).includes(viewer.username) : false;

  const handleUpdateField = async (field: keyof UserProfile, value: any) => {
    try {
      const updatedUser = { ...user, [field]: value };
      await onUpdate(updatedUser);
      setUser(updatedUser);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="z-20 w-[96%] max-w-2xl h-[94dvh] flex flex-col p-4 sm:p-10 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 shadow-[0_0_150px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-300 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent`}></div>

      {/* MANUAL DE PATENTES OVERLAY */}
      {showRankManual && (
        <div className="absolute inset-0 z-[60] bg-black/95 backdrop-blur-xl p-4 sm:p-6 flex flex-col animate-in fade-in zoom-in duration-300">
           <div className="flex justify-between items-center mb-4 shrink-0">
             <h3 className="text-lg sm:text-xl font-orbitron font-black text-amber-500 italic uppercase">Hierarquia Militar</h3>
             <button onClick={() => setShowRankManual(false)} className="w-10 h-10 bg-zinc-900 rounded-xl text-white border border-zinc-800 transition-transform active:scale-90"><i className="fas fa-times"></i></button>
           </div>
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 sm:space-y-3 pb-6">
             {MILITARY_HIERARCHY.map((r, i) => (
               <div key={i} className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${user.level >= r.minLevel ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-950/50 border-zinc-900 opacity-40'}`}>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-gradient-to-br ${r.badgeBg} rounded-xl flex items-center justify-center text-lg sm:text-xl text-white border-2 border-white/10 shadow-lg`}>
                     <i className={`fas ${r.icon}`}></i>
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] sm:text-[11px] font-black uppercase ${r.color}`}>{r.title}</span>
                      <span className="text-[8px] sm:text-[9px] font-mono text-zinc-500">LV {r.minLevel}+</span>
                    </div>
                    {user.level >= r.minLevel && <span className="text-[7px] text-emerald-500 font-black uppercase tracking-widest mt-0.5 sm:mt-1">ALCANÇADO</span>}
                  </div>
               </div>
             ))}
           </div>
           <button onClick={() => setShowRankManual(false)} className="w-full py-4 bg-zinc-800 text-white rounded-xl sm:rounded-2xl font-black uppercase text-[10px] tracking-widest mt-4 active:scale-95 transition-transform">VOLTAR</button>
        </div>
      )}

      {/* HEADER - Ajustado para ser mais compacto */}
      <div className="flex justify-between items-center mb-4 sm:mb-6 shrink-0 z-10 pt-2 sm:pt-4">
        <div className="flex flex-col">
          <h2 className="text-xl sm:text-3xl font-orbitron font-black text-white flex items-center gap-2 italic leading-none uppercase">
            <span className="text-emerald-500">Dossiê</span> {isOwnProfile ? 'Militar' : 'Operador'}
          </h2>
          <div className="bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800 mt-2 inline-block self-start font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
            ID_{user.username}
          </div>
        </div>
        <button onClick={onBack} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white transition-all border border-zinc-800 active:scale-90 shadow-lg">
          <i className="fas fa-times text-sm"></i>
        </button>
      </div>

      {/* ÁREA DE CONTEÚDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-8 z-10">
        <div className="flex flex-col items-center">
          
          {/* AVATAR */}
          <div className="relative mb-6 sm:mb-8 group mt-2">
             <div className="w-28 h-28 sm:w-48 sm:h-48 relative">
               <div className={`absolute -inset-4 sm:-inset-6 bg-gradient-to-br ${rank.badgeBg} opacity-10 blur-[60px] rounded-full`}></div>
               <img 
                 src={user.avatar} 
                 className={`w-full h-full rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-900 border-4 ${rank.borderColor.replace('border-', 'border-opacity-60 border-')} shadow-2xl object-cover relative z-10 transition-transform group-hover:scale-[1.02] duration-500`}
               />
               <div className="absolute -top-2 -left-2 bg-zinc-950 text-emerald-400 text-[8px] sm:text-[10px] px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl border border-emerald-500/30 font-black shadow-2xl z-20 font-orbitron italic">
                  LV {user.level}
               </div>
               
               {isOwnProfile && (
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-8 h-8 sm:w-10 sm:h-10 bg-black/80 backdrop-blur-xl rounded-xl flex items-center justify-center text-white border border-white/10 z-30 shadow-2xl active:scale-90 transition-all hover:bg-emerald-600"
                 >
                    <i className="fas fa-camera text-[10px]"></i>
                 </button>
               )}
             </div>
          </div>

          {/* PAINEL DE TELEMETRIA SOCIAL (STATS) */}
          <div className="w-full max-w-md mb-6 flex flex-col gap-4 px-2">
             {/* Grade de 3 Colunas com fonte responsiva */}
             <div className="grid grid-cols-3 gap-2">
                <div className={`p-2 sm:p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center text-center transition-all ${user.likes > 0 ? 'border-amber-500/30' : ''}`}>
                   <i className={`fas fa-star text-[10px] mb-1 ${isLiked ? 'text-amber-500 animate-pulse' : 'text-zinc-600'}`}></i>
                   <span className="text-sm sm:text-lg font-orbitron font-black text-white leading-none">{user.likes || 0}</span>
                   <span className="text-[6px] sm:text-[7px] text-zinc-500 font-black uppercase tracking-widest mt-1 leading-none">Reputação</span>
                </div>

                <div className={`p-2 sm:p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center text-center transition-all ${user.followers?.length > 0 ? 'border-emerald-500/30' : ''}`}>
                   <i className={`fas fa-satellite-dish text-[10px] mb-1 ${isFollowing ? 'text-emerald-500 animate-pulse' : 'text-zinc-600'}`}></i>
                   <span className="text-sm sm:text-lg font-orbitron font-black text-white leading-none">{user.followers?.length || 0}</span>
                   <span className="text-[6px] sm:text-[7px] text-zinc-500 font-black uppercase tracking-widest mt-1 leading-none">Seguidores</span>
                </div>

                <div className={`p-2 sm:p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center text-center transition-all ${user.friends?.length > 0 ? 'border-blue-500/30' : ''}`}>
                   <i className={`fas fa-users text-[10px] mb-1 ${isFriend ? 'text-blue-500 animate-pulse' : 'text-zinc-600'}`}></i>
                   <span className="text-sm sm:text-lg font-orbitron font-black text-white leading-none">{user.friends?.length || 0}</span>
                   <span className="text-[6px] sm:text-[7px] text-zinc-500 font-black uppercase tracking-widest mt-1 leading-none">Unidade</span>
                </div>
             </div>

             {/* BOTÕES DE AÇÃO SOCIAL */}
             {!isOwnProfile && (
               <div className="flex gap-2 w-full animate-in slide-in-from-bottom-2 duration-500 mt-2">
                  <button 
                    onClick={() => handleAction('LIKE')}
                    disabled={isProcessing}
                    className={`flex-1 py-3 rounded-xl border font-black text-[7px] sm:text-[8px] uppercase tracking-tighter transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${isLiked ? 'bg-amber-500 border-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-amber-500'}`}
                  >
                    <i className="fas fa-star"></i>
                    {isLiked ? 'VALORIZADO' : 'PRESTIGIAR'}
                  </button>
                  <button 
                    onClick={() => handleAction('FOLLOW')}
                    disabled={isProcessing}
                    className={`flex-1 py-3 rounded-xl border font-black text-[7px] sm:text-[8px] uppercase tracking-tighter transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${isFollowing ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-emerald-500'}`}
                  >
                    <i className="fas fa-satellite-dish"></i>
                    {isFollowing ? 'MONITORANDO' : 'ALISTAR'}
                  </button>
                  <button 
                    onClick={() => handleAction('FRIEND')}
                    disabled={isProcessing}
                    className={`flex-1 py-3 rounded-xl border font-black text-[7px] sm:text-[8px] uppercase tracking-tighter transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${isFriend ? 'bg-blue-500 border-blue-400 text-zinc-950 shadow-lg shadow-blue-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-blue-500'}`}
                  >
                    <i className="fas fa-users"></i>
                    {isFriend ? 'VINCULADO' : 'UNIDADE'}
                  </button>
               </div>
             )}
          </div>

          {/* PATENTE */}
          <div className={`w-full max-w-[420px] mb-6 relative cursor-pointer active:scale-95 transition-transform group px-2`} onClick={() => setShowRankManual(true)}>
             <div className={`relative bg-zinc-900/50 border-2 ${rank.borderColor} rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 flex items-center gap-4 sm:gap-6 shadow-2xl ${rank.shadowColor}`}>
                <div className={`w-12 h-12 sm:w-16 sm:h-16 shrink-0 bg-gradient-to-br ${rank.badgeBg} rounded-xl flex items-center justify-center text-xl sm:text-2xl text-white border-2 border-white/20 shadow-xl`}>
                   <i className={`fas ${rank.icon}`}></i>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                   <span className="text-[7px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-1">Status de Carreira</span>
                   <h4 className={`text-xs sm:text-lg font-orbitron font-black uppercase truncate leading-none ${rank.color} italic`}>{rank.title}</h4>
                   <span className="text-[6px] text-zinc-600 font-mono mt-1 underline uppercase tracking-widest opacity-60">Hierarquia Global</span>
                </div>
             </div>
          </div>
          
          <h3 className="text-xl sm:text-4xl font-orbitron font-black text-white mb-4 tracking-tighter uppercase text-center px-4 leading-none italic break-all">{user.username}</h3>
          
          {/* GRITO DE GUERRA */}
          <div className="w-full max-w-md bg-zinc-900/40 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-800 shadow-inner relative mb-6 mx-2">
             <h4 className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <i className="fas fa-quote-left text-emerald-500/40 text-[10px]"></i> Grito de Guerra
             </h4>
             <p className="text-xs sm:text-sm font-mono italic text-emerald-500/90 leading-relaxed text-center">"{user.bio || 'Tanque carregado e pronto para o engajamento.'}"</p>
          </div>

          {/* DADOS */}
          <div className="grid grid-cols-2 gap-3 mb-6 w-full max-w-md px-4">
             <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 text-center">
                <span className="text-[7px] text-zinc-600 uppercase font-black block mb-1 tracking-widest leading-none">Gênero</span>
                <span className="text-white font-black text-[10px] sm:text-xs uppercase">{user.gender === 'M' ? 'Masc.' : user.gender === 'F' ? 'Fem.' : 'Outro'}</span>
             </div>
             <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 text-center">
                <span className="text-[7px] text-zinc-600 uppercase font-black block mb-1 tracking-widest leading-none">Idade</span>
                <span className="text-white font-black text-[10px] sm:text-xs uppercase">{user.age || '20'} ANOS</span>
             </div>
          </div>

          {/* PROGRESSO */}
          <div className="w-full max-w-md space-y-2 px-6 mb-8">
             <div className="flex justify-between items-center px-1">
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em]">Especialidade</span>
                <span className="text-[10px] text-emerald-500 font-mono font-bold">{Math.floor(xpPct)}%</span>
             </div>
             <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-[1px]">
                <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 rounded-full" style={{ width: `${xpPct}%` }} />
             </div>
          </div>

        </div>
      </div>

      {/* FOOTER - Mantido fixo e compacto */}
      <div className="mt-auto pt-4 border-t border-zinc-900 shrink-0 z-10 bg-zinc-950 flex flex-col items-center">
        <button onClick={onBack} className="w-full max-w-sm py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-orbitron font-black rounded-2xl uppercase text-[10px] sm:text-[12px] tracking-[0.4em] border border-zinc-800 active:scale-95 transition-all shadow-2xl leading-none">ENCERRAR PROTOCOLO</button>
        <p className="text-[6px] text-zinc-800 font-black uppercase tracking-[1em] mt-3 mb-1">NÊMESIS v3.4.2</p>
      </div>

      <input type="file" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && file.size <= 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (ev) => handleUpdateField('avatar', ev.target?.result as string);
          reader.readAsDataURL(file);
        }
      }} accept="image/*" className="hidden" />
    </div>
  );
};

export default ProfileView;
