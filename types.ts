
export type GameMode = 'OFFLINE' | 'ONLINE';
export type PowerUpType = 'DAMAGE' | 'MULTI_CANNON' | 'DOUBLE_CANNON' | 'REPAIR' | 'SHIELD';
export type EnemyType = 'NORMAL' | 'SWIFT' | 'HEAVY' | 'SNIPER' | 'BOSS';

export interface UserProfile {
  username: string;
  password?: string;
  bio: string;
  gender: 'M' | 'F' | 'O';
  age: number;
  highScore: number;
  victoryPoints: number; 
  joinedAt: string;
  avatar?: string;
  level: number;
  xp: number;
  maxLevelReached: number;
  // Social
  likes: number;
  likedBy: string[]; 
  followers: string[];
  following: string[];
  friends: string[];
  reportsCount?: number;
}

export interface FeedbackEntry {
  id: string;
  username: string;
  type: 'BUG' | 'SUGGESTION' | 'CRASH' | 'REPORT';
  description: string;
  timestamp: string;
  status: 'PENDING' | 'RESOLVED';
  targetUser?: string; // Para denúncias
}

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  victoryPoints: number;
  date: string;
  aiComment?: string;
  avatar?: string;
  rankTitle?: string;
  level?: number;
  maxLevelReached?: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  pos: Vector2D;
  size: number;
  color: string;
  rotation: number;
}

export interface Bullet extends Entity {
  velocity: Vector2D;
  owner: 'PLAYER' | 'ENEMY';
  life: number;
  damage: number;
  size: number;
}

export interface PowerUp extends Entity {
  type: PowerUpType;
  duration: number;
  spawnTime: number;
}

export interface Tank extends Entity {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  speed: number;
  lastShot: number;
  type?: EnemyType;
  isBoss?: boolean;
  hasMultiCannon: boolean;
  hasDoubleCannon: boolean;
  hasDamageBoost: boolean;
  shieldUntil: number;
}

export interface SphereTarget extends Entity {
  health: number;
  maxHealth: number;
  active: boolean;
  shielded: boolean;
}

export interface GameState {
  playerRoundWins: number;
  enemyRoundWins: number;
  currentRound: number;
  isGameOver: boolean;
  isPaused: boolean;
  highScore: number;
  mode: GameMode;
  lives: number;
  currentLevel: number;
}
