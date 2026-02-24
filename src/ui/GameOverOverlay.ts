/**
 * Game Over Overlay UI
 * ====================
 * Overlay shown when a character's health reaches zero.
 * Shows "YOU WIN" or "YOU LOSE" with restart/quit options.
 * Tech-noir style matching the pause menu design.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

/** Game over overlay configuration - Tech-noir style matching pause menu */
const CONFIG = {
  /** Overlay color and opacity */
  OVERLAY_COLOR: 0x000000,
  OVERLAY_ALPHA: 0.6,
  /** Panel styling */
  PANEL_WIDTH: 480,
  PANEL_HEIGHT: 350,
  PANEL_COLOR: 0x1e293b,
  PANEL_BORDER_COLOR: 0x64748b,
  PANEL_BORDER_WIDTH: 2,
  BORDER_RADIUS: 12,
  /** Button styling */
  BUTTON_WIDTH: 320,
  BUTTON_HEIGHT: 60,
  BUTTON_COLOR: 0x1e293b,
  BUTTON_HOVER_COLOR: 0x0f2a1f,
  BUTTON_SELECTED_COLOR: 0x4ade80, // Green accent
  BUTTON_TEXT_COLOR: '#ffffff',
  BUTTON_SELECTED_TEXT_COLOR: '#4ade80',
  BUTTON_SPACING: 25,
  /** Font */
  FONT_FAMILY: 'Quantico',
};

/** Button data structure */
interface MenuButton {
  bg: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  hitArea: Phaser.GameObjects.Rectangle;
  callback: () => void;
}

export class GameOverOverlay {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private overlay: Phaser.GameObjects.Rectangle;
  private isVisible: boolean = false;

  // Title elements (recreated on show)
  private titleText: Phaser.GameObjects.Text | null = null;
  private subtitleText: Phaser.GameObjects.Text | null = null;

  // Keyboard navigation
  private buttons: MenuButton[] = [];
  private selectedIndex: number = 0;

  // Input keys
  private upKey: Phaser.Input.Keyboard.Key | null = null;
  private downKey: Phaser.Input.Keyboard.Key | null = null;
  private wKey: Phaser.Input.Keyboard.Key | null = null;
  private sKey: Phaser.Input.Keyboard.Key | null = null;
  private enterKey: Phaser.Input.Keyboard.Key | null = null;
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create overlay (full screen darkening)
    this.overlay = scene.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      CONFIG.OVERLAY_COLOR,
      CONFIG.OVERLAY_ALPHA
    );
    this.overlay.setScrollFactor(0);
    this.overlay.setDepth(2000);
    this.overlay.setVisible(false);
    this.overlay.setInteractive(); // Block clicks to game below

    // Create container for menu elements
    this.container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.container.setScrollFactor(0);
    this.container.setDepth(2001);
    this.container.setVisible(false);

    this.createPanel();
    this.createButtons();
    this.setupInput();
  }

  private createPanel(): void {
    // Panel background
    const panel = this.scene.add.graphics();

    const x = -CONFIG.PANEL_WIDTH / 2;
    const y = -CONFIG.PANEL_HEIGHT / 2;
    const width = CONFIG.PANEL_WIDTH;
    const height = CONFIG.PANEL_HEIGHT;

    // Shadow
    panel.fillStyle(0x000000, 0.4);
    panel.fillRoundedRect(x + 6, y + 6, width, height, CONFIG.BORDER_RADIUS);

    // Main panel fill
    panel.fillStyle(CONFIG.PANEL_COLOR, 0.92);
    panel.fillRoundedRect(x, y, width, height, CONFIG.BORDER_RADIUS);

    // Subtle border
    panel.lineStyle(CONFIG.PANEL_BORDER_WIDTH, CONFIG.PANEL_BORDER_COLOR, 0.6);
    panel.strokeRoundedRect(x, y, width, height, CONFIG.BORDER_RADIUS);

    // Tech corner decorations
    const cornerSize = 20;
    const cornerOffset = 6;
    panel.lineStyle(2, CONFIG.BUTTON_SELECTED_COLOR, 0.7);

    // Top-left corner
    panel.beginPath();
    panel.moveTo(x - cornerOffset, y + cornerSize);
    panel.lineTo(x - cornerOffset, y - cornerOffset);
    panel.lineTo(x + cornerSize, y - cornerOffset);
    panel.strokePath();

    // Top-right corner
    panel.beginPath();
    panel.moveTo(x + width - cornerSize, y - cornerOffset);
    panel.lineTo(x + width + cornerOffset, y - cornerOffset);
    panel.lineTo(x + width + cornerOffset, y + cornerSize);
    panel.strokePath();

    // Bottom-left corner
    panel.beginPath();
    panel.moveTo(x - cornerOffset, y + height - cornerSize);
    panel.lineTo(x - cornerOffset, y + height + cornerOffset);
    panel.lineTo(x + cornerSize, y + height + cornerOffset);
    panel.strokePath();

    // Bottom-right corner
    panel.beginPath();
    panel.moveTo(x + width - cornerSize, y + height + cornerOffset);
    panel.lineTo(x + width + cornerOffset, y + height + cornerOffset);
    panel.lineTo(x + width + cornerOffset, y + height - cornerSize);
    panel.strokePath();

    // Subtle inner highlight at top
    panel.lineStyle(1, 0x94a3b8, 0.2);
    panel.lineBetween(x + 30, y + 3, x + width - 30, y + 3);

    this.container.add(panel);
  }

  private createButtons(): void {
    const buttonY = 10;

    // Restart button
    this.createButton(0, buttonY, 'RESTART', () => this.restart());

    // Quit button
    this.createButton(0, buttonY + CONFIG.BUTTON_HEIGHT + CONFIG.BUTTON_SPACING, 'QUIT TO MENU', () => this.quit());

    // Navigation hint
    const hint = this.scene.add.text(0, CONFIG.PANEL_HEIGHT / 2 - 30, '↑↓ Navigate  •  ENTER Select', {
      fontFamily: CONFIG.FONT_FAMILY,
      fontSize: '12px',
      color: '#64748b',
    });
    hint.setOrigin(0.5);
    this.container.add(hint);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const index = this.buttons.length;

    // Button background
    const bg = this.scene.add.graphics();
    this.drawButton(bg, CONFIG.BUTTON_COLOR, false);
    bg.setPosition(x, y);
    this.container.add(bg);

    // Button text
    const buttonText = this.scene.add.text(x, y, text, {
      fontFamily: CONFIG.FONT_FAMILY,
      fontSize: '24px',
      color: CONFIG.BUTTON_TEXT_COLOR,
      stroke: '#000000',
      strokeThickness: 3,
    });
    buttonText.setOrigin(0.5);
    this.container.add(buttonText);

    // Interactive zone
    const hitArea = this.scene.add.rectangle(
      x,
      y,
      CONFIG.BUTTON_WIDTH,
      CONFIG.BUTTON_HEIGHT,
      0xffffff,
      0
    );
    hitArea.setInteractive({ useHandCursor: true });
    this.container.add(hitArea);

    // Store button reference
    const button: MenuButton = { bg, text: buttonText, hitArea, callback };
    this.buttons.push(button);

    // Mouse hover - select this button
    hitArea.on('pointerover', () => {
      this.selectButton(index);
    });

    hitArea.on('pointerdown', () => {
      buttonText.setScale(0.95);
    });

    hitArea.on('pointerup', () => {
      buttonText.setScale(1.05);
      callback();
    });
  }

  private drawButton(graphics: Phaser.GameObjects.Graphics, color: number, selected: boolean = false): void {
    graphics.clear();

    const x = -CONFIG.BUTTON_WIDTH / 2;
    const y = -CONFIG.BUTTON_HEIGHT / 2;
    const width = CONFIG.BUTTON_WIDTH;
    const height = CONFIG.BUTTON_HEIGHT;

    // Draw glow effect for selected button
    if (selected) {
      for (let i = 5; i > 0; i--) {
        graphics.lineStyle(i * 2.5, CONFIG.BUTTON_SELECTED_COLOR, 0.08);
        graphics.strokeRoundedRect(x - i * 2, y - i * 2, width + i * 4, height + i * 4, 8);
      }
    }

    // Button fill
    graphics.fillStyle(color, 0.9);
    graphics.fillRoundedRect(x, y, width, height, 8);

    // Button border
    const borderColor = selected ? 0xe0f2e9 : 0x64748b;
    graphics.lineStyle(selected ? 3 : 2, borderColor, 1);
    graphics.strokeRoundedRect(x, y, width, height, 8);

    // Tech corner decorations
    const cornerSize = 12;
    const cornerOffset = 4;
    graphics.lineStyle(2, borderColor, selected ? 1 : 0.6);

    // Top-left corner
    graphics.beginPath();
    graphics.moveTo(x - cornerOffset, y + cornerSize);
    graphics.lineTo(x - cornerOffset, y - cornerOffset);
    graphics.lineTo(x + cornerSize, y - cornerOffset);
    graphics.strokePath();

    // Top-right corner
    graphics.beginPath();
    graphics.moveTo(x + width - cornerSize, y - cornerOffset);
    graphics.lineTo(x + width + cornerOffset, y - cornerOffset);
    graphics.lineTo(x + width + cornerOffset, y + cornerSize);
    graphics.strokePath();

    // Bottom-left corner
    graphics.beginPath();
    graphics.moveTo(x - cornerOffset, y + height - cornerSize);
    graphics.lineTo(x - cornerOffset, y + height + cornerOffset);
    graphics.lineTo(x + cornerSize, y + height + cornerOffset);
    graphics.strokePath();

    // Bottom-right corner
    graphics.beginPath();
    graphics.moveTo(x + width - cornerSize, y + height + cornerOffset);
    graphics.lineTo(x + width + cornerOffset, y + height + cornerOffset);
    graphics.lineTo(x + width + cornerOffset, y + height - cornerSize);
    graphics.strokePath();

    // Left accent line for selected button
    if (selected) {
      graphics.lineStyle(4, CONFIG.BUTTON_SELECTED_COLOR, 0.9);
      graphics.beginPath();
      graphics.moveTo(x, y + 12);
      graphics.lineTo(x, y + height - 12);
      graphics.strokePath();
    }
  }

  private selectButton(index: number): void {
    // Clamp index
    if (index < 0) index = this.buttons.length - 1;
    if (index >= this.buttons.length) index = 0;

    // Update selection
    const prevIndex = this.selectedIndex;
    this.selectedIndex = index;

    // Update previous button (deselect)
    if (prevIndex !== index && this.buttons[prevIndex]) {
      const prevButton = this.buttons[prevIndex];
      this.drawButton(prevButton.bg, CONFIG.BUTTON_COLOR, false);
      prevButton.text.setColor(CONFIG.BUTTON_TEXT_COLOR);
      prevButton.text.setScale(1);
    }

    // Update current button (select)
    const button = this.buttons[index];
    this.drawButton(button.bg, CONFIG.BUTTON_HOVER_COLOR, true);
    button.text.setColor(CONFIG.BUTTON_SELECTED_TEXT_COLOR);
    button.text.setScale(1.05);
    this.scene.sound.play('power-up-sfx', { volume: 0.2 });
  }

  private confirmSelection(): void {
    const button = this.buttons[this.selectedIndex];
    if (button) {
      // Visual feedback
      button.text.setScale(0.95);
      this.scene.time.delayedCall(100, () => {
        button.text.setScale(1.05);
        button.callback();
      });
    }
  }

  private setupInput(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return;

    // Navigation keys
    this.upKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.wKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // Selection keys
    this.enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Up navigation
    this.upKey.on('down', () => {
      if (this.isVisible) this.selectButton(this.selectedIndex - 1);
    });
    this.wKey.on('down', () => {
      if (this.isVisible) this.selectButton(this.selectedIndex - 1);
    });

    // Down navigation
    this.downKey.on('down', () => {
      if (this.isVisible) this.selectButton(this.selectedIndex + 1);
    });
    this.sKey.on('down', () => {
      if (this.isVisible) this.selectButton(this.selectedIndex + 1);
    });

    // Confirm selection
    this.enterKey.on('down', () => {
      if (this.isVisible) this.confirmSelection();
    });
    this.spaceKey.on('down', () => {
      if (this.isVisible) this.confirmSelection();
    });
  }

  /** Show the game over overlay */
  show(winner: 'player' | 'enemy'): void {
    if (this.isVisible) return;
    this.isVisible = true;

    // Pause physics
    this.scene.physics.pause();

    // Reset selection to first button
    this.selectedIndex = 0;
    this.buttons.forEach((button, index) => {
      const isSelected = index === 0;
      this.drawButton(button.bg, isSelected ? CONFIG.BUTTON_HOVER_COLOR : CONFIG.BUTTON_COLOR, isSelected);
      button.text.setColor(isSelected ? CONFIG.BUTTON_SELECTED_TEXT_COLOR : CONFIG.BUTTON_TEXT_COLOR);
      button.text.setScale(isSelected ? 1.05 : 1);
    });

    // Remove old title/subtitle if exists
    if (this.titleText) {
      this.container.remove(this.titleText);
      this.titleText.destroy();
      this.titleText = null;
    }
    if (this.subtitleText) {
      this.container.remove(this.subtitleText);
      this.subtitleText.destroy();
      this.subtitleText = null;
    }

    // Create title text based on winner
    const titleContent = winner === 'player' ? 'VICTORY' : 'DEFEAT';
    const titleColor = winner === 'player' ? '#4ade80' : '#f87171';

    this.titleText = this.scene.add.text(0, -CONFIG.PANEL_HEIGHT / 2 + 60, titleContent, {
      fontFamily: CONFIG.FONT_FAMILY,
      fontSize: '48px',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.titleText.setOrigin(0.5);
    this.container.add(this.titleText);

    // Subtitle
    const subtitleContent = winner === 'player' ? 'Enemy defeated!' : 'Better luck next time';
    this.subtitleText = this.scene.add.text(0, -CONFIG.PANEL_HEIGHT / 2 + 110, subtitleContent, {
      fontFamily: CONFIG.FONT_FAMILY,
      fontSize: '18px',
      color: '#94a3b8',
    });
    this.subtitleText.setOrigin(0.5);
    this.container.add(this.subtitleText);

    // Show elements
    this.overlay.setVisible(true);
    this.container.setVisible(true);

    // Fade in animation
    this.overlay.setAlpha(0);
    this.container.setScale(0.8);
    this.container.setAlpha(0);

    this.scene.tweens.add({
      targets: this.overlay,
      alpha: CONFIG.OVERLAY_ALPHA,
      duration: 200,
      ease: 'Power2',
    });

    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  /** Hide the overlay */
  hide(): void {
    if (!this.isVisible) return;
    this.isVisible = false;

    // Animate out
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
    });

    this.scene.tweens.add({
      targets: this.container,
      scale: 0.8,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.overlay.setVisible(false);
        this.container.setVisible(false);
      },
    });
  }

  /** Restart the game */
  private restart(): void {
    this.isVisible = false;
    this.scene.physics.resume();
    this.scene.cameras.main.fadeOut(300, 0, 0, 0);
    this.scene.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.scene.start('Game');
    });
  }

  /** Quit to main menu */
  private quit(): void {
    this.isVisible = false;
    this.scene.physics.resume();
    this.scene.cameras.main.fadeOut(500, 0, 0, 0);
    this.scene.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.scene.start('Versus');
    });
  }

  /** Check if overlay is currently visible */
  getIsVisible(): boolean {
    return this.isVisible;
  }

  /** Destroy the overlay */
  destroy(): void {
    this.upKey?.destroy();
    this.downKey?.destroy();
    this.wKey?.destroy();
    this.sKey?.destroy();
    this.enterKey?.destroy();
    this.spaceKey?.destroy();
    this.overlay.destroy();
    this.container.destroy();
  }
}
