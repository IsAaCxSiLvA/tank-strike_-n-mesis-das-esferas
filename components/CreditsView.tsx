
import React from 'react';

const CreditsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="z-20 w-[92%] max-w-md p-8 rounded-[2.5rem] bg-zinc-900/95 backdrop-blur-3xl border border-blue-500/30 shadow-[0_0_80px_rgba(59,130,246,0.15)] flex flex-col items-center animate-in fade-in zoom-in duration-500 text-center">
      
      {/* Avatar do Desenvolvedor Estilizado */}
      <div className="w-24 h-24 rounded-3xl bg-black border-2 border-blue-500/30 flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-all"></div>
        <i className="fas fa-code text-4xl text-blue-500 group-hover:scale-110 transition-transform"></i>
      </div>

      <h2 className="text-2xl font-orbitron font-black text-white mb-1 uppercase tracking-tighter">
        ARQUITETO DO <span className="text-blue-500">SISTEMA</span>
      </h2>
      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-8 opacity-60">Dossiê de Desenvolvimento</p>
      
      <div className="w-full space-y-6 text-zinc-400 font-mono text-xs mb-10">
        <div className="bg-black/40 p-5 rounded-2xl border border-zinc-800 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-8 -mt-8"></div>
          <p className="text-blue-500 text-[9px] uppercase font-black mb-2 tracking-widest">Dev Responsável</p>
          <p className="text-white font-bold text-base mb-1">TankStrike Developer</p>
          <p className="text-zinc-500 text-[11px]">Especialista em Game Design & UI/UX</p>
        </div>
        
        {/* Link Instagram (Iatagram) */}
        <div className="bg-black/40 p-5 rounded-2xl border border-zinc-800 flex items-center justify-between group cursor-pointer hover:border-pink-500/40 transition-all hover:bg-pink-500/5 shadow-xl" 
             onClick={() => window.open('https://instagram.com/seu_perfil', '_blank')}>
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white text-2xl shadow-[0_5px_15px_rgba(238,42,123,0.3)]">
              <i className="fab fa-instagram"></i>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none mb-1 group-hover:text-pink-400 transition-colors">Siga no Instagram</p>
              <p className="text-zinc-600 text-[10px]">Updates e novas operações</p>
            </div>
          </div>
          <i className="fas fa-external-link-alt text-zinc-700 text-xs group-hover:text-white group-hover:translate-x-1 transition-all"></i>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-zinc-800/50 text-left italic">
           <p className="text-zinc-600 text-[9px] leading-relaxed">
             "Construído com tecnologia de ponta para oferecer a melhor experiência de combate blindado em dispositivos móveis."
           </p>
        </div>
      </div>

      <button 
        onClick={onBack}
        className="group w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-orbitron font-black rounded-2xl transition-all uppercase text-[10px] tracking-[0.3em] border border-zinc-700 shadow-xl active:scale-95"
      >
        <i className="fas fa-chevron-left mr-2 group-hover:-translate-x-1 transition-transform"></i> Retornar ao QG
      </button>
    </div>
  );
};

export default CreditsView;
