/**
 * Game Configuration
 * ===================
 * Defines how Phaser should set up the game - resolution, physics, rendering, etc.
 */

import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.ts';
import { PreloadScene } from '../scenes/PreloadScene.ts';
import { MenuScene } from '../scenes/MenuScene.ts';
import { GameScene } from '../scenes/GameScene.ts';
import { StoryScene } from '../scenes/StoryScene.ts';
import { CreditsScene } from '../scenes/CreditsScene.ts';

/** Game dimensions - 16:9 HD resolution */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

/** Main Phaser configuration object */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  // AUTO = try WebGL first, fallback to Canvas
  type: Phaser.AUTO,

  // HTML element to inject canvas into
  parent: 'game-container',

  // Internal game resolution
  width: GAME_WIDTH,
  height: GAME_HEIGHT,

  // Background color (matches server lab image edges)
  backgroundColor: '#0d1117',

  // Scaling behavior
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Physics configuration - Arcade is simple and fast
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false,
      debugShowBody: true,
      debugBodyColor: 0xff0000, // Red color for collision boxes
    },
  },

  // Scene order - first runs first
  scene: [BootScene, PreloadScene, MenuScene, GameScene, StoryScene, CreditsScene],

  // Rendering settings for detailed artwork (not pixel art)
  render: {
    pixelArt: false,        // Use smooth filtering for detailed sprites
    antialias: true,        // Enable antialiasing for smoother edges
    roundPixels: false,     // Allow sub-pixel rendering for smooth movement
  },
};
