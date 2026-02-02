---
name: background-designer
description: "IMAGE GENERATION SKILL: Creates 2D game backgrounds matching the project's cartoon tech-noir style. Use when creating level backgrounds, environment art, scene backdrops, or when the user asks for background designs, environment assets, or new level art."
---

# 2D Background Image Generation

> [!IMPORTANT]
> **THIS IS AN IMAGE GENERATION SKILL**
>
> This skill is used to **generate actual images** of game backgrounds. Use the prompt templates below to create consistent, game-ready environment artwork directly.

Generate **actual background images** matching this project's established art style using the prompt templates below.

---

## CRITICAL: Style Reference

> [!CAUTION]
> **Before generating ANY background, you MUST study this reference image:**
>
> **`.cursor/skills/background-designer/reference-style.png`**
>
> This is the DEFINITIVE reference for the background art style. All backgrounds must match this aesthetic.

---

## Canvas Specifications

| Spec           | Value                          |
| -------------- | ------------------------------ |
| **Width**      | 1280 pixels                    |
| **Height**     | 720 pixels                     |
| **Aspect**     | 16:9 HD                        |
| **Format**     | PNG (or JPG for non-alpha)     |
| **Resolution** | 2x (2560x1440) for retina      |

---

## Art Style Reference

The project uses a **cartoon tech-noir style** with these characteristics:

| Element              | Specification                                                   |
| -------------------- | --------------------------------------------------------------- |
| **Color palette**    | Blue/cyan/purple dominant with accent lights (green, red, cyan) |
| **Lighting**         | Dramatic ambient glow, neon accents, reflective surfaces        |
| **Line work**        | Clean defined outlines, cartoon style                           |
| **Detail level**     | High detail on tech elements (servers, screens, cables)         |
| **Atmosphere**       | Tech-noir, cyberpunk-adjacent, mysterious data centers          |
| **Perspective**      | Side-scrolling view, slight depth for parallax layers           |
| **Floor treatment**  | Metallic/industrial with reflections                            |
| **Background depth** | Multi-layer capable (foreground, midground, background)         |

---

## Base Prompt Template

Use this structure for all background prompts:

```
2D game background, side-scrolling platformer view, 1280x720 resolution,
[ENVIRONMENT DESCRIPTION], cartoon tech-noir style,
blue and purple color palette with [ACCENT COLORS] accent lighting,
clean outlines, dramatic ambient lighting, neon glow effects,
reflective metallic floor, high detail on [KEY ELEMENTS],
suitable for action-adventure game, no characters,
[LAYER TYPE: single layer / parallax-ready with depth separation]
```

---

## Environment Prompt Examples

### Data Center / Server Room

```
2D game background, side-scrolling platformer view, 1280x720 resolution,
futuristic data center interior with towering server racks,
cartoon tech-noir style, blue and purple color palette with green and red blinking server lights,
clean outlines, dramatic ambient lighting, holographic displays showing code and data,
reflective metallic grated floor, high detail on server equipment cables and monitors,
suitable for action-adventure game, no characters,
single layer background
```

### Tech Corridor / Hallway

```
2D game background, side-scrolling platformer view, 1280x720 resolution,
sleek futuristic corridor with sliding doors and wall panels,
cartoon tech-noir style, blue and cyan color palette with white accent lighting,
clean outlines, dramatic ambient lighting, glowing floor strips,
reflective polished floor, high detail on door mechanisms and control panels,
suitable for action-adventure game, no characters,
parallax-ready with depth separation
```

### Control Room / Command Center

```
2D game background, side-scrolling platformer view, 1280x720 resolution,
high-tech control room with multiple holographic screens and consoles,
cartoon tech-noir style, deep blue and purple color palette with cyan hologram glow,
clean outlines, dramatic ambient lighting, floating UI elements,
reflective dark floor, high detail on control panels keyboards and displays,
suitable for action-adventure game, no characters,
single layer background
```

### Underground Lab / Research Facility

```
2D game background, side-scrolling platformer view, 1280x720 resolution,
secret underground laboratory with containment tubes and scientific equipment,
cartoon tech-noir style, dark blue and green color palette with yellow warning lights,
clean outlines, dramatic ambient lighting, glowing containment pods,
industrial concrete and metal floor, high detail on lab equipment and cables,
suitable for action-adventure game, no characters,
parallax-ready with depth separation
```

### Warehouse / Industrial Storage

```
2D game background, side-scrolling platformer view, 1280x720 resolution,
industrial warehouse with stacked crates and cargo containers,
cartoon tech-noir style, muted blue and orange color palette with dim overhead lights,
clean outlines, moody ambient lighting, dust particles in light beams,
concrete floor with painted markings, high detail on crates chains and machinery,
suitable for action-adventure game, no characters,
single layer background
```

### Rooftop / Urban Exterior

```
2D game background, side-scrolling platformer view, 1280x720 resolution,
nighttime city rooftop with distant skyline and antenna equipment,
cartoon tech-noir style, dark purple and pink color palette with city light glow,
clean outlines, neon sign reflections, starry sky background,
flat rooftop with vents and pipes, high detail on distant buildings and rooftop machinery,
suitable for action-adventure game, no characters,
parallax-ready with three depth layers
```

---

## Parallax Layer Templates

For parallax scrolling effects, generate separate layers:

### Background Layer (Slowest - Farthest)

```
2D game parallax background layer, 1280x720 resolution,
[DISTANT ELEMENTS: skyline, mountains, sky, distant buildings],
cartoon tech-noir style, heavily desaturated colors, atmospheric haze,
minimal detail, silhouette-like shapes, suitable for slow parallax scrolling,
[COLOR PALETTE]
```

### Midground Layer (Medium Speed)

```
2D game parallax midground layer, 1280x720 resolution,
[MID-DISTANCE ELEMENTS: secondary structures, background props],
cartoon tech-noir style, moderate detail and saturation,
clean outlines, ambient lighting effects,
suitable for medium parallax scrolling, [COLOR PALETTE]
```

### Foreground Layer (Fastest - Gameplay Layer)

```
2D game parallax foreground layer, 1280x720 resolution,
[CLOSE ELEMENTS: main platforms, interactive environment],
cartoon tech-noir style, full detail and saturation,
clean outlines, dramatic lighting, reflective surfaces,
primary gameplay layer, [COLOR PALETTE]
```

---

## Style Modifiers

Add these to fine-tune output:

| Modifier                              | When to Use                     |
| ------------------------------------- | ------------------------------- |
| `lens flare, light bloom`             | High-tech, dramatic scenes      |
| `volumetric lighting, god rays`       | Atmospheric, moody areas        |
| `rain effects, wet reflections`       | Outdoor or leak areas           |
| `steam, fog, particle effects`        | Industrial, mechanical areas    |
| `flickering lights, sparks`           | Damaged or unstable areas       |
| `warning signs, caution tape`         | Danger zones                    |
| `holographic advertisements`          | Urban, commercial areas         |
| `overgrown tech, vines on machinery`  | Abandoned facility              |

---

## Color Palette Reference

### Primary Palettes

| Environment Type    | Primary       | Secondary    | Accents              |
| ------------------- | ------------- | ------------ | -------------------- |
| Data Center         | Deep Blue     | Purple       | Green, Red, Cyan     |
| Control Room        | Navy Blue     | Cyan         | White, Yellow        |
| Lab                 | Dark Teal     | Green        | Yellow, Orange       |
| Warehouse           | Gray-Blue     | Orange       | Yellow, White        |
| Rooftop             | Deep Purple   | Pink         | Cyan, Magenta        |
| Corridor            | Blue-Gray     | White        | Cyan, Green          |

### Hex Reference (approximate)

| Color Name      | Hex Code  |
| --------------- | --------- |
| Deep Blue       | #1a1a2e   |
| Navy Blue       | #16213e   |
| Purple          | #4a148c   |
| Cyan Accent     | #00fff5   |
| Green Light     | #00ff88   |
| Red Light       | #ff4444   |
| Orange Warning  | #ff8c00   |
| Pink Neon       | #ff00ff   |

---

## Generated Image Specifications

| Spec            | Value                              |
| --------------- | ---------------------------------- |
| **Dimensions**  | 1280x720 (or 2560x1440 for 2x)     |
| **Format**      | PNG preferred, JPG acceptable      |
| **Color Space** | sRGB                               |
| **Bit Depth**   | 24-bit (32-bit if alpha needed)    |

---

## Workflow

1. **Identify environment type**: What location? What mood?
2. **Choose layer type**: Single background or parallax layers?
3. **Build the prompt**: Use template + environment details + modifiers
4. **Generate the image**: Create the background image using constructed prompt
5. **Review consistency**: Ensure style matches reference and other backgrounds
6. **Integrate**: Add to `src/assets/backgrounds/` folder

---

## File Organization

Save generated backgrounds to:

```
src/assets/backgrounds/
├── level-1/
│   ├── background.png
│   ├── midground.png (if parallax)
│   └── foreground.png (if parallax)
├── level-2/
│   └── ...
└── common/
    ├── sky-layer.png
    └── ...
```

---

## Integration Notes

- Backgrounds should complement character sprites without competing for attention
- Keep the floor/ground area clear for gameplay visibility
- Ensure sufficient contrast between background and foreground elements
- Test parallax layers at different scroll speeds before finalizing
