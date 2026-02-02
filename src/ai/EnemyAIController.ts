/**
 * Enemy AI Controller
 * ====================
 * A Finite State Machine (FSM) based AI controller for enemy characters.
 * Controls enemy behavior including chasing, attacking, and retreating.
 */

import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';

/** AI States for the finite state machine */
export enum AIState {
  IDLE,      // Standing still, waiting
  CHASE,     // Moving toward the player
  ATTACK,    // Close enough to attack
  RETREAT,   // Backing away (when low health or after attacking)
}

/** Configuration for AI behavior */
const AI_CONFIG = {
  // Distance thresholds
  IDLE_TO_CHASE_DISTANCE: 2000,      // Start chasing when player is within this distance
  CHASE_TO_IDLE_DISTANCE: 600,      // Stop chasing when player is beyond this distance
  ATTACK_DISTANCE: 120,             // Attack when within this distance
  
  // Distance randomization (adds unpredictability)
  DISTANCE_VARIANCE: 30,            // +/- variance to distances
  
  // Timing
  ATTACK_COOLDOWN: 800,             // ms between attacks
  RETREAT_DURATION: 500,            // ms to retreat after attack
  ATTACK_PAUSE_CHANCE: 0.3,         // 30% chance to pause before attacking
  ATTACK_PAUSE_DURATION: 200,       // ms to pause before attacking
  
  // Behavior chances
  RETREAT_CHANCE: 0.25,             // 25% chance to retreat after attacking
  JUMP_WHILE_CHASING_CHANCE: 0.02,  // 2% chance per frame to jump while chasing
  
  // Health-based behavior
  LOW_HEALTH_THRESHOLD: 0.3,        // 30% health is considered low
  LOW_HEALTH_RETREAT_CHANCE: 0.4,   // 40% chance to retreat when low health
};

/**
 * EnemyAIController - Finite State Machine for enemy AI
 * 
 * Controls an enemy's behavior through discrete states:
 * - IDLE: Wait until player approaches
 * - CHASE: Pursue the player
 * - ATTACK: Execute attacks when in range
 * - RETREAT: Back away strategically
 */
export class EnemyAIController {
  private enemy: Enemy;
  private player: Player;
  
  // FSM state
  private currentState: AIState = AIState.IDLE;
  private stateTimer: number = 0;
  
  // Attack timing
  private attackCooldown: number = AI_CONFIG.ATTACK_COOLDOWN;
  private lastAttackTime: number = 0;
  
  // State-specific timers
  private attackPauseTimer: number = 0;
  private isWaitingToAttack: boolean = false;
  
  constructor(enemy: Enemy, player: Player) {
    this.enemy = enemy;
    this.player = player;
  }
  
  /**
   * Main update loop - called every frame
   * @param delta - Time elapsed since last frame in ms
   */
  public update(delta: number): void {
    // Don't update if enemy is dead
    if (this.enemy.isDead()) {
      this.enemy.stopMoving();
      return;
    }
    
    // Don't update if player is dead
    if (this.player.isDead()) {
      this.enemy.stopMoving();
      this.currentState = AIState.IDLE;
      return;
    }
    
    // Update timers
    this.stateTimer += delta;
    this.lastAttackTime += delta;
    
    if (this.attackPauseTimer > 0) {
      this.attackPauseTimer -= delta;
    }
    
    // Calculate distance to player
    const playerX = this.player.getSprite().x;
    const enemyX = this.enemy.getX();
    const distance = Math.abs(playerX - enemyX);
    
    // Check state transitions
    this.checkStateTransitions(distance);
    
    // Execute current state behavior
    this.executeStateBehavior(distance, delta);
  }
  
  /**
   * Check and handle state transitions based on current conditions
   */
  private checkStateTransitions(distance: number): void {
    // Add randomized variance to distances for unpredictability
    const variance = (Math.random() - 0.5) * 2 * AI_CONFIG.DISTANCE_VARIANCE;
    
    switch (this.currentState) {
      case AIState.IDLE:
        // Transition to CHASE if player is within detection range
        if (distance < AI_CONFIG.IDLE_TO_CHASE_DISTANCE + variance) {
          this.transitionTo(AIState.CHASE);
        }
        break;
        
      case AIState.CHASE:
        // Transition to ATTACK if close enough
        if (distance < AI_CONFIG.ATTACK_DISTANCE + variance) {
          this.transitionTo(AIState.ATTACK);
        }
        // Transition back to IDLE if player is too far
        else if (distance > AI_CONFIG.CHASE_TO_IDLE_DISTANCE + variance) {
          this.transitionTo(AIState.IDLE);
        }
        break;
        
      case AIState.ATTACK:
        // If player moves out of attack range, chase them
        if (distance > AI_CONFIG.ATTACK_DISTANCE + 20) {
          this.transitionTo(AIState.CHASE);
        }
        break;
        
      case AIState.RETREAT:
        // Retreat for a fixed duration, then go back to chasing
        if (this.stateTimer >= AI_CONFIG.RETREAT_DURATION) {
          this.transitionTo(AIState.CHASE);
        }
        break;
    }
  }
  
  /**
   * Execute behavior for the current state
   */
  private executeStateBehavior(distance: number, delta: number): void {
    switch (this.currentState) {
      case AIState.IDLE:
        this.executeIdleBehavior();
        break;
        
      case AIState.CHASE:
        this.executeChaseBehavior(delta);
        break;
        
      case AIState.ATTACK:
        this.executeAttackBehavior();
        break;
        
      case AIState.RETREAT:
        this.executeRetreatBehavior();
        break;
    }
  }
  
  /**
   * IDLE state behavior - stand still and face the player
   */
  private executeIdleBehavior(): void {
    this.enemy.stopMoving();
    this.facePlayer();
  }
  
  /**
   * CHASE state behavior - move toward the player
   */
  private executeChaseBehavior(delta: number): void {
    const playerX = this.player.getSprite().x;
    const enemyX = this.enemy.getX();
    
    // Move toward the player
    if (playerX < enemyX) {
      this.enemy.startMovingLeft();
    } else {
      this.enemy.startMovingRight();
    }
    
    // Occasionally jump while chasing (adds unpredictability)
    if (Math.random() < AI_CONFIG.JUMP_WHILE_CHASING_CHANCE) {
      this.enemy.jump();
    }
  }
  
  /**
   * ATTACK state behavior - attack the player
   */
  private executeAttackBehavior(): void {
    // Always face the player before attacking
    this.facePlayer();
    this.enemy.stopMoving();
    
    // Check if we're in the middle of an attack pause
    if (this.isWaitingToAttack) {
      if (this.attackPauseTimer <= 0) {
        this.isWaitingToAttack = false;
        this.performAttack();
      }
      return;
    }
    
    // Check if we can attack (cooldown passed and enemy can attack)
    if (this.lastAttackTime >= this.attackCooldown && this.enemy.canAttack()) {
      // Random chance to pause briefly before attacking
      if (Math.random() < AI_CONFIG.ATTACK_PAUSE_CHANCE) {
        this.isWaitingToAttack = true;
        this.attackPauseTimer = AI_CONFIG.ATTACK_PAUSE_DURATION * (0.5 + Math.random());
        return;
      }
      
      this.performAttack();
    }
  }
  
  /**
   * Perform an attack (randomly choose punch or sidekick)
   */
  private performAttack(): void {
    // Randomly choose attack type
    const attackSuccess = Math.random() < 0.5 
      ? this.enemy.punch() 
      : this.enemy.sidekick();
    
    if (attackSuccess) {
      this.lastAttackTime = 0;
      
      // After attacking, decide whether to retreat
      const isLowHealth = this.enemy.getCurrentHealth() / this.enemy.getMaxHealth() < AI_CONFIG.LOW_HEALTH_THRESHOLD;
      const retreatChance = isLowHealth 
        ? AI_CONFIG.LOW_HEALTH_RETREAT_CHANCE 
        : AI_CONFIG.RETREAT_CHANCE;
      
      if (Math.random() < retreatChance) {
        // Small delay before retreating (let attack animation play)
        setTimeout(() => {
          if (this.currentState === AIState.ATTACK) {
            this.transitionTo(AIState.RETREAT);
          }
        }, 200);
      } else {
        // Go back to chasing
        setTimeout(() => {
          if (this.currentState === AIState.ATTACK) {
            this.transitionTo(AIState.CHASE);
          }
        }, 100);
      }
    }
  }
  
  /**
   * RETREAT state behavior - move away from the player
   */
  private executeRetreatBehavior(): void {
    const playerX = this.player.getSprite().x;
    const enemyX = this.enemy.getX();
    
    // Move away from the player
    if (playerX < enemyX) {
      this.enemy.startMovingRight();
    } else {
      this.enemy.startMovingLeft();
    }
    
    // Keep facing the player while retreating
    this.facePlayer();
  }
  
  /**
   * Transition to a new state
   */
  private transitionTo(newState: AIState): void {
    // Exit current state
    this.enemy.stopMoving();
    this.isWaitingToAttack = false;
    
    // Enter new state
    this.currentState = newState;
    this.stateTimer = 0;
  }
  
  /**
   * Make the enemy face toward the player
   */
  private facePlayer(): void {
    const playerX = this.player.getSprite().x;
    const enemyX = this.enemy.getX();
    
    // Face right if player is to the right, left otherwise
    this.enemy.setFacing(playerX > enemyX);
  }
  
  /**
   * Get the current AI state (for debugging/UI)
   */
  public getCurrentState(): AIState {
    return this.currentState;
  }
  
  /**
   * Get state name as string (for debugging)
   */
  public getStateName(): string {
    switch (this.currentState) {
      case AIState.IDLE: return 'IDLE';
      case AIState.CHASE: return 'CHASE';
      case AIState.ATTACK: return 'ATTACK';
      case AIState.RETREAT: return 'RETREAT';
      default: return 'UNKNOWN';
    }
  }
  
  /**
   * Force a specific state (useful for testing or scripted sequences)
   */
  public forceState(state: AIState): void {
    this.transitionTo(state);
  }
  
  /**
   * Set attack cooldown (allows difficulty adjustment)
   */
  public setAttackCooldown(cooldownMs: number): void {
    this.attackCooldown = cooldownMs;
  }
}

export default EnemyAIController;
