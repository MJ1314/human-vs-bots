Project: Juan's Jungle Adventure
Genre: 2D side-scrolling action-adventure platformer (like Mario)
Concept: Juan explores a jungle searching for lost treasure. Side-view perspective with running, jumping, and combat.
Tech Stack
Engine: Phaser 3 (v3.80.1)
Language: TypeScript
Build Tool: Vite
Physics: Arcade (simple AABB collision)
Current State
Basic skeleton complete
Player (green placeholder rectangle) can move (WASD/arrows) and jump (SPACE)
Ground and floating platforms with working collision
Scene flow: Boot → Preload → Menu → Game
Debug overlay showing FPS, position, velocity
Project Structure
src/
├── main.ts                    # Entry point
├── config/GameConfig.ts       # Phaser config (1280x720, physics settings)
├── scenes/
│   ├── BootScene.ts           # Initial bootstrap
│   ├── PreloadScene.ts        # Asset loading with progress bar
│   ├── MenuScene.ts           # Title screen
│   └── GameScene.ts           # Main gameplay (platforms, player, collisions)
├── entities/
│   └── Player.ts              # Player class (movement, jump, state machine)
├── systems/
│   └── InputManager.ts        # Keyboard input abstraction
├── types/
│   └── index.ts               # TypeScript type definitions
└── assets/juan/animations/    # Sprite sheets (juan_idle.png, juan_sidekick.png)
Key Patterns Used
Composition over inheritance for Player (wraps Phaser sprite)
Scene-based architecture (Phaser's native pattern)
Centralized input handling via InputManager
Generated textures for placeholder graphics
Next Steps (not yet implemented)
Load and animate Juan's sprite sheets
Add enemies
Create jungle tilemap levels
Implement combat system
Add collectibles and treasures