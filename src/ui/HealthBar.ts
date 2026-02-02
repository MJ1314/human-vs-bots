/**
 * Health Bar UI
 * ==============
 * A floating health bar that follows a character and displays their HP.
 * Red theme matching BoosterBar aesthetic.
 */

import Phaser from 'phaser';

/** Health bar configuration */
const CONFIG = {
  /** Bar dimensions */
  WIDTH: 120,
  HEIGHT: 16,
  /** Padding above character head (added to calculated position) */
  PADDING_ABOVE_HEAD: 20,
  /** Colors */
  BG_COLOR: 0x1a1a2e,
  FILL_COLOR: 0xff4444,
  BORDER_COLOR: 0x4a4a6a,
  GLOW_COLOR: 0xff4444,
  /** Animation */
  PULSE_SPEED: 600,
  /** Corner radius */
  BORDER_RADIUS: 8,
};

export class HealthBar {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private fillBar: Phaser.GameObjects.Graphics;
  private border: Phaser.GameObjects.Graphics;
  private glowEffect: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private hpText: Phaser.GameObjects.Text;

  private targetSprite: Phaser.Physics.Arcade.Sprite;
  private currentProgress: number = 1;
  private targetProgress: number = 1;
  private maxHealth: number;
  private currentHealth: number;
  private characterName: string;
  private headOffset: number;

  constructor(
    scene: Phaser.Scene,
    targetSprite: Phaser.Physics.Arcade.Sprite,
    maxHealth: number,
    characterName: string,
    headOffset: number = 0
  ) {
    this.scene = scene;
    this.targetSprite = targetSprite;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.characterName = characterName;
    this.headOffset = headOffset;

    // Create container for all bar elements
    this.container = scene.add.container(0, 0);
    this.container.setDepth(1000); // Above most game elements

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

    // Create label (character name)
    this.label = scene.add.text(CONFIG.WIDTH / 2, -20, characterName, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.label.setOrigin(0.5, 1);
    this.container.add(this.label);

    // Create HP text
    this.hpText = scene.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.hpText.setOrigin(0.5, 0.5);
    this.container.add(this.hpText);

    // Initial draw
    this.updateHealth(maxHealth);

    // Update loop to follow character
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

    // Red fill
    this.fillBar.fillStyle(CONFIG.FILL_COLOR, 1);
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

  /**
   * Update health value and redraw bar
   */
  updateHealth(newHealth: number): void {
    this.currentHealth = Math.max(0, Math.min(newHealth, this.maxHealth));
    this.targetProgress = this.currentHealth / this.maxHealth;

    // Update HP text
    this.hpText.setText(`${Math.ceil(this.currentHealth)} / ${this.maxHealth}`);

    // Color change based on health percentage
    if (this.targetProgress <= 0.3) {
      this.hpText.setColor('#ff4444');
      this.label.setColor('#ff4444');
    } else if (this.targetProgress <= 0.6) {
      this.hpText.setColor('#ffaa44');
      this.label.setColor('#ffaa44');
    } else {
      this.hpText.setColor('#ffffff');
      this.label.setColor('#ffffff');
    }
  }

  /**
   * Update loop - follows character and smooths progress bar
   */
  private update(_time: number, delta: number): void {
    // Follow character position - centered horizontally, above head vertically
    // Since sprites have origin at feet (0.5, 1), top of frame is at y - displayHeight
    // headOffset accounts for empty space at the top of the sprite frame
    const topOfFrame = this.targetSprite.y - this.targetSprite.displayHeight;
    const topOfHead = topOfFrame + this.headOffset;
    this.container.setPosition(
      this.targetSprite.x - CONFIG.WIDTH / 2,  // Center the bar horizontally
      topOfHead - CONFIG.PADDING_ABOVE_HEAD
    );

    // Smooth progress update
    this.currentProgress += (this.targetProgress - this.currentProgress) * 0.15;

    // Update visuals
    this.drawFill(this.currentProgress);
    this.drawGlow(this.currentProgress);
  }

  /** Get current health */
  getCurrentHealth(): number {
    return this.currentHealth;
  }

  /** Get max health */
  getMaxHealth(): number {
    return this.maxHealth;
  }

  /** Destroy the health bar */
  destroy(): void {
    this.scene.events.off('update', this.update, this);
    this.container.destroy();
  }
}
