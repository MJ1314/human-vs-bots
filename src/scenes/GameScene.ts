/**
 * Game Scene
 * ===========
 * Main gameplay scene - creates the world, player, and handles game logic.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig.ts';
import { Player } from '../entities/Player.ts';
import { Enemy } from '../entities/Enemy.ts';
import { PowerBooster } from '../entities/PowerBooster.ts';
import { InputManager } from '../systems/InputManager.ts';
import { BoosterBar } from '../ui/BoosterBar.ts';
import { PauseMenu } from '../ui/PauseMenu.ts';
import { HealthBar } from '../ui/HealthBar.ts';
import { GameOverOverlay } from '../ui/GameOverOverlay.ts';
import { EnemyAIController } from '../ai/EnemyAIController.ts';
// import { getEnemyAIAction, GameState, CollisionObject } from '../ai/ai-access.ts';

/** Height of the ground collision floor in pixels */
const GROUND_HEIGHT = 130;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputManager!: InputManager;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private powerBoosters: PowerBooster[] = [];
  private enemies: Enemy[] = [];
  private boosterBar!: BoosterBar;
  private pauseMenu!: PauseMenu;
  private gameOverOverlay!: GameOverOverlay;
  private playerHealthBar!: HealthBar;
  private enemyHealthBars: Map<Enemy, HealthBar> = new Map();
  private gameEnded: boolean = false;
  private debugUpdateHandler: (() => void) | null = null;

  // Traditional AI controllers (FSM-based)
  private enemyAIControllers: EnemyAIController[] = [];

  // LLM AI control system (deprecated - using traditional AI now)
  // private aiUpdateInterval: number = 10; // ms between AI decisions
  // private lastAIUpdate: number = 0;
  // private isAIUpdating: boolean = false; // Prevent overlapping AI calls

  constructor() {
    super({ key: 'Game' });
  }

  private createBackground(): void {
    // Add background image anchored at left edge, vertically centered
    const bg = this.add.image(0, GAME_HEIGHT / 2, 'bg-server-lab');
    bg.setOrigin(0, 0.5);

    // Scale to cover full height while maintaining aspect ratio
    // This makes the width extend beyond GAME_WIDTH
    const scale = GAME_HEIGHT / bg.height;
    bg.setScale(scale);

    // Ensure background is behind all other elements
    bg.setDepth(-100);

    // Add slight blur effect for depth-of-field look
    bg.preFX?.addBlur(0, 2, 2, 0.3);
  }

  create(): void {
    console.log('[GameScene] Creating game world...');
   

    // Reset game state flags (CRITICAL for scene restart)
    this.gameEnded = false;

    // Reset update counter for logging (in case scene instance is reused)
    this.updateCounter = 0;

    this.createBackground();
    console.log('[GameScene] Background created');

    this.inputManager = new InputManager(this);
    console.log('[GameScene] InputManager created');

    this.createPlatforms();
    console.log('[GameScene] Platforms created');

    this.createFloorVisual();
    console.log('[GameScene] Floor visual created');

    this.createPlayer();
    console.log('[GameScene] Player created');

    this.createBoosterBar();
    console.log('[GameScene] BoosterBar created');

    this.createPowerBoosters();
    console.log('[GameScene] PowerBoosters created');

    this.createEnemies();
    console.log('[GameScene] Enemies created');

    // Set up counter-dodge system: provide player with warning checks and timing info
    this.player.setEnemyWarningChecker(
      () => this.isAnyEnemyShowingWarning(),
      () => this.getTimeUntilEnemyAttack()
    );
    console.log('[GameScene] Counter-dodge system linked');

    this.setupCollisions();
    console.log('[GameScene] Collisions set up');

    this.setupCamera();
    console.log('[GameScene] Camera set up');

    this.createDebugInfo();
    console.log('[GameScene] Debug info created');

    this.createPauseMenu();
    console.log('[GameScene] PauseMenu created');

    this.createGameOverOverlay();
    console.log('[GameScene] GameOverOverlay created');

    this.createHealthBars();
    console.log('[GameScene] HealthBars created');

    // Register shutdown handler to clean up event listeners
    this.events.once('shutdown', this.shutdown, this);
  }

  private createPauseMenu(): void {
    // Pass a callback to check if pausing is allowed (not when game is over)
    this.pauseMenu = new PauseMenu(this, () => !this.gameEnded);
  }

  private createGameOverOverlay(): void {
    this.gameOverOverlay = new GameOverOverlay(this);
  }

  private createHealthBars(): void {
    // Head offset accounts for empty space at top of sprite frames (in display pixels)
    // Player: body starts at y=170 in 400px frame, head ~50px above body = 120px empty * 0.65 scale
    // Enemy: similar proportions at 0.8 scale
    const playerHeadOffset = 117;  // Display pixels from top of frame to actual head
    const enemyHeadOffset = 110;   // Display pixels from top of frame to actual head

    // Create health bar for player
    this.playerHealthBar = new HealthBar(
      this,
      this.player.getSprite(),
      this.player.getMaxHealth(),
      'JUAN',
      playerHeadOffset
    );
    this.player.setHealthBar(this.playerHealthBar);

    // Create health bars for enemies
    this.enemies.forEach((enemy) => {
      const enemyHealthBar = new HealthBar(
        this,
        enemy.getSprite(),
        enemy.getMaxHealth(),
        'ENEMY',
        enemyHeadOffset
      );
      enemy.setHealthBar(enemyHealthBar);
      this.enemyHealthBars.set(enemy, enemyHealthBar);
    });
  }

  private createBoosterBar(): void {
    this.boosterBar = new BoosterBar(this);
  }

  private createPlatforms(): void {
    this.ground = this.physics.add.staticGroup();

    // Create ground texture
    const groundGfx = this.add.graphics();
    groundGfx.fillStyle(0x4a5568, 1);
    groundGfx.fillRect(0, 0, GAME_WIDTH, GROUND_HEIGHT);
    groundGfx.generateTexture('ground-texture', GAME_WIDTH, GROUND_HEIGHT);
    groundGfx.destroy();

    // Create platform texture
    const platGfx = this.add.graphics();
    platGfx.fillStyle(0x6b7280, 1);
    platGfx.fillRect(0, 0, 350, 20);
    platGfx.generateTexture('platform-texture', 350, 20);
    platGfx.destroy();


    // Ground - position is center of sprite (y = bottom - half height)
    const ground = this.ground.create(GAME_WIDTH / 2, GAME_HEIGHT - GROUND_HEIGHT / 2, 'ground-texture') as Phaser.Physics.Arcade.Sprite;
    ground.refreshBody();

    // Floating platforms
    this.createPlatform(200, GAME_HEIGHT - 500);
    this.createPlatform(600, GAME_HEIGHT - 325);
    this.createPlatform(1100, GAME_HEIGHT - 450);
  }

  private createPlatform(x: number, y: number): void {
    // Offset to raise collision box relative to visual (positive = collision higher)
    const collisionOffset = 20;

    // Create collision platform at offset position (higher than visual)
    const platform = this.ground.create(x, y - collisionOffset, 'platform-texture') as Phaser.Physics.Arcade.Sprite;
    platform.refreshBody();

    // Add visual scaffolding image at original y position
    const scaffolding = this.add.image(x, y, 'floating-scaffolding');
    // Scale to 2x the platform width (400px visual, 200px collision box)
    const scale = (200 / scaffolding.width) * 2;
    scaffolding.setScale(scale);
    // Anchor from bottom-center so the platform surface aligns with collision
    scaffolding.setOrigin(0.5, 0.95);
    // Depth between background and player
    scaffolding.setDepth(0);
  }

  private createFloorVisual(): void {
    // Add the visual floor image on top of the collision floor
    // Position at bottom of screen, anchor from bottom-left
    const floorImage = this.add.image(0, GAME_HEIGHT, 'floor-server-lab');
    floorImage.setOrigin(0, 1); // Anchor at bottom-left

    // Scale to cover the full game width while maintaining aspect ratio
    const scale = GAME_WIDTH / floorImage.width;
    floorImage.setScale(scale);

    // Set depth between background (-100) and player (10)
    floorImage.setDepth(0);
  }

  private createPowerBoosters(): void {
    // Spawn power boosters at strategic locations
    // On the ground area
    this.powerBoosters.push(new PowerBooster(this, 400, GAME_HEIGHT - GROUND_HEIGHT - 50));

    // Near the floating platforms
    this.powerBoosters.push(new PowerBooster(this, 600, GAME_HEIGHT - 400));

    // On top of a platform
    this.powerBoosters.push(new PowerBooster(this, 1100, GAME_HEIGHT - 530));
  }

  private createEnemies(): void {
    // Spawn an enemy at the right edge of the canvas, facing left (toward player spawn)
    const enemy = new Enemy(this, GAME_WIDTH - 100, GAME_HEIGHT - GROUND_HEIGHT, this.inputManager);
    enemy.getSprite().setDepth(10); // Same depth as player
    this.enemies.push(enemy);

    // Create traditional AI controller for the enemy
    const aiController = new EnemyAIController(enemy, this.player);
    this.enemyAIControllers.push(aiController);
  }

  private createPlayer(): void {
    const startX = 100;
    // Spawn at ground level (ground top is at GAME_HEIGHT - GROUND_HEIGHT)
    // With origin (0.5, 1), this y is where the feet will be
    const startY = GAME_HEIGHT - GROUND_HEIGHT;
    this.player = new Player(this, startX, startY, this.inputManager);

    // Set player depth higher than floor visual
    this.player.getSprite().setDepth(10);
  }

  private setupCollisions(): void {
    // Player collides with ground/platforms
    this.physics.add.collider(this.player.getSprite(), this.ground);

    // Enemies collide with ground/platforms
    this.enemies.forEach((enemy) => {
      this.physics.add.collider(enemy.getSprite(), this.ground);
    });

    // Player overlaps with power boosters (pickup)
    this.powerBoosters.forEach((booster) => {
      this.physics.add.overlap(
        this.player.getSprite(),
        booster.getSprite(),
        () => {
          if (!booster.isAlreadyCollected()) {
            booster.collect(this.player.getSprite(), this.boosterBar);
          }
        },
        undefined,
        this
      );
    });
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player.getSprite(), true, 0.1, 0.1);
  }

  private createDebugInfo(): void {
    console.log('[GameScene] Creating debug info');
    const debugText = this.add.text(10, 10, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 },
    });
    debugText.setScrollFactor(0);
    debugText.setDepth(1000);

    // Store the handler so we can remove it in shutdown()
    this.debugUpdateHandler = () => {
      const sprite = this.player.getSprite();
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      debugText.setText([
        `FPS: ${Math.round(this.game.loop.actualFps)}`,
        `Player: (${Math.round(sprite.x)}, ${Math.round(sprite.y)})`,
        `Velocity: (${Math.round(body?.velocity.x ?? 0)}, ${Math.round(body?.velocity.y ?? 0)})`,
        `On Ground: ${body?.blocked.down ?? false}`,
      ].join('\n'));
    };
    this.events.on('update', this.debugUpdateHandler);
  }

  private updateCounter = 0;
  
  update(): void {
    try {
      // Log first few updates to verify update loop is running
      if (this.updateCounter < 3) {
       
        this.updateCounter++;
      }
      
      // Don't update if game is ended
      if (this.gameEnded) {
        return;
      }

      // Don't update if paused
      if (this.pauseMenu?.getIsVisible()) {
        return;
      }

      this.player?.update();
    } catch (error: any) {
      throw error;
    }
  

    // Update all enemies
    this.enemies.forEach((enemy) => {
      enemy.update();
    });

    // Update AI controllers (traditional FSM-based AI)
    const delta = this.game.loop.delta;
    this.enemyAIControllers.forEach((controller, index) => {
      if (!this.enemies[index].isDead()) {
        controller.update(delta);
      }
    });

    // LLM-based AI (deprecated - using traditional AI now)
    // this.updateEnemyAI();

    // Check for combat hits
    this.checkPlayerAttacks();
    this.checkEnemyAttacks();

    // Check for death
    this.checkDeath();
  }

  /**
   * Check if player attacks are hitting enemies
   */
  private checkPlayerAttacks(): void {
    // Get player's attack hitbox
    const attackHitbox = this.player.getAttackHitbox();
    if (!attackHitbox) {
      return; // Not attacking or not in hit frame
    }

    // Check each enemy
    this.enemies.forEach((enemy) => {
      // Skip if enemy is dead or invincible
      if (enemy.isDead() || enemy.getIsInvincible()) {
        return;
      }

      // Get enemy sprite bounds
      const enemySprite = enemy.getSprite();
      const enemyBody = enemySprite.body as Phaser.Physics.Arcade.Body;

      // Calculate enemy bounds from body
      const enemyLeft = enemySprite.x - enemyBody.width / 2;
      const enemyRight = enemySprite.x + enemyBody.width / 2;
      const enemyTop = enemySprite.y - enemyBody.height / 2;
      const enemyBottom = enemySprite.y + enemyBody.height / 2;

      // Check if attack hitbox overlaps with enemy bounds
      const hitboxRight = attackHitbox.x + attackHitbox.width;
      const hitboxBottom = attackHitbox.y + attackHitbox.height;

      if (attackHitbox.x < enemyRight &&
        hitboxRight > enemyLeft &&
        attackHitbox.y < enemyBottom &&
        hitboxBottom > enemyTop) {
        // Deal damage, passing attack type for appropriate reaction animation
        const damage = this.player.getAttackDamage();
        const attackType = this.player.getAttackType();
        enemy.takeDamage(damage, this.player.getSprite().x, attackType ?? undefined);
      }
    });
  }

  /**
   * Check if enemy attacks are hitting the player
   */
  private checkEnemyAttacks(): void {
    // Skip if player is dead or invincible
    if (this.player.isDead() || this.player.getIsInvincible()) {
      return;
    }

    // Check each enemy
    this.enemies.forEach((enemy) => {
      // Skip if enemy is dead
      if (enemy.isDead()) {
        return;
      }

      // Get enemy's attack hitbox
      const attackHitbox = enemy.getAttackHitbox();
      if (!attackHitbox) {
        return; // Not attacking or not in hit frame
      }

      // Get player sprite bounds
      const playerSprite = this.player.getSprite();
      const playerBody = playerSprite.body as Phaser.Physics.Arcade.Body;

      // Calculate player bounds from body
      const playerLeft = playerSprite.x - playerBody.width / 2;
      const playerRight = playerSprite.x + playerBody.width / 2;
      const playerTop = playerSprite.y - playerBody.height / 2;
      const playerBottom = playerSprite.y + playerBody.height / 2;

      // Check if attack hitbox overlaps with player bounds
      const hitboxRight = attackHitbox.x + attackHitbox.width;
      const hitboxBottom = attackHitbox.y + attackHitbox.height;

      if (attackHitbox.x < playerRight &&
        hitboxRight > playerLeft &&
        attackHitbox.y < playerBottom &&
        hitboxBottom > playerTop) {
        // Deal damage
        const damage = enemy.getAttackDamage();
        this.player.takeDamage(damage, enemy.getSprite().x);
      }
    });
  }

  /**
   * Check if any character has died and trigger game over
   */
  private checkDeath(): void {
    if (this.gameEnded) {
      return;
    }

    // Check if player is dead
    if (this.player.isDead()) {
      this.gameEnded = true;
      this.physics.pause();
      this.gameOverOverlay.show('enemy');
      return;
    }

    // Check if all enemies are dead
    const allEnemiesDead = this.enemies.every((enemy) => enemy.isDead());
    if (allEnemiesDead && this.enemies.length > 0) {
      this.gameEnded = true;
      this.physics.pause();
      this.gameOverOverlay.show('player');
      return;
    }
  }

  /**
   * Check if any alive enemy is currently showing an attack warning
   * Used by the player's counter-dodge system to determine if dodge was timed correctly
   */
  private isAnyEnemyShowingWarning(): boolean {
    return this.enemies.some((enemy) => !enemy.isDead() && enemy.isShowingWarning());
  }

  /**
   * Get the time until the next enemy attack executes (in ms)
   * Returns 0 if no enemy is showing warning
   * Used by player's counter-dodge to sync dodge animation with attack
   */
  private getTimeUntilEnemyAttack(): number {
    let minTime = Infinity;
    
    for (const enemy of this.enemies) {
      if (!enemy.isDead() && enemy.isShowingWarning()) {
        const timeUntil = enemy.getTimeUntilAttack();
        if (timeUntil < minTime) {
          minTime = timeUntil;
        }
      }
    }
    
    return minTime === Infinity ? 0 : minTime;
  }

  // ============================================================================
  // LLM-based AI methods (deprecated - using traditional FSM AI now)
  // ============================================================================
  
  // /**
  //  * Collect all collision objects (platforms, ground) for AI decision making
  //  */
  // private getCollisionObjects(): CollisionObject[] {
  //   const objects: CollisionObject[] = [];

  //   this.ground.getChildren().forEach((child) => {
  //     const platform = child as Phaser.Physics.Arcade.Sprite;
  //     const body = platform.body as Phaser.Physics.Arcade.StaticBody;
      
  //     // Determine type based on size (ground is wider)
  //     const isGround = body.width >= GAME_WIDTH * 0.5;
      
  //     objects.push({
  //       x: platform.x,
  //       y: platform.y,
  //       width: body.width,
  //       height: body.height,
  //       type: isGround ? 'floor' : 'platform',
  //     });
  //   });

  //   return objects;
  // }

  // /**
  //  * Build the current game state for AI decision making
  //  */
  // private getGameState(enemy: Enemy): GameState {
  //   const playerSprite = this.player.getSprite();
  //   const enemySprite = enemy.getSprite();
    
  //   return {
  //     // Enemy state
  //     enemyX: enemy.getX(),
  //     enemyY: enemy.getY(),
  //     enemyHeight: enemySprite.displayHeight,
  //     enemyHealth: enemy.getCurrentHealth(),
  //     enemyMaxHealth: enemy.getMaxHealth(),
  //     enemyFacingRight: enemy.isFacingRight(),
  //     canAttack: enemy.canAttack(),
  //     canJump: enemy.canJump(),
      
  //     // Player state
  //     playerX: playerSprite.x,
  //     playerY: playerSprite.y,
  //     playerHealth: this.player.getCurrentHealth(),
  //     playerMaxHealth: this.player.getMaxHealth(),
      
  //     // Spatial relationship
  //     distance: Math.abs(enemy.getX() - playerSprite.x),
      
  //     // World objects
  //     collisionObjects: this.getCollisionObjects(),
  //   };
  // }

  // /**
  //  * Update enemy AI - called periodically (not every frame)
  //  */
  // private async updateEnemyAI(): Promise<void> {
  //   // Prevent overlapping AI calls
  //   if (this.isAIUpdating) {
  //     return;
  //   }

  //   const now = this.time.now;
    
  //   // Check if enough time has passed since last AI update
  //   if (now - this.lastAIUpdate < this.aiUpdateInterval) {
  //     return;
  //   }

  //   this.lastAIUpdate = now;
  //   this.isAIUpdating = true;

  //   try {
  //     // Update AI for each enemy
  //     for (const enemy of this.enemies) {
  //       // Skip dead enemies
  //       if (enemy.isDead()) {
  //         continue;
  //       }

  //       const gameState = this.getGameState(enemy);
  //       const { action, params } = await getEnemyAIAction(gameState);

  //       // Log AI decision
  //       console.log(`[AI] Decision: ${action}`, params ? `params: ${JSON.stringify(params)}` : '');

  //       // Execute the action
  //       switch (action) {
  //         case 'punch':
  //           enemy.punch();
  //           break;
  //         case 'sidekick':
  //           enemy.sidekick();
  //           break;
  //         case 'jump':
  //           enemy.jump();
  //           break;
  //         case 'moveLeft':
  //           if (params?.pixels) {
  //             enemy.moveLeftBy(params.pixels);
  //           } else {
  //             enemy.startMovingLeft();
  //           }
  //           break;
  //         case 'moveRight':
  //           if (params?.pixels) {
  //             enemy.moveRightBy(params.pixels);
  //           } else {
  //             enemy.startMovingRight();
  //           }
  //           break;
  //         case 'stopMoving':
  //           enemy.stopMoving();
  //           break;
  //         case 'wait':
  //           // Do nothing
  //           break;
  //       }
  //     }
  //   } catch (error) {
  //     console.error('AI update error:', error);
  //   } finally {
  //     this.isAIUpdating = false;
  //   }
  // }

  /**
   * Clean up resources when scene is shutdown
   * This prevents lingering event listeners from interfering with scene restarts
   */
  shutdown(): void {
    console.log('[GameScene] Shutting down...');
    
    // CRITICAL: Remove the debug update handler to prevent it from running after scene restart
    if (this.debugUpdateHandler) {
      this.events.off('update', this.debugUpdateHandler);
      this.debugUpdateHandler = null;
    }
    
    // Destroy UI components with their event listeners
    this.pauseMenu?.destroy();
    this.gameOverOverlay?.destroy();
    
    // Clear health bars
    this.playerHealthBar?.destroy();
    this.enemyHealthBars.forEach((healthBar) => healthBar.destroy());
    this.enemyHealthBars.clear();
    
    // Reset arrays to prevent stale references
    this.powerBoosters = [];
    this.enemies = [];
    this.enemyAIControllers = [];
  }
}
