/**
 * Versus Scene
 * =============
 * Shows the versus screen (APE vs Blockhead) after pressing Fight, then starts the game.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

const VERSUS_DURATION_MS = 2500;

export class VersusScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Versus' });
  }

  create(): void {
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'versus-bg');
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setDepth(0);

    this.cameras.main.fadeIn(300);

    this.time.delayedCall(VERSUS_DURATION_MS, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Game');
      });
    });
  }
}
