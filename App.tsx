
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
import { MILITARY_HIERARCHY, getMilitaryRank, getXPForNextLevel } from './gameConstants';

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
    console.log('App mounted - initializing...');
    db.users.seed();
    
    const activeSession = db.session.get();
    console.log('Active session:', activeSession);
    
    if (activeSession) {
      setCurrentUser(activeSession);
      const savedGameState = db.gameState.get();
      setGameState(savedGameState || { ...DEFAULT_GAME_STATE, highScore: activeSession.highScore });
      setScreen('MENU');
    }
    setLeaderboard(db.ranking.getTop());
    console.log('App initialized with screen:', screen);
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
