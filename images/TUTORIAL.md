# 🎨 Creating Runescape-Style Sprites - Step by Step

## Example: Empty Soil Tile (80x80px)

### Step 1: Set Up Canvas
1. Create 80x80px canvas
2. Fill with base brown: #8B7355
3. Zoom to 800% for pixel-perfect work

### Step 2: Add Isometric Shape
```
Top edge (slightly diagonal):
████████████████
   ████████████
     ████████
```

### Step 3: Add Shading (3 tones)
- Highlight: #A68A6A (top/left edges)
- Base: #8B7355 (main surface)
- Shadow: #654321 (bottom/right edges)

### Step 4: Add Texture
- Sprinkle darker pixels randomly
- Add small dirt clumps (2x2px darker squares)
- Keep it chunky, not realistic

### Step 5: Add Outline
- 1px dark brown (#3A2010) around entire tile
- Makes it pop against background

### Step 6: Export
- PNG format
- No compression
- Name: soil-empty.png

## Quick Reference Colors:

**Soil Tiles:**
```
Empty Soil: #8B7355, #A68A6A, #654321
Wet Soil: #5C4A3A, #4A3520, #3A2810
```

**Plants:**
```
Seedling: #7FBC8C, #5C8F2F, #3A5520
Sprout: #66B266, #4A8A4A, #2E5C2E
Vegetative: #52A852, #3A7A3A, #1F4D1F
Flowering: #4CAF50, #388E3C, #2E7D32
Ready: #4CAF50 + Gold sparkles #FFD700
```

**Obstacles:**
```
Weeds: #7FAA65, #5C8F2F, #4A7025
Stones: #808080, #606060, #404040
Trees: #8B4513 trunk, #228B22 leaves
```

## Free Tools:

1. **Piskel (easiest)**: https://www.piskelapp.com/
   - Browser-based, no install
   - Perfect for beginners
   - Has isometric guides

2. **Aseprite ($20)**: https://www.aseprite.org/
   - Professional pixel art tool
   - Worth the money

3. **GIMP (free)**: https://www.gimp.org/
   - Use pencil tool only
   - Disable anti-aliasing
   - Set grid to 1px

## Pro Tips:

- **Keep it chunky**: 3-4 pixel minimum for details
- **Limited palette**: Use same colors across all sprites
- **Consistent lighting**: Light always from top-left
- **Dither sparingly**: Just a few pixels for texture
- **Test in-game**: View at actual size (80x80) frequently

## Fallback System:

The game will work WITHOUT sprites:
- Emojis show if images missing
- Gradients provide background
- You can add sprites one at a time
- Mix sprites and emojis during development

## Sprite Priority (build in this order):

1. soil-empty.png (most visible)
2. plant-ready.png (important feedback)
3. soil-watered.png (common state)
4. Plant growth stages (1-4)
5. Obstacles (less important, emojis work)
6. Special effects (glow, particles)

Start simple, iterate often!
