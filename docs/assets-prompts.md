# Ready-To-Drop Asset Prompts

Use these prompts in ChatGPT webchat image generation. Ask for transparent PNG output where specified. Keep the canvas sizes exact so the files can replace procedural placeholders without layout changes.

Place finished files under:

```txt
apps/web/public/assets/
  buildings/
  terrain/
  residents/
  effects/
  ui/
```

## Global Style Lock

Use this paragraph at the top of every prompt:

```txt
Create crisp isometric pixel art for a dark AI observability dashboard called Agent Village. Style: readable 2D isometric pixel art, high-contrast night village lighting, no blur, no painterly shading, no text baked into the image, transparent background, consistent 2:1 isometric perspective, sharp edges, game asset sheet quality, cohesive palette with emerald status lights, amber warning lights, red alert lights, cobalt roofs, warm windows, charcoal stone, and small cyber-fantasy details.
```

## Buildings

### `apps/web/public/assets/buildings/command-center.png`

```txt
Create one transparent PNG, 512x384. Subject: Command Center building for an AI orchestrator. Isometric pixel-art headquarters with red roof, central antenna, glowing cyan command screen visible near the entrance, warm lit windows, stone base, tiny status beacons. No text. Leave empty transparent margin around the building.
```

### `apps/web/public/assets/buildings/chat-hall.png`

```txt
Create one transparent PNG, 512x384. Subject: Chat Hall for LLM conversation activity. Isometric pixel-art civic hall with cobalt blue roof, speech-bubble sign icon without letters, warm windows, small lanterns, tidy stone steps, subtle green running lights. No text.
```

### `apps/web/public/assets/buildings/code-forge.png`

```txt
Create one transparent PNG, 512x384. Subject: Code Forge for code generation and repo edits. Isometric pixel-art forge workshop with dark slate roof, orange furnace glow, small chimney, tool racks, glowing bracket-symbol ornament without readable text, sparks contained near the forge. No text.
```

### `apps/web/public/assets/buildings/token-mine.png`

```txt
Create one transparent PNG, 512x384. Subject: Token Mine for token usage and request volume. Isometric pixel-art mine hut with timber roof, crystal cart, blue token crystals, small rail track, cold glow, compact footprint. No text.
```

### `apps/web/public/assets/buildings/task-board.png`

```txt
Create one transparent PNG, 512x384. Subject: Task Board for queues and planning. Isometric pixel-art notice-board pavilion with pinned papers, amber queue lantern, little crates, readable paper shapes but no legible text. No text.
```

### `apps/web/public/assets/buildings/memory-archive.png`

```txt
Create one transparent PNG, 512x384. Subject: Memory Archive for embeddings, logs, and stored context. Isometric pixel-art stone archive with teal glowing data windows, stacked archive blocks, subtle blue particles, quiet library feeling. No text.
```

### `apps/web/public/assets/buildings/research-lab.png`

```txt
Create one transparent PNG, 512x384. Subject: Research Lab for browsing and experiments. Isometric pixel-art lab with purple glass dome, teal vials, small telescope, controlled magical-science glow, compact stone base. No text.
```

### `apps/web/public/assets/buildings/alert-tower.png`

```txt
Create one transparent PNG, 512x384. Subject: Alert Tower for errors and blocked agents. Isometric pixel-art watchtower with red beacon, dark metal braces, alert light, subtle smoke puff, no damage gore, no text.
```

## Terrain

### `apps/web/public/assets/terrain/grass-tile.png`

```txt
Create a seamless transparent PNG, 128x64. Subject: single 2:1 isometric grass tile for a night village dashboard. Pixel art, dark green grass, small flower pixels, transparent outside diamond, no text.
```

### `apps/web/public/assets/terrain/stone-road-tile.png`

```txt
Create a seamless transparent PNG, 128x64. Subject: single 2:1 isometric cobblestone road tile. Pixel art, charcoal gray stones with soft moonlit highlights, transparent outside diamond, no text.
```

### `apps/web/public/assets/terrain/water-edge-tile.png`

```txt
Create a transparent PNG, 128x64. Subject: single 2:1 isometric water edge tile with dark blue river water and grassy bank. Pixel art, subtle cyan highlights, transparent outside diamond, no text.
```

## Residents

### `apps/web/public/assets/residents/agent-resident-sheet.png`

```txt
Create a transparent PNG sprite sheet, 512x128. Eight 64x64 isometric pixel-art tiny AI agent residents in a row, each centered in its cell. Variants: coordinator, chat operator, coder, researcher, archivist, queue clerk, tool runner, scout. Cyber-fantasy village style, readable silhouettes, no text.
```

## Effects

### `apps/web/public/assets/effects/status-badges-sheet.png`

```txt
Create a transparent PNG sprite sheet, 320x64. Five 64x64 pixel-art status markers in a row: running emerald dot pulse, idle cobalt dot, waiting amber clock/dot, error red alert marker, offline gray dim marker. No letters or text.
```

### `apps/web/public/assets/effects/activity-particles-sheet.png`

```txt
Create a transparent PNG sprite sheet, 512x64. Eight 64x64 small pixel-art effect sprites: green sparkle, amber wait shimmer, red alert spark, blue data particle, orange forge spark, teal memory mote, white completion check sparkle without text, gray offline dust. No text.
```

## UI Brand

### `apps/web/public/assets/ui/agent-village-mark.png`

```txt
Create one transparent PNG, 256x256. Subject: compact pixel-art app icon for Agent Village. A tiny isometric command building with antenna, emerald status light, warm windows, dark outline, no letters, no text.
```

## Integration Notes

The current MVP uses procedural PixiJS drawings. To switch to generated art later:

- Put the PNGs at the paths above.
- Extend `apps/web/src/village/pixi/assets.ts` to load the textures.
- Replace the procedural building body in `renderBuilding()` with the matching sprite anchored at bottom center.
- Keep labels, badges, selection rings, and particles code-native so UI text stays crisp and accessible.
