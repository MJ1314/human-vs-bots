/**
 * Type Definitions
 * =================
 * Central location for TypeScript types used across the game.
 */

/** 2D Vector/Point */
export interface Vector2 {
  x: number;
  y: number;
}

/** Rectangle bounds */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Serializable player data for save/load */
export interface PlayerData {
  position: Vector2;
  health: number;
  maxHealth: number;
  lives: number;
}

/** Level information */
export interface LevelData {
  id: string;
  name: string;
}

/** Inventory state */
export interface InventoryData {
  coins: number;
  treasures: string[];
  keys: number;
}

/** Game progress */
export interface ProgressData {
  levelsCompleted: string[];
  secretsFound: number;
  totalSecrets: number;
  playTime: number;
}

/** Complete game state for save/load */
export interface GameState {
  player: PlayerData;
  level: LevelData;
  inventory: InventoryData;
  progress: ProgressData;
}

/** Entity categories for collision */
export enum EntityType {
  PLAYER = 'player',
  ENEMY = 'enemy',
  COLLECTIBLE = 'collectible',
  PLATFORM = 'platform',
  HAZARD = 'hazard',
  TRIGGER = 'trigger',
  NPC = 'npc',
}

/** Custom game events */
export const GameEvents = {
  PLAYER_DIED: 'player-died',
  PLAYER_HURT: 'player-hurt',
  COIN_COLLECTED: 'coin-collected',
  TREASURE_FOUND: 'treasure-found',
  LEVEL_COMPLETE: 'level-complete',
  CHECKPOINT_REACHED: 'checkpoint-reached',
  ENEMY_DEFEATED: 'enemy-defeated',
} as const;

/** Scene identifiers */
export const SceneKeys = {
  BOOT: 'Boot',
  PRELOAD: 'Preload',
  MENU: 'Menu',
  GAME: 'Game',
  PAUSE: 'Pause',
  GAME_OVER: 'GameOver',
} as const;
