
import React, { useState } from 'react';
import { UserProfile, FeedbackEntry } from '../types';
import { db } from '../services/db';
import { getBugReportResponse } from '../services/geminiService';

interface FeedbackViewProps {
  user: UserProfile;
  onBack: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ user, onBack }) => {
  const [type, setType] = useState<FeedbackEntry['type']>('BUG');
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSending(true);
    try {
      await db.feedback.submit({
        username: user.username,
        type,
        description
      });

      const response = await getBugReportResponse(description);
      setAiResponse(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="z-20 w-[92%] max-w-lg p-6 sm:p-10 rounded-[2.5rem] bg-zinc-900 border border-amber-500/20 shadow-[0_0_80px_rgba(245,158,11,0.1)] flex flex-col animate-in fade-in zoom-in duration-500 overflow-hidden max-h-[90dvh]">
      
      <div className="flex justify-between items-start mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-orbitron font-black text-amber-500 flex items-center gap-3 italic">
            <i className="fas fa-satellite-dish animate-pulse"></i> TRANSMISSÃO TÉCNICA
          </h2>
          <p className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.3em] mt-1">Canal de Reporte de Anomalias</p>
        </div>
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-zinc-800/50 rounded-xl text-zinc-500 hover:text-white transition-all">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-6">
        {!aiResponse ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] text-zinc-500 font-black uppercase ml-1 tracking-widest">Classificação da Anomalia</label>
              <div className="grid grid-cols-3 gap-3">
                {(['BUG', 'SUGGESTION', 'CRASH'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-3 rounded-xl text-[10px] font-black tracking-widest transition-all border ${
                      type === t 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'bg-black/40 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                    }`}
                  >
                    {t === 'BUG' ? 'FALHA' : t === 'SUGGESTION' ? 'IDEIA' : 'CRITICAL'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-zinc-500 font-black uppercase ml-1 tracking-widest">Descrição Técnica</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o erro ou sua sugestão aqui, operador..."
                className="w-full h-40 bg-black/40 border border-zinc-800 rounded-2xl p-5 text-amber-500/80 font-mono text-sm focus:outline-none focus:border-amber-500/40 transition-all placeholder:text-zinc-800 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !description.trim()}
              className="w-full py-5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-orbitron font-black rounded-2xl transition-all uppercase text-[11px] tracking-[0.3em] shadow-[0_15px_40px_rgba(245,158,11,0.2)] active:scale-95 flex items-center justify-center gap-3"
            >
              {isSending ? (
                <>
                  <i className="fas fa-cog animate-spin"></i> ENVIANDO DOSSIÊ...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> TRANSMITIR REPORTE
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center text-center py-10 animate-in fade-in slide-in-from-top-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20 mb-6 shadow-2xl">
              <i className="fas fa-check-circle text-4xl text-emerald-500"></i>
            </div>
            <h3 className="text-xl font-orbitron font-black text-white mb-4 uppercase italic tracking-tighter">REPORTE RECEBIDO</h3>
            <div className="bg-black/60 p-6 rounded-3xl border border-zinc-800 relative mb-10 text-left">
              <div className="absolute -top-3 left-6 bg-zinc-800 px-3 py-1 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-widest border border-zinc-700">
                Engenharia de Combate
              </div>
              <p className="text-emerald-500/90 font-mono text-sm leading-relaxed italic">
                "{aiResponse}"
              </p>
            </div>
            <button
              onClick={onBack}
              className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-orbitron font-black rounded-2xl transition-all uppercase text-[10px] tracking-[0.3em] border border-zinc-700"
            >
              VOLTAR AO COMBATE
            </button>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-zinc-800/80 flex justify-center shrink-0">
        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.5em] opacity-40">Protocolo de Manutenção v3.0</p>
      </div>
    </div>
  );
};

export default FeedbackView;
