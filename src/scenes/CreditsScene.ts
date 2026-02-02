/**
 * Credits Scene
 * =============
 * Placeholder scene for credits content.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class CreditsScene extends Phaser.Scene {
  private menuMusic?: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: 'Credits' });
  }

  create(): void {
    console.log('[CreditsScene] Showing credits placeholder');

    // Create background (same as menu)
    this.createBackground();

    // Continue menu music if playing
    const existingMusic = this.sound.get('menu-music');
    if (existingMusic && existingMusic.isPlaying) {
      this.menuMusic = existingMusic;
    }

    // Title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Credits', {
      fontFamily: 'Russo One',
      fontSize: '72px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
    });
    title.setOrigin(0.5);

    // Coming soon message
    const comingSoon = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'Coming Soon', {
      fontFamily: 'Russo One',
      fontSize: '36px',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 4,
    });
    comingSoon.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100, 'Press ESC to return to menu', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#888888',
    });
    instructions.setOrigin(0.5);

    // ESC to return to menu
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('Menu');
    });
  }

  private createBackground(): void {
    // Add background image
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-server-lab');
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setDepth(-100);

    // Add dim overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setDepth(-99);
  }
}
