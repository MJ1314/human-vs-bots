/**
 * Main Entry Point
 * =================
 * Creates the Phaser.Game instance using our configuration.
 * This kicks off the entire game lifecycle.
 */

import Phaser from 'phaser';
import { gameConfig } from './config/GameConfig.ts';
import './styles/fonts.css';

const game = new Phaser.Game(gameConfig);

export { game };
