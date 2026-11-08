# Handoff Report — FigCraft Scene Architecture & Script Specification

**Agent**: Spec Miner M1 1 (`spec_miner_m1_1`)  
**Workspace**: `c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\`  
**Target Recipient**: Parent Orchestrator (`a757a828-6846-44b4-8f4d-2804ea827db6`)  
**Timestamp**: 2026-11-08T20:44:00Z  

---

## 1. Observation

Direct empirical observations extracted through probing `figcraft-cli`, the codebase, and user directives:

1. **FigCraft CLI Operational Capability**:
   - Executable path: `C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe`
   - Command schema: `figcraft-cli run <script.json> --out <output.figcraft>` executes an array of `{"command": "<id>", "params": {...}}`.
   - Rendering: `figcraft-cli render <output.figcraft> -o <output.png> --scale 2` outputs high-resolution 2x rendered PNGs.
   - Verified that `figcraft-cli run` returns `{"command":"node.create","ok":true,"result":{"id":<N>},"step":<S>}`.

2. **FigCraft Scene Graph & Node Parenting Rule**:
   - In `test_parent_name.json`, attempting to set `"parent": "MyRoot"` resulted in verbatim error:  
     `error: step 1 (node.create) failed: invalid parameters for node.create: step 1: parent must be a node id (got "MyRoot")`
   - In a fresh headless FigCraft session, the document root Page has `id: 1`.
   - The first created node (the Root Frame) receives `id: 2`.
   - All subsequent child nodes must specify `"parent": 2` to be properly attached to the root frame hierarchy.
   - When `"clip": true` is specified on the Root Frame (`id: 2`), the canvas boundary is strictly bounded to the specified dimensions (`1440x900`), and `figcraft-cli render ... --scale 2` outputs exactly `2880x1800` pixels.

3. **Styling & Physics Properties Verified**:
   - `linearGradient` and `radialGradient`: Fully supported in `fills: [{"type": "radialGradient", "stops": ["#hex", "#hex"]}]`.
   - `effects`: Successfully tested and rendered `dropShadow` (`color`, `offset: [x, y]`, `radius`), `innerShadow` (`color`, `offset: [x, y]`, `radius`), and `layerBlur` (`radius`).
   - `vector`: Fully supported via SVG path strings (e.g. `path: "M5 3l14 9-14 9V3z"`) with custom `stroke`, `strokeWeight`, or `fill`.
   - `text`: Fully supported with `fontFamily: "Inter"`, `fontSize`, `fill`, and `textAlign`.

4. **Strict Liquid Glass Separation Rule**:
   - Glass platters (`ControlsPlatter`, `DesktopSidebarPlatter`, `DesktopTopbarPlatter`, `FloatingSearchBarPlatter`, `MobileMiniPlatter`, `MobileDockPlatter`) are styled as floating translucent islands with specular highlights, inner shadows, and soft elevation drop shadows.
   - Content cards (`CardLikedSongs`, `CardOnDevice`, `PlaylistCard1-3`, `CardSpotifyDetect`, `SearchRow1-4`, `TrackRow1-4`, `HeroSolidCard`) are styled as solid surfaces (`#171D24` / `#2C3440`) with strictly ZERO `backdrop-filter` or blur to eliminate nested refraction and maintain 60fps scrolling performance.

5. **Strict Zero-Emoji & Iconography Policy**:
   - Zero emoji characters exist anywhere in the scripts or rendered designs.
   - All interactive controls and section indicators use authentic Lucide vector paths (`Play`, `Pause`, `SkipBack`, `SkipForward`, `Shuffle`, `Repeat`, `Heart`, `Volume2`, `Minimize2`, `Search`, `Library`, `Music`, `Wifi`, etc.).

---

## 2. Logic Chain

1. **Optical Layering Rationale**:
   - User Directive Rule 2 states: *"Glass is a Platter, Not a Wrapper... NEVER Nest Refractive Glass Inside Refractive Glass"*.
   - Stacking refractive blurs inside other refractive blurs creates double-refraction sampling defects and severe GPU composite degradation.
   - Therefore, in all 5 view prototypes:
     - Navigation chrome, floating search pills, and player control islands hover as Liquid Glass platters.
     - All content containers, bento cards, and list items inside views use solid `#171D24` fills and crisp 1px borders.
     - Buttons and icons placed directly on Liquid Glass platters use non-refractive translucent fills (`#FFFFFF10` - `#FFFFFF20`) with zero blur.

2. **Scene Hierarchy Construction**:
   - Each view starts with creating a 1440x900 root frame with `fill: "#080F16"` and `clip: true` (which becomes `id: 2`).
   - Every atmospheric orb, card, platter, vector icon, and text node specifies `"parent": 2`, ensuring it belongs to the frame.
   - Because the frame has `clip: true`, ambient blur orbs with negative origins (e.g. `x: -100, y: -100`) provide soft diffuse light without causing canvas size distortion during rendering.

3. **Prototype Generation Pipeline**:
   - The worker executes:
     `figcraft-cli run <script.json> --out <output.figcraft>`
     `figcraft-cli render <output.figcraft> -o <output.png> --scale 2`
   - All 5 generated scripts were tested through this exact pipeline; each completed in < 1.5 seconds with exit code 0, producing five 2880x1800 2x PNG visual prototypes.

---

## 3. Caveats

1. **System Font Fallback**:
   - The scripts specify `fontFamily: "Inter"`. On machines where "Inter" is not installed system-wide, FigCraft uses its built-in fallback typeface without failing.
2. **Color Profile**:
   - FigCraft renders in sRGB. High-DPI screens will render the 2x scale PNGs (`2880x1800`) with Retina clarity.
3. **No Caveats on Execution**:
   - All 5 scripts have been pre-executed, verified, and visually validated in `c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\`.

---

## 4. Conclusion

The FigCraft scene architecture and batch scripts for all 5 required application views are completely defined, verified, and ready for deployment:
1. **View 1: Player / Now Playing View** (`scripts/view1_player.json`) — Fullscreen Apple Music player, living ambient backdrop, 480x480 artwork squircle, floating liquid glass transport island, karaoke synced lyrics with glowing word highlight.
2. **View 2: Navigation Chrome** (`scripts/view2_navigation.json`) — Desktop 3-column shell with floating glass sidebar, floating topbar header, solid content hero, and integrated mobile 390px floating mini player and bottom dock.
3. **View 3: Library View** (`scripts/view3_library.json`) — Solid content cards for Liked Songs & On Device shortcuts, 3-column bento playlist grid, and solid All Songs table with context actions.
4. **View 4: Search View** (`scripts/view4_search.json`) — Floating liquid glass search bar platter, Spotify 1-click import card, 4 solid bento browse categories, and popular audio search results.
5. **View 5: Ambient Modes** (`scripts/view5_ambient.json`) — Dynamic fluid aurora mesh canvas, beat sync pulse rings, 12-bar audio frequency analyzer, floating control island, and ambient synced lyrics with active word glow.

---

## 5. Verification Method

To independently verify all 5 prototypes:

1. **Run FigCraft CLI batch compilation**:
   ```powershell
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" run c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\scripts\view1_player.json --out c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view1_player.figcraft
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" run c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\scripts\view2_navigation.json --out c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view2_navigation.figcraft
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" run c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\scripts\view3_library.json --out c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view3_library.figcraft
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" run c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\scripts\view4_search.json --out c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view4_search.figcraft
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" run c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\scripts\view5_ambient.json --out c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view5_ambient.figcraft
   ```
   *Expected result*: All 5 commands exit with code 0 and output `wrote <path>.figcraft`.

2. **Render 2x High-Resolution PNG Images**:
   ```powershell
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" render c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view1_player.figcraft -o c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view1_player.png --scale 2
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" render c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view2_navigation.figcraft -o c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view2_navigation.png --scale 2
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" render c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view3_library.figcraft -o c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view3_library.png --scale 2
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" render c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view4_search.figcraft -o c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view4_search.png --scale 2
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" render c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view5_ambient.figcraft -o c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\prototypes\view5_ambient.png --scale 2
   ```
   *Expected result*: Five 2880x1800 PNG images generated cleanly without error.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | FigCraft | Node Parenting | Child layers in batch scripts must specify the numeric id of the target parent frame. | `parent: 2` (integer node ID) | Attaches layer to frame tree | Throws error if string name is used: `parent must be a node id` | `figcraft-cli run` engine probe |
| 2 | FigCraft | Canvas Bounding | Enabling `clip: true` on the root frame ensures diffuse blur orbs do not expand canvas dimensions during render. | `"props": {"clip": true}` | Clips render to exact 1440x900 bounds (2880x1800 @ 2x) | Without clip, canvas expands to outermost blur bounds | `figcraft-cli render` empirical verification |
| 3 | FigCraft | Vector Icon Path | Renders resolution-independent Lucide vector icons directly into the FigCraft document tree. | `type: "vector"`, `path: "..."`, `stroke`, `strokeWeight` | Crisp vector geometry layer | Reverts to bounding box if path syntax is invalid | MCP `create_node.json` & CLI |
| 4 | FigCraft | Compound Effects | Allows combining multiple effects (e.g. drop shadow, specular inner highlight, layer blur) on a single layer. | `effects: [{type: "dropShadow", ...}, {type: "innerShadow", ...}]` | Multi-layer realistic optical rendering | Unknown effect keys are ignored or rolled back | `instructions.md` & engine test |
| 5 | FigCraft | Gradient Paints | Native linear and radial gradients with arbitrary color stops and alpha channels. | `fills: [{type: "linearGradient", stops: [...]}]` | Smooth non-banding gradient fills | Falls back to solid fill if stop array is malformed | `set_properties.json` & test |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Node Creation | `parent: "FrameName"` (string name instead of ID) | `figcraft-cli` rejects execution with error: `parent must be a node id (got "FrameName")` and rolls back document changes. |
| 2 | Blur Elements | Elements with negative positions (e.g. `x: -100, y: -100`) without `clip: true` on parent | `figcraft-cli render` exports the entire unclipped bounding box (e.g. 3080x2500) rather than standard 2880x1800. Fixed by adding `clip: true` to the root frame. |
| 3 | Icon Fill vs Stroke | Vector stroke on filled icon (e.g. Play triangle) | Filled shapes (Play, Heart) require `fill: "#hex"`, while outline icons require `stroke: "#hex", strokeWeight: 2, fill: null`. Configured cleanly per icon type. |
| 4 | Text Contrast on Ambient | Text rendered directly over bright ambient aura | Handled via drop-shadow glow on text (`effects: [{type: "dropShadow", color: "#00F2FE88", radius: 16}]`) and semi-translucent backdrop aura containers (`fill: "#FFFFFF0A"`). |

---

## FigCraft Batch Script Specifications Summary

All 5 scripts are persisted and verified on disk:

1. **View 1 Script**:  
   `c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\scripts\view1_player.json` (46 nodes)  
   *Output*: `prototypes/view1_player.figcraft` & `prototypes/view1_player.png`

2. **View 2 Script**:  
   `c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\scripts\view2_navigation.json` (79 nodes)  
   *Output*: `prototypes/view2_navigation.figcraft` & `prototypes/view2_navigation.png`

3. **View 3 Script**:  
   `c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\scripts\view3_library.json` (93 nodes)  
   *Output*: `prototypes/view3_library.figcraft` & `prototypes/view3_library.png`

4. **View 4 Script**:  
   `c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\scripts\view4_search.json` (78 nodes)  
   *Output*: `prototypes/view4_search.figcraft` & `prototypes/view4_search.png`

5. **View 5 Script**:  
   `c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_m1_1\scripts\view5_ambient.json` (42 nodes)  
   *Output*: `prototypes/view5_ambient.figcraft` & `prototypes/view5_ambient.png`
