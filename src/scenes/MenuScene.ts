/**
 * Menu Scene
 * ===========
 * Main menu screen with title, tech-style buttons, and Juan's animated entrance.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

interface MenuButton {
  frame: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  action: () => void;
  label: string;
  hitArea: Phaser.GameObjects.Rectangle;
}

export class MenuScene extends Phaser.Scene {
  private buttons: MenuButton[] = [];
  private selectedIndex: number = 0;
  private menuMusic?: Phaser.Sound.BaseSound;
  private canNavigate: boolean = true;
  private isMuted: boolean = false;
  private muteButton?: Phaser.GameObjects.Text;
  private juanSprite?: Phaser.GameObjects.Image;
  private swooshGraphics?: Phaser.GameObjects.Graphics;
  private buttonParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private buttonContainer?: Phaser.GameObjects.Graphics;
  private buttonGroup?: Phaser.GameObjects.Container;

  // Button styling constants
  private readonly BUTTON_WIDTH = 350;
  private readonly BUTTON_HEIGHT = 80;
  private readonly BUTTON_X = GAME_WIDTH - 550; // Position buttons on the right side
  private readonly BUTTON_Y_START = 250;
  private readonly BUTTON_SPACING = 125;
  private readonly JUAN_FINAL_X = 400;

  private readonly TITLE_FONT_SIZE = '90px';
  private readonly TITLE_FONT_FAMILY = 'Quantico';
  private readonly TITLE_NAME = 'HUMANS VS BOTS';

  constructor() {
    super({ key: 'Menu' });
  }

  create(): void {
    console.log('[MenuScene] Showing main menu');

    // Reset state
    this.buttons = [];
    this.selectedIndex = 0;

    // Load mute state from registry (persists across scenes)
    this.isMuted = this.registry.get('musicMuted') || false;

    // Create background with dim overlay
    this.createBackground();

    // Create floating particles
    this.createParticles();

    // Start background music (loop if not already playing)
    this.startMenuMusic();

    // Create title
    this.createTitle();

    // Create buttons (left side)
    this.createButtons();

    // Create particles for selected button
    this.createButtonParticles();

    // Create red selection overlay button
    // this.createSelectionOverlay();

    // Create Juan sprite with swoosh and entrance animation (right side)
    this.createJuanEntrance();

    // Create mute button
    this.createMuteButton();

    // Set up keyboard navigation
    this.setupKeyboardNavigation();

    // Initial selection highlight
    this.updateSelection();
  }

  private createBackground(): void {
    // Add background image
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-server-lab');
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setDepth(-100);

    // Add blur effect to background
    bg.preFX?.addBlur(0, 3, 3, 0.3);

    // Add lighter dim overlay to keep neon colors more visible
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.35);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setDepth(-99);

    // Add subtle vignette (darker edges) - reduced intensity
    const vignette = this.add.graphics();
    for (let i = 0; i < 40; i++) {
      const alpha = (i / 50) * 0.3;
      const size = Math.max(GAME_WIDTH, GAME_HEIGHT) * (0.65 + i / 100);
      vignette.lineStyle(15, 0x000000, alpha);
      vignette.strokeRect(
        (GAME_WIDTH - size) / 2,
        (GAME_HEIGHT - size) / 2,
        size,
        size
      );
    }
    vignette.setDepth(-98);
  }

  private createParticles(): void {
    // Add floating particle effect with glow
    const particles = this.add.particles(0, 0, 'particle', {
      x: { min: this.JUAN_FINAL_X - 250, max: this.JUAN_FINAL_X + 250 },
      y: { min: GAME_HEIGHT / 3, max: GAME_HEIGHT + 50 },
      speedY: { min: -30, max: -60 },
      speedX: { min: -10, max: 10 },
      lifespan: 6000,
      quantity: 1,
      frequency: 150,
      alpha: { start: 0.4, end: 0 }, // Brighter alpha
      scale: { start: 0.7, end: 0.2 }, // Slightly larger for more presence
      tint: [0xbbf7d0, 0xbae6fd], // Very light green and very light skyblue
      blendMode: Phaser.BlendModes.ADD, // Additive blend for glow effect
    });
    particles.setDepth(-50);

    // Add glow post-processing effect to the particles
    particles.postFX?.addGlow(0xffffff, 4, 0, false, 0.5, 16);
  }

  private createTitle(): void {
    // Main title with white text and black outline
    const title = this.add.text(GAME_WIDTH / 2, 70, this.TITLE_NAME, {
      fontFamily: this.TITLE_FONT_FAMILY,
      fontSize: this.TITLE_FONT_SIZE,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
      shadow: {
        offsetX: 2,
        offsetY: 6,
        color: '#000000',
        blur: 1,
        stroke: true,
        fill: true,
      },
    });
    title.setOrigin(0.5);
    title.setDepth(10);

    // Add postFX glow effect to the title
    title.postFX?.addGlow(0x4ade80, 3, 0, false, 0.4, 16);
  }

  private createButtons(): void {
    // Create a container for all button elements to animate together
    this.buttonGroup = this.add.container(0, 0);
    this.buttonGroup.setDepth(8);

    // Draw subtle container frame around all buttons (add to group)
    this.drawButtonContainer();

    const buttonLabels = ['FIGHT', 'STORY', 'CREDITS'];

    buttonLabels.forEach((label, index) => {
      const y = this.BUTTON_Y_START + index * this.BUTTON_SPACING;
      const centerX = this.BUTTON_X + this.BUTTON_WIDTH / 2;
      const centerY = y;

      // Create frame graphics
      const frame = this.add.graphics();
      frame.setDepth(9);

      // Create button text
      const buttonText = this.add.text(centerX, centerY, label, {
        fontFamily: 'Quantico',
        fontSize: '60px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
      });
      buttonText.setOrigin(0.5);
      buttonText.setDepth(11);
      

      // Create invisible hit area for mouse interaction
      const hitArea = this.add.rectangle(
        centerX,
        centerY,
        this.BUTTON_WIDTH,
        this.BUTTON_HEIGHT,
        0x000000,
        0
      );
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.setDepth(12);

      // Define action for each button
      let action: () => void;
      if (label === 'FIGHT') {
        action = () => this.startGame();
      } else if (label === 'STORY') {
        action = () => this.scene.start('Story');
      } else {
        action = () => this.scene.start('Credits');
      }
      buttonText.setScale(1, 1);
      // Mouse hover
      hitArea.on('pointerover', () => {
        if (this.selectedIndex !== index) {
          this.selectedIndex = index;
          this.updateSelection();
          this.playSound('power-up-sfx', 0.4);
        }
      });

      // Mouse click
      hitArea.on('pointerdown', () => {
        this.playSound('punch-sfx', 0.5);
        action();
      });

      this.buttons.push({ frame, text: buttonText, action, label, hitArea });
    });

    // Animate buttons sliding in from the right
    this.animateButtonsEntrance();
  }

  private animateButtonsEntrance(): void {
    // Slide offset for entrance animation
    const slideOffset = 400;

    // Move all button elements to start position (off-screen right)
    this.buttons.forEach((button) => {
      button.frame.x += slideOffset;
      button.text.x += slideOffset;
      button.hitArea.x += slideOffset;
    });

    if (this.buttonContainer) {
      this.buttonContainer.x += slideOffset;
    }

    // Animate each button with staggered delay
    this.buttons.forEach((button, index) => {
      const delay = index * 100; // Stagger each button

      this.tweens.add({
        targets: [button.frame, button.text, button.hitArea],
        x: `-=${slideOffset}`,
        duration: 600,
        delay: delay,
        ease: 'Back.easeOut',
        easeParams: [1.2],
      });
    });

    // Animate the container box
    if (this.buttonContainer) {
      this.tweens.add({
        targets: this.buttonContainer,
        x: `-=${slideOffset}`,
        duration: 700,
        ease: 'Back.easeOut',
        easeParams: [1.2],
      });
    }
  }

  private drawButtonContainer(): void {
    this.buttonContainer = this.add.graphics();
    this.buttonContainer.setDepth(7); // Behind buttons
    const container = this.buttonContainer;

    // Calculate container bounds (surrounds all 3 buttons with padding)
    const padding = 50;
    const padding_y = 30
    const x = this.BUTTON_X - padding;
    const y = this.BUTTON_Y_START - this.BUTTON_HEIGHT / 2 - padding_y;
    const width = this.BUTTON_WIDTH + padding * 2;
    const height = this.BUTTON_SPACING * 2 + this.BUTTON_HEIGHT + padding_y * 2;

    const borderColor = 0xffffff; // Subtle gray-blue
    const cornerColor = 0xffffff; // Slightly lighter for corners

    // Draw very subtle main border
    container.lineStyle(1, borderColor, 0.3);
    container.strokeRoundedRect(x, y, width, height, 10);

    // Draw tech corner decorations (more prominent)
    const cornerSize = 25;
    const cornerOffset = 8;
    container.lineStyle(2, cornerColor, 0.5);

    // // Top-left corner
    // container.beginPath();
    // container.moveTo(x - cornerOffset, y + cornerSize);
    // container.lineTo(x - cornerOffset, y - cornerOffset);
    // container.lineTo(x + cornerSize, y - cornerOffset);
    // container.strokePath();

    // Top-right corner
    container.beginPath();
    container.moveTo(x + width - cornerSize, y - cornerOffset);
    container.lineTo(x + width + cornerOffset, y - cornerOffset);
    container.lineTo(x + width + cornerOffset, y + cornerSize);
    container.strokePath();

    // Bottom-left corner
    container.beginPath();
    container.moveTo(x - cornerOffset, y + height - cornerSize);
    container.lineTo(x - cornerOffset, y + height + cornerOffset);
    container.lineTo(x + cornerSize, y + height + cornerOffset);
    container.strokePath();

    // // Bottom-right corner
    // container.beginPath();
    // container.moveTo(x + width - cornerSize, y + height + cornerOffset);
    // container.lineTo(x + width + cornerOffset, y + height + cornerOffset);
    // container.lineTo(x + width + cornerOffset, y + height - cornerSize);
    // container.strokePath();

    // Add subtle inner glow line at top
    container.lineStyle(1, 0x94a3b8, 0.15);
    container.beginPath();
    container.moveTo(x + 20, y + 2);
    container.lineTo(x + width - 20, y + 2);
    container.strokePath();
  }

  private createButtonParticles(): void {
    // Get initial button position
    const y = this.BUTTON_Y_START;
    const centerX = this.BUTTON_X + this.BUTTON_WIDTH / 2;

    // Create particle emitter that orbits around the selected button
    this.buttonParticles = this.add.particles(centerX, y, 'particle', {
      speed: { min: 20, max: 40 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0.2 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1500,
      frequency: 80,
      quantity: 1,
      tint: [0xbbf7d0, 0xbae6fd, 0x4ade80], // Light green, light blue, green
      blendMode: Phaser.BlendModes.ADD,
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Rectangle(
          -this.BUTTON_WIDTH / 2 - 10,
          -this.BUTTON_HEIGHT / 2 - 10,
          this.BUTTON_WIDTH + 20,
          this.BUTTON_HEIGHT + 20
        ),
        quantity: 32,
        yoyo: false,
      },
    });
    this.buttonParticles.setDepth(8);

    // Add glow effect to button particles
    this.buttonParticles.postFX?.addGlow(0xffffff, 2, 0, false, 0.3, 8);
  }

  private updateButtonParticles(): void {
    if (!this.buttonParticles) return;

    // Update particle emitter position to follow selected button
    const y = this.BUTTON_Y_START + this.selectedIndex * this.BUTTON_SPACING;
    const centerX = this.BUTTON_X + this.BUTTON_WIDTH / 2;

    this.buttonParticles.setPosition(centerX, y);
  }

  private drawButtonFrame(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    isSelected: boolean
  ): void {
    graphics.clear();

    // Lighter/whiter border colors, green glow stays the same
    const borderColor = isSelected ? 0xe0f2e9 : 0x94a3b8; // Light mint-white when selected, light gray otherwise
    const fillColor =  0x1e293b;
    const fillAlpha = 0.1;
    const borderWidth = isSelected ? 3 : 2;
    const glowColor = 0x4ade80; // Keep the green glow

    // Draw stronger green glow effect for selected button
    if (isSelected) {
      for (let i = 8; i > 0; i--) {
        graphics.lineStyle(i * 2, glowColor, 0.05);
        graphics.setDepth(15);
        graphics.strokeRoundedRect(x - i * 2, y - i * 2, width + i * 4, height + i * 4, 8);
      }
    }

    // Draw fill
    graphics.fillStyle(fillColor, fillAlpha);
    graphics.fillRoundedRect(x, y, width, height, 8);

    // Draw inner highlight line at top (subtle 3D effect)
    if (isSelected) {
      graphics.lineStyle(1, 0xffffff, 0.2);
      graphics.beginPath();
      graphics.moveTo(x + 15, y + 2);
      graphics.lineTo(x + width - 15, y + 2);
      graphics.strokePath();
    }

    // Draw main border (lighter/whiter)
    graphics.lineStyle(borderWidth, borderColor, 1);
    graphics.strokeRoundedRect(x, y, width, height, 8);

    // Draw tech corner decorations (more pronounced, matching border color)
    const cornerSize = 15;
    const cornerOffset = 5;
    graphics.lineStyle(2, borderColor, isSelected ? 1 : 0.7);

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

    // Add small accent line on the left for selected button (keep green)
    if (isSelected) {
      graphics.lineStyle(4, glowColor, 0.9);
      graphics.beginPath();
      graphics.moveTo(x, y + 15);
      graphics.lineTo(x, y + height - 15);
      graphics.strokePath();
    }
  }

  private createJuanEntrance(): void {
    // Create swoosh effect first (behind Juan)
    this.swooshGraphics = this.add.graphics();
    this.swooshGraphics.setDepth(4);
    this.swooshGraphics.setAlpha(0);

    // Juan starts off-screen to the left
    const startX = -300;
    const finalX = this.JUAN_FINAL_X; // Position on the left side
    // Position Juan in the center-left area, vertically centered
    const y = GAME_HEIGHT / 2 + 50;

    // Use the new menu image - centered origin for better positioning
    this.juanSprite = this.add.image(startX, y, 'juan-menu');
    this.juanSprite.setScale(0.55); // Smaller scale to fit fully on screen
    this.juanSprite.setOrigin(0.5, 0.5); // Center origin for easier positioning
    this.juanSprite.setDepth(5);
    this.juanSprite.setAlpha(0);
    // Original sprite already kicks to the right, no flip needed

    // Draw the swoosh effect (positioned to the right of Juan now)
    // this.drawSwoosh(finalX + 80, y - 50);

    // Entrance animation: slide in from left + fade in
    this.tweens.add({
      targets: [this.juanSprite, this.swooshGraphics],
      x: `+=${finalX - startX}`,
      alpha: 1,
      duration: 800,
      ease: 'Back.easeOut',
      easeParams: [1.5],
      onComplete: () => {
        // Subtle floating animation
        this.tweens.add({
          targets: this.juanSprite,
          y: y - 10,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });
  }


  private setupKeyboardNavigation(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;

    // Up/Down navigation
    keyboard.on('keydown-UP', () => {
      if (!this.canNavigate) return;
      this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
      this.updateSelection();
      this.playSound('power-up-sfx', 0.4);
      this.canNavigate = false;
      this.time.delayedCall(150, () => {
        this.canNavigate = true;
      });
    });

    keyboard.on('keydown-DOWN', () => {
      if (!this.canNavigate) return;
      this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
      this.updateSelection();
      this.playSound('power-up-sfx', 0.4);
      this.canNavigate = false;
      this.time.delayedCall(150, () => {
        this.canNavigate = true;
      });
    });

    // Enter to select
    keyboard.on('keydown-ENTER', () => {
      this.playSound('punch-sfx', 0.5);
      this.buttons[this.selectedIndex].action();
    });
  }

  private updateSelection(): void {
    this.buttons.forEach((button, index) => {
      const isSelected = index === this.selectedIndex;
      const y = this.BUTTON_Y_START + index * this.BUTTON_SPACING;

      // Redraw frame with selection state
      this.drawButtonFrame(
        button.frame,
        this.BUTTON_X,
        y - this.BUTTON_HEIGHT / 2,
        this.BUTTON_WIDTH,
        this.BUTTON_HEIGHT,
        isSelected
      );

      // Update text color
      if (isSelected) {
        button.text.setStroke('#4ade80', 6);
      } else {
        // button.text.setColor('#ffffff');
        button.text.setStroke('#000000', 6);
      }
    });

    // Update button particles position
    this.updateButtonParticles();

    // Update red selection overlay
    // this.updateSelectionOverlay();
  }

  private createMuteButton(): void {
    // Position in bottom-right corner
    const muteX = GAME_WIDTH - 100;
    const muteY = GAME_HEIGHT - 40;

    // Set initial text based on mute state
    const buttonText = this.isMuted ? '🔇' : '🔊';

    this.muteButton = this.add.text(muteX, muteY, buttonText, {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.muteButton.setOrigin(0.5);
    this.muteButton.setDepth(20);
    this.muteButton.setInteractive({ useHandCursor: true });

    // Hover effect
    this.muteButton.on('pointerover', () => {
      this.muteButton?.setScale(1.2);
    });

    this.muteButton.on('pointerout', () => {
      this.muteButton?.setScale(1.0);
    });

    // Click to toggle mute
    this.muteButton.on('pointerdown', () => {
      this.toggleMute();
      this.playSound('punch-sfx', 0.3);
    });
  }

  private toggleMute(): void {
    this.isMuted = !this.isMuted;

    // Store mute state in registry for persistence
    this.registry.set('musicMuted', this.isMuted);

    if (this.menuMusic) {
      if (this.isMuted) {
        (this.menuMusic as Phaser.Sound.WebAudioSound).setVolume(0);
        this.muteButton?.setText('🔇');
      } else {
        (this.menuMusic as Phaser.Sound.WebAudioSound).setVolume(0.3);
        this.muteButton?.setText('🔊');
      }
    }
  }

  private startMenuMusic(): void {
    // Check if music is already playing (to avoid stacking on scene restart)
    const existingMusic = this.sound.get('menu-music');
    if (existingMusic && existingMusic.isPlaying) {
      this.menuMusic = existingMusic;
      // Apply mute state from registry
      if (this.isMuted) {
        (this.menuMusic as Phaser.Sound.WebAudioSound).setVolume(0);
      } else {
        (this.menuMusic as Phaser.Sound.WebAudioSound).setVolume(0.3);
      }
      return;
    }

    // Start looping menu music with lower volume
    this.menuMusic = this.sound.add('menu-music', {
      volume: this.isMuted ? 0 : 0.3,
      loop: true,
    });
    this.menuMusic.play();
  }

  private playSound(key: string, volume: number = 0.5): void {
    this.sound.play(key, { volume });
  }

  private startGame(): void {
    console.log('[MenuScene] Starting game...');

    // Fade out music
    if (this.menuMusic && this.menuMusic.isPlaying) {
      this.tweens.add({
        targets: this.menuMusic,
        volume: 0,
        duration: 300,
        onComplete: () => {
          this.menuMusic?.stop();
        },
      });
    }

    // Camera fade out
    this.cameras.main.fadeOut(400, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Versus');
    });
  }
}
