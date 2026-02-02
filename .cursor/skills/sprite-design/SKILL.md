---
name: sprite-design
description: "IMAGE GENERATION SKILL: Creates 2D animated character sprites matching the project's art style. Use when creating new character animations, sprite sheets, game assets, or when the user asks for character designs, animation frames, or new sprites."
---

# 2D Sprite Image Generation

> [!IMPORTANT]
> **THIS IS AN IMAGE GENERATION SKILL**
>
> This skill is used to **generate actual images** of character sprites. Use the prompt templates below to create consistent, game-ready sprite artwork directly.

Generate **actual sprite images** matching this project's established art style using the prompt templates below.

---

## CRITICAL: Juan (Main Character) Reference

> [!CAUTION]
> **If generating sprites for JUAN (the main character), you MUST study this reference image first:**
>
> **`src/assets/juan/animations/juan_idle.png`**
>
> This is the DEFINITIVE reference for Juan's appearance. All Juan sprites must match this exactly.

---

## Art Style Reference

**Style examples are located in:** `src/assets/juan/animations/`

The project uses a **semi-realistic cartoon style** with these characteristics:

| Element          | Specification                                               |
| ---------------- | ----------------------------------------------------------- |
| **Line work**    | Clean, defined outlines with subtle variation in weight     |
| **Shading**      | Soft cel-shading with subtle gradients, no harsh shadows    |
| **Proportions**  | Chibi-influenced (larger head, ~4-5 head heights tall)      |
| **Colors**       | Muted, realistic palette with earth tones                   |
| **Detail level** | High detail on clothing folds, accessories, facial features |
| **Background**   | Transparent (PNG with alpha channel)                        |

## Prompt Template

Use this base structure for all character sprite prompts:

```
[ACTION DESCRIPTION], 2D game character sprite sheet, horizontal strip layout,
[NUMBER] animation frames showing [ANIMATION SEQUENCE],
semi-realistic cartoon style, clean black outlines, soft cel-shading,
chibi proportions (4-5 heads tall), [CHARACTER DESCRIPTION],
transparent background, game asset, high detail on clothing and accessories,
consistent character design across all frames, side view facing right
```

## Animation Prompt Examples

### Sidekick Attack (6 frames)

```
Character performing sidekick attack, 2D game character sprite sheet, horizontal strip layout,
6 animation frames showing fighting stance to leg raise to full kick extension to recovery,
semi-realistic cartoon style, clean black outlines, soft cel-shading,
chibi proportions (4-5 heads tall), young male character wearing black baseball cap with logo,
olive green jacket over teal shirt, blue jeans, brown sneakers,
transparent background, game asset, high detail on clothing and accessories,
consistent character design across all frames, side view facing right
```

### Idle Animation (4-6 frames)

```
Character idle breathing animation, 2D game character sprite sheet, horizontal strip layout,
4 animation frames showing subtle body movement and breathing,
semi-realistic cartoon style, clean black outlines, soft cel-shading,
chibi proportions (4-5 heads tall), [CHARACTER DESCRIPTION],
transparent background, game asset, relaxed fighting stance,
consistent character design across all frames, side view facing right
```

### Run Cycle (6-8 frames)

```
Character running animation, 2D game character sprite sheet, horizontal strip layout,
8 animation frames showing complete run cycle with contact-passing-up-down phases,
semi-realistic cartoon style, clean black outlines, soft cel-shading,
chibi proportions (4-5 heads tall), [CHARACTER DESCRIPTION],
transparent background, game asset, dynamic motion with clothing movement,
consistent character design across all frames, side view facing right
```

### Jump Animation (4-6 frames)

```
Character jump animation, 2D game character sprite sheet, horizontal strip layout,
5 animation frames showing crouch anticipation to takeoff to apex to landing,
semi-realistic cartoon style, clean black outlines, soft cel-shading,
chibi proportions (4-5 heads tall), [CHARACTER DESCRIPTION],
transparent background, game asset, exaggerated squash and stretch,
consistent character design across all frames, side view facing right
```

### Punch Attack (4-6 frames)

```
Character punch attack animation, 2D game character sprite sheet, horizontal strip layout,
5 animation frames showing wind-up to punch extension to recovery,
semi-realistic cartoon style, clean black outlines, soft cel-shading,
chibi proportions (4-5 heads tall), [CHARACTER DESCRIPTION],
transparent background, game asset, powerful impact pose,
consistent character design across all frames, side view facing right
```

### Hurt/Damage (3-4 frames)

```
Character taking damage reaction, 2D game character sprite sheet, horizontal strip layout,
3 animation frames showing impact to recoil to recovery stance,
semi-realistic cartoon style, clean black outlines, soft cel-shading,
chibi proportions (4-5 heads tall), [CHARACTER DESCRIPTION],
transparent background, game asset, expressive pained face,
consistent character design across all frames, side view facing right
```

## Character Description Template

Replace `[CHARACTER DESCRIPTION]` with consistent details:

```
[age/build] [gender] character wearing [headwear],
[top clothing] over [inner clothing], [bottom clothing], [footwear],
[hair color and style], [notable accessories]
```

**Example (Juan - main character):**

```
young male character wearing black baseball cap with white logo,
olive green jacket over teal shirt, blue jeans, brown sneakers,
dark brown hair visible under cap, determined expression
```

## Style Modifiers

Add these to fine-tune output:

| Modifier                       | When to Use                |
| ------------------------------ | -------------------------- |
| `action lines, speed blur`     | Fast attacks, dashes       |
| `impact effects, motion smear` | Powerful hits              |
| `anticipation squash`          | Jump/attack wind-ups       |
| `exaggerated pose`             | Key action frames          |
| `subtle movement`              | Idle, breathing animations |

## Generated Image Specifications

For game engine compatibility, request these specs when generating images:

| Spec       | Recommended Value                               |
| ---------- | ----------------------------------------------- |
| Format     | PNG with transparency                           |
| Frame size | 128x128 to 256x256 px per frame                 |
| Layout     | Horizontal strip (all frames in one row)        |
| Spacing    | No padding between frames OR consistent padding |
| Resolution | 2x for retina/high-DPI support                  |

## Workflow

1. **Define the animation**: What action? How many frames?
2. **Build the prompt**: Use template + character description + modifiers
3. **Generate the image**: Create the sprite sheet image using the constructed prompt
4. **Post-process if needed**: Adjust spacing, ensure consistent frame sizes
5. **Integrate**: Load the generated sprite sheet image into game engine

## Style Reference Images

Reference sprites are located in `src/assets/juan/animations/`.

### Juan (Main Character) - CRITICAL REFERENCE

**When generating sprites for Juan, you MUST reference this image:**

`src/assets/juan/animations/juan_idle.png`

This is the definitive reference for Juan's appearance. Study this image carefully to match:

- **Outfit**: Olive green jacket, teal shirt with logo, blue jeans, brown/gray sneakers
- **Hat**: Black baseball cap with white geometric logo
- **Proportions**: Chibi-style (~4-5 heads tall), slightly larger head
- **Art style**: Clean outlines, soft cel-shading, semi-realistic cartoon
- **Color palette**: Muted earth tones with teal accent

All new Juan sprites must maintain visual consistency with this reference.

### Other References

- `src/assets/juan/animations/juan_sidekick.png` - Action pose reference
