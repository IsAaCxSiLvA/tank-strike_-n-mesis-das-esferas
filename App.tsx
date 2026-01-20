
import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import RankingView from './components/RankingView';
import CreditsView from './components/CreditsView';
import LoadingScreen from './components/LoadingScreen';
import AuthView from './components/AuthView';
import ProfileView from './components/ProfileView';
import FeedbackView from './components/FeedbackView';
import { ScoreEntry, GameState, UserProfile } from './types';
import { getCommanderReport } from './services/geminiService';
import { db } from './services/db';

export interface RankInfo {
  title: string;
  icon: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  shadowColor: string;
  minLevel: number;
}

export const MILITARY_HIERARCHY: RankInfo[] = [
  { minLevel: 300, title: 'Marechal Supremo', icon: 'fa-crown', color: 'text-red-500', badgeBg: 'from-red-600 via-rose-500 to-red-900', borderColor: 'border-red-400', shadowColor: 'shadow-red-500/50' },
  { minLevel: 250, title: 'General de Divisão Estelar', icon: 'fa-star-shooting', color: 'text-amber-300', badgeBg: 'from-amber-400 via-red-600 to-zinc-950', borderColor: 'border-amber-400', shadowColor: 'shadow-red-600/50' },
  { minLevel: 210, title: 'Coronel de Elite', icon: 'fa-shield-halved', color: 'text-blue-500', badgeBg: 'from-blue-600 via-cyan-500 to-indigo-900', borderColor: 'border-blue-400', shadowColor: 'shadow-blue-500/40' },
  { minLevel: 170, title: 'Major de Assalto', icon: 'fa-medal', color: 'text-emerald-400', badgeBg: 'from-emerald-500 via-teal-500 to-green-900', borderColor: 'border-emerald-400', shadowColor: 'shadow-emerald-500/30' },
  { minLevel: 130, title: 'Capitão de Divisão', icon: 'fa-crosshairs', color: 'text-purple-400', badgeBg: 'from-purple-500 via-violet-500 to-purple-900', borderColor: 'border-purple-400', shadowColor: 'shadow-purple-500/30' },
  { minLevel: 90, title: 'Tenente Tático', icon: 'fa-bolt', color: 'text-cyan-400', badgeBg: 'from-cyan-400 via-sky-500 to-blue-800', borderColor: 'border-cyan-400', shadowColor: 'shadow-cyan-500/30' },
  { minLevel: 60, title: 'Sargento Veterano', icon: 'fa-chevron-up', color: 'text-zinc-200', badgeBg: 'from-zinc-300 via-zinc-400 to-zinc-700', borderColor: 'border-zinc-300', shadowColor: 'shadow-zinc-400/30' },
  { minLevel: 30, title: 'Cabo de Infantaria', icon: 'fa-angle-up', color: 'text-orange-400', badgeBg: 'from-orange-500 via-amber-600 to-orange-900', borderColor: 'border-orange-500', shadowColor: 'shadow-orange-700/30' },
  { minLevel: 10, title: 'Soldado Raso', icon: 'fa-minus', color: 'text-zinc-500', badgeBg: 'from-zinc-600 via-zinc-700 to-black', borderColor: 'border-zinc-600', shadowColor: 'shadow-black/20' },
  { minLevel: 0, title: 'Recruta', icon: 'fa-circle', color: 'text-zinc-600', badgeBg: 'from-zinc-800 via-zinc-900 to-black', borderColor: 'border-zinc-800', shadowColor: 'shadow-transparent' }
];

export const getMilitaryRank = (level: number): RankInfo => {
  return MILITARY_HIERARCHY.find(r => level >= r.minLevel) || MILITARY_HIERARCHY[MILITARY_HIERARCHY.length - 1];
};

export const getXPForNextLevel = (level: number) => level * 1000;

const DEFAULT_GAME_STATE: GameState = {
  playerRoundWins: 0,
  enemyRoundWins: 0,
  currentRound: 1,
  isGameOver: false,
  isPaused: false,
  highScore: 0,
  mode: 'OFFLINE',
  lives: 5,
  currentLevel: 1
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<'AUTH' | 'MENU' | 'LOADING' | 'PLAYING' | 'GAMEOVER' | 'RANKING' | 'CREDITS' | 'PROFILE' | 'FEEDBACK' | 'OTHER_PROFILE'>('AUTH');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [viewedUser, setViewedUser] = useState<UserProfile | null>(null);
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [lastReport, setLastReport] = useState<string>('');
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [vpGained, setVpGained] = useState(0);
  const [lastLevelsCleared, setLastLevelsCleared] = useState(0);

  useEffect(() => {
    db.users.seed();
    
    const activeSession = db.session.get();
    if (activeSession) {
      setCurrentUser(activeSession);
      const savedGameState = db.gameState.get();
      setGameState(savedGameState || { ...DEFAULT_GAME_STATE, highScore: activeSession.highScore });
      setScreen('MENU');
    }
    setLeaderboard(db.ranking.getTop());
  }, []);

  useEffect(() => {
    if (screen === 'PLAYING') {
      db.gameState.save(gameState);
    }
  }, [gameState, screen]);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    db.session.set(user);
    setGameState(prev => ({ ...prev, highScore: user.highScore }));
    setLeaderboard(db.ranking.getTop());
    setScreen('MENU');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    db.session.clear();
    setGameState(DEFAULT_GAME_STATE);
    setScreen('AUTH');
  };

  const handleUpdateProfile = async (updatedUser: UserProfile) => {
    const result = await db.users.update(updatedUser.username, updatedUser);
    
    if (currentUser?.username === updatedUser.username) {
      setCurrentUser(result);
    }
    
    if (viewedUser?.username === updatedUser.username) {
      setViewedUser(result);
    }

    setLeaderboard(db.ranking.getTop());
  };

  const handleViewOtherProfile = (username: string) => {
    const user = db.users.getByUsername(username);
    if (user) {
      setViewedUser(user);
      setScreen('OTHER_PROFILE');
    }
  };

  const handleGameOver = useCallback(async (playerWonMatch: boolean, finalPoints: number, levelsCleared: number) => {
    db.gameState.clear();
    setLastLevelsCleared(levelsCleared);
    const victoryPointsGained = Math.floor(levelsCleared * 5);
    const gainedXP = Math.floor(finalPoints / 5) + (levelsCleared * 200);
    setXpGained(gainedXP);
    setVpGained(victoryPointsGained);

    if (currentUser) {
      let newLevel = currentUser.level || 1;
      let newXP = (currentUser.xp || 0) + gainedXP;
      let newVP = (currentUser.victoryPoints || 0) + victoryPointsGained;
      let maxLvl = Math.max(currentUser.maxLevelReached || 0, levelsCleared);
      
      let nextThreshold = getXPForNextLevel(newLevel);
      while (newXP >= nextThreshold) {
        newXP -= nextThreshold;
        newLevel++;
        nextThreshold = getXPForNextLevel(newLevel);
      }

      await handleUpdateProfile({ 
        ...currentUser, 
        victoryPoints: newVP,
        highScore: Math.max(currentUser.highScore, finalPoints),
        level: newLevel,
        xp: newXP,
        maxLevelReached: maxLvl
      });
    }

    setScreen('GAMEOVER');
    setIsLoadingReport(true);
    const report = await getCommanderReport(finalPoints, currentUser?.highScore || 0);
    setLastReport(report);
    setIsLoadingReport(false);
  }, [currentUser]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden touch-none">
      <div className="scanline fixed inset-0 pointer-events-none opacity-10"></div>

      {screen === 'AUTH' && <AuthView onSuccess={handleAuthSuccess} />}

      {screen === 'MENU' && currentUser && (
        <MainMenu 
          onPlay={(mode) => { 
            const newGameState = { ...DEFAULT_GAME_STATE, mode, highScore: currentUser.highScore };
            setGameState(newGameState);
            db.gameState.save(newGameState);
            setScreen('LOADING'); 
          }}
          onShowRanking={() => { setLeaderboard(db.ranking.getTop()); setScreen('RANKING'); }}
          onShowCredits={() => setScreen('CREDITS')}
          onShowProfile={() => setScreen('PROFILE')}
          onShowFeedback={() => setScreen('FEEDBACK')}
          onLogout={handleLogout}
          highScore={currentUser.highScore}
          top3={leaderboard.slice(0, 3)}
          user={currentUser}
          onLogout={() => { db.session.clear(); setCurrentUser(null); setScreen('AUTH'); }}
        />
      )}

      {screen === 'PROFILE' && currentUser && (
        <ProfileView 
          user={currentUser} 
          onUpdate={handleUpdateProfile} 
          onBack={() => setScreen('MENU')}
        />
      )}

      {screen === 'OTHER_PROFILE' && currentUser && viewedUser && (
        <ProfileView 
          user={viewedUser} 
          viewer={currentUser}
          onUpdate={handleUpdateProfile} 
          onBack={() => setScreen('RANKING')}
        />
      )}

      {screen === 'FEEDBACK' && currentUser && (
        <FeedbackView 
          user={currentUser} 
          onBack={() => setScreen('MENU')}
        />
      )}

      {screen === 'LOADING' && <LoadingScreen onComplete={() => setScreen('PLAYING')} isOnline={gameState.mode === 'ONLINE'} />}
      {screen === 'RANKING' && <RankingView leaderboard={leaderboard} onBack={() => setScreen('MENU')} onViewProfile={handleViewOtherProfile} />}
      {screen === 'CREDITS' && <CreditsView onBack={() => setScreen('MENU')} />}

      {screen === 'PLAYING' && currentUser && (
        <GameCanvas 
          onGameOver={handleGameOver} 
          userName={currentUser.username}
          mode={gameState.mode}
        />
      )}

      {screen === 'GAMEOVER' && currentUser && (
        <GameOver 
          score={currentUser.highScore} 
          highScore={currentUser.highScore}
          report={lastReport}
          isLoadingReport={isLoadingReport}
          onSave={() => setScreen('MENU')}
          onRestart={() => setScreen('LOADING')}
          defaultName={currentUser.username}
          xpGained={xpGained}
          vpGained={vpGained}
          currentLevel={currentUser.level}
          currentXp={currentUser.xp}
          levelsCleared={lastLevelsCleared}
        />
      )}
    </div>
  );
};

export default App;
