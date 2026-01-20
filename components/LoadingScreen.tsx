
import React, { useState, useEffect } from 'react';

const LoadingScreen: React.FC<{ onComplete: () => void, isOnline?: boolean }> = ({ onComplete, isOnline }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('PREPARANDO...');
  
  const messages = ['CALIBRANDO', 'MAPA OK', 'FOGO!'];

  useEffect(() => {
    let msgIndex = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1.5;
        const msgStep = 100 / messages.length;
        if (next >= (msgIndex + 1) * msgStep) {
          msgIndex = Math.min(msgIndex + 1, messages.length - 1);
          setCurrentMessage(messages[msgIndex]);
        }
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return next;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="z-50 fixed inset-0 bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Breathing Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
      
      <div className="w-full max-w-[240px] flex flex-col items-center">
        {/* Título Minimalista */}
        <div className="mb-10 text-center">
          <h2 className="text-white/90 font-orbitron font-black text-xl tracking-[0.4em] italic mb-1">LOADING</h2>
          <div className="flex justify-center gap-1.5 opacity-50">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
             ))}
          </div>
        </div>

        {/* Barra Stealth Line */}
        <div className="w-full h-[1px] bg-zinc-900 relative mb-4">
          <div 
            className="h-full absolute left-0 top-0 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] transition-all duration-100 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Texto de Status */}
        <div className="w-full flex justify-between items-center opacity-40">
          <span className="text-[7px] font-mono text-zinc-400 uppercase tracking-[0.6em]">{currentMessage}</span>
          <span className="text-[9px] font-orbitron font-bold text-white">{Math.floor(progress)}%</span>
        </div>
      </div>
      
      <div className="fixed bottom-12 opacity-10">
        <span className="text-[6px] text-white font-black tracking-[1.5em] uppercase">Setor de Combate Alpha-01</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
