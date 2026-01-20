
export const TANK_SPEED = 2.4;
export const BULLET_SPEED = 7.5;
export const TILE_SIZE = 40;
export const SUB_TILE_SIZE = 20; 
export const MAP_ROWS = 13;
export const MAP_COLS = 13; 

export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  WATER = 3,
  BUSH = 4,
  BASE = 5
}

export const COLORS = {
  PLAYER: '#FFD700', // Dourado
  ENEMY: '#E2E2E2',  // Branco Gelo
  BASE: '#FF3131',   
  BRICK: '#B22222',
  STEEL: '#4A4E69',
  WATER: '#0077B6',
  BUSH: '#2D6A4F',
  BG: '#0D1117',
  BULLET: '#FFFFFF'
};
