/**
 * Boot Scene
 * ===========
 * First scene to run. Sets up minimal assets and transitions to PreloadScene.
 */

import Phaser from 'phaser';
import ologoUrl from '../assets/backgrounds/ologo.png';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    this.load.image('ologo', ologoUrl);
  }

  create(): void {
    console.log('[BootScene] Game booting...');
    this.scene.start('Preload');
  }
}
