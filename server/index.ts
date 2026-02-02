import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { generateText, tool } from 'ai';
import { z } from 'zod';

config();

const app = express();

app.use(cors());
app.use(express.json());

// Define the enemy AI tools
const enemyTools = {
  punch: tool({
    description: 'Throw a punch attack at the player. Best used when close to the player.',
    inputSchema: z.object({}),
    execute: async () => ({ action: 'punch', success: true }),
  }),

  sidekick: tool({
    description: 'Perform a sidekick attack. More powerful than punch, good range.',
    inputSchema: z.object({}),
    execute: async () => ({ action: 'sidekick', success: true }),
  }),

  jump: tool({
    description: 'Jump into the air. Use to dodge attacks or reach elevated positions.',
    inputSchema: z.object({}),
    execute: async () => ({ action: 'jump', success: true }),
  }),

  moveLeft: tool({
    description: 'Move left by a specific number of pixels. Use the distance to player to determine how far to move.',
    inputSchema: z.object({
      pixels: z.number().describe('Number of pixels to move left (e.g., 50, 100, 200)'),
    }),
    execute: async ({ pixels }) => ({ action: 'moveLeft', pixels, success: true }),
  }),

  moveRight: tool({
    description: 'Move right by a specific number of pixels. Use the distance to player to determine how far to move.',
    inputSchema: z.object({
      pixels: z.number().describe('Number of pixels to move right (e.g., 50, 100, 200)'),
    }),
    execute: async ({ pixels }) => ({ action: 'moveRight', pixels, success: true }),
  }),

  stopMoving: tool({
    description: 'Stop moving and stand still.',
    inputSchema: z.object({}),
    execute: async () => ({ action: 'stopMoving', success: true }),
  }),

  wait: tool({
    description: 'Do nothing this turn. Use to observe the player or when no action is needed.',
    inputSchema: z.object({}),
    execute: async () => ({ action: 'wait', success: true }),
  }),
};

// Format collision objects for the prompt
function formatCollisionObjects(objects: any[]): string {
  if (!objects || objects.length === 0) return 'None';
  return objects
    .map(obj => `  - ${obj.type}: x=${obj.x}, y=${obj.y}, width=${obj.width}, height=${obj.height}`)
    .join('\n');
}

// Endpoint for AI to decide enemy action
app.post('/api/enemy-action', async (req, res) => {
  try {
    const { gameState } = req.body;

    // Build a prompt with the current game state
    const systemPrompt = `You are controlling an enemy fighter in a 2D side-scrolling fighting game.
Your goal is to defeat the player by attacking them while avoiding their attacks.

COORDINATE SYSTEM:
- X increases to the right, Y increases downward
- Lower Y values mean higher positions (platforms above have lower Y)

CURRENT GAME STATE:

Enemy (you):
- Position: (${gameState.enemyX}, ${gameState.enemyY})
- Height: ${gameState.enemyHeight} pixels
- Health: ${gameState.enemyHealth}/${gameState.enemyMaxHealth}
- Facing: ${gameState.enemyFacingRight ? 'right' : 'left'}
- Can attack: ${gameState.canAttack}
- Can jump: ${gameState.canJump}

Player (target):
- Position: (${gameState.playerX}, ${gameState.playerY})
- Health: ${gameState.playerHealth}/${gameState.playerMaxHealth}
- Relative position: ${gameState.playerX > gameState.enemyX ? 'right' : 'left'} of you

Spatial:
- Horizontal distance to player: ${gameState.distance} pixels
- Vertical difference: ${Math.abs(gameState.playerY - gameState.enemyY)} pixels (player is ${gameState.playerY < gameState.enemyY ? 'above' : 'below or same level'})

Collision Objects (platforms, floors, obstacles):
${formatCollisionObjects(gameState.collisionObjects)}

STRATEGY GUIDELINES:
- If close (distance < 150), attack with punch or sidekick
- If far, move toward the player
- If player is on a platform above you, jump to reach them
- Use jump + sidekick for aerial attacks
- Face the player before attacking

Choose the single best action for this moment.`;

    const result = await generateText({
      model: 'openai/gpt-4o',
      system: systemPrompt,
      prompt: 'What action should the enemy take?',
      tools: enemyTools,
      toolChoice: 'required', // Force the model to use a tool
    });

    // Extract the tool call
    const toolCall = result.toolCalls?.[0];
    
    if (toolCall) {
      // Cast to access input property (contains the tool parameters)
      const toolInput = (toolCall as any).input ?? {};
      
      console.log(`[AI Server] Tool called: ${toolCall.toolName}`, toolInput);
      
      res.json({ 
        action: toolCall.toolName,
        params: toolInput, // Include any parameters (like pixels for moveLeft/moveRight)
        success: true 
      });
    } else {
      console.log('[AI Server] No tool called, defaulting to wait');
      res.json({ 
        action: 'wait', 
        params: {},
        success: true 
      });
    }
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to get AI decision', action: 'wait' });
  }
});

// Keep the original endpoint for other uses
app.post('/generate-response', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await generateText({
      model: 'google/gemini-2.5-flash',
      prompt: prompt,
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});