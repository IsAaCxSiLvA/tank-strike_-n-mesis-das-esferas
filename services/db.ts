
import { UserProfile, ScoreEntry, FeedbackEntry, GameState } from '../types';

const STORAGE_KEYS = {
  USERS: 'tank_strike_users_v3',
  RANKING: 'tank_strike_ranking_v3',
  SESSION: 'tank_strike_session_v3',
  FEEDBACK: 'tank_strike_feedback_v3',
  GAME_STATE: 'tank_strike_game_state_v3'
};

export const db = {
  users: {
    getAll: (): UserProfile[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
    
    getByUsername: (username: string): UserProfile | null => {
      return db.users.getAll().find(u => u.username === username) || null;
    },

    register: async (user: any): Promise<UserProfile> => {
      const users = db.users.getAll();
      const newUser: UserProfile = {
        ...user,
        bio: user.bio || "Tanque carregado e pronto.",
        gender: user.gender || 'O',
        age: user.age || 20,
        highScore: user.highScore || 0,
        level: user.level || 1,
        xp: 0,
        victoryPoints: user.victoryPoints || 0,
        joinedAt: new Date().toISOString(),
        maxLevelReached: user.maxLevelReached || 0,
        avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
        likes: user.likes || 0,
        likedBy: user.likedBy || [],
        followers: user.followers || [],
        following: user.following || [],
        friends: user.friends || [],
        reportsCount: 0
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      await db.ranking.sync(newUser);
      return newUser;
    },

    seed: async () => {
      const users = db.users.getAll();
      if (users.length > 1) return;

      const mockPlayers = [
        { username: 'NOVA_PRIME', level: 300, highScore: 950000, likes: 250, victoryPoints: 500, maxLevelReached: 120, bio: "Marechal de Ferro.", gender: 'F', age: 28 },
        { username: 'IRON_FIST', level: 150, highScore: 65000, likes: 82, victoryPoints: 120, maxLevelReached: 55, bio: "Major Blindado.", gender: 'M', age: 34 },
        { username: 'SHADOW_REAPER', level: 80, highScore: 22000, likes: 14, victoryPoints: 40, maxLevelReached: 18, bio: "Tenente das Sombras.", gender: 'M', age: 19 },
        { username: 'CYBER_VULCAN', level: 25, highScore: 98000, likes: 142, victoryPoints: 210, maxLevelReached: 82, bio: "Cabo de Artilharia.", gender: 'O', age: 25 }
      ];

      for (const p of mockPlayers) {
        if (!users.find(u => u.username === p.username)) {
          await db.users.register({ 
            ...p, 
            password: 'password123',
            followers: [],
            friends: [],
            likedBy: []
          });
        }
      }
    },

    update: async (username: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
      const users = db.users.getAll();
      const idx = users.findIndex(u => u.username === username);
      if (idx === -1) throw new Error("Operador não encontrado");
      
      const updatedUser = { 
        ...users[idx], 
        ...updates,
        followers: updates.followers || users[idx].followers || [],
        friends: updates.friends || users[idx].friends || [],
        likedBy: updates.likedBy || users[idx].likedBy || []
      };
      users[idx] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      const session = db.session.get();
      if (session?.username === username) {
        db.session.set(updatedUser);
      }
      
      await db.ranking.sync(updatedUser);
      return updatedUser;
    },

    toggleLike: async (targetUsername: string, likerUsername: string): Promise<UserProfile> => {
      const target = db.users.getByUsername(targetUsername);
      if (!target) throw new Error("Alvo não encontrado");

      const likedBy = [...(target.likedBy || [])];
      const idx = likedBy.indexOf(likerUsername);
      
      if (idx > -1) {
        likedBy.splice(idx, 1);
      } else {
        likedBy.push(likerUsername);
      }

      return await db.users.update(targetUsername, { 
        likedBy, 
        likes: likedBy.length 
      });
    },

    toggleFollow: async (targetUsername: string, followerUsername: string): Promise<void> => {
      const target = db.users.getByUsername(targetUsername);
      const follower = db.users.getByUsername(followerUsername);
      if (!target || !follower) return;

      const tFollowers = [...(target.followers || [])];
      const fFollowing = [...(follower.following || [])];

      const idx = tFollowers.indexOf(followerUsername);
      if (idx > -1) {
        tFollowers.splice(idx, 1);
        fFollowing.splice(fFollowing.indexOf(targetUsername), 1);
      } else {
        tFollowers.push(followerUsername);
        fFollowing.push(targetUsername);
      }

      await db.users.update(targetUsername, { followers: tFollowers });
      await db.users.update(followerUsername, { following: fFollowing });
    },

    toggleFriend: async (user1: string, user2: string): Promise<void> => {
      const u1 = db.users.getByUsername(user1);
      const u2 = db.users.getByUsername(user2);
      if (!u1 || !u2) return;

      const f1 = [...(u1.friends || [])];
      const f2 = [...(u2.friends || [])];

      const idx = f1.indexOf(user2);
      if (idx > -1) {
        f1.splice(idx, 1);
        f2.splice(f2.indexOf(user1), 1);
      } else {
        f1.push(user2);
        f2.push(user1);
      }

      await db.users.update(user1, { friends: f1 });
      await db.users.update(user2, { friends: f2 });
    }
  },

  ranking: {
    sync: async (user: UserProfile) => {
      let ranking: ScoreEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RANKING) || '[]');
      const entryIdx = ranking.findIndex(e => e.name === user.username);
      
      const newEntry: ScoreEntry = {
        id: user.username,
        name: user.username,
        score: user.highScore,
        victoryPoints: user.victoryPoints,
        date: new Date().toISOString(),
        avatar: user.avatar,
        level: user.level,
        rankTitle: user.username, 
        maxLevelReached: user.maxLevelReached
      };

      if (entryIdx > -1) {
        ranking[entryIdx] = newEntry;
      } else {
        ranking.push(newEntry);
      }
      
      localStorage.setItem(STORAGE_KEYS.RANKING, JSON.stringify(ranking));
    },

    getTop: (): ScoreEntry[] => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RANKING) || '[]');
    }
  },

  feedback: {
    getAll: (): FeedbackEntry[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACK) || '[]'),
    submit: async (feedback: Partial<FeedbackEntry>): Promise<FeedbackEntry> => {
      const all = db.feedback.getAll();
      const newEntry: FeedbackEntry = {
        id: Math.random().toString(36).substring(2, 9),
        username: feedback.username || 'ANON',
        type: feedback.type || 'BUG',
        description: feedback.description || '',
        timestamp: new Date().toISOString(),
        status: 'PENDING'
      };
      all.push(newEntry);
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(all));
      return newEntry;
    }
  },

  gameState: {
    save: (state: GameState) => localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state)),
    get: (): GameState | null => {
      const s = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      return s ? JSON.parse(s) : null;
    },
    clear: () => localStorage.removeItem(STORAGE_KEYS.GAME_STATE)
  },

  session: {
    set: (user: UserProfile) => localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user)),
    get: (): UserProfile | null => {
      const s = localStorage.getItem(STORAGE_KEYS.SESSION);
      return s ? JSON.parse(s) : null;
    },
    clear: () => {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    }
  }
};
