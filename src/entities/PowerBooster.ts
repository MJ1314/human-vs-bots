/**
 * Power Booster Entity
 * ====================
 * Collectible power-up that makes the player bigger and stronger.
 * Similar to Mario's mushroom/flower power-ups.
 */

import Phaser from 'phaser';
import { BoosterBar } from '../ui/BoosterBar';

/** Power booster configuration */
const CONFIG = {
  /** Size of the power booster sprite */
  SCALE: 0.15,
  /** Floating bob animation amplitude (pixels) */
  BOB_AMPLITUDE: 8,
  /** Floating bob animation speed */
  BOB_SPEED: 2000,
  /** Glow pulse speed */
  GLOW_SPEED: 1500,
  /** Duration of the power boost effect (ms) */
  BOOST_DURATION: 10000,
  /** Scale multiplier when powered up */
  POWER_SCALE: 1.2,
};

export class PowerBooster {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private startY: number;
  private bobTween!: Phaser.Tweens.Tween;
  private glowTween!: Phaser.Tweens.Tween;
  private isCollected: boolean = false;

  /** Track if player is currently powered up (shared across all boosters) */
  private static isPlayerPoweredUp: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.startY = y;

    // Create the sprite
    this.sprite = scene.physics.add.sprite(x, y, 'power-booster');
    this.sprite.setScale(CONFIG.SCALE);
    this.sprite.setDepth(5);

    // Disable gravity so it floats
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    
    // Set a circular hitbox centered on the cube
    body.setCircle(this.sprite.width * 0.3, this.sprite.width * 0.2, this.sprite.height * 0.2);

    // Start floating animation
    this.createFloatingAnimation();
    
    // Add glow effect
    this.createGlowEffect();
  }

  private createFloatingAnimation(): void {
    // Floating bob animation
    this.bobTween = this.scene.tweens.add({
      targets: this.sprite,
      y: this.startY - CONFIG.BOB_AMPLITUDE,
      duration: CONFIG.BOB_SPEED / 2,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private createGlowEffect(): void {
    // Pulsing glow effect using alpha
    this.glowTween = this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.8, to: 1 },
      duration: CONFIG.GLOW_SPEED / 2,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Add a subtle scale pulse for extra "power" feel
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: CONFIG.SCALE * 1.1,
      scaleY: CONFIG.SCALE * 1.1,
      duration: CONFIG.GLOW_SPEED,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Called when player collects the power booster
   */
  collect(playerSprite: Phaser.Physics.Arcade.Sprite, boosterBar?: BoosterBar): void {
    if (this.isCollected) return;
    if (PowerBooster.isPlayerPoweredUp) return; // Can't collect while already powered up
    this.isCollected = true;

    // Stop animations
    this.bobTween.stop();
    this.glowTween.stop();

    // Play power-up sound
    this.scene.sound.play('power-up-sfx', { volume: 0.7 });

    // Activate the booster bar UI
    if (boosterBar) {
      boosterBar.activate(CONFIG.BOOST_DURATION);
    }

    // Collection visual effect - scale up and fade out
    this.scene.tweens.add({
      targets: this.sprite,
      scale: CONFIG.SCALE * 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.sprite.destroy();
      },
    });

    // Apply power boost to player
    this.applyPowerBoost(playerSprite);

    // Particle burst effect
    this.createCollectionParticles();
  }

  private applyPowerBoost(playerSprite: Phaser.Physics.Arcade.Sprite): void {
    const originalScaleX = playerSprite.scaleX;
    const originalScaleY = playerSprite.scaleY;

    // Mark player as powered up
    PowerBooster.isPlayerPoweredUp = true;

    // Scale up the player (power boost!)
    this.scene.tweens.add({
      targets: playerSprite,
      scaleX: originalScaleX * CONFIG.POWER_SCALE,
      scaleY: originalScaleY * CONFIG.POWER_SCALE,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Add a glowing tint effect to player
    playerSprite.setTint(0x00ffff);

    // Flash effect
    this.scene.tweens.add({
      targets: playerSprite,
      alpha: { from: 0.5, to: 1 },
      duration: 100,
      repeat: 3,
      yoyo: true,
      onComplete: () => {
        playerSprite.setAlpha(1); // Ensure alpha is reset to full
      },
    });

    // Revert after duration
    this.scene.time.delayedCall(CONFIG.BOOST_DURATION, () => {
      // Scale back down
      this.scene.tweens.add({
        targets: playerSprite,
        scaleX: originalScaleX,
        scaleY: originalScaleY,
        duration: 500,
        ease: 'Power2',
      });
      // Remove tint
      playerSprite.clearTint();
      // Allow collecting boosters again
      PowerBooster.isPlayerPoweredUp = false;
    });
  }

  private createCollectionParticles(): void {
    // Create particle emitter for collection effect
    const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, 'power-booster', {
      scale: { start: 0.05, end: 0 },
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      lifespan: 500,
      quantity: 8,
      blendMode: 'ADD',
    });

    // Stop emitting after burst
    particles.explode(8);

    // Clean up after particles fade
    this.scene.time.delayedCall(600, () => {
      particles.destroy();
    });
  }

  /** Get the sprite for collision detection */
  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  /** Check if already collected */
  isAlreadyCollected(): boolean {
    return this.isCollected;
  }

  /** Get boost duration for external use */
  static getBoostDuration(): number {
    return CONFIG.BOOST_DURATION;
  }

  /** Get power scale for external use */
  static getPowerScale(): number {
    return CONFIG.POWER_SCALE;
  }

  /** Reset static state (call when restarting the game) */
  static resetState(): void {
    PowerBooster.isPlayerPoweredUp = false;
  }
}
