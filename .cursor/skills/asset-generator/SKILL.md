---
name: asset-generator
description: "IMAGE GENERATION SKILL: Creates 2D game props and collision objects matching the project's cartoon tech-noir style. Use when creating platforms, floors, stairs, furniture, crates, obstacles, interactive objects, or any environmental props the character can collide with or interact with."
---

# 2D Game Asset / Prop Generation

> [!IMPORTANT]
> **THIS IS AN IMAGE GENERATION SKILL**
>
> This skill generates **actual images** of game props, platforms, and collision objects. Use the prompt templates below to create consistent, game-ready assets.

Generate **prop and object images** matching this project's cartoon tech-noir style.

---

## Style References

> [!CAUTION]
> **Before generating ANY asset, review these references:**
>
> - **Background style:** `.cursor/skills/background-designer/reference-style.png`
> - **Character style:** `src/assets/juan/animations/juan_idle.png`
>
> Props must visually match both the environment AND character art styles.

---

## Asset Specifications

| Spec               | Value                                    |
| ------------------ | ---------------------------------------- |
| **Format**         | PNG with transparency (alpha channel)    |
| **Game canvas**    | 1280x720 (design props to scale)         |
| **Character ref**  | ~128-200px tall (chibi proportions)      |
| **Color palette**  | Blue/purple/cyan with tech accent lights |
| **View angle**     | Side-scrolling (slight 3/4 for depth)    |

---

## Art Style Requirements

| Element           | Specification                                          |
| ----------------- | ------------------------------------------------------ |
| **Line work**     | Clean defined outlines, cartoon style                  |
| **Shading**       | Soft cel-shading, subtle gradients                     |
| **Colors**        | Tech-noir palette (blues, purples, metallic grays)     |
| **Details**       | High detail on tech elements, lights, panels           |
| **Lighting**      | Ambient glow, neon accents on edges/lights             |
| **Materials**     | Metal, glass, plastic - industrial/futuristic look     |
| **Background**    | Transparent (PNG alpha)                                |

---

## Base Prompt Template

```
2D game prop asset, [OBJECT DESCRIPTION], side-scrolling game view,
cartoon tech-noir style, clean outlines, soft cel-shading,
blue and purple color palette with [ACCENT COLOR] accent lights,
metallic and industrial materials, high detail,
transparent background, game-ready asset, isolated object,
[SIZE REFERENCE relative to 200px character]
```

---

## Platform & Floor Assets

### Metal Floor Tile (Tileable)

```
2D game prop asset, futuristic metal floor tile section,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, metallic gray with blue tint,
industrial grated pattern with subtle glow lines,
seamlessly tileable horizontally, 256x64 pixels,
transparent background, game-ready platform asset
```

### Floating Platform

```
2D game prop asset, futuristic floating platform,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, dark metal with cyan edge glow,
anti-gravity hover effect with light underneath,
transparent background, game-ready asset,
approximately 300x80 pixels, suitable for character to stand on
```

### Industrial Walkway

```
2D game prop asset, industrial metal walkway with railings,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, gunmetal gray with yellow warning stripes,
grated floor texture, pipe railings on one side,
transparent background, game-ready asset,
tileable section approximately 200x100 pixels
```

---

## Stairs & Ramps

### Metal Staircase

```
2D game prop asset, industrial metal staircase 4-5 steps,
side-scrolling game view at slight angle, cartoon tech-noir style,
clean outlines, soft cel-shading, dark metal with subtle blue lighting,
open grate steps, side railing with tech details,
transparent background, game-ready asset,
approximately 300x250 pixels, each step ~50px rise
```

### Tech Ramp / Incline

```
2D game prop asset, futuristic inclined ramp surface,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, smooth metal with grip texture,
glowing guide lights along edges, 30-degree angle,
transparent background, game-ready asset,
approximately 400x200 pixels
```

### Ladder

```
2D game prop asset, industrial metal ladder,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, dark metal with worn edges,
6-8 rungs visible, mounting brackets at top and bottom,
transparent background, game-ready asset,
approximately 80x400 pixels vertical orientation
```

---

## Furniture & Equipment

### Office Chair (Tech Style)

```
2D game prop asset, futuristic ergonomic office chair,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, dark gray with cyan accent lights,
sleek modern design, swivel base with wheels,
transparent background, game-ready asset,
approximately 100x150 pixels, obstacle height for character
```

### Computer Terminal / Desk

```
2D game prop asset, futuristic computer terminal workstation,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, dark metal desk with glowing monitors,
holographic display elements, keyboard and equipment,
transparent background, game-ready asset,
approximately 250x180 pixels
```

### Server Rack

```
2D game prop asset, tall data server rack cabinet,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, dark metal frame,
blinking green and red LED lights, cable management,
transparent background, game-ready asset,
approximately 150x350 pixels, taller than character
```

### Control Console

```
2D game prop asset, industrial control console panel,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, angled surface with buttons and screens,
glowing displays showing data, lever and switches,
transparent background, game-ready asset,
approximately 200x120 pixels, waist-height obstacle
```

---

## Obstacles & Barriers

### Tech Crate (Small)

```
2D game prop asset, futuristic cargo crate small size,
side-scrolling game view with slight 3/4 angle, cartoon tech-noir style,
clean outlines, soft cel-shading, dark metal with blue markings,
reinforced corners, digital label panel,
transparent background, game-ready asset,
approximately 80x80 pixels, jumpable obstacle
```

### Tech Crate (Large)

```
2D game prop asset, futuristic cargo crate large size,
side-scrolling game view with slight 3/4 angle, cartoon tech-noir style,
clean outlines, soft cel-shading, dark metal with orange hazard stripes,
heavy-duty construction, shipping labels and barcodes,
transparent background, game-ready asset,
approximately 150x150 pixels, blocks character path
```

### Barrel / Cylinder Container

```
2D game prop asset, industrial storage barrel cylinder,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, metallic with hazard symbols,
ribbed construction, sealed top,
transparent background, game-ready asset,
approximately 80x120 pixels
```

### Energy Barrier (Inactive)

```
2D game prop asset, energy barrier emitter posts,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, two metal posts with tech details,
inactive state with dim lights, no energy field between,
transparent background, game-ready asset,
approximately 200x250 pixels gap for character passage
```

### Concrete Barrier / Jersey Barrier

```
2D game prop asset, concrete traffic barrier futuristic style,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, gray concrete with reflective strips,
weathered industrial look, warning markings,
transparent background, game-ready asset,
approximately 150x80 pixels, waist-height cover
```

---

## Interactive Objects

### Sliding Door (Closed)

```
2D game prop asset, futuristic sliding door closed state,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, heavy metal double doors,
glowing seam in center, access panel on side with red light,
transparent background, game-ready asset,
approximately 200x300 pixels, blocks passage
```

### Sliding Door (Open)

```
2D game prop asset, futuristic sliding door open state,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, doors recessed into walls,
doorframe with green access light, passage clear,
transparent background, game-ready asset,
approximately 200x300 pixels, allows passage
```

### Switch / Button Panel

```
2D game prop asset, wall-mounted switch control panel,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, small metal panel,
large button with glow, status indicator lights,
transparent background, game-ready asset,
approximately 60x80 pixels, interaction point
```

### Elevator Platform

```
2D game prop asset, industrial elevator lift platform,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, heavy metal platform,
safety railings, control panel, lift mechanism visible,
transparent background, game-ready asset,
approximately 250x100 pixels platform surface
```

---

## Environmental Props (Non-Collision Decorative)

### Pipes (Horizontal Bundle)

```
2D game prop asset, industrial pipe bundle horizontal,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, various diameter pipes,
metallic with colored markings, valve and joint details,
transparent background, game-ready asset,
approximately 400x60 pixels, background decoration
```

### Ventilation Duct

```
2D game prop asset, wall-mounted ventilation duct grate,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, metal frame with slats,
subtle interior glow suggesting airflow,
transparent background, game-ready asset,
approximately 120x80 pixels
```

### Wall Monitor / Screen

```
2D game prop asset, wall-mounted display screen,
side-scrolling game view, cartoon tech-noir style,
clean outlines, soft cel-shading, thin frame monitor,
glowing screen with data visualization graphics,
transparent background, game-ready asset,
approximately 150x100 pixels, wall decoration
```

### Ceiling Light Fixture

```
2D game prop asset, industrial ceiling light panel,
top-down angled view for side-scroller, cartoon tech-noir style,
clean outlines, soft cel-shading, rectangular fixture,
bright white-blue glow with light bloom effect,
transparent background, game-ready asset,
approximately 200x40 pixels
```

---

## Size Reference Guide

Design props relative to the player character (~200px tall):

| Object Type        | Approximate Size | Collision Notes               |
| ------------------ | ---------------- | ----------------------------- |
| Small crate        | 80x80 px         | Jumpable                      |
| Large crate        | 150x150 px       | Blocks path, climbable        |
| Chair              | 100x150 px       | Partial cover                 |
| Desk/Console       | 250x180 px       | Full cover, climbable         |
| Floor tile         | 256x64 px        | Platform, tileable            |
| Platform           | 300x80 px        | Jumpable surface              |
| Door               | 200x300 px       | Full barrier when closed      |
| Stairs             | 300x250 px       | Walkable incline              |
| Server rack        | 150x350 px       | Tall obstacle, no climb       |
| Barrel             | 80x120 px        | Partial cover, movable        |

---

## Collision Shape Guidance

When implementing these assets, use these collision shapes:

| Asset Type       | Collision Shape    | Notes                        |
| ---------------- | ------------------ | ---------------------------- |
| Crates/Boxes     | Rectangle          | Match visual bounds          |
| Barrels          | Rectangle          | Slightly inset from edges    |
| Platforms        | Rectangle          | Top surface only for walk-on |
| Stairs           | Polygon/Slopes     | Step-by-step or smooth ramp  |
| Chairs           | Rectangle          | Lower portion only           |
| Desks            | Rectangle          | Full surface area            |
| Doors (closed)   | Rectangle          | Full door area               |
| Doors (open)     | None or thin edges | Allow passage                |
| Railings         | Thin rectangles    | Block but don't obstruct     |

---

## Color Palette Reference

| Material Type    | Base Color | Accent           |
| ---------------- | ---------- | ---------------- |
| Metal (standard) | #3a3a4a    | Blue edge glow   |
| Metal (dark)     | #1a1a2e    | Cyan highlights  |
| Warning/Hazard   | #ff8c00    | Yellow stripes   |
| Active/Powered   | #00ff88    | Green glow       |
| Inactive/Off     | #ff4444    | Red dim          |
| Glass/Screen     | #00fff5    | Cyan emission    |
| Concrete         | #5a5a6a    | Minimal          |

---

## Workflow

1. **Identify asset type**: Platform, obstacle, interactive, decorative?
2. **Determine size**: Reference character height (~200px)
3. **Build prompt**: Use appropriate template + modifiers
4. **Generate image**: Create the asset with transparency
5. **Define collision**: Note collision shape for implementation
6. **Integrate**: Save to `src/assets/props/` and load in game

---

## File Organization

```
src/assets/props/
├── platforms/
│   ├── floor-tile.png
│   ├── floating-platform.png
│   └── walkway.png
├── stairs/
│   ├── metal-stairs.png
│   ├── ramp.png
│   └── ladder.png
├── obstacles/
│   ├── crate-small.png
│   ├── crate-large.png
│   ├── barrel.png
│   └── barrier.png
├── furniture/
│   ├── chair.png
│   ├── desk-terminal.png
│   ├── server-rack.png
│   └── console.png
├── interactive/
│   ├── door-closed.png
│   ├── door-open.png
│   ├── switch-panel.png
│   └── elevator.png
└── decorative/
    ├── pipes.png
    ├── vent.png
    ├── wall-monitor.png
    └── ceiling-light.png
```

---

## Tileable Asset Notes

For tileable assets (floors, walkways):

- Ensure left and right edges align seamlessly
- Test by placing 3+ copies side by side
- Keep consistent lighting direction (top-left source)
- Match height/baseline across all platform tiles
