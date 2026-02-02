# Human vs Bots

A 2D side-scrolling action-adventure fighting game built with Phaser 3 and TypeScript.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Running the Game

Start the development server:

```bash
npm run dev
```

The game will be available at `http://localhost:5173` (or the port shown in your terminal).

### Opening the Browser in Cursor

To view the game interface in Cursor IDE:

1. Start the dev server with `npm run dev`
2. Press `Cmd+Shift+B` (Mac) or `Ctrl+Shift+B` (Windows/Linux) to open the built-in browser
3. Navigate to `http://localhost:5173`

## How to Play

### Player Controls (Juan)

| Key                 | Action                                             |
| ------------------- | -------------------------------------------------- |
| `A` / `←`           | Move left                                          |
| `D` / `→`           | Move right                                         |
| `W` / `↑` / `Space` | Jump (press again for double jump)                 |
| `C`                 | Punch (press twice quickly for uppercut combo)     |
| `X`                 | Kick (press twice quickly for sidekick combo)      |
| `V`                 | Uppercut (direct)                                  |
| `Z`                 | Sidekick (direct)                                  |
| `I`                 | Dodge                                              |
| `L`                 | Matrix-style dodge                                 |
| `U`                 | Counter-dodge (press during enemy attack warning!) |
| `Esc`               | Pause menu                                         |

### Combat Tips

- **Combo System**: Press `C` twice quickly to chain a punch into an uppercut. Press `X` twice for a kick into a sidekick.
- **Counter-Dodge**: When you see the red "!" warning above an enemy, press `U` to perform a counter-dodge. If timed correctly (within the 500ms warning window), you'll dodge the attack and take no damage!
- **Aerial Attacks**: Jump and attack for aerial moves.

### Enemy Controls (for testing)

| Key | Action           |
| --- | ---------------- |
| `G` | Enemy move left  |
| `J` | Enemy move right |
| `Y` | Enemy jump       |
| `U` | Enemy punch      |
| `K` | Enemy sidekick   |

> Note: The enemy is also controlled by AI, so these keys are mainly for testing purposes.

## Cursor AI Skills & Commands

This project includes custom AI skills and commands for Cursor IDE located in the `.cursor/` folder.

### Skills (`.cursor/skills/`)

Skills are specialized AI capabilities for generating game assets:

| Skill                   | Description                                                              |
| ----------------------- | ------------------------------------------------------------------------ |
| `juan-sprite-generator` | Creates sprite animations specifically for Juan (main character)         |
| `animation-designer`    | Creates 2D animated character sprites matching the project's art style   |
| `sprite-design`         | General sprite sheet creation for characters                             |
| `asset-generator`       | Creates 2D game props and collision objects (platforms, obstacles, etc.) |
| `background-designer`   | Creates 2D game backgrounds matching the cartoon tech-noir style         |

### Commands (`.cursor/commands/`)

| Command        | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| `game-context` | Provides full context about the game project structure and state |

### Using Skills

To use a skill, simply ask the AI to create assets and it will automatically use the appropriate skill. For example:

- "Create a new jump animation for Juan"
- "Design a new background for a factory level"
- "Create a power-up sprite"

## Tech Stack

- **Game Engine**: Phaser 3 (v3.80.1)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Physics**: Arcade Physics
