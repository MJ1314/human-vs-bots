/**
 * Enemy Entity
 * ==============
 * Represents a basic enemy character.
 * Uses composition pattern to wrap a Phaser sprite.
 */

import Phaser from 'phaser';
import { InputManager } from '../systems/InputManager';
import { HealthBar } from '../ui/HealthBar';

/** Enemy configuration */
const CONFIG = {
  // Frame dimensions (must match PreloadScene sprite sheet config)
  FRAME_WIDTH: 200,
  FRAME_HEIGHT: 400,
  // Scale to fit the game
  SCALE: 0.8,
  // Physics body size (in texture coordinates)
  BODY_WIDTH: 100,
  BODY_HEIGHT: 220,
  // Movement settings
  MOVE_SPEED: 250,
  ACCELERATION: 1200,
  DRAG: 800,
  JUMP_VELOCITY: -650,
  // Health system
  MAX_HEALTH: 300,
  INVINCIBILITY_DURATION: 800, // ms (must be longer than longest yoyo attack animation)
  KNOCKBACK_FORCE: 250, // pixels/second
  // Attack warning system
  ATTACK_WARNING_DURATION: 500, // ms before attack executes
};

/** Enemy state for animation system */
export enum EnemyState {
  IDLE,
  RUNNING,
  JUMPING,
  FALLING,
  ATTACKING,
  HURT,
}

export class Enemy {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private inputManager: InputManager;
  private currentState: EnemyState = EnemyState.IDLE;
  private facingRight: boolean = false; // Start facing left (toward player)

  // Health system
  private maxHealth: number = CONFIG.MAX_HEALTH;
  private currentHealth: number = CONFIG.MAX_HEALTH;
  private isInvincible: boolean = false;
  private invincibilityTimer: number = 0;
  private healthBar: HealthBar | null = null;

  // Attack system
  private currentAttackType: 'punch' | 'sidekick' | 'jump_sidekick' | null = null;

  // Attack warning system
  private warningContainer: Phaser.GameObjects.Container | null = null;
  private warningGraphics: Phaser.GameObjects.Graphics | null = null;
  private warningText: Phaser.GameObjects.Text | null = null;
  private pendingAttack: 'punch' | 'sidekick' | null = null;
  private warningTween: Phaser.Tweens.Tween | null = null;
  private attackExecuteTime: number = 0; // When the attack will execute (scene time)

  // AI control system - allows programmatic control alongside keyboard
  private aiMovementDirection: -1 | 0 | 1 = 0; // -1 = left, 0 = none, 1 = right
  private aiJumpRequested: boolean = false;
  
  // Distance-based movement tracking
  private targetX: number | null = null; // Target X position for moveLeftBy/moveRightBy

  constructor(scene: Phaser.Scene, x: number, y: number, inputManager: InputManager) {
    this.scene = scene;
    this.inputManager = inputManager;

    // Create animations
    this.createAnimations();

    // Create the physics sprite
    this.sprite = scene.physics.add.sprite(x, y, 'enemy-idle');
    this.sprite.setOrigin(0.5, 1); // Origin at feet
    this.sprite.setScale(CONFIG.SCALE);

    // Configure physics body
    this.setupPhysicsBody();

    // Create attack warning indicator
    this.createWarningIndicator();

    // Start with idle animation
    this.sprite.play('enemy-idle');
  }

  /**
   * Create the visual warning indicator for attacks
   */
  private createWarningIndicator(): void {
    // Create container to hold warning elements
    this.warningContainer = this.scene.add.container(this.sprite.x, this.sprite.y - 180);
    this.warningContainer.setDepth(100);
    this.warningContainer.setVisible(false);

    // Create glowing background circle
    this.warningGraphics = this.scene.add.graphics();
    
    // Draw outer glow (multiple layers for soft glow effect)
    this.warningGraphics.fillStyle(0xff0000, 0.15);
    this.warningGraphics.fillCircle(0, 0, 35);
    this.warningGraphics.fillStyle(0xff0000, 0.25);
    this.warningGraphics.fillCircle(0, 0, 28);
    this.warningGraphics.fillStyle(0xff3300, 0.4);
    this.warningGraphics.fillCircle(0, 0, 22);
    this.warningGraphics.fillStyle(0xff5500, 0.6);
    this.warningGraphics.fillCircle(0, 0, 16);
    
    // Draw inner solid circle
    this.warningGraphics.fillStyle(0xff0000, 1);
    this.warningGraphics.fillCircle(0, 0, 12);
    
    // Add exclamation mark
    this.warningText = this.scene.add.text(0, 0, '!', {
      fontFamily: 'Quantico, Arial',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.warningText.setOrigin(0.5, 0.5);

    // Add elements to container
    this.warningContainer.add([this.warningGraphics, this.warningText]);
  }

  private createAnimations(): void {
    // Only create animations if they don't already exist
    if (!this.scene.anims.exists('enemy-idle')) {
      // Idle animation - 3 frames, looping
      this.scene.anims.create({
        key: 'enemy-idle',
        frames: this.scene.anims.generateFrameNumbers('enemy-idle', { start: 0, end: 2 }),
        frameRate: 6,
        repeat: -1, // Loop forever
      });
    }

    if (!this.scene.anims.exists('enemy-running')) {
      // Running animation - 8 frames, looping
      this.scene.anims.create({
        key: 'enemy-running',
        frames: this.scene.anims.generateFrameNumbers('enemy-running', { start: 0, end: 7 }),
        frameRate: 12,
        repeat: -1, // Loop forever
      });
    }

    if (!this.scene.anims.exists('enemy-punch')) {
      // Punch animation - 5 frames (0-4)
      // Sequence: stance (0) -> wind-up (1) -> punch start (2) -> punch_extend (wide, frames 3+4 combined)
      this.scene.anims.create({
        key: 'enemy-punch',
        frames: [
          { key: 'enemy-punch', frame: 0 },           // stance
          { key: 'enemy-punch', frame: 1 },           // wind-up
          { key: 'enemy-punch', frame: 2 },           // punch start
          { key: 'enemy-punch', frame: 'punch_extend' }, // full extension (400px wide, frames 3+4 combined)
        ],
        frameRate: 12,
        repeat: 0, // Play once
      });
    }

    if (!this.scene.anims.exists('enemy-sidekick')) {
      // Sidekick animation - 6 frames (skipping frame 5)
      // Sequence: stance (0) -> knee slightly elevated (1) -> knee fully elevated (2) -> leg half-extended (3) -> kick_extend (3+4 combined, skip 5) -> kick_follow (6+7 combined)
      this.scene.anims.create({
        key: 'enemy-sidekick',
        frames: [
          { key: 'enemy-sidekick', frame: 0 },           // stance
          { key: 'enemy-sidekick', frame: 1 },           // knee slightly elevated
          { key: 'enemy-sidekick', frame: 2 },           // knee fully elevated
          { key: 'enemy-sidekick', frame: 'kick_extend' }, // frames 3+4 combined (skip frame 5)
          { key: 'enemy-sidekick', frame: 'kick_follow' }, // follow through (400px wide, slots 6+7)
        ],
        frameRate: 18,
        repeat: 0, // Play once
        yoyo: true, // Play forward then backward
      });
    }

    if (!this.scene.anims.exists('enemy-jump-sidekick')) {
      // Jump sidekick animation - aerial sidekick attack
      // Sequence: 4 prep frames -> extended flying kick
      this.scene.anims.create({
        key: 'enemy-jump-sidekick',
        frames: [
          { key: 'enemy-jump-sidekick', frame: 0 },                // stance
          { key: 'enemy-jump-sidekick', frame: 1 },                // crouch prep
          { key: 'enemy-jump-sidekick', frame: 2 },                // knee up
          { key: 'enemy-jump-sidekick', frame: 'jump_kick_extend' }, // full extension (400px wide)
          { key: 'enemy-jump-sidekick', frame: 'jump_kick_follow' }, // follow through (400px wide)
        ],
        frameRate: 16,
        repeat: 0, // Play once
        yoyo: true, // Play forward then backward
      });
    }

    if (!this.scene.anims.exists('enemy-getting-punched')) {
      // Getting punched animation - 5 frames, hurt/damage reaction
      // Sequence: impact -> recoil -> stunned -> recovering -> recovered
      this.scene.anims.create({
        key: 'enemy-getting-punched',
        frames: [
          { key: 'enemy-getting-punched', frame: 0 },                // stance
          { key: 'enemy-getting-punched', frame: 1 },                // crouch prep
          { key: 'enemy-getting-punched', frame: 2 },                // knee up
          { key: 'enemy-getting-punched', frame: 3 }, // full extension (400px wide)
        ],        
        frameRate: 18,
        repeat: 0,
        yoyo: true,
      });
    }

    if (!this.scene.anims.exists('enemy-getting-punched-stomach')) {
      // Getting punched in stomach animation - 5 frames, gut punch reaction
      // Sequence: standing -> brace -> doubled over -> recovery
      this.scene.anims.create({
        key: 'enemy-getting-punched-stomach',
        frames: this.scene.anims.generateFrameNumbers('enemy-getting-punched-stomach', { start: 0, end: 4 }),
        frameRate: 18,
        repeat: 0,
        yoyo: true,
      });
    }
  }

  private setupPhysicsBody(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Set physics body size
    body.setSize(CONFIG.BODY_WIDTH, CONFIG.BODY_HEIGHT);

    // Center the body horizontally, position at bottom of frame (where character is)
    const offsetX = (CONFIG.FRAME_WIDTH - CONFIG.BODY_WIDTH) / 2;
    // Character feet are near the bottom of the frame with some padding
    const bottomPadding = 30; // Space below character's feet in the frame
    const offsetY = CONFIG.FRAME_HEIGHT - CONFIG.BODY_HEIGHT - bottomPadding;
    body.setOffset(offsetX, offsetY);

    // Enable gravity and world bounds collision
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(CONFIG.MOVE_SPEED, 800);
    body.setDrag(CONFIG.DRAG, 0);
  }

  update(): void {
    const delta = this.scene.game.loop.delta;

    // Update invincibility timer
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= delta;
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
      }
    }

    // Update warning indicator position to follow enemy
    this.updateWarningPosition();

    // Don't update movement if dead
    if (this.currentHealth <= 0) {
      return;
    }

    this.handleAttack();
    this.handleMovement();
    this.handleJump();
    this.updateState();
    this.updateFacing();
  }

  /**
   * Update the warning indicator position to follow the enemy
   */
  private updateWarningPosition(): void {
    if (this.warningContainer) {
      // Position above the enemy's head
      this.warningContainer.setPosition(this.sprite.x, this.sprite.y - 180);
    }
  }

  private handleAttack(): void {
    // Don't allow attacks while already attacking, hurt, dead, or showing warning
    if (this.currentState === EnemyState.ATTACKING || 
        this.currentState === EnemyState.HURT || 
        this.currentHealth <= 0 ||
        this.isShowingWarning()) {
      return;
    }

    if (this.inputManager.isEnemyPunchPressed()) {
      this.punch(); // Use the public method which includes warning
    } else if (this.inputManager.isEnemySidekickPressed()) {
      this.sidekick(); // Use the public method which includes warning
    }
  }

  private performPunch(): void {
    this.currentState = EnemyState.ATTACKING;
    this.currentAttackType = 'punch';
    this.sprite.play('enemy-punch');
    this.scene.sound.play('punch-sfx', { volume: 0.5 });
    this.sprite.once('animationcomplete', () => {
      this.currentAttackType = null;
      this.currentState = EnemyState.IDLE;
      this.sprite.play('enemy-idle');
    });
  }

  private performSidekick(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const isAirborne = !body.onFloor();
    const isRunning = Math.abs(body.velocity.x) > 50; // Has significant horizontal velocity

    this.currentState = EnemyState.ATTACKING;

    if (isAirborne || isRunning) {
      // Use jump sidekick when in the air or running
      this.currentAttackType = 'jump_sidekick';
      this.sprite.play('enemy-jump-sidekick');
    } else {
      // Use regular sidekick when standing still on the ground
      this.currentAttackType = 'sidekick';
      this.sprite.play('enemy-sidekick');
    }

    this.scene.sound.play('kick-sfx', { volume: 0.5 });
    this.sprite.once('animationcomplete', () => {
      this.currentAttackType = null;
      this.currentState = EnemyState.IDLE;
      this.sprite.play('enemy-idle');
    });
  }

  private handleMovement(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Don't move while attacking on the ground (except jump sidekick), or while hurt
    if (this.currentState === EnemyState.HURT ||
        (this.currentState === EnemyState.ATTACKING && this.currentAttackType !== 'jump_sidekick')) {
      body.setAccelerationX(0);
      return;
    }

    // Check if we've reached the target position (for distance-based movement)
    if (this.targetX !== null) {
      const reachedTarget = 
        (this.aiMovementDirection === -1 && this.sprite.x <= this.targetX) ||
        (this.aiMovementDirection === 1 && this.sprite.x >= this.targetX);
      
      if (reachedTarget) {
        // Stop movement
        this.aiMovementDirection = 0;
        this.targetX = null;
        body.setAccelerationX(0);
        body.setVelocityX(0); // Stop immediately when target reached
        return;
      }
    }

    // Check both keyboard input and AI control
    const movingLeft = this.inputManager.isEnemyMovingLeft() || this.aiMovementDirection === -1;
    const movingRight = this.inputManager.isEnemyMovingRight() || this.aiMovementDirection === 1;

    if (movingLeft) {
      body.setAccelerationX(-CONFIG.ACCELERATION);
      // Don't change facing direction during jump sidekick (committed to direction)
      if (this.currentAttackType !== 'jump_sidekick') {
        this.facingRight = false;
      }
    } else if (movingRight) {
      body.setAccelerationX(CONFIG.ACCELERATION);
      // Don't change facing direction during jump sidekick (committed to direction)
      if (this.currentAttackType !== 'jump_sidekick') {
        this.facingRight = true;
      }
    } else {
      // During jump sidekick, maintain momentum instead of stopping
      if (this.currentAttackType !== 'jump_sidekick') {
        body.setAccelerationX(0);
      }
    }
  }

  private handleJump(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Check both keyboard input and AI control
    const jumpRequested = this.inputManager.isEnemyJumpPressed() || this.aiJumpRequested;
    
    // Consume the AI jump request (one-shot)
    if (this.aiJumpRequested) {
      this.aiJumpRequested = false;
    }

    // Only allow jump when on ground
    if (jumpRequested && body.blocked.down) {
      body.setVelocityY(CONFIG.JUMP_VELOCITY);
    }
  }

  private updateState(): void {
    // Don't change state while attacking or hurt
    if (this.currentState === EnemyState.ATTACKING || 
        this.currentState === EnemyState.HURT) {
      return;
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const previousState = this.currentState;

    if (!body.blocked.down) {
      // In the air
      this.currentState = body.velocity.y < 0 ? EnemyState.JUMPING : EnemyState.FALLING;
    } else {
      // On ground
      this.currentState = Math.abs(body.velocity.x) > 10 ? EnemyState.RUNNING : EnemyState.IDLE;
    }

    // Play animation when state changes
    if (this.currentState !== previousState) {
      this.playAnimationForState();
    }
  }

  private playAnimationForState(): void {
    switch (this.currentState) {
      case EnemyState.IDLE:
        if (this.sprite.anims.currentAnim?.key !== 'enemy-idle') {
          this.sprite.play('enemy-idle');
        }
        break;
      case EnemyState.RUNNING:
        if (this.sprite.anims.currentAnim?.key !== 'enemy-running') {
          this.sprite.play('enemy-running');
        }
        break;
      case EnemyState.JUMPING:
      case EnemyState.FALLING:
        // Use idle animation for jumping (no jump animation available)
        if (this.sprite.anims.currentAnim?.key !== 'enemy-idle') {
          this.sprite.play('enemy-idle');
        }
        break;
    }
  }

  private updateFacing(): void {
    // Sprites face right by default, so flip when facing left
    const shouldFlip = !this.facingRight;
    if (this.sprite.flipX !== shouldFlip) {
      this.sprite.setFlipX(shouldFlip);
    }
  }

  /**
   * Show the attack warning indicator with pulsing animation
   * @param attackType - The type of attack being prepared
   * @param callback - Function to call when warning completes (executes attack)
   */
  private showAttackWarning(attackType: 'punch' | 'sidekick', callback: () => void): void {
    if (!this.warningContainer || !this.warningGraphics) {
      // If warning system not available, execute attack immediately
      callback();
      return;
    }

    this.pendingAttack = attackType;
    this.warningContainer.setVisible(true);
    this.warningContainer.setAlpha(0);
    this.warningContainer.setScale(0.5);

    // Record when the attack will execute (for counter-dodge timing)
    this.attackExecuteTime = this.scene.time.now + CONFIG.ATTACK_WARNING_DURATION;

    // Kill any existing tween
    if (this.warningTween) {
      this.warningTween.destroy();
    }

    // Create pulsing warning animation that fills the full warning duration
    this.warningTween = this.scene.tweens.add({
      targets: this.warningContainer,
      alpha: { from: 0, to: 1 },
      scale: { from: 0.5, to: 1.2 },
      duration: CONFIG.ATTACK_WARNING_DURATION / 2,
      yoyo: true,
      repeat: 0,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        // Add shake effect to the container
        if (this.warningContainer) {
          const shake = (Math.random() - 0.5) * 4;
          this.warningContainer.x = this.sprite.x + shake;
        }
      },
      onComplete: () => {
        this.hideAttackWarning();
        callback();
      }
    });

    // Also add a red tint flash to the enemy sprite
    this.scene.tweens.add({
      targets: this.sprite,
      tint: { from: 0xffffff, to: 0xff6666 },
      duration: CONFIG.ATTACK_WARNING_DURATION / 3,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.sprite.clearTint();
      }
    });
  }

  /**
   * Hide the attack warning indicator
   */
  private hideAttackWarning(): void {
    if (this.warningContainer) {
      this.warningContainer.setVisible(false);
      this.warningContainer.setPosition(this.sprite.x, this.sprite.y - 180);
    }
    this.pendingAttack = null;
    
    if (this.warningTween) {
      this.warningTween.destroy();
      this.warningTween = null;
    }
  }

  /**
   * Check if enemy is currently showing attack warning
   */
  public isShowingWarning(): boolean {
    return this.pendingAttack !== null;
  }

  /**
   * Get the time remaining until the attack executes (in ms)
   * Returns 0 if not showing warning
   */
  public getTimeUntilAttack(): number {
    if (!this.isShowingWarning()) {
      return 0;
    }
    return Math.max(0, this.attackExecuteTime - this.scene.time.now);
  }

  /** Get the underlying Phaser sprite for physics/collisions */
  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  getState(): EnemyState {
    return this.currentState;
  }

  /** Set which direction the enemy faces */
  setFacing(right: boolean): void {
    this.facingRight = right;
    this.sprite.setFlipX(!right); // Sprite faces right by default, flip when facing left
  }

  /**
   * Take damage from an attack
   * @param amount - Damage amount
   * @param attackerX - X position of attacker for knockback direction
   * @param attackType - Optional attack type to determine reaction animation
   */
  takeDamage(amount: number, attackerX: number, attackType?: string): void {
    // Don't take damage if invincible or dead
    if (this.isInvincible || this.currentHealth <= 0) {
      return;
    }

    this.currentHealth = Math.max(0, this.currentHealth - amount);

    // Update health bar
    if (this.healthBar) {
      this.healthBar.updateHealth(this.currentHealth);
    }

    // Apply knockback
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const knockbackDirection = this.sprite.x < attackerX ? -1 : 1;
    body.setVelocityX(knockbackDirection * CONFIG.KNOCKBACK_FORCE);

    // Start invincibility
    this.isInvincible = true;
    this.invincibilityTimer = CONFIG.INVINCIBILITY_DURATION;

    // Play appropriate hurt animation based on attack type
    // Sidekick and uppercut hit the face, other attacks hit the stomach
    if (attackType === 'sidekick' || attackType === 'uppercut') {
      this.triggerHurt();
    } else if (attackType) {
      this.triggerHurtStomach();
    }

    // Check if dead
    if (this.currentHealth <= 0) {
      // Freeze in place
      body.setVelocity(0, 0);
      body.setAcceleration(0, 0);
    }
  }

  /**
   * Trigger the hurt/getting punched animation (face hit)
   */
  public triggerHurt(): void {
    // Don't interrupt if already hurt
    if (this.currentState === EnemyState.HURT) {
      return;
    }

    this.currentState = EnemyState.HURT;
    this.currentAttackType = null; // Cancel any current attack
    this.sprite.play('enemy-getting-punched');

    // Return to idle after animation completes
    this.sprite.once('animationcomplete', () => {
      this.currentState = EnemyState.IDLE;
      this.sprite.play('enemy-idle');
    });
  }

  /**
   * Trigger the stomach hurt/gut punch animation
   */
  public triggerHurtStomach(): void {
    // Don't interrupt if already hurt
    if (this.currentState === EnemyState.HURT) {
      return;
    }

    this.currentState = EnemyState.HURT;
    this.currentAttackType = null; // Cancel any current attack
    this.sprite.play('enemy-getting-punched-stomach');

    // Return to idle after animation completes
    this.sprite.once('animationcomplete', () => {
      this.currentState = EnemyState.IDLE;
      this.sprite.play('enemy-idle');
    });
  }

  /**
   * Set health bar reference
   */
  setHealthBar(healthBar: HealthBar): void {
    this.healthBar = healthBar;
  }

  /**
   * Get current health
   */
  getCurrentHealth(): number {
    return this.currentHealth;
  }

  /**
   * Get max health
   */
  getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * Check if enemy is dead
   */
  isDead(): boolean {
    return this.currentHealth <= 0;
  }

  /**
   * Check if enemy is invincible
   */
  getIsInvincible(): boolean {
    return this.isInvincible;
  }

  /**
   * Get the current attack hitbox bounds if attacking
   * Returns null if not attacking or not in hit frame
   */
  getAttackHitbox(): Phaser.Geom.Rectangle | null {
    if (this.currentState !== EnemyState.ATTACKING || !this.currentAttackType) {
      return null;
    }

    const anim = this.sprite.anims.currentAnim;
    if (!anim) return null;

    // Get current frame from sprite's animation manager
    const animsManager = this.sprite.anims as any;
    const currentFrame = animsManager.currentFrame;
    if (!currentFrame) return null;

    // Punch hitbox - check if we're on the punch_extend frame (wide frame, frames 4+5 combined)
    if (anim.key === 'enemy-punch' && currentFrame.frame.name === 'punch_extend') {
      const hitboxWidth = 100; // Wider hitbox for the extended punch
      const hitboxHeight = 60;
      const offsetX = this.facingRight ? 70 : -70; // Further reach for extended punch
      const offsetY = -30; // Slightly above center

      // Create hitbox rectangle
      const hitboxX = this.sprite.x + offsetX - hitboxWidth / 2;
      const hitboxY = this.sprite.y + offsetY - hitboxHeight / 2;

      return new Phaser.Geom.Rectangle(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
    }

    // Sidekick hitbox - check if we're on the kick_extend or kick_follow frames (wide frames)
    if (anim.key === 'enemy-sidekick' && 
        (currentFrame.frame.name === 'kick_extend' || currentFrame.frame.name === 'kick_follow')) {
      const hitboxWidth = 120; // Wider hitbox for the extended kick
      const hitboxHeight = 80;
      const offsetX = this.facingRight ? 90 : -90; // Further reach for extended kick
      const offsetY = -40; // Slightly above center

      // Create hitbox rectangle
      const hitboxX = this.sprite.x + offsetX - hitboxWidth / 2;
      const hitboxY = this.sprite.y + offsetY - hitboxHeight / 2;

      return new Phaser.Geom.Rectangle(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
    }

    // Jump sidekick hitbox - check if we're on the jump_kick_extend frame
    if (anim.key === 'enemy-jump-sidekick' && currentFrame.frame.name === 'jump_kick_extend') {
      const hitboxWidth = 140; // Wide hitbox for the flying kick
      const hitboxHeight = 100;
      const offsetX = this.facingRight ? 100 : -100; // Extended reach for aerial kick
      const offsetY = -20; // Center of body during jump

      // Create hitbox rectangle
      const hitboxX = this.sprite.x + offsetX - hitboxWidth / 2;
      const hitboxY = this.sprite.y + offsetY - hitboxHeight / 2;

      return new Phaser.Geom.Rectangle(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
    }

    return null;
  }

  /**
   * Get damage value for current attack
   */
  getAttackDamage(): number {
    if (this.currentAttackType === 'punch') {
      return 10; // Same as player punch damage
    }
    if (this.currentAttackType === 'sidekick') {
      return 15; // Sidekick does more damage than punch
    }
    if (this.currentAttackType === 'jump_sidekick') {
      return 20; // Jump sidekick does the most damage
    }
    return 0;
  }

  // ============================================
  // PUBLIC ACTION METHODS (for AI or programmatic control)
  // ============================================

  /**
   * Check if the enemy can currently perform an attack
   * @returns true if attack is allowed
   */
  public canAttack(): boolean {
    return this.currentState !== EnemyState.ATTACKING &&
           this.currentState !== EnemyState.HURT &&
           this.currentHealth > 0 &&
           !this.isShowingWarning();
  }

  /**
   * Check if the enemy can currently jump
   * @returns true if jump is allowed (on ground and not dead)
   */
  public canJump(): boolean {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down && this.currentHealth > 0;
  }

  /**
   * Trigger a punch attack (callable by AI or code)
   * Shows a 300ms warning before the attack executes
   * @returns true if punch was triggered, false if not allowed
   */
  public punch(): boolean {
    if (!this.canAttack() || this.isShowingWarning()) {
      return false;
    }
    
    // Show warning, then execute punch after delay
    this.showAttackWarning('punch', () => {
      // Double-check we can still attack after the warning
      if (this.canAttack()) {
        this.performPunch();
      }
    });
    
    return true;
  }

  /**
   * Trigger a sidekick attack (callable by AI or code)
   * Shows a 300ms warning before the attack executes
   * @returns true if sidekick was triggered, false if not allowed
   */
  public sidekick(): boolean {
    if (!this.canAttack() || this.isShowingWarning()) {
      return false;
    }
    
    // Show warning, then execute sidekick after delay
    this.showAttackWarning('sidekick', () => {
      // Double-check we can still attack after the warning
      if (this.canAttack()) {
        this.performSidekick();
      }
    });
    
    return true;
  }

  /**
   * Trigger a jump (callable by AI or code)
   * @returns true if jump was triggered, false if not allowed
   */
  public jump(): boolean {
    if (!this.canJump()) {
      return false;
    }
    this.aiJumpRequested = true;
    return true;
  }

  /**
   * Start moving left (for AI control)
   * Movement continues until stopMoving() is called
   */
  public startMovingLeft(): void {
    this.aiMovementDirection = -1;
  }

  /**
   * Start moving right (for AI control)
   * Movement continues until stopMoving() is called
   */
  public startMovingRight(): void {
    this.aiMovementDirection = 1;
  }

  /**
   * Stop AI-controlled movement
   */
  public stopMoving(): void {
    this.aiMovementDirection = 0;
    this.targetX = null;
  }

  /**
   * Move left by a specific number of pixels
   * Movement will automatically stop when target is reached
   * @param pixels - Number of pixels to move
   */
  public moveLeftBy(pixels: number): void {
    this.targetX = this.sprite.x - pixels;
    this.aiMovementDirection = -1;
  }

  /**
   * Move right by a specific number of pixels
   * Movement will automatically stop when target is reached
   * @param pixels - Number of pixels to move
   */
  public moveRightBy(pixels: number): void {
    this.targetX = this.sprite.x + pixels;
    this.aiMovementDirection = 1;
  }

  /**
   * Get the current AI movement direction
   * @returns -1 for left, 0 for none, 1 for right
   */
  public getAIMovementDirection(): -1 | 0 | 1 {
    return this.aiMovementDirection;
  }

  /**
   * Check if enemy is currently attacking
   */
  public isAttacking(): boolean {
    return this.currentState === EnemyState.ATTACKING;
  }

  /**
   * Get enemy's current X position
   */
  public getX(): number {
    return this.sprite.x;
  }

  /**
   * Get enemy's current Y position
   */
  public getY(): number {
    return this.sprite.y;
  }

  /**
   * Check if enemy is facing right
   */
  public isFacingRight(): boolean {
    return this.facingRight;
  }
}
