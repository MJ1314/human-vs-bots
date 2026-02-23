/**
 * Player Entity
 * ==============
 * Represents Juan - the playable character.
 * Uses composition pattern to wrap a Phaser sprite.
 */

import Phaser from 'phaser';
import { InputManager } from '../systems/InputManager.ts';
import { HealthBar } from '../ui/HealthBar.ts';

/** Player physics and movement configuration */
const CONFIG = {
  MOVE_SPEED: 300,
  ACCELERATION: 1500,
  DRAG: 1000,
  JUMP_VELOCITY: -450,
  MAX_JUMPS: 2, // Allow double jump
  JUMP_BUFFER_TIME: 150, // ms to buffer jump input (allows pressing jump slightly early)
  // Standardized sprite dimensions: 200x400 per frame
  FRAME_WIDTH: 200,
  FRAME_HEIGHT: 400,
  // Scale to fit the game (400 * 0.65 = 260px tall character)
  SCALE: 0.65,
  // Physics body size (in texture coordinates)
  BODY_WIDTH: 80,
  BODY_HEIGHT: 200, // Reduced from 280 to give head clearance
  // Character positioning within frame (in texture coordinates)
  // Empty space above the character's head
  CHAR_TOP_PADDING: 30,
  // Empty space below the character's feet (30px from bottom = feet at 370px)
  CHAR_BOTTOM_PADDING: 30,
  // Health system
  MAX_HEALTH: 100,
  INVINCIBILITY_DURATION: 500, // ms
  KNOCKBACK_FORCE: 250, // pixels/second
};

/** Damage values for different attacks */
const DAMAGE = {
  PUNCH: 10,
  UPPERCUT: 20, // Combo punch
  AERIAL_PUNCH: 15,
};

/** Player state for animation system */
export enum PlayerState {
  IDLE,
  RUNNING,
  JUMPING,
  FALLING,
  ATTACKING,
  HURT,
  DEAD,
  DODGING,
}

export class Player {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private inputManager: InputManager;
  private jumpsRemaining: number = CONFIG.MAX_JUMPS;
  private currentState: PlayerState = PlayerState.IDLE;
  private facingRight: boolean = true;

  // Combo system timing
  private readonly COMBO_WINDOW: number = 800;     // ms to chain combo
  private readonly COMBO_MIN_DELAY: number = 250;  // ms before combo can trigger (let first anim play)

  // Punch combo system
  private comboCount: number = 0;
  private comboTimer: number = 0;
  private comboDelayTimer: number = 0;

  // Input buffer - queue next attack during current animation
  private bufferedAttack: 'punch' | 'uppercut' | 'aerial-punch' | null = null;

  // Jump buffer - allows pressing jump slightly before landing
  private jumpBufferTimer: number = 0;

  // Health system
  private maxHealth: number = CONFIG.MAX_HEALTH;
  private currentHealth: number = CONFIG.MAX_HEALTH;
  private isInvincible: boolean = false;
  private invincibilityTimer: number = 0;
  private healthBar: HealthBar | null = null;

  // Attack tracking for hitbox generation
  private currentAttackType: 'punch' | 'uppercut' | 'aerial-punch' | null = null;

  // Counter-dodge system - callbacks for enemy warning checks
  private isAnyEnemyShowingWarning: (() => boolean) | null = null;
  private getTimeUntilEnemyAttack: (() => number) | null = null;
  private counterDodgeQueued: boolean = false; // True if player pressed U during warning

  // All animations now use standardized 200x400 frames - no per-animation config needed!

  constructor(scene: Phaser.Scene, x: number, y: number, inputManager: InputManager) {
    this.scene = scene;
    this.inputManager = inputManager;

    // Create animations
    this.createAnimations();

    // Create the physics sprite
    // Set origin at character's feet position (not frame bottom)
    this.sprite = scene.physics.add.sprite(x, y, 'juan-idle');
    const originY = (CONFIG.FRAME_HEIGHT - CONFIG.CHAR_BOTTOM_PADDING) / CONFIG.FRAME_HEIGHT;
    this.sprite.setOrigin(0.5, originY);
    this.sprite.setScale(CONFIG.SCALE);

    // Configure physics body
    this.setupPhysicsBody();

    // Start with idle animation
    this.sprite.play('juan-idle');
  }

  private createAnimations(): void {
    // Idle animation - 6 frames (row 1 of 6x3 grid), looping
    this.scene.anims.create({
      key: 'juan-idle',
      frames: this.scene.anims.generateFrameNumbers('juan-idle', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1, // Loop forever
    });

    // Run animation - 12 frames (rows 1-2 of 6x3 grid), looping
    this.scene.anims.create({
      key: 'running-animation',
      frames: this.scene.anims.generateFrameNumbers('running-animation', { start: 0, end: 7 }),
      frameRate: 24,
      repeat: -1, // Loop forever
    });

    // Jump animation - 6 frames (single row), plays once
    this.scene.anims.create({
      key: 'juan-jump',
      frames: this.scene.anims.generateFrameNumbers('juan-jump', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0, // Play once and hold last frame
    });

    // Punch animation - 6 standard frames (200px each)
    // Sequence: guard -> wind-up -> jab -> impact -> retract -> recovery
    this.scene.anims.create({
      key: 'juan-punch',
      frames: [
        { key: 'juan-punch', frame: 0 },      // guard stance
        { key: 'juan-punch', frame: 1 },      // wind-up
        { key: 'juan-punch', frame: 2 },      // jab thrust
        { key: 'juan-punch', frame: 3 },      // impact
        { key: 'juan-punch', frame: 4 },      // retract
        { key: 'juan-punch', frame: 5 },      // recovery
      ],
      frameRate: 12,
      repeat: 0,
      // yoyo: true, // Play forward then backward
    });

    // Uppercut animation - 5 frames, plays forward then backward
    this.scene.anims.create({
      key: 'juan-uppercut',
      frames: this.scene.anims.generateFrameNumbers('juan-uppercut', { start: 0, end: 4 }),
      frameRate: 14,
      repeat: 0,
      yoyo: true, // Play forward then backward
    });

    // Aerial punch animation - uses custom wide frames (frames 1+2 and 3+4 combined = 400px each)
    // Layout: frame0 (200px) | frames1+2 (400px) | frames3+4 (400px) | frame5 (200px)
    // Sequence: stance -> windup (wide) -> punch (wide) -> recovery
    this.scene.anims.create({
      key: 'juan-aerial-punch',
      frames: [
        { key: 'juan-aerial-punch', frame: 0 },         // frame 0: stance (200px)
        { key: 'juan-aerial-punch', frame: 'windup' },  // frames 1+2 combined (400px wide)
        { key: 'juan-aerial-punch', frame: 'punch' },   // frames 3+4 combined (400px wide)
        { key: 'juan-aerial-punch', frame: 5 },         // frame 5: recovery (200px)
      ],
      frameRate: 12,
      repeat: 0,
    });

    // Getting punched animation - 5 frames, hurt/damage reaction
    // Sequence: standing -> brace -> impact -> recoil -> recovery
    this.scene.anims.create({
      key: 'juan-getting-punched',
      frames: this.scene.anims.generateFrameNumbers('juan-getting-punched', { start: 0, end: 4 }),
      frameRate: 18,
      repeat: 0,
      yoyo: true,
    });

    // Getting punched in stomach animation - 4 frames, gut punch reaction
    // Sequence: standing -> brace -> doubled over -> recovery
    this.scene.anims.create({
      key: 'juan-getting-punched-stomach',
      frames: this.scene.anims.generateFrameNumbers('juan-getting-punched-stomach', { start: 0, end: 4 }),
      frameRate: 18,
      repeat: 0,
      yoyo: true,
    });

    // Dodge animation - 4 frames, evasion sequence
    // Sequence: react -> lean back -> dodge -> full dodge
    this.scene.anims.create({
      key: 'juan-dodge',
      frames: this.scene.anims.generateFrameNumbers('juan-dodge', { start: 0, end: 3 }),
      frameRate: 14,
      repeat: 0,
      yoyo: true, // Play forward then backward (dodge and return)
    });

    // Matrix dodge animation - uses custom wide frames for deep lean/crouch poses
    // Sequence: stance -> lean -> lean more -> lean deep (wide) -> crouch_1 (wide) -> crouch_2 (wide) -> crouch_3 (wide)
    this.scene.anims.create({
      key: 'juan-matrix-dodge',
      frames: [
        { key: 'juan-matrix-dodge', frame: 0 },           // stance
        { key: 'juan-matrix-dodge', frame: 1 },           // lean start
        { key: 'juan-matrix-dodge', frame: 2 },           // lean more
        { key: 'juan-matrix-dodge', frame: 'lean_deep' }, // frames 4&5 combined (400px)
        { key: 'juan-matrix-dodge', frame: 'crouch_1' },  // frames 6&7 combined (400px)
 ],
      frameRate: 14,
      repeat: 0,
      yoyo: true, // Play forward then backward (dodge and return)
    });

    // Kipup dodge animation - acrobatic flip dodge
    // Layout: 1200x800, 6 columns x 2 rows = 12 slots, ~10 frames used
    // Sequence: stance -> kick up -> roll -> recovery -> back to stance
    this.scene.anims.create({
      key: 'juan-kipup',
      frames: this.scene.anims.generateFrameNumbers('juan-kipup', { start: 0, end: 10 }),
      frameRate: 16,
      repeat: 0,
    });
  }

  private setupPhysicsBody(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Set physics body size (in texture coordinates, scaled automatically)
    body.setSize(CONFIG.BODY_WIDTH, CONFIG.BODY_HEIGHT);

    // Character is centered in frame with padding above and below
    // Center body horizontally
    const offsetX = (CONFIG.FRAME_WIDTH - CONFIG.BODY_WIDTH) / 2;
    // Position body to align with where character actually is in the frame
    // Body bottom should be at: FRAME_HEIGHT - CHAR_BOTTOM_PADDING
    const offsetY = CONFIG.FRAME_HEIGHT - CONFIG.CHAR_BOTTOM_PADDING - CONFIG.BODY_HEIGHT;
    body.setOffset(offsetX, offsetY);

    // Prevent player from leaving the game world horizontally
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(CONFIG.MOVE_SPEED, 800);
    body.setDrag(CONFIG.DRAG, 0);
  }

  // With standardized 200x400 frames, no per-animation adjustments needed!


  update(): void {
    const delta = this.scene.game.loop.delta;

    // Update punch combo timers
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboCount = 0; // Reset combo if window expired
      }
    }
    if (this.comboDelayTimer > 0) {
      this.comboDelayTimer -= delta;
    }

    // Update invincibility timer
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= delta;
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
      }
    }

    // Debug: Press P to trigger hurt animation (temporary, for testing without enemies)
    this.handleDebugHurt();

    this.handleCounterDodge();
    this.handleDodge();
    this.handleMatrixDodge();
    this.handleAttack();
    this.handleMovement();
    this.handleJump();
    this.updateState();
    this.updateFacing();
  }

  /** Debug method to trigger hurt animations with P/O keys (temporary, for testing) */
  private handleDebugHurt(): void {
    if (this.inputManager.isDebugHurtPressed()) {
      this.triggerHurt();
    }
    if (this.inputManager.isDebugHurtStomachPressed()) {
      this.triggerHurtStomach();
    }
  }

  /** Trigger the hurt/getting punched animation (face) */
  public triggerHurt(): void {
    // Don't interrupt if already hurt
    if (this.currentState === PlayerState.HURT) {
      return;
    }

    this.currentState = PlayerState.HURT;
    this.sprite.play('juan-getting-punched');

    // Return to idle after animation completes
    this.sprite.once('animationcomplete', () => {
      this.currentState = PlayerState.IDLE;
      this.sprite.play('juan-idle');
    });
  }

  /** Trigger the stomach hurt/gut punch animation */
  public triggerHurtStomach(): void {
    // Don't interrupt if already hurt
    if (this.currentState === PlayerState.HURT) {
      return;
    }

    this.currentState = PlayerState.HURT;
    this.sprite.play('juan-getting-punched-stomach');

    // Return to idle after animation completes
    this.sprite.once('animationcomplete', () => {
      this.currentState = PlayerState.IDLE;
      this.sprite.play('juan-idle');
    });
  }

  /** Handle dodge input (I key) */
  private handleDodge(): void {
    // Don't allow dodge while already dodging, attacking, or hurt
    if (this.currentState === PlayerState.DODGING ||
      this.currentState === PlayerState.ATTACKING ||
      this.currentState === PlayerState.HURT) {
      return;
    }

    if (this.inputManager.isDodgePressed()) {
      this.performDodge();
    }
  }

  /** Perform the dodge animation */
  private performDodge(): void {
    this.currentState = PlayerState.DODGING;
    this.sprite.play('juan-dodge');

    // Return to idle after animation completes
    this.sprite.once('animationcomplete', () => {
      this.currentState = PlayerState.IDLE;
      this.sprite.play('juan-idle');
    });
  }

  /** Handle matrix dodge input (L key) */
  private handleMatrixDodge(): void {
    // Don't allow matrix dodge while already dodging, attacking, or hurt
    if (this.currentState === PlayerState.DODGING ||
      this.currentState === PlayerState.ATTACKING ||
      this.currentState === PlayerState.HURT) {
      return;
    }

    if (this.inputManager.isMatrixDodgePressed()) {
      this.performMatrixDodge();
    }
  }

  /** Perform the matrix-style dodge animation */
  private performMatrixDodge(): void {
    this.currentState = PlayerState.DODGING;
    this.sprite.play('juan-matrix-dodge');

    // Return to idle after animation completes
    this.sprite.once('animationcomplete', () => {
      this.currentState = PlayerState.IDLE;
      this.sprite.play('juan-idle');
    });
  }

  /**
   * Set the callback functions for enemy warning system
   * This is called by GameScene after creating the player
   * @param warningChecker - Returns true if any enemy is showing attack warning
   * @param timeUntilAttack - Returns ms until the next enemy attack executes
   */
  public setEnemyWarningChecker(warningChecker: () => boolean, timeUntilAttack: () => number): void {
    this.isAnyEnemyShowingWarning = warningChecker;
    this.getTimeUntilEnemyAttack = timeUntilAttack;
  }

  /**
   * Handle counter-dodge input (U key)
   * Counter-dodge only works during enemy attack warning window (500ms)
   * If pressed during warning, dodge animation is delayed to sync with enemy attack
   */
  private handleCounterDodge(): void {
    // Don't allow counter-dodge while already dodging, attacking, hurt, or already queued
    if (this.currentState === PlayerState.DODGING ||
      this.currentState === PlayerState.ATTACKING ||
      this.currentState === PlayerState.HURT ||
      this.counterDodgeQueued) {
      return;
    }

    if (this.inputManager.isCounterDodgePressed()) {
      // Check if any enemy is showing attack warning
      const enemyIsAttacking = this.isAnyEnemyShowingWarning?.() ?? false;
      
      if (enemyIsAttacking) {
        // Successful counter-dodge! Queue the dodge to sync with enemy attack
        this.queueCounterDodge();
      } else {
        // Missed timing - play dodge immediately but no invincibility
        this.performCounterDodge(false, 0);
      }
    }
  }

  /**
   * Queue a counter-dodge to execute when the enemy attack happens
   * The dodge animation will be delayed to sync with the incoming attack
   */
  private queueCounterDodge(): void {
    // Get the time until enemy attack executes
    const delayMs = this.getTimeUntilEnemyAttack?.() ?? 0;
    
    // Mark as queued so we don't queue multiple times
    this.counterDodgeQueued = true;
    
    // Grant invincibility immediately to protect during the wait
    // Duration covers: wait time + dodge animation time
    this.isInvincible = true;
    this.invincibilityTimer = delayMs + 600;
    
    if (delayMs > 0) {
      // Delay the dodge animation to sync with enemy attack
      this.scene.time.delayedCall(delayMs, () => {
        this.performCounterDodge(true, 0);
      });
    } else {
      // No delay needed, execute immediately
      this.performCounterDodge(true, 0);
    }
  }

  /**
   * Perform the counter-dodge animation
   * @param successful - If true, player timed the dodge correctly during warning
   * @param _delay - Unused, kept for API consistency
   */
  private performCounterDodge(successful: boolean, _delay: number): void {
    this.currentState = PlayerState.DODGING;
    this.counterDodgeQueued = false; // Clear the queue flag
    
    // Randomly choose between the three dodge animations
    const dodgeAnimations = ['juan-dodge', 'juan-matrix-dodge', 'juan-kipup'];
    const randomIndex = Math.floor(Math.random() * dodgeAnimations.length);
    const animKey = dodgeAnimations[randomIndex];
    
    this.sprite.play(animKey);

    if (successful) {
      // Invincibility was already granted in queueCounterDodge
      // Just add a subtle scale pulse for visual feedback
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: CONFIG.SCALE * 1.05,
        scaleY: CONFIG.SCALE * 1.05,
        duration: 100,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    }

    // Return to idle after animation completes
    this.sprite.once('animationcomplete', () => {
      this.currentState = PlayerState.IDLE;
      this.sprite.play('juan-idle');
    });
  }

  private handleAttack(): void {
    // Don't allow attacks while hurt
    if (this.currentState === PlayerState.HURT) {
      return;
    }

    // Cache key states (JustDown only returns true once per press)
    const punchPressed = this.inputManager.isPunchPressed();
    const uppercutPressed = this.inputManager.isUppercutPressed();
    const isAttacking = this.currentState === PlayerState.ATTACKING;
    const isAirborne = !this.isOnGround();

    // Aerial punch - only C (punch) while in the air triggers aerial punch
    if (isAirborne && !isAttacking && punchPressed) {
      this.performAerialPunch();
      return;
    }

    // Allow combo continuation even while attacking (but only after min delay)
    // C key combo: second C during punch = uppercut
    if (punchPressed && this.comboCount === 1 && this.comboDelayTimer <= 0) {
      this.bufferedAttack = null; // Clear buffer, combo takes priority
      this.performUppercut();
      this.comboCount = 0;
      this.comboTimer = 0;
      return;
    }

    // Buffer inputs while attacking (queue next attack)
    if (isAttacking) {
      if (punchPressed) this.bufferedAttack = isAirborne ? 'aerial-punch' : 'punch';
      else if (uppercutPressed) this.bufferedAttack = 'uppercut';
      return;
    }

    // V key = uppercut (direct)
    if (uppercutPressed) {
      this.performUppercut();
      return;
    }

    // C key = punch (first press starts combo)
    if (punchPressed) {
      this.performPunch();
      return;
    }

    // Kick/sidekick removed
  }

  private onAttackComplete(): void {
    // Check for buffered attack
    if (this.bufferedAttack) {
      const attack = this.bufferedAttack;
      this.bufferedAttack = null;

      switch (attack) {
        case 'punch':
          this.performPunch();
          break;
        case 'uppercut':
          this.performUppercut();
          break;
        case 'aerial-punch':
          this.performAerialPunch();
          break;
      }
    } else {
      this.currentState = PlayerState.IDLE;
      this.sprite.play('juan-idle');
    }
  }

  private performPunch(): void {
    this.currentState = PlayerState.ATTACKING;
    this.currentAttackType = 'punch';
    this.sprite.play('juan-punch');
    this.scene.sound.play('punch-sfx', { volume: 0.5 });
    this.comboCount = 1;
    this.comboTimer = this.COMBO_WINDOW;
    this.comboDelayTimer = this.COMBO_MIN_DELAY;
    this.sprite.once('animationcomplete', () => {
      this.currentAttackType = null;
      this.onAttackComplete();
    });
  }

  private performUppercut(): void {
    this.currentState = PlayerState.ATTACKING;
    this.currentAttackType = 'uppercut';
    this.sprite.play('juan-uppercut');
    this.scene.sound.play('punch-sfx', { volume: 0.6 });
    this.sprite.once('animationcomplete', () => {
      this.currentAttackType = null;
      this.onAttackComplete();
    });
  }

  private performAerialPunch(): void {
    this.currentState = PlayerState.ATTACKING;
    this.currentAttackType = 'aerial-punch';
    this.sprite.play('juan-aerial-punch');
    this.scene.sound.play('punch-sfx', { volume: 0.6 });
    this.sprite.once('animationcomplete', () => {
      this.currentAttackType = null;
      this.onAttackComplete();
    });
  }

  private handleMovement(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Don't move while attacking, hurt, or dodging (keeps player planted during animations)
    if (this.currentState === PlayerState.ATTACKING ||
      this.currentState === PlayerState.HURT ||
      this.currentState === PlayerState.DODGING) {
      body.setAccelerationX(0);
      return;
    }

    if (this.inputManager.isMovingLeft()) {
      body.setAccelerationX(-CONFIG.ACCELERATION);
      this.facingRight = false;
    } else if (this.inputManager.isMovingRight()) {
      body.setAccelerationX(CONFIG.ACCELERATION);
      this.facingRight = true;
    } else {
      body.setAccelerationX(0);
    }
  }

  private handleJump(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const delta = this.scene.game.loop.delta;

    // Update jump buffer timer
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
    }

    // Buffer jump input when pressed
    if (this.inputManager.isJumpPressed()) {
      this.jumpBufferTimer = CONFIG.JUMP_BUFFER_TIME;
    }

    // Reset jumps when grounded
    if (body.blocked.down) {
      this.jumpsRemaining = CONFIG.MAX_JUMPS;
    }

    // Execute jump if buffer is active and we have jumps remaining
    if (this.jumpBufferTimer > 0 && this.jumpsRemaining > 0) {
      body.setVelocityY(CONFIG.JUMP_VELOCITY);
      this.jumpsRemaining--;
      this.jumpBufferTimer = 0; // Consume the buffer
    }
  }

  private updateState(): void {
    // Don't change state while attacking, hurt, or dodging
    if (this.currentState === PlayerState.ATTACKING ||
      this.currentState === PlayerState.HURT ||
      this.currentState === PlayerState.DODGING) {
      return;
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const previousState = this.currentState;

    if (!body.blocked.down) {
      this.currentState = body.velocity.y < 0 ? PlayerState.JUMPING : PlayerState.FALLING;
    } else {
      this.currentState = Math.abs(body.velocity.x) > 10 ? PlayerState.RUNNING : PlayerState.IDLE;
    }

    // Play animation when state changes
    if (this.currentState !== previousState) {
      this.playAnimationForState();
    }
  }

  private playAnimationForState(): void {
    switch (this.currentState) {
      case PlayerState.IDLE:
        if (this.sprite.anims.currentAnim?.key !== 'juan-idle') {
          this.sprite.play('juan-idle');
        }
        break;
      case PlayerState.RUNNING:
        if (this.sprite.anims.currentAnim?.key !== 'running-animation') {
          this.sprite.play('running-animation');
        }
        break;
      case PlayerState.JUMPING:
      case PlayerState.FALLING:
        // Use jump animation for air states
        if (this.sprite.anims.currentAnim?.key !== 'juan-jump') {
          this.sprite.play('juan-jump');
        }
        break;
      case PlayerState.ATTACKING:
        // Keep current attack animation playing
        break;
    }
  }

  private updateFacing(): void {
    const shouldFlip = !this.facingRight;
    if (this.sprite.flipX !== shouldFlip) {
      this.sprite.setFlipX(shouldFlip);
    }
  }

  /** Get the underlying Phaser sprite for physics/camera */
  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  getState(): PlayerState {
    return this.currentState;
  }

  isOnGround(): boolean {
    return (this.sprite.body as Phaser.Physics.Arcade.Body).blocked.down;
  }

  /**
   * Take damage from an attack
   */
  takeDamage(amount: number, attackerX: number): void {
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

    // Play hurt animation
    this.triggerHurt();

    // Check if dead
    if (this.currentHealth <= 0) {
      this.currentState = PlayerState.DEAD;
      // Freeze in place
      body.setVelocity(0, 0);
      body.setAcceleration(0, 0);
    }
  }

  /**
   * Get the current attack hitbox bounds if attacking
   * Returns null if not attacking or not in hit frame
   */
  getAttackHitbox(): Phaser.Geom.Rectangle | null {
    if (this.currentState !== PlayerState.ATTACKING || !this.currentAttackType) {
      return null;
    }

    const anim = this.sprite.anims.currentAnim;
    if (!anim) return null;

    // Get current frame from sprite's animation manager
    // Use type assertion as Phaser types may be incomplete
    const animsManager = this.sprite.anims as any;
    const currentFrame = animsManager.currentFrame;
    if (!currentFrame) return null;

    // Determine hitbox based on attack type
    let hitboxWidth = 80;
    let hitboxHeight = 60;
    let offsetX = this.facingRight ? 50 : -50;
    let offsetY = -30; // Slightly above center

    // Adjust hitbox for different attacks
    switch (this.currentAttackType) {
      case 'punch':
        // Punch hitbox - check if we're on the impact frame (index 3 in the animation)
        if (anim.key === 'juan-punch' && currentFrame.index >= 2 && currentFrame.index <= 3) {
          hitboxWidth = 100;
          offsetX = this.facingRight ? 60 : -60;
        } else {
          return null; // Not in hit frame yet
        }
        break;
      case 'uppercut':
        // Uppercut hitbox - upward strike
        if (anim.key === 'juan-uppercut' && currentFrame.index >= 1 && currentFrame.index <= 3) {
          hitboxWidth = 70;
          hitboxHeight = 80;
          offsetX = this.facingRight ? 40 : -40;
          offsetY = -50; // Higher up
        } else {
          return null;
        }
        break;
      case 'aerial-punch':
        // Aerial punch hitbox
        if (anim.key === 'juan-aerial-punch' &&
          (currentFrame.frame.name === 'windup' || currentFrame.frame.name === 'punch')) {
          hitboxWidth = 100;
          offsetX = this.facingRight ? 60 : -60;
        } else {
          return null;
        }
        break;
    }

    // Create hitbox rectangle
    const hitboxX = this.sprite.x + offsetX - hitboxWidth / 2;
    const hitboxY = this.sprite.y + offsetY - hitboxHeight / 2;

    return new Phaser.Geom.Rectangle(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
  }

  /**
   * Get damage value for current attack
   */
  getAttackDamage(): number {
    if (!this.currentAttackType) return 0;

    switch (this.currentAttackType) {
      case 'punch':
        return DAMAGE.PUNCH;
      case 'uppercut':
        return DAMAGE.UPPERCUT;
      case 'aerial-punch':
        return DAMAGE.AERIAL_PUNCH;
      default:
        return 0;
    }
  }

  /**
   * Get current attack type (for determining enemy reaction)
   */
  getAttackType(): string | null {
    return this.currentAttackType;
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
   * Check if player is dead
   */
  isDead(): boolean {
    return this.currentHealth <= 0;
  }

  /**
   * Check if player is invincible
   */
  getIsInvincible(): boolean {
    return this.isInvincible;
  }
}
