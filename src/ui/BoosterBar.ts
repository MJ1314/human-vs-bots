/**
 * Booster Bar UI
 * ==============
 * A stylish progress bar that appears when the player has an active power boost.
 * Shows remaining time with animated effects.
 */

import Phaser from 'phaser';

/** Booster bar configuration */
const CONFIG = {
  /** Bar dimensions */
  WIDTH: 200,
  HEIGHT: 20,
  /** Position from top-right corner */
  MARGIN_X: 40,
  MARGIN_Y: 40,
  /** Colors */
  BG_COLOR: 0x1a1a2e,
  FILL_COLOR: 0x00ffff,
  BORDER_COLOR: 0x4a4a6a,
  GLOW_COLOR: 0x00ffff,
  /** Animation */
  PULSE_SPEED: 800,
  /** Corner radius */
  BORDER_RADIUS: 10,
};

export class BoosterBar {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private fillBar: Phaser.GameObjects.Graphics;
  private border: Phaser.GameObjects.Graphics;
  private glowEffect: Phaser.GameObjects.Graphics;
  private icon: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;
  private timerText: Phaser.GameObjects.Text;
  
  private currentProgress: number = 1;
  private targetProgress: number = 1;
  private isActive: boolean = false;
  private duration: number = 0;
  private elapsed: number = 0;
  private pulseTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create container for all bar elements (positioned top-right)
    const x = scene.cameras.main.width - CONFIG.WIDTH - CONFIG.MARGIN_X - 40;
    const y = CONFIG.MARGIN_Y;
    this.container = scene.add.container(x, y);
    this.container.setScrollFactor(0); // Fixed to camera
    this.container.setDepth(1000);
    this.container.setAlpha(0); // Start hidden

    // Create glow effect (behind everything)
    this.glowEffect = scene.add.graphics();
    this.container.add(this.glowEffect);

    // Create background
    this.background = scene.add.graphics();
    this.drawBackground();
    this.container.add(this.background);

    // Create fill bar
    this.fillBar = scene.add.graphics();
    this.container.add(this.fillBar);

    // Create border
    this.border = scene.add.graphics();
    this.drawBorder();
    this.container.add(this.border);

    // Create icon (power booster icon on the left)
    this.icon = scene.add.image(-25, CONFIG.HEIGHT / 2, 'power-booster');
    this.icon.setScale(0.04);
    this.container.add(this.icon);

    // Create label
    this.label = scene.add.text(CONFIG.WIDTH / 2, -8, 'POWER BOOST', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#00ffff',
      fontStyle: 'bold',
    });
    this.label.setOrigin(0.5, 1);
    this.container.add(this.label);

    // Create timer text
    this.timerText = scene.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.timerText.setOrigin(0.5, 0.5);
    this.container.add(this.timerText);

    // Update loop
    scene.events.on('update', this.update, this);
  }

  private drawBackground(): void {
    this.background.clear();
    this.background.fillStyle(CONFIG.BG_COLOR, 0.9);
    this.background.fillRoundedRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT, CONFIG.BORDER_RADIUS);
  }

  private drawBorder(): void {
    this.border.clear();
    this.border.lineStyle(2, CONFIG.BORDER_COLOR, 1);
    this.border.strokeRoundedRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT, CONFIG.BORDER_RADIUS);
  }

  private drawFill(progress: number): void {
    this.fillBar.clear();
    
    if (progress <= 0) return;

    const fillWidth = Math.max(0, (CONFIG.WIDTH - 4) * progress);
    
    // Gradient effect using multiple rectangles
    const gradient = this.getGradientColor(progress);
    
    this.fillBar.fillStyle(gradient, 1);
    this.fillBar.fillRoundedRect(
      2, 
      2, 
      fillWidth, 
      CONFIG.HEIGHT - 4, 
      CONFIG.BORDER_RADIUS - 2
    );

    // Add shine effect on top
    this.fillBar.fillStyle(0xffffff, 0.3);
    this.fillBar.fillRoundedRect(
      2, 
      2, 
      fillWidth, 
      (CONFIG.HEIGHT - 4) / 3, 
      { tl: CONFIG.BORDER_RADIUS - 2, tr: CONFIG.BORDER_RADIUS - 2, bl: 0, br: 0 }
    );
  }

  private drawGlow(progress: number): void {
    this.glowEffect.clear();
    
    if (progress <= 0) return;

    const fillWidth = (CONFIG.WIDTH - 4) * progress;
    
    // Outer glow
    this.glowEffect.fillStyle(CONFIG.GLOW_COLOR, 0.2);
    this.glowEffect.fillRoundedRect(-4, -4, fillWidth + 8, CONFIG.HEIGHT + 8, CONFIG.BORDER_RADIUS + 2);
  }

  private getGradientColor(progress: number): number {
    // Change color based on remaining time
    if (progress > 0.6) return 0x00ffff; // Cyan - plenty of time
    if (progress > 0.3) return 0xffff00; // Yellow - warning
    return 0xff4444; // Red - almost out!
  }

  /**
   * Activate the booster bar with a duration
   */
  activate(durationMs: number): void {
    this.duration = durationMs;
    this.elapsed = 0;
    this.currentProgress = 1;
    this.targetProgress = 1;
    this.isActive = true;

    // Fade in
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });

    // Start pulse animation
    this.startPulseAnimation();

    // Pop-in effect for icon
    this.scene.tweens.add({
      targets: this.icon,
      scale: { from: 0.08, to: 0.04 },
      duration: 400,
      ease: 'Back.easeOut',
    });
  }

  /**
   * Deactivate and hide the bar
   */
  deactivate(): void {
    this.isActive = false;

    // Stop pulse
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
    }

    // Fade out
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
    });
  }

  private startPulseAnimation(): void {
    // Pulse the glow effect
    this.pulseTween = this.scene.tweens.add({
      targets: this.glowEffect,
      alpha: { from: 0.5, to: 1 },
      duration: CONFIG.PULSE_SPEED,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Pulse the icon
    this.scene.tweens.add({
      targets: this.icon,
      scale: { from: 0.04, to: 0.045 },
      duration: CONFIG.PULSE_SPEED,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private update(_time: number, delta: number): void {
    if (!this.isActive) return;

    // Update elapsed time
    this.elapsed += delta;
    
    // Calculate progress (1 = full, 0 = empty)
    this.targetProgress = Math.max(0, 1 - (this.elapsed / this.duration));
    
    // Smooth progress update
    this.currentProgress += (this.targetProgress - this.currentProgress) * 0.1;

    // Update visuals
    this.drawFill(this.currentProgress);
    this.drawGlow(this.currentProgress);

    // Update timer text
    const remainingSeconds = Math.ceil((this.duration - this.elapsed) / 1000);
    this.timerText.setText(`${Math.max(0, remainingSeconds)}s`);

    // Update label color based on time
    if (this.currentProgress <= 0.3) {
      this.label.setColor('#ff4444');
      this.timerText.setColor('#ff4444');
    } else if (this.currentProgress <= 0.6) {
      this.label.setColor('#ffff00');
      this.timerText.setColor('#ffff00');
    } else {
      this.label.setColor('#00ffff');
      this.timerText.setColor('#ffffff');
    }

    // Check if expired
    if (this.elapsed >= this.duration) {
      this.deactivate();
    }
  }

  /** Check if currently active */
  getIsActive(): boolean {
    return this.isActive;
  }

  /** Destroy the bar */
  destroy(): void {
    this.scene.events.off('update', this.update, this);
    this.container.destroy();
  }
}
