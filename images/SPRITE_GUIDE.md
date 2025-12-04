# 🎨 Sprite Guide - Smooth Runescape Cartoon Style

## Style: Polished Cartoon (NOT Pixel Art!)

Think: **Old School Runescape HD** or **RS3** style
- Smooth, clean edges (anti-aliased)
- Isometric 3D look
- Flat/cel shading
- Cartoon proportions
- Professional polish

## Tile Sprites (80x80px)

### Tools Recommendation:

**Best Options:**
1. **Blender** (FREE) - 3D modeling → render to 2D sprites
2. **Inkscape** (FREE) - Vector art, smooth cartoon style  
3. **Figma** (FREE) - Modern vector tool, browser-based
4. **Krita** (FREE) - Digital painting with smooth brushes

**Avoid:** Aseprite, Piskel, GraphicsGale (these are for pixel art)

### Art Style Guidelines:

✅ **DO:**
- Smooth anti-aliased edges
- Isometric perspective (26.6° angle)
- 2-3 tone cel shading
- Clean 2-3px outlines
- Vibrant, saturated colors
- Simple low-poly shapes

❌ **DON'T:**
- Pixel-by-pixel placement
- Visible pixels/jagged edges
- Dithering
- Over-detailed textures
- Realistic rendering

### Required Sprites:

**Soil States:**
- `soil-empty.png` - Tilled brown soil patch
- `soil-watered.png` - Dark wet soil

**Obstacles:**
- `soil-locked-weed.png` - Green overgrown weeds
- `soil-locked-stone.png` - Gray rocky area
- `soil-locked-tree.png` - Tree stump or small tree

**Plant Growth (5 stages):**
- `plant-seedling.png` - Tiny sprout
- `plant-sprout.png` - Small leaves
- `plant-vegetative.png` - Bushy plant
- `plant-flowering.png` - Visible buds
- `plant-ready.png` - Full mature plant

**Effects:**
- `plant-ready-glow.png` - Golden glow overlay

### Color Palette:
```
Soil: #8B7355, #6B5544, #4A3520
Plants: #4CAF50, #388E3C, #2E7D32  
Weeds: #5C8F2F, #4A7025
Stones: #808080, #606060, #404040
Wood: #8B4513, #6B3410
Outline: #2C1810 (dark brown)
Highlights: Add 20% brightness
Shadows: Reduce 30% brightness
```

## Method 1: Blender (3D → 2D)

### Setup:
1. New Blender file
2. Delete default cube
3. Camera → Orthographic
4. Rotate camera 45° on Z, tilt down ~30°
5. Set render resolution: 80x80px

### Modeling:
1. Keep it LOW POLY (like Runescape)
2. Use simple shapes (cubes, cylinders)
3. Don't worry about detail

### Shading:
1. Switch to Shading workspace
2. Add material → Shader Editor
3. Use Toon BSDF shader
4. Set 2-3 color bands

### Rendering:
1. Transparent background
2. Render image
3. Save as PNG
4. Batch render all states

### Example - Soil Tile:
```
1. Add cube, scale flat (dirt clod)
2. Add material: Brown toon shader
3. Position camera isometric view
4. Render → soil-empty.png
```

## Method 2: Inkscape (Vector Art)

### Setup:
1. New document: 80x80px
2. View → Display Mode → Outline
3. Enable isometric grid (optional)

### Drawing:
1. Use Bezier tool (pen)
2. Draw isometric shapes
3. Fill with base color
4. Duplicate for highlights/shadows

### Shading (Cel Style):
1. Base shape: Mid tone
2. Add highlight shape on top (lighter)
3. Add shadow shape below (darker)
4. Use 2-3 colors total per object

### Outlines:
1. Duplicate main shape
2. Add 2-3px stroke
3. Set to dark brown (#2C1810)
4. Move to back layer

### Export:
1. File → Export PNG
2. Set 80x80px
3. Check transparent background

## Method 3: Krita (Digital Painting)

### Setup:
1. New image: 80x80px
2. **Enable anti-aliasing** (crucial!)
3. Use pixel grid for reference

### Brushes:
1. Use Basic-5 or Ink brushes
2. **NO pixel brush**
3. Keep edges smooth

### Painting:
1. Sketch isometric shape
2. Fill base color
3. Add highlights (lighter shade)
4. Add shadows (darker shade)
5. Add outline stroke

### Tips:
- Zoom out frequently
- Keep it simple
- Use reference images
- 2-3 colors per object

## Style Examples:

### Good Reference Images:
- Old School Runescape farming patches
- RS3 allotment plots
- Hay Day farm tiles
- Clash of Clans buildings
- Any isometric mobile farm game

### Visual Style Breakdown:

**Soil Patch:**
```
Top surface: Light brown
Front face: Mid brown  
Side face: Dark brown
Outline: Very dark brown
Details: Few darker specks
```

**Cannabis Plant (ready):**
```
Leaves: Bright green
Stems: Dark green
Buds: Green with white highlights
Glow: Golden overlay
Outline: Dark green/brown
```

## Quick Reference Table:

| Sprite | Main Color | Highlight | Shadow | Outline |
|--------|-----------|-----------|---------|---------|
| Empty Soil | #8B7355 | #A68A6A | #6B5544 | #2C1810 |
| Wet Soil | #6B5544 | #8B7355 | #4A3520 | #2C1810 |
| Seedling | #7FBC8C | #9FD8A8 | #5C8F2F | #2E4A1F |
| Ready Plant | #4CAF50 | #66BB6A | #388E3C | #1B5E20 |

## Export Settings:

- **Format**: PNG
- **Size**: 80x80px
- **Background**: Transparent
- **Quality**: Maximum
- **Anti-aliasing**: ON (crucial!)

## Learning Resources:

**Blender:**
- YouTube: "Blender isometric rendering tutorial"
- Search: "Blender toon shader"

**Inkscape:**  
- YouTube: "Inkscape isometric tutorial"
- Search: "Inkscape game assets"

**General:**
- Study actual Runescape sprites
- Look at mobile farming games
- Practice with simple shapes first

## Fallback System:

Game works now with emojis/gradients!
- Add sprites one at a time
- No rush to complete everything
- Mix sprites and emojis while building

Start with `soil-empty.png` - it's the most visible! 🌿
