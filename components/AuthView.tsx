
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { db } from '../services/db';

interface AuthViewProps {
  onSuccess: (user: UserProfile) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      if (username.length < 3 || password.length < 4) {
        throw new Error('Mínimo: Nome 3 carac., Senha 4 carac.');
      }

      const users = db.users.getAll();

      if (isLogin) {
        const found = users.find((u: any) => u.username === username && u.password === password);
        if (found) {
          onSuccess(found);
        } else {
          throw new Error('Acesso negado: Credenciais inválidas.');
        }
      } else {
        const exists = users.find((u: any) => u.username === username);
        if (exists) {
          throw new Error('Codinome já registrado por outro operador.');
        } else {
          const newUser = await db.users.register({ username, password });
          onSuccess(newUser);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="z-20 w-[92%] max-w-md p-8 rounded-3xl bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-4 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <i className="fas fa-terminal text-2xl text-emerald-500"></i>
        </div>
        <h1 className="text-3xl font-orbitron font-black text-white tracking-tighter uppercase">
          {isLogin ? 'Login Operador' : 'Novo Registro'}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
            Identificação de Combate
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 font-black uppercase ml-1">Codinome</label>
          <input 
            type="text" 
            value={username}
            disabled={isProcessing}
            onChange={(e) => setUsername(e.target.value.toUpperCase())}
            className="w-full bg-black/40 border border-zinc-800 rounded-xl p-4 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500/50 transition-all uppercase placeholder:text-zinc-800 disabled:opacity-50"
            placeholder="EX: GHOST_UNIT"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 font-black uppercase ml-1">Senha Neural</label>
          <input 
            type="password" 
            value={password}
            disabled={isProcessing}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-zinc-800 rounded-xl p-4 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800 disabled:opacity-50"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-[9px] font-black uppercase text-center animate-pulse">
            <i className="fas fa-shield-virus mr-2"></i> {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={isProcessing}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron font-black rounded-xl transition-all shadow-[0_15px_30px_rgba(16,185,129,0.2)] active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3"
        >
          {isProcessing ? (
            <>
              <i className="fas fa-sync-alt animate-spin"></i> Processando...
            </>
          ) : (
            <>{isLogin ? 'Autenticar' : 'Finalizar Registro'}</>
          )}
        </button>
      </form>

      <button 
        onClick={() => { setIsLogin(!isLogin); setError(''); }}
        className="mt-8 text-[10px] text-zinc-500 hover:text-emerald-500 transition-colors uppercase font-black tracking-widest"
      >
        {isLogin ? 'Criar nova conta de operador' : 'Voltar para autenticação'}
      </button>
    </div>
  );
};

export default AuthView;
