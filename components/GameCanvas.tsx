
import React, { useRef, useEffect, useState } from 'react';
import { Bullet, Tank, GameMode } from '../types';
import { TANK_SPEED, BULLET_SPEED, TILE_SIZE, SUB_TILE_SIZE, TileType, COLORS } from '../constants';

interface GameCanvasProps {
  onGameOver: (playerWonMatch: boolean, finalScore: number, levelsCleared: number) => void;
  userName: string;
  mode: GameMode;
}

interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; color: string; size: number;
}

const INTERNAL_SIZE = 13 * TILE_SIZE; 

class SoundEngine {
  ctx: AudioContext | null = null;
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 44100});
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playShot() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
  playExplosion() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.2);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }
  playHit() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

const audio = new SoundEngine();

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, userName, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameInfo, setGameInfo] = useState({ level: 1, lives: 5, score: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const map = useRef<number[][]>([]);
  const bullets = useRef<Bullet[]>([]);
  const enemies = useRef<Tank[]>([]);
  const particles = useRef<Particle[]>([]);
  const player = useRef<Tank>({
    pos: { x: 4 * TILE_SIZE + 20, y: 12 * TILE_SIZE + 20 },
    size: 28, color: COLORS.PLAYER, rotation: -Math.PI/2,
    health: 1, maxHealth: 1, speed: TANK_SPEED, lastShot: 0,
  } as any);
  const keys = useRef<Record<string, boolean>>({});
  const isGameOver = useRef(false);
  const baseAlive = useRef(true);
  const frameId = useRef(0);

  useEffect(() => {
    const checkTouch = () => {
      const isMobileOS = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
      setIsTouchDevice(isMobileOS || hasTouch);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    
    const handleKeyDown = (e: KeyboardEvent) => { 
      audio.init(); 
      keys.current[e.code] = true; 
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
      keys.current[e.code] = false; 
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('resize', checkTouch);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const createParticles = (x: number, y: number, color: string, count = 5, sizeMultiplier = 1) => {
    for(let i=0; i<count; i++) {
      particles.current.push({
        x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
        life: 1.0, color, size: (Math.random() * 3 + 2) * sizeMultiplier
      });
    }
  };

  const initMap = (level: number) => {
    const rows = 26, cols = 26;
    const newMap = Array(rows).fill(0).map(() => Array(cols).fill(0));
    const bx = 12, by = 24;
    newMap[by][bx] = TileType.BASE; newMap[by][bx+1] = TileType.BASE;
    newMap[by+1][bx] = TileType.BASE; newMap[by+1][bx+1] = TileType.BASE;
    const wall = [[23,11],[23,12],[23,13],[23,14],[24,11],[24,14],[25,11],[25,14]];
    wall.forEach(([y,x]) => newMap[y][x] = TileType.BRICK);
    for(let i=2; i<22; i++) {
      for(let j=0; j<cols; j++) {
        if (newMap[i][j] !== 0) continue;
        const rand = Math.random();
        if (rand < 0.22) newMap[i][j] = TileType.BRICK;
        else if (rand < 0.06) newMap[i][j] = TileType.STEEL;
        else if (rand < 0.04) newMap[i][j] = TileType.WATER;
        else if (rand < 0.04) newMap[i][j] = TileType.BUSH;
      }
    }
    map.current = newMap;
  };

  const spawnEnemies = (level: number) => {
    const pos = [20, 260, 500];
    enemies.current = Array.from({length: Math.min(3 + level, 8)}, (_, i) => ({
      pos: { x: pos[i % 3], y: 20 },
      size: 28, color: COLORS.ENEMY, rotation: Math.PI/2,
      health: 1, speed: TANK_SPEED * (0.55 + (level * 0.05)), lastShot: 0
    } as any));
  };

  const isSolid = (gx: number, gy: number) => {
    if (gx < 0 || gx >= 26 || gy < 0 || gy >= 26) return true;
    const t = map.current[gy][gx];
    return t !== TileType.EMPTY && t !== TileType.BUSH;
  };

  const checkCollision = (nx: number, ny: number) => {
    const r = 8.5; 
    const points = [{x: nx-r, y: ny-r}, {x: nx+r, y: ny-r}, {x: nx-r, y: ny+r}, {x: nx+r, y: ny+r}];
    return points.some(p => isSolid(Math.floor(p.x / SUB_TILE_SIZE), Math.floor(p.y / SUB_TILE_SIZE)));
  };

  const fire = (t: Tank, owner: 'PLAYER' | 'ENEMY') => {
    const now = Date.now();
    if (now - t.lastShot < 450) return;
    const spawnX = t.pos.x + Math.cos(t.rotation) * 18;
    const spawnY = t.pos.y + Math.sin(t.rotation) * 18;
    const gx = Math.floor(spawnX / SUB_TILE_SIZE);
    const gy = Math.floor(spawnY / SUB_TILE_SIZE);
    if (gx >= 0 && gx < 26 && gy >= 0 && gy < 26) {
      const tile = map.current[gy][gx];
      if (tile === TileType.BRICK || tile === TileType.STEEL || tile === TileType.BASE) {
        if (tile === TileType.BRICK) {
          map.current[gy][gx] = TileType.EMPTY;
          createParticles(spawnX, spawnY, COLORS.BRICK, 10);
          audio.playHit();
        } else if (tile === TileType.BASE) {
           baseAlive.current = false;
           isGameOver.current = true;
           audio.playExplosion();
           onGameOver(false, gameInfo.score, gameInfo.level-1);
        }
        t.lastShot = now;
        return;
      }
    }
    bullets.current.push({
      pos: { x: spawnX, y: spawnY },
      velocity: { x: Math.cos(t.rotation) * BULLET_SPEED, y: Math.sin(t.rotation) * BULLET_SPEED },
      owner, size: 5, damage: 1, life: 100, rotation: t.rotation, color: '#FFF'
    } as any);
    if (owner === 'PLAYER') audio.playShot();
    t.lastShot = now;
  };

  useEffect(() => {
    initMap(gameInfo.level);
    spawnEnemies(gameInfo.level);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const loop = () => {
      if (isGameOver.current) return;
      let dx = 0, dy = 0;
      if (keys.current['ArrowUp'] || keys.current['KeyW']) dy = -1;
      else if (keys.current['ArrowDown'] || keys.current['KeyS']) dy = 1;
      else if (keys.current['ArrowLeft'] || keys.current['KeyA']) dx = -1;
      else if (keys.current['ArrowRight'] || keys.current['KeyD']) dx = 1;
      
      if (dx !== 0 || dy !== 0) {
        const speed = player.current.speed;
        if (dx > 0) player.current.rotation = 0;
        else if (dx < 0) player.current.rotation = Math.PI;
        else if (dy > 0) player.current.rotation = Math.PI/2;
        else if (dy < 0) player.current.rotation = -Math.PI/2;
        let nx = player.current.pos.x + dx * speed;
        let ny = player.current.pos.y + dy * speed;
        if (!checkCollision(nx, ny)) {
          player.current.pos.x = nx; player.current.pos.y = ny;
        }
      }
      if (keys.current['Space']) { audio.init(); fire(player.current, 'PLAYER'); }
      
      enemies.current.forEach(en => {
        if (Math.random() > 0.982) en.rotation = [0, Math.PI/2, Math.PI, -Math.PI/2][Math.floor(Math.random()*4)];
        const nx = en.pos.x + Math.cos(en.rotation) * en.speed;
        const ny = en.pos.y + Math.sin(en.rotation) * en.speed;
        if (!checkCollision(nx, ny)) { en.pos.x = nx; en.pos.y = ny; }
        else en.rotation += Math.PI/2;
        if (Math.random() > 0.982) fire(en, 'ENEMY');
      });

      for (let i = bullets.current.length - 1; i >= 0; i--) {
        const b = bullets.current[i];
        b.pos.x += b.velocity.x; b.pos.y += b.velocity.y;
        const gx = Math.floor(b.pos.x / SUB_TILE_SIZE);
        const gy = Math.floor(b.pos.y / SUB_TILE_SIZE);
        if (gx >= 0 && gx < 26 && gy >= 0 && gy < 26) {
          const tile = map.current[gy][gx];
          if (tile === TileType.BRICK) {
            map.current[gy][gx] = TileType.EMPTY; createParticles(b.pos.x, b.pos.y, COLORS.BRICK, 8);
            audio.playHit(); bullets.current.splice(i, 1); continue;
          } else if (tile === TileType.STEEL) {
            createParticles(b.pos.x, b.pos.y, '#AAA', 4); audio.playHit(); bullets.current.splice(i, 1); continue;
          } else if (tile === TileType.BASE) {
            createParticles(b.pos.x, b.pos.y, '#F00', 40, 2.5); audio.playExplosion();
            baseAlive.current = false; isGameOver.current = true;
            onGameOver(false, gameInfo.score, gameInfo.level-1); return;
          }
        }
        if (b.owner === 'PLAYER') {
          enemies.current.forEach((en, idx) => {
            if (Math.sqrt((b.pos.x - en.pos.x)**2 + (b.pos.y - en.pos.y)**2) < 18) {
              createParticles(en.pos.x, en.pos.y, '#FF0', 15, 1.5); audio.playExplosion();
              enemies.current.splice(idx, 1); bullets.current.splice(i, 1);
              setGameInfo(p => ({ ...p, score: p.score + 100 }));
              if (enemies.current.length === 0) {
                setGameInfo(p => ({ ...p, level: p.level + 1 }));
                player.current.pos = { x: 4 * TILE_SIZE + 20, y: 12 * TILE_SIZE + 20 };
              }
            }
          });
        } else if (Math.sqrt((b.pos.x - player.current.pos.x)**2 + (b.pos.y - player.current.pos.y)**2) < 18) {
          bullets.current.splice(i, 1);
          createParticles(player.current.pos.x, player.current.pos.y, '#F00', 25, 1.8); audio.playExplosion();
          setGameInfo(p => {
            if (p.lives <= 1) { isGameOver.current = true; onGameOver(false, p.score, p.level-1); return p; }
            player.current.pos = { x: 4 * TILE_SIZE + 20, y: 12 * TILE_SIZE + 20 };
            return { ...p, lives: p.lives - 1 };
          });
        }
        if (b.pos.x < 0 || b.pos.x > INTERNAL_SIZE || b.pos.y < 0 || b.pos.y > INTERNAL_SIZE) bullets.current.splice(i, 1);
      }

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.045;
        if (p.life <= 0) particles.current.splice(i, 1);
      }

      ctx.fillStyle = COLORS.BG; ctx.fillRect(0,0,INTERNAL_SIZE, INTERNAL_SIZE);
      for(let y=0; y<26; y++) for(let x=0; x<26; x++) {
        const t = map.current[y][x], px = x*20, py = y*20;
        if (t === TileType.BRICK) {
          ctx.fillStyle = COLORS.BRICK; ctx.fillRect(px+1, py+1, 18, 18);
        } else if (t === TileType.STEEL) {
          ctx.fillStyle = COLORS.STEEL; ctx.fillRect(px, py, 20, 20);
        } else if (t === TileType.WATER) {
          ctx.fillStyle = COLORS.WATER; ctx.fillRect(px, py, 20, 20);
        } else if (t === TileType.BASE) {
          ctx.fillStyle = baseAlive.current ? COLORS.BASE : '#333';
          ctx.beginPath(); ctx.moveTo(px, py+20); ctx.lineTo(px+10, py); ctx.lineTo(px+20, py+20); ctx.fill();
        }
      }
      
      const drawTank = (t: Tank) => {
        ctx.save(); ctx.translate(t.pos.x, t.pos.y); ctx.rotate(t.rotation);
        ctx.fillStyle = t.color; ctx.fillRect(-12, -10, 24, 20);
        ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(0, -4, 22, 8);
        ctx.restore();
      };
      
      drawTank(player.current); enemies.current.forEach(drawTank);
      
      particles.current.forEach(p => {
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      
      ctx.globalAlpha = 1;
      bullets.current.forEach(b => {
        ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(b.pos.x, b.pos.y, 4, 0, Math.PI*2); ctx.fill();
      });
      
      frameId.current = requestAnimationFrame(loop);
    };
    frameId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId.current);
  }, [gameInfo.level]);

  const setKey = (code: string, val: boolean) => { keys.current[code] = val; };
  const handlePointerDown = (key: string) => { audio.init(); keys.current[key] = true; };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#050505] text-white touch-none overflow-hidden select-none h-[100dvh]">
      <header className="flex justify-between items-center px-4 sm:px-12 bg-zinc-900 border-b-2 border-zinc-800 shrink-0 h-[8dvh] sm:h-[10dvh] shadow-2xl relative z-20">
        <div className="flex flex-col">
          <span className="text-[7px] sm:text-[10px] text-emerald-500/50 font-black uppercase tracking-widest leading-none mb-1">Setor</span>
          <span className="text-white font-orbitron font-black text-lg sm:text-2xl leading-none">ALPHA-0{gameInfo.level}</span>
        </div>
        <div className="flex gap-2 sm:gap-4 bg-black/40 px-3 py-1.5 sm:px-6 sm:py-3 rounded-xl border border-zinc-800">
          {[...Array(5)].map((_, i) => (
            <i key={i} className={`fas fa-shield-alt text-sm sm:text-2xl transition-all ${i < gameInfo.lives ? 'text-emerald-500' : 'text-zinc-800 opacity-20'}`}></i>
          ))}
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[7px] sm:text-[10px] text-amber-500/50 font-black uppercase tracking-widest leading-none mb-1">Score</span>
          <span className="text-white font-orbitron font-black text-lg sm:text-2xl leading-none">{gameInfo.score.toLocaleString()}</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-black/50 relative">
        <div className="relative border-2 sm:border-[8px] border-zinc-800 shadow-2xl rounded-xl sm:rounded-3xl aspect-square h-full max-h-full max-w-full overflow-hidden bg-zinc-950 mx-auto group">
          <canvas ref={canvasRef} width={INTERNAL_SIZE} height={INTERNAL_SIZE} className="w-full h-full block object-contain" />
          <div className="scanline"></div>
        </div>
      </main>

      <footer className="h-[30dvh] bg-zinc-950 flex justify-around items-center px-4 sm:px-12 shrink-0 border-t-2 border-zinc-900 shadow-2xl z-20">
        {isTouchDevice ? (
          <div className="w-full max-w-5xl flex items-center justify-between px-2 sm:px-10 gap-4 h-full">
            <div className="relative w-44 h-44 sm:w-64 sm:h-64 flex items-center justify-center scale-90 sm:scale-110 shrink-0">
              <div className="absolute inset-0 bg-zinc-900/50 rounded-full border-[4px] border-zinc-800"></div>
              <button onPointerDown={()=>handlePointerDown('ArrowUp')} onPointerUp={()=>setKey('ArrowUp', false)} onPointerLeave={()=>setKey('ArrowUp', false)} className="absolute top-0 w-14 h-18 sm:w-20 sm:h-24 bg-zinc-800 rounded-xl flex items-center justify-center border-b-[4px] border-black active:translate-y-1 active:bg-emerald-600"><i className="fas fa-caret-up text-3xl sm:text-5xl text-zinc-500"></i></button>
              <button onPointerDown={()=>handlePointerDown('ArrowDown')} onPointerUp={()=>setKey('ArrowDown', false)} onPointerLeave={()=>setKey('ArrowDown', false)} className="absolute bottom-0 w-14 h-18 sm:w-20 sm:h-24 bg-zinc-800 rounded-xl flex items-center justify-center border-t-[4px] border-black active:-translate-y-1 active:bg-emerald-600"><i className="fas fa-caret-down text-3xl sm:text-5xl text-zinc-500"></i></button>
              <button onPointerDown={()=>handlePointerDown('ArrowLeft')} onPointerUp={()=>setKey('ArrowLeft', false)} onPointerLeave={()=>setKey('ArrowLeft', false)} className="absolute left-0 h-14 w-18 sm:h-20 sm:w-24 bg-zinc-800 rounded-xl flex items-center justify-center border-r-[4px] border-black active:translate-x-1 active:bg-emerald-600"><i className="fas fa-caret-left text-3xl sm:text-5xl text-zinc-500"></i></button>
              <button onPointerDown={()=>handlePointerDown('ArrowRight')} onPointerUp={()=>setKey('ArrowRight', false)} onPointerLeave={()=>setKey('ArrowRight', false)} className="absolute right-0 h-14 w-18 sm:h-20 sm:w-24 bg-zinc-800 rounded-xl flex items-center justify-center border-l-[4px] border-black active:-translate-x-1 active:bg-emerald-600"><i className="fas fa-caret-right text-3xl sm:text-5xl text-zinc-500"></i></button>
            </div>
            <button 
              onPointerDown={()=>handlePointerDown('Space')} onPointerUp={()=>setKey('Space', false)} onPointerLeave={()=>setKey('Space', false)} 
              className="w-24 h-24 sm:w-48 sm:h-48 bg-gradient-to-b from-red-600 to-red-800 rounded-full border-b-[8px] sm:border-b-[12px] border-red-950 active:border-b-0 active:translate-y-2 transition-all shadow-2xl flex flex-col items-center justify-center group active:scale-90"
            >
              <i className="fas fa-crosshairs text-4xl sm:text-7xl text-white"></i>
              <span className="text-white font-black font-orbitron text-[8px] sm:text-sm italic uppercase tracking-widest mt-1">FOGO</span>
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center gap-20 lg:gap-40">
            <div className="flex flex-col items-center">
               <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-4">Tração Blindada</span>
               <div className="grid grid-cols-3 gap-2">
                  <div className="col-start-2 w-14 h-14 bg-zinc-900 border-2 border-zinc-800 rounded-xl flex items-center justify-center"><span className="text-emerald-500 font-orbitron font-black text-xl">W</span></div>
                  <div className="col-start-1 row-start-2 w-14 h-14 bg-zinc-900 border-2 border-zinc-800 rounded-xl flex items-center justify-center"><span className="text-emerald-500 font-orbitron font-black text-xl">A</span></div>
                  <div className="col-start-2 row-start-2 w-14 h-14 bg-zinc-900 border-2 border-zinc-800 rounded-xl flex items-center justify-center"><span className="text-emerald-500 font-orbitron font-black text-xl">S</span></div>
                  <div className="col-start-3 row-start-2 w-14 h-14 bg-zinc-900 border-2 border-zinc-800 rounded-xl flex items-center justify-center"><span className="text-emerald-500 font-orbitron font-black text-xl">D</span></div>
               </div>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-4">Artilharia</span>
               <div className="w-64 h-20 bg-zinc-900 border-2 border-red-900/40 rounded-3xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-orbitron font-black text-sm tracking-widest italic uppercase">Espaço [FOGO_CANHÃO]</span>
               </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};

export default GameCanvas;
