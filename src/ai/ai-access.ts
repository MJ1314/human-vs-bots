/**
 * AI Access Module
 * =================
 * Provides functions to communicate with the AI server
 * and get enemy action decisions.
 */

/** A collision object in the game world (platform, floor, etc.) */
export interface CollisionObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'platform' | 'floor' | 'wall' | 'obstacle';
}

/** Game state sent to the AI for decision making */
export interface GameState {
  // Enemy state
  enemyX: number;
  enemyY: number;
  enemyHeight: number;
  enemyHealth: number;
  enemyMaxHealth: number;
  enemyFacingRight: boolean;
  canAttack: boolean;
  canJump: boolean;
  
  // Player state
  playerX: number;
  playerY: number;
  playerHealth: number;
  playerMaxHealth: number;
  
  // Spatial relationship
  distance: number;
  
  // World objects - platforms, floors, etc.
  collisionObjects: CollisionObject[];
}

/** Available enemy actions that the AI can choose */
export type EnemyActionType = 
  | 'punch' 
  | 'sidekick' 
  | 'jump' 
  | 'moveLeft' 
  | 'moveRight' 
  | 'stopMoving' 
  | 'wait';

/** Parameters for movement actions */
export interface MoveParams {
  pixels: number;
}

/** The AI decision with action and optional parameters */
export interface EnemyAction {
  action: EnemyActionType;
  params?: MoveParams;
}

/** Response from the AI server */
interface AIResponse {
  action: EnemyActionType;
  params?: MoveParams;
  success: boolean;
  error?: string;
}

const API_BASE_URL = 'http://localhost:3001';

/**
 * Get an AI decision for the enemy's next action
 * @param gameState - Current state of the game
 * @returns The action the AI decided to take, with any parameters
 */
export const getEnemyAIAction = async (gameState: GameState): Promise<EnemyAction> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/enemy-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameState }),
    });

    if (!response.ok) {
      console.error('AI server returned error:', response.status);
      return { action: 'wait' };
    }

    const data: AIResponse = await response.json();
    return { 
      action: data.action,
      params: data.params,
    };
  } catch (error) {
    console.error('Failed to get AI action:', error);
    return { action: 'wait' }; // Default to waiting if AI fails
  }
};

/**
 * Generate text using AI (general purpose)
 * @param prompt - The prompt to send to the AI
 * @returns The generated text
 */
export const generateTextWithAI = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Failed to generate text:', error);
    throw error;
  }
};
