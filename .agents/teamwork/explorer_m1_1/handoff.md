# FigCraft CLI & Rendering Pipeline Investigation Report

## 1. Observation

### Binary Location & Integrity
The FigCraft CLI executable was verified directly at:
- Executable path: `C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe`
- File size: 86,236,528 bytes
- Bundled Open Font License (OFL) typefaces in the FigCraft directory: `Inter`, `Lato`, `Roboto`, `Montserrat`, `Open Sans`, `Poppins`, `Liberation Sans`, `Liberation Mono`, `Carlito`, `Caladea`, `Merriweather`, etc.

### Command Line Interface
Executing `& "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" --help` verified the following core subcommands:
```text
figcraft-cli info <file> [--json]
figcraft-cli export <file> -o <out> [--format png|jpg|svg|webp|pdf|xml|fig] [--scale N] [--page NAME] [--node ID|NAME]
figcraft-cli convert <in> <out>
figcraft-cli render <file> -o <out.png> [--scale N] [--page NAME]
figcraft-cli run <script.json|script.jsonl> [--in <file>] [--out <file>]
figcraft-cli commands [--json] [--filter TEXT]
```

### Script Execution & Schema Observations

#### 1. Script Format
Scripts passed to `figcraft-cli run` must be valid JSON arrays containing command objects without a UTF-8 Byte Order Mark (BOM):
```json
[
  { "command": "<command_id>", "params": { ... } }
]
```

#### 2. Node Creation & Deterministic IDs
- In a new headless session, the document root `Page 1` is assigned `id: 1`.
- The first created node (e.g. `frame.create`) is assigned `id: 2`.
- Subsequent created nodes increment sequentially: `id: 3`, `id: 4`, `id: 5`, etc.
- In `node.create`, the `parent` property **must be an integer node id**.
  - Direct observed verbatim error when using a string name:
    ```text
    {"command":"node.create","error":"invalid parameters for `node.create`: step 1: `parent` must be a node id (got \"NameParentFrame\")","ok":false,"rolledBack":true,"step":1}
    ```
  - Omitting `parent` places the node directly on the root page (`id: 1`) instead of inside the parent frame.

#### 3. Styling & Effects Syntax
- **Fills**:
  - Solid: `"fill": "#171D24"` or `"fill": "#FFFFFF14"` (8-digit hex with alpha) or `"fill": "none"`.
  - Linear Gradient:
    ```json
    "fills": [
      {
        "type": "linearGradient",
        "stops": ["#1A0B2E", "#0B192E", "#05050A"],
        "from": [0, 0],
        "to": [1, 1]
      }
    ]
    ```
- **Strokes**: `"stroke": "#FFFFFF33"`, `"strokeWeight": 1`, `"strokeAlign": "inside" | "center" | "outside"`.
- **Corners**: `"cornerRadius": 16` or `[tl, tr, br, bl]`, `"cornerSmoothing": 0.6` (iOS squircle).
- **Effects Array**:
  - `dropShadow` and `innerShadow`: Direct observed verbatim error when using separate `offsetX` / `offsetY`:
    ```text
    invalid parameters for `node.create`: step 1: effects[0]: unknown properties: offsetX, offsetY (a dropShadow takes blend, color, offset, radius, showBehind, spread, type, visible)
    ```
    Correct syntax requires `offset` as an array `[x, y]`:
    ```json
    { "type": "dropShadow", "color": "#00000080", "offset": [0, 12], "radius": 28, "spread": 0 }
    { "type": "innerShadow", "color": "#FFFFFF4D", "offset": [0, 1], "radius": 2 }
    ```
  - `backgroundBlur`:
    ```json
    { "type": "backgroundBlur", "radius": 28 }
    ```
  - `glass` (native physics shader):
    ```json
    { "type": "glass", "depth": 10, "dispersion": 0.5, "frost": 0.2, "lightAngle": 45, "lightIntensity": 0.8, "refraction": 1.2 }
    ```

#### 4. Auto Layout on Frames
Auto layout is configured on frames via:
```json
"props": {
  "layout": "horizontal", // or "vertical"
  "gap": 16,
  "padding": [12, 24, 12, 24], // or single integer e.g. 24
  "mainAlign": "spaceBetween", // "min" | "center" | "max" | "spaceBetween" | "spaceAround" | "spaceEvenly"
  "crossAlign": "center" // "min" | "center" | "max" | "baseline"
}
```

#### 5. Vector Iconography (Lucide Vectors)
Vector layers render crisp SVG geometry via `node.create`:
```json
{
  "command": "node.create",
  "params": {
    "parent": 6,
    "type": "vector",
    "name": "PlayIcon",
    "width": 24,
    "height": 24,
    "path": "M5 3l14 9-14 9V3z",
    "props": {
      "fill": "#FA586A",
      "stroke": "none"
    }
  }
}
```
For stroked vector icons (e.g. search, music, sliders), set `"fill": "none"`, `"stroke": "#FFFFFF"`, `"strokeWeight": 2`.

#### 6. Artwork & Image Fills
Images can be placed as the fill of an existing rectangle/container using `image.place`:
```json
{
  "command": "image.place",
  "params": {
    "path": "c:/laragon/www/mochy-pwa/public/icon-512.png",
    "target": 3
  }
}
```
This preserves the container's `cornerRadius`, `stroke`, and `effects`.

### Verified Artifact Generation
A test prototype demonstrating background gradient, solid opaque card (`#171D24`), and floating Liquid Glass platter (`#FFFFFF14` + `backgroundBlur` + `innerShadow` + Lucide vector icon) was generated and rendered:
- `.figcraft` document: `c:\laragon\www\mochy-pwa\.agents\teamwork\figcraft_prototypes\sample_prototype.figcraft` (29,923 bytes)
- Rendered 2x PNG: `c:\laragon\www\mochy-pwa\.agents\teamwork\figcraft_prototypes\sample_prototype.png` (213,016 bytes, 2000×1400)

---

## 2. Logic Chain

1. **Premise**: Milestone 1 requires creating 5 high-resolution visual prototypes in FigCraft for Mochy Music PWA (Player, Navigation Chrome, Library, Search, Ambient / Audio Lab) with Liquid Glass floating chrome, solid content cards, zero emoji, and Lucide vector icons.
2. **Execution Chain**: FigCraft CLI operates headlessly through `figcraft-cli run <script.json> --out <model.figcraft>` followed by `figcraft-cli render <model.figcraft> -o <render.png> --scale 2`.
3. **Determinism Verification**: Headless execution starts with Page ID `1`, Frame ID `2`, and subsequent elements incrementing monotonically. Since `parent` must be an integer ID, script generators can deterministically track parent IDs using an in-memory counter (`nextId = 2`) or modular builder class.
4. **Visual Hierarchy Compliance**: Liquid Glass optics are achieved by applying `backgroundBlur`, specular `innerShadow`, and elevation `dropShadow` strictly to floating navigation/control platters. Content cards remain solid opaque surfaces (`#171D24` / `#131820`) with crisp 1px borders and zero backdrop blur, ensuring zero nested refraction distortion.
5. **Iconography Compliance**: Lucide vector paths embedded via `node.create` with `type: "vector"` render natively with customizable stroke and fill, satisfying the zero-emoji policy.

---

## 3. Caveats

- **System Fonts**: In headless environments without installed fonts, FigCraft uses its bundled fonts (`Inter`, `Roboto`, `Montserrat`, `Lato`, `Poppins`). Scripts must use `"fontFamily": "Inter"` to guarantee consistent rendering across systems.
- **Node Rollback**: If any command in a script array fails, FigCraft rolls back all changes in that script execution. Scripts should be pre-validated or generated using tested helper patterns.
- **Top-Level Render Scope**: `figcraft-cli render` renders the entire page canvas containing all frames. When generating multiple distinct prototype views, the cleanest and most modular workflow is generating one `.figcraft` file per view (e.g. `view_1_player.figcraft` -> `view_1_player.png`), OR exporting specific named frames via `figcraft-cli export <file> -o <out.png> --node "<frame_name>" --scale 2`.

---

## 4. Conclusion & Recommended Architecture for Worker M1

Worker M1 has a verified, zero-friction execution pipeline to construct and render the 5 required views.

### Verified Command Lines for Worker M1
```powershell
# 1. Compile script to FigCraft model
& "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" run "<view_script.json>" --out "c:\laragon\www\mochy-pwa\.agents\teamwork\figcraft_prototypes\<view_name>.figcraft"

# 2. Render 2x high-resolution visual prototype PNG
& "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" render "c:\laragon\www\mochy-pwa\.agents\teamwork\figcraft_prototypes\<view_name>.figcraft" -o "c:\laragon\www\mochy-pwa\.agents\teamwork\figcraft_prototypes\<view_name>.png" --scale 2
```

### The 5 Target Prototype Deliverables
| View # | View Name | Canvas Dimensions | Key Structural Elements | Target Output PNG |
|---|---|---|---|---|
| 1 | **Player / Now Playing** | 1280 × 800 (Desktop) | Living aurora background gradient, 360×360 squircle artwork container, floating glass controls island with seek scrubber & volume, karaoke lyrics card with active line highlight | `view_1_player.png` |
| 2 | **Navigation Chrome** | 1440 × 900 (Desktop + Mobile) | Floating Liquid Glass sidebar (Home, Search, Library, Audio Lab), topbar breadcrumb pills, mobile viewport mockup with bottom glass dock & floating mini-player platter | `view_2_navigation.png` |
| 3 | **Library View** | 1280 × 800 (Desktop) | Glass action toolbar, solid Liked Songs & On Device hero bento cards, 3-column playlist grid, solid track rows with duration & menu buttons | `view_3_library.png` |
| 4 | **Search View** | 1280 × 800 (Desktop) | Glass search input platter with sheen border, solid 1-click Spotify import card, 4 solid bento browse category cards, recent search results list | `view_4_search.png` |
| 5 | **Ambient / Audio Lab** | 1280 × 800 (Desktop) | Fluid aurora visualizer canvas, 6 solid DSP feature cards (Equalizer, Bass Booster, Spatial 3D, Vocal Isolator, Tube Warmth, Reverb), floating glass EQ adjustment board | `view_5_ambient.png` |

### Key Lucide Vector Icon SVG Paths
| Icon Name | SVG Path (`path`) | Fill / Stroke Config |
|---|---|---|
| **Play** | `M5 3l14 9-14 9V3z` | `fill: "#FA586A", stroke: "none"` |
| **Pause** | `M6 4h4v16H6z M14 4h4v16h-4z` | `fill: "#FA586A", stroke: "none"` |
| **Skip Back** | `M19 20L9 12l10-8v16z M5 19V5h2v14H5z` | `fill: "#FFFFFF", stroke: "none"` |
| **Skip Forward** | `M5 4l10 8-10 8V4z M19 5v14h-2V5h2z` | `fill: "#FFFFFF", stroke: "none"` |
| **Search** | `M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35` | `fill: "none", stroke: "#FFFFFF", strokeWeight: 2` |
| **Music / Library**| `M9 18V5l12-2v13 M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z` | `fill: "none", stroke: "#FFFFFF", strokeWeight: 2` |
| **Sliders / EQ** | `M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6` | `fill: "none", stroke: "#FFFFFF", strokeWeight: 2` |
| **Heart / Liked** | `M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z` | `fill: "#FA586A", stroke: "none"` |
| **Sparkles / Aurora**| `M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.64 5.64l2.12 2.12 M16.24 16.24l2.12 2.12 M5.64 18.36l2.12-2.12 M16.24 7.76l2.12-2.12` | `fill: "none", stroke: "#A855F7", strokeWeight: 2` |
| **Volume** | `M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 0 1 0 14.14 M15.54 8.46a5 5 0 0 1 0 7.07` | `fill: "none", stroke: "#FFFFFF", strokeWeight: 2` |

### Recommended Node.js Generator Structure for Worker M1
Worker M1 can write a generator script (e.g. `generate_views.js`) utilizing the verified builder pattern:
```javascript
const fs = require('fs');

class ViewBuilder {
  constructor() {
    this.commands = [];
    this.nextId = 2; // page 1, first frame 2
  }
  frame({ name, width, height, fills, fill, layout, gap, padding, mainAlign, crossAlign }) {
    const id = this.nextId++;
    const props = {};
    if (fills) props.fills = fills;
    if (fill) props.fill = fill;
    if (layout) props.layout = layout;
    if (gap !== undefined) props.gap = gap;
    if (padding !== undefined) props.padding = padding;
    if (mainAlign) props.mainAlign = mainAlign;
    if (crossAlign) props.crossAlign = crossAlign;
    this.commands.push({ command: 'frame.create', params: { name, width, height, x: 0, y: 0, props } });
    return id;
  }
  container({ parent, name, width, height, x = 0, y = 0, fill, cornerRadius, stroke, strokeWeight, effects, layout, gap, padding, mainAlign, crossAlign, absolute }) {
    const id = this.nextId++;
    const props = {};
    if (fill) props.fill = fill;
    if (cornerRadius !== undefined) props.cornerRadius = cornerRadius;
    if (stroke) props.stroke = stroke;
    if (strokeWeight !== undefined) props.strokeWeight = strokeWeight;
    if (effects) props.effects = effects;
    if (layout) props.layout = layout;
    if (gap !== undefined) props.gap = gap;
    if (padding !== undefined) props.padding = padding;
    if (mainAlign) props.mainAlign = mainAlign;
    if (crossAlign) props.crossAlign = crossAlign;
    if (absolute) props.absolute = true;
    this.commands.push({ command: 'node.create', params: { parent, type: 'frame', name, width, height, x, y, props } });
    return id;
  }
  text({ parent, text, fontSize = 14, fontFamily = 'Inter', fontStyle = 'Regular', fill = '#FFFFFF', x = 0, y = 0, width }) {
    const id = this.nextId++;
    const params = { parent, type: 'text', name: text.slice(0, 24), text, x, y, props: { fontSize, fontFamily, fontStyle, fill } };
    if (width !== undefined) params.width = width;
    this.commands.push({ command: 'node.create', params });
    return id;
  }
  vector({ parent, name, path, width = 24, height = 24, fill = 'none', stroke = '#FFFFFF', strokeWeight = 2, x = 0, y = 0 }) {
    const id = this.nextId++;
    this.commands.push({ command: 'node.create', params: { parent, type: 'vector', name, width, height, x, y, path, props: { fill, stroke, strokeWeight } } });
    return id;
  }
  placeImage({ target, path }) {
    this.commands.push({ command: 'image.place', params: { target, path } });
  }
  toJSON() {
    return JSON.stringify(this.commands, null, 2);
  }
}
```

---

## 5. Verification Method

To independently reproduce and verify the findings:

1. **Verify Binary & CLI Commands**:
   ```powershell
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" --help
   ```
   *Expected result*: Exits with code 0 and lists subcommands `info`, `export`, `render`, `run`, `commands`.

2. **Verify Sample Prototype Execution & Output**:
   ```powershell
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" render "c:\laragon\www\mochy-pwa\.agents\teamwork\figcraft_prototypes\sample_prototype.figcraft" -o "c:\laragon\www\mochy-pwa\.agents\teamwork\figcraft_prototypes\sample_prototype.png" --scale 2
   ```
   *Expected result*: Exits code 0, writes `sample_prototype.png` (2000×1400) exhibiting background gradient, solid card, and floating liquid glass platter.

3. **Verify Builder Execution**:
   ```powershell
   node "c:\laragon\www\mochy-pwa\.agents\teamwork\explorer_m1_1\test_builder.js"
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" run "c:\laragon\www\mochy-pwa\.agents\teamwork\explorer_m1_1\test_builder.json" --out "c:\laragon\www\mochy-pwa\.agents\teamwork\explorer_m1_1\test_builder.figcraft"
   ```
   *Expected result*: All steps report `ok: true` with sequential IDs 2, 3, 4, 5.
