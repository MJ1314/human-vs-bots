/**
 * Preload Scene
 * ==============
 * Loads all game assets with a progress bar.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

// Import assets using Vite's asset handling (returns resolved URLs)
import juanIdleUrl from '../assets/juan/animations/juan_gorilla_idle.png';
import juanRunUrl from '../assets/juan/animations/juan_gorilla_running.png';
import juanJumpUrl from '../assets/juan/animations/juan_gorilla_jumping.png';
import juanPunchUrl from '../assets/juan/animations/juan_gorilla_punch.png';
import juanUppercutUrl from '../assets/juan/animations/juan_gorilla_uppercut.png';
import juanAerialPunchUrl from '../assets/juan/animations/juan_gorilla_aerial_punch.png';
import juanGettingPunchedUrl from '../assets/juan/animations/juan_gorilla_getting_punched.png';
import juanGettingPunchedStomachUrl from '../assets/juan/animations/juan_getting_punched_stomach.png';
import juanDodgeUrl from '../assets/juan/animations/juan_dodge_punch_animation.png';
import juanMatrixDodgeUrl from '../assets/juan/animations/juan_matrix_style_dodge.png';
import juanKipupUrl from '../assets/juan/animations/juan_kipup_animation.png';

// Audio
import punchSfxUrl from '../assets/audio/punch.mp3';
import kickSfxUrl from '../assets/audio/kick.mp3';
import powerUpSfxUrl from '../assets/audio/power-up.wav';
import menuMusicUrl from '../assets/audio/menu_music.mp3';

// Backgrounds
import serverLabBgUrl from '../assets/backgrounds/server_lab.png';
import overgrownCityBgUrl from '../assets/backgrounds/overgrown_city.png';
import overgrownCitySunsetBgUrl from '../assets/backgrounds/overgrown_city_sunset.png';
import versusBgUrl from '../assets/backgrounds/versus.png';

// Menu assets
import juanMenuUrl from '../assets/juan_sidekick_main_menu.png';

// Props - Platforms
import serverLabFloorUrl from '../assets/props/platforms/server_lab_floor.png';
import overgrownGroundFloorUrl from '../assets/props/platforms/overgrown_ground_floor.png';
import overgrownFloatingPlatformUrl from '../assets/props/platforms/overgrown_floating_platform_350.png';
import floatingScaffoldingUrl from '../assets/props/platforms/floating_scaffolding.png';

// Props - Powerups
import powerBoosterUrl from '../assets/props/powerups/power-booster.png';

// Enemy sprites
import enemyIdleUrl from '../assets/enemy_human/enemy_blockhead_idle.png';
import enemyRunningUrl from '../assets/enemy_human/enemy_blockhead_running.png';
import enemyPunchUrl from '../assets/enemy_human/enemy_blockhead_punch.png';
import enemySidekickUrl from '../assets/enemy_human/enemy_blockhead_sidekick.png';
import enemyGettingPunchedUrl from '../assets/enemy_human/enemy_blockhead_getting_punched.png';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preload' });
  }

  preload(): void {
    this.createLoadingBar();

    // Load Juan's sprite sheets (using Vite-imported URLs)
    // All sprites now use standardized 200x400 frame size

    // idle: 1200x1200, 6 columns x 3 rows, 6 frames used (row 1)
    this.load.spritesheet('juan-idle', juanIdleUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // running: 1200x1200, 6 columns x 3 rows, 12 frames used (rows 1-2)
    this.load.spritesheet('running-animation', juanRunUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // jumping: 1200x400, 6 columns x 1 row, 6 frames
    this.load.spritesheet('juan-jump', juanJumpUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // punch: 6 standard frames (guard, wind-up, jab, impact, retract, recovery)
    this.load.spritesheet('juan-punch', juanPunchUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // uppercut: 5 frames
    this.load.spritesheet('juan-uppercut', juanUppercutUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // aerial punch: 4 frames horizontal strip
    this.load.spritesheet('juan-aerial-punch', juanAerialPunchUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // getting punched: 5 frames horizontal strip (hurt/damage reaction)
    this.load.spritesheet('juan-getting-punched', juanGettingPunchedUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // getting punched stomach: 4 frames horizontal strip (gut punch reaction)
    this.load.spritesheet('juan-getting-punched-stomach', juanGettingPunchedStomachUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // dodge: 4 frames horizontal strip (evasion animation)
    this.load.spritesheet('juan-dodge', juanDodgeUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // matrix dodge: 12 frame slots (0-11), frames 4-11 are 4 wide frames (400px each)
    // Layout: frames 0-3 (200px each) | frames 4&5 (400px) on row 1
    //         frames 6&7 (400px) | frames 8&9 (400px) | frames 10&11 (400px) on row 2
    this.load.spritesheet('juan-matrix-dodge', juanMatrixDodgeUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // kipup dodge: 1200x800 image, 6 columns x 2 rows, ~10 frames used
    // Acrobatic dodge where Juan kicks up from the ground
    this.load.spritesheet('juan-kipup', juanKipupUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });

    // Load audio
    this.load.audio('punch-sfx', punchSfxUrl);
    this.load.audio('kick-sfx', kickSfxUrl);
    this.load.audio('power-up-sfx', powerUpSfxUrl);
    this.load.audio('menu-music', menuMusicUrl);

    // Load backgrounds
    this.load.image('bg-server-lab', serverLabBgUrl);
    this.load.image('bg-overgrown-city', overgrownCityBgUrl);
    this.load.image('bg-overgrown-city-sunset', overgrownCitySunsetBgUrl);
    this.load.image('versus-bg', versusBgUrl);

    // Load menu assets
    this.load.image('juan-menu', juanMenuUrl);

    // Load props - platforms
    this.load.image('floor-server-lab', serverLabFloorUrl);
    this.load.image('floor-overgrown-city', overgrownGroundFloorUrl);
    this.load.image('floating-platform', overgrownFloatingPlatformUrl);
    this.load.image('floating-scaffolding', floatingScaffoldingUrl);

    // Load props - powerups
    this.load.image('power-booster', powerBoosterUrl);

    // Load enemy sprite sheets
    // enemy_idle: 3 frames in a row
    this.load.spritesheet('enemy-idle', enemyIdleUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // enemy_running: 1200×1200 sheet, 8 frames (6 on top row, 2 on bottom row)
    this.load.spritesheet('enemy-running', enemyRunningUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // enemy_punch: 5 frames in a row (frames 4 and 5 are the same, will be combined)
    this.load.spritesheet('enemy-punch', enemyPunchUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // enemy_sidekick: 4x2 grid (8 slots), last 2 poses are double-width (slots 4+5 and 6+7)
    this.load.spritesheet('enemy-sidekick', enemySidekickUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
    // enemy_getting_punched: 5 frames horizontal strip (hurt/damage reaction)
    this.load.spritesheet('enemy-getting-punched', enemyGettingPunchedUrl, {
      frameWidth: 200,
      frameHeight: 400,
    });
  }

  private createLoadingBar(): void {
    const barWidth = 400;
    const barHeight = 30;
    const barX = (GAME_WIDTH - barWidth) / 2;
    const barY = (GAME_HEIGHT - barHeight) / 2;

    const bgBar = this.add.graphics();
    bgBar.fillStyle(0x333333, 1);
    bgBar.fillRect(barX, barY, barWidth, barHeight);

    const progressBar = this.add.graphics();

    const loadingText = this.add.text(GAME_WIDTH / 2, barY - 30, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5);

    const percentText = this.add.text(GAME_WIDTH / 2, barY + barHeight / 2, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    });
    percentText.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4ade80, 1);
      progressBar.fillRect(barX, barY, barWidth * value, barHeight);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      bgBar.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }

  create(): void {
    console.log('[PreloadScene] All assets loaded!');

    // Generate particle texture for menu effects
    const particleGfx = this.add.graphics();
    particleGfx.fillStyle(0xffffff, 1);
    particleGfx.fillCircle(4, 4, 4);
    particleGfx.generateTexture('particle', 8, 8);
    particleGfx.destroy();

    // Set LINEAR filter for juan-menu
    this.textures.get('juan-menu').setFilter(Phaser.Textures.FilterMode.LINEAR);

    // Set LINEAR filtering for smooth scaling of detailed artwork
    this.textures.get('juan-idle').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('running-animation').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('juan-jump').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('juan-punch').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('juan-uppercut').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('juan-aerial-punch').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('juan-getting-punched').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('juan-getting-punched-stomach').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('juan-dodge').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('juan-matrix-dodge').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('juan-kipup').setFilter(Phaser.Textures.FilterMode.LINEAR);

    // Enemy textures
    this.textures.get('enemy-idle').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('enemy-running').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('enemy-punch').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('enemy-sidekick').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('enemy-getting-punched').setFilter(Phaser.Textures.FilterMode.LINEAR);

    // Add custom wide frame for enemy punch (frames 3+4 combined = 400px wide)
    // Frames 3 and 4 are the same, so combine them into a single wide frame
    const enemyPunchTexture = this.textures.get('enemy-punch');
    enemyPunchTexture.add('punch_extend', 0, 600, 0, 400, 400); // frames 3+4: x=600, y=0, width=400, height=400

    // Add custom wide frames for enemy sidekick (slots 4+5 and 6+7 are 400px wide)
    const enemySidekickTexture = this.textures.get('enemy-sidekick');
    enemySidekickTexture.add('kick_extend', 0, 600, 0, 400, 400);   // slots 4+5: x=0, y=400, width=400, height=400
    enemySidekickTexture.add('kick_follow', 0, 0, 400, 400, 400); // slots 6+7: x=400, y=400, width=400, height=400

    // Add custom wide frames for aerial punch (frames 1+2 and 3+4 are 400px wide each)
    // Layout: frame0 (200px) | frames1+2 (400px) | frames3+4 (400px) | frame5 (200px)
    const aerialPunchTexture = this.textures.get('juan-aerial-punch');
    aerialPunchTexture.add('windup', 0, 200, 0, 400, 400);    // frames 1+2: x=200, y=0, width=400
    aerialPunchTexture.add('punch', 0, 600, 0, 400, 400);     // frames 3+4: x=600, y=0, width=400

    // Add custom wide frames for matrix dodge
    // Layout (1200x800): Row 1: frames 0-3 (200px each) + frames 4&5 (400px)
    //                    Row 2: frames 6&7 (400px) + frames 8&9 (400px) + frames 10&11 (400px)
    const matrixDodgeTexture = this.textures.get('juan-matrix-dodge');
    matrixDodgeTexture.add('lean_deep', 0, 600, 0, 400, 400);     // frames 4&5: x=800, y=0, width=400
    matrixDodgeTexture.add('crouch_1', 0, 0, 400, 400, 400);      // frames 6&7: x=0, y=400, width=400

    // Wait for custom fonts to be fully loaded before starting menu
    this.waitForFonts().then(() => {
      this.time.delayedCall(200, () => {
        this.scene.start('Menu');
      });
    });
  }

  private async waitForFonts(): Promise<void> {
    // Preload fonts by creating temporary text elements
    const fontsToLoad = ['Quantico', 'Russo One'];
    
    // Create hidden elements to trigger font loading
    for (const font of fontsToLoad) {
      const testText = document.createElement('span');
      testText.style.fontFamily = font;
      testText.style.position = 'absolute';
      testText.style.visibility = 'hidden';
      testText.textContent = 'Font preload test';
      document.body.appendChild(testText);
      
      // Clean up after a moment
      setTimeout(() => testText.remove(), 100);
    }

    // Wait for all fonts to be ready
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
      console.log('[PreloadScene] Fonts loaded successfully');
    }
  }
}
