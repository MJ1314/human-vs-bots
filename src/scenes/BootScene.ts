/**
 * Boot Scene
 * ===========
 * First scene to run. Sets up minimal assets and transitions to PreloadScene.
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    // Future: Load loading bar assets here
  }

  create(): void {
    console.log('[BootScene] Game booting...');
    this.scene.start('Preload');
  }
}
