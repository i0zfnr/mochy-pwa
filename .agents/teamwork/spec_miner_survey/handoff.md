# Handoff Report — UI Specification & Design System Requirements Survey

**Agent**: Spec Miner Survey (`spec_miner_survey`)  
**Workspace**: `c:\laragon\www\mochy-pwa\.agents\teamwork\spec_miner_survey\`  
**Target Recipient**: Parent Orchestrator (`a757a828-6846-44b4-8f4d-2804ea827db6`)  
**Timestamp**: 2026-11-08T20:23:00Z  

---

## 1. Observation

Direct observations extracted from authoritative project sources, user rules, skills, and the active codebase:

1. **User Request & Directives (`ORIGINAL_REQUEST.md`)**:
   - Requirement R1: Create and export high-resolution visual prototypes in FigCraft for the redesigned application views (Player / Now Playing view, navigation chrome, Library, Search, Ambient modes) demonstrating Apple Music aesthetics, Liquid Glass floating controls, solid content surfaces, and vector iconography before final UI implementation.
   - Requirement R2: Liquid glass styling must be strictly restricted to floating navigation, toolbars, modal sheets, and playback control chrome hovering over backgrounds. Content containers, lists, and cards must remain solid opaque surfaces with clear contrast. Never nest refractive glass inside refractive glass. Strict zero-emoji policy using Lucide vector icons throughout. Fully responsive layout adapting across mobile (390px), tablet (768px/1024px), and desktop (1280px+) widths with zero horizontal clipping or overflow.
   - Requirement R3: Preserve all existing audio playback, library management, search, and ambient features without regressions. `npm run build` and `npm test` must exit code 0.

2. **User Rules (`C:\Users\ipan\.gemini\config\plugins\pro-design-rules\rules\AGENTS.md`)**:
   - Section 1 (Mandatory FigCraft Prototyping Workflow): Autonomously perform Design Read; build prototype using FigCraft; export high-res PNG; present in chat and artifact; strictly halt for explicit user approval before touching project code.
   - Section 2 (Liquid Glass Design System): "Glass is a Platter, Not a Wrapper" — navigation chrome, tab bars, floating action buttons, toolbars, modal sheets, dialogs only. Backgrounds must be rich curated wallpapers or deep ambient gradients. Content cards must use solid surfaces (`surfaceStyle: GlassSurfaceStyle.solid` / opaque flat cards). "NEVER Nest Refractive Glass Inside Refractive Glass" — no refractive glass buttons/chips inside refractive glass cards (prevents double refraction distortion and GPU fill-rate waste). Snell's law refraction, specular edge highlights (1px highlight on top/left), inner rim glow, backdrop saturation boost (140%-180%), WCAG AA contrast (≥ 4.5:1 body text, ≥ 3:1 icons/borders).
   - Section 4 & 5 (Zero-Emoji & Anti-Slop): Never use emojis anywhere in UI (headings, buttons, navigation, status indicators, badges, cards, or copy). Exclusively use professional vector icons (Lucide/Phosphor) with 1.5px/2.0px stroke. No generic AI purple/indigo gradients, no identical 3-column feature cards, no default Inter + slate-900 templates.

3. **Current Codebase Audit (`c:\laragon\www\mochy-pwa`)**:
   - `package.json`: React 19.2.0, Vite 7.2.0, `lucide-react@0.468.0`, `idb@8.0.0`, `music-metadata@12.3.5`. Tests via `node --test tests/*.test.js`.
   - Verified current health: `npm test` executes 16 tests with 16 PASS, 0 FAIL. `npm run build` compiles 1750 modules successfully in 3.62s to `dist/`.
   - FigCraft CLI (`C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe`): verified operational via `figcraft-cli run` and `figcraft-cli render`.
   - **Current Defects & Rule Collisions Observed in Code**:
     - *Nested Refractive Glass*: In `src/apple-music.css:1877-1891`, `.sidebar` has `backdrop-filter: var(--am-glass-blur) !important`, and nested `.nav-item.selected` has `backdrop-filter: blur(14px) !important`. In lines 2010-2036, `.secondary` buttons and `.icon-button:hover` have `backdrop-filter: blur(16px)` and `blur(14px)` inside `.player-panel` and `.modal`, producing nested refraction.
     - *Glass on Content Cards*: In `src/apple-music.css:1939-1955`, `.playlist-tile`, `.settings-group`, `.about-card`, `.bring-music`, `.local-note` inside scrolling `main` have `backdrop-filter: var(--am-glass-blur) !important`. This violates the platter rule and causes mobile frame-rate drops.
     - *Anti-Slop R-39 Violation*: In `index.html:1`, `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"/>` contains `user-scalable=no, maximum-scale=1` which is explicitly forbidden by R-39.
     - *Branding Inconsistency*: `index.html:1` and `src/main.jsx:24, 539, 541, 574` name the app "Xenn" (`Reload Xenn`, `xenn.`, `Xenn /`, `XENN · NOW PLAYING`) instead of "Mochy" / "Mochy Music".
     - *Unicode Glyphs*: `src/style.css:9` contains `.breadcrumb:before{content:'✳';font-size:25px;color:#d5b5a3;margin-right:-7px}`.

---

## 2. Logic Chain

1. **Optical Layer Separation**:
   - The user directive and `liquid-glass/SKILL.md` strictly command that glass is a floating platter, never a content wrapper.
   - Refractive glass blurs (`backdrop-filter`) calculate screen buffer coordinates; stacking one refractive blur inside another causes undefined shader refraction passes, high fill-rate overhead, and muddy text rendering.
   - Therefore, the UI architecture must strictly bifurcate into two layers:
     - **Layer 1: Floating Chrome (Liquid Glass)**: The fixed or detached navigation chrome (`.topbar`, `.mobile-nav`, `.sidebar`, floating `.player-panel`, `.mobile-mini`, `.af-controls` island, `.modal`, and `.toast`). These use authentic liquid glass tokens: `backdrop-filter: blur(28px) saturate(190%)`, specular border gradient (`linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.06) 100%)`), dual inner shadows (`inset 0 1px 1.5px 0 rgba(255,255,255,0.4), inset 0 -1px 2px 0 rgba(0,0,0,0.2)`), and drop elevation shadow.
     - **Layer 2: Content Cards & Containers (Solid Opaque Surfaces)**: All scrollable cards (`.playlist-tile`, `.album-card`, `.settings-group`, `.about-card`, `.bring-music`, `.browse-card`, `.track-row`). These must use solid, opaque surfaces (`#171D24` in dark, `#F7F7F7` in light), zero `backdrop-filter`, crisp 1px borders (`#30353B` / `#E0E0E0`), and subtle static shadows.
     - **Controls Inside Platters**: Buttons, tabs, and list items inside floating platters (`.nav-item`, `.icon-button`, `.secondary`) must use non-refractive translucent color fills (`rgba(255,255,255,0.08)`) with zero `backdrop-filter`.

2. **Visual Prototyping Pipeline Gate**:
   - User Rule 1 mandates that prior to implementing UI code changes, FigCraft prototypes and exported PNG renderings must exist for 5 core views:
     1. Player / Now Playing view (fullscreen Apple Music view + player panel)
     2. Navigation chrome (desktop 3-column shell, floating topbar, mobile floating tab bar, mobile mini player)
     3. Library view (solid playlist tiles, shortcuts, tracks list)
     4. Search view (floating search bar platter, quick browse cards, search results)
     5. Ambient modes (WebGL `AlbumAtmosphere` shader platter, dynamic artwork color extraction, synced lyrics)
   - These prototypes must be rendered via `figcraft-cli run` and `figcraft-cli render`, saved to `.agents/teamwork/` artifacts, and presented for user approval.

3. **Zero-Emoji & Anti-Slop Enforcement**:
   - Zero emojis in any component, label, pseudo-element, or heading.
   - All icons use `lucide-react` with 1.5px or 2.0px stroke.
   - Replace the `✳` glyph in `style.css:9` with a clean Lucide vector icon (`Music2` or `Sparkles`).
   - Fix `index.html` viewport meta to remove `maximum-scale=1, user-scalable=no`.
   - Update branding from "Xenn" to "Mochy Music".

4. **Responsive Layout Discipline**:
   - Mobile (`360px - 767px`, standard `390px`): Single column vertical stack; hidden desktop sidebar; bottom floating glass tab bar (5 items, min 44px tap target); docked mini player platter; full-screen player overlay; `min-h-[100dvh]` to eliminate iOS Safari viewport jump; zero horizontal overflow.
   - Tablet (`768px - 1189px`, standard `768px` / `1024px`): 2-column or adapted 3-column grid; compact sidebar (`165px`); responsive album grid (3-4 columns); floating player panel (`310px`) with close button.
   - Desktop (`1190px - 1599px`, standard `1280px` / `1440px`): 3-column spatial architecture: 224px fixed glass sidebar, flexible main canvas (`minmax(0, 1fr)`), 316px right-hand player panel.
   - Wide Desktop (`1600px+`): Scaled 3-column architecture (250px sidebar, 360px player panel).

---

## 3. Caveats

1. **Browser Support for CSS Backdrop Optics**:
   - Standard WebKit/Blink browsers support `-webkit-backdrop-filter` and `backdrop-filter`.
   - Under `prefers-reduced-transparency: reduce`, liquid glass platters must gracefully fall back to solid high-opacity surfaces (`rgba(23, 29, 36, 0.98)` in dark mode, `rgba(247, 247, 247, 0.98)` in light mode).
2. **WebGL Contexts in Ambient Mode**:
   - `AlbumAtmosphere` runs a canvas WebGL shader (`ambient-renderer.js`). If WebGL context is lost or unsupported on low-end hardware, the code already gracefully falls back to a 2D canvas / CSS blurred background.
   - To prevent GPU battery drain, the compact sidebar player preview must continue to bypass the heavy WebGL shader loop (`compact={true}`), reserving active WebGL rendering for the fullscreen view.
3. **No Breaking Audio / Storage Regressions**:
   - All IndexedDB functions (`idb`), audio pipeline (`AudioLab`, Web Audio nodes), and metadata extractors (`music-metadata`) are covered by tests in `tests/*.test.js`. Any styling modifications must not alter DOM IDs or event handlers needed for playback continuity.

---

## 4. Conclusion

The Mochy Music PWA UI redesign has clear, unambiguous specifications:
1. **FigCraft Prototyping Gate**: First build FigCraft script definitions for the 5 views, execute via `figcraft-cli run`, render high-resolution 2x PNGs via `figcraft-cli render`, and present them for approval.
2. **Liquid Glass Separation**: Completely purge `backdrop-filter` from content cards (`.playlist-tile`, `.settings-group`, `.about-card`, `.bring-music`, `.local-note`) and from nested elements inside platters (`.secondary`, `.icon-button`, `.nav-item`). Confine authentic liquid glass optics exclusively to floating chrome platters.
3. **Vector Iconography & Clean Typography**: Enforce 0 emoji throughout, standardizing on Lucide icons (1.5px/2.0px stroke). Remove CSS `✳` pseudo-element. Fix `index.html` viewport meta. Align branding to Mochy Music.
4. **Responsive Adaptability**: Full compliance across 390px, 768px, 1024px, 1280px, and 1440px+ with zero horizontal overflow and `min-h-[100dvh]`.

---

## 5. Verification Method

To independently verify the discoveries and subsequent implementation:
1. **Automated Unit Tests**:
   ```powershell
   npm test
   ```
   *Expected result*: All 16 unit tests pass with exit code 0.
2. **Vite Production Build**:
   ```powershell
   npm run build
   ```
   *Expected result*: Build completes cleanly without bundling errors with exit code 0.
3. **FigCraft Script Execution & Visual Rendering**:
   ```powershell
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" run <script.json> --out <output.figcraft>
   & "C:\Users\ipan\AppData\Local\Programs\ArtCraft\FigCraft\figcraft-cli.exe" render <output.figcraft> -o <output.png> --scale 2
   ```
   *Expected result*: Valid `.figcraft` document created and rendered high-res PNG image exported.
4. **Zero-Emoji and Em Dash Audit**:
   ```powershell
   # Search for forbidden emojis or em dashes in source
   rg "[^\x00-\x7F]" src/
   ```
5. **Backdrop Filter Inspection**:
   - Confirm `backdrop-filter` is present ONLY on `.sidebar`, `.topbar`, `.mobile-nav`, `.player-panel`, `.mobile-mini`, `.af-controls`, `.modal`, and `.toast`.
   - Confirm zero `backdrop-filter` on `.playlist-tile`, `.settings-group`, `.album-card`, `.track-row`, `.secondary`, or `.icon-button`.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Navigation | Desktop Sidebar Platter | Fixed floating navigation bar with Home, Search, Library, Audio Lab, Settings, Playlists, Liked Songs, and On This Device. | Click on navigation item / playlist | View state transition (`page`), active indicator | Preserves current playback state without reload | `src/main.jsx:539` |
| 2 | Navigation | Floating Topbar | Header chrome displaying breadcrumb navigation, offline pill, PWA install button, history shortcut, and settings avatar. | Window online status, PWA install prompt, click events | Route breadcrumb, install prompt dialog, settings trigger | Fallback offline banner if offline | `src/main.jsx:541` |
| 3 | Navigation | Mobile Bottom Tab Bar | Floating glass tab bar at viewport bottom with 5 navigation destinations (`Home`, `Search`, `Library`, `Audio Lab`, `Settings`). | Tap on tab item | View state transition, selected highlight | Smooth switch, touch targets ≥ 44px | `src/main.jsx:569` |
| 4 | Navigation | Mobile Mini Player Platter | Floating glass pill docked above bottom tab bar with track cover, title/artist, full-screen trigger, play/pause, and skip forward. | Tap mini player or playback controls | Full player expansion (`player-expanded`), playback toggle | Gracefully hidden when no track is loaded | `src/main.jsx:568` |
| 5 | Player | Aside Player Panel | Right-hand desktop/tablet panel with Playing, Lyrics, and Queue tabs; volume slider; seek bar; transport controls. | User interaction with tabs, seek slider, transport buttons | Audio playback control, lyrics scroll, queue reordering | Empty state illustration with "Let something good play" | `src/main.jsx:564-567` |
| 6 | Player | Fullscreen Apple Music Player | Immersive full-screen overlay with dynamic WebGL `AlbumAtmosphere` background, large cover art, floating controls island, interactive synced lyrics. | Fullscreen trigger (icon or cover tap), Esc key | Fullscreen UI, animated lyrics, beat-reactive ambient canvas | Instrumental songs show instrumental badge; fallback plain lyrics | `src/main.jsx:574-579` |
| 7 | Player | Interactive Synced Lyrics | Synchronized lyric scrolling with word-level or line-level timing, click-to-seek, auto-scroll with golden-ratio positioning (38%), timing offset adjuster. | Lyric click, timing offset adjustments (+/- 0.25s) | Audio seek to timestamp, smooth scroll animation | Graceful fallback to plain lyrics or error message | `src/main.jsx:215-318` |
| 8 | Player | Transport & Scrubbing | Shuffle, Previous (rewinds if >3s, else skips), Play/Pause, Skip Forward, Repeat mode cycle (off -> all -> one -> off), volume slider. | Button clicks, drag range input | Real-time audio stream control | Disables buttons when no track loaded | `src/main.jsx:567` |
| 9 | Home | Daily Soundtrack Hero | Dynamic hero showcase featuring last listened song or top feed recommendation with orbital visual, quick play button. | Play button click | Plays track, starts playback queue | Fallback generic escape text if library empty | `src/main.jsx:543` |
| 10 | Home | Mood Filter Row | Horizontal scrolling chip row ('For you', 'Chill', 'Focus', 'Feel good', 'Late night', 'Romance', 'Workout'). | Chip click | Navigates to home or triggers pre-filtered search query | Smooth horizontal overflow scroll | `src/main.jsx:544` |
| 11 | Home | Back In Your Rotation | Quick 2-column grid of recently played tracks from history with like and options context triggers. | Track click | Immediate playback of track in history queue | Hidden if listening history is empty | `src/main.jsx:545` |
| 12 | Home | Your Next Favorites | Responsive album card grid displaying recommended tracks with hover play overlay. | Album card click | Plays selected album/track | Shows skeleton grid during initial feed fetch | `src/main.jsx:546` |
| 13 | Search | YouTube Music Search | Debounced (250ms) search input querying YouTube Music API with clear button and loading state. | Text input (up to 150 chars), Enter or submit button | Search results track list | Inline error box with "Try again" button | `src/main.jsx:548` |
| 14 | Search | Spotify Link Detection | Automatic detection of Spotify playlist, album, or track URLs in search input with one-click import card. | Pasted Spotify URL (`open.spotify.com`) | Parses Spotify metadata and saves songs to IndexedDB | Displays inline error if link is invalid or private | `src/main.jsx:549-560` |
| 15 | Search | Quick Browse Categories | 4 colored bento cards ('Soft mornings', 'After hours', 'In your feelings', 'A little energy') triggering curated queries. | Card click | Executes curated genre query and populates results | Instant transition to search results | `src/main.jsx:561` |
| 16 | Library | Collection Overview | Library management with Liked songs and On this device shortcuts, playlist grid, and all songs table. | Shortcut click, playlist click | Navigates to filtered track views | Empty library prompt to import audio | `src/main.jsx:562` |
| 17 | Library | Playlist Creation & Deletion | Modal dialog to create new custom playlists; detail view with option to delete playlist. | Playlist name input (up to 80 chars) | Persisted playlist object in IndexedDB | Validates non-empty name string | `src/main.jsx:475, 572` |
| 18 | Library | Local Audio Import | Multi-file audio importer reading MP3, FLAC, M4A, WAV, OGG, AAC, OPUS, WEBM and extracting ID3 metadata. | File input dialog / drag & drop | IndexedDB audio Blobs and metadata tracks | Shows toast warning if file format is unsupported | `src/main.jsx:470-474` |
| 19 | Library | Spotify Playlist Importer | Modal dialog to paste public Spotify URLs and import tracks directly into custom Mochy playlist. | Public Spotify URL string | Batch track metadata stored in IndexedDB | Shows error if network fails or no songs found | `src/main.jsx:493-535` |
| 20 | Audio Lab | 5-Band Graphic Equalizer | 5-band frequency sliders (60Hz, 250Hz, 1kHz, 4kHz, 12kHz) with dB gain range (-12dB to +12dB) and preset library. | Slider dragging, preset selection (Flat, Bass Boost, Rock, etc.) | Real-time BiquadFilterNode parameter updates | Bypass toggle disables EQ without losing slider values | `src/AudioLab.jsx:15-55` |
| 21 | Audio Lab | Audio Effects Engine | 3D Spatial Surround (convolver/phase), Bass Punch, Concert Hall reverberation, Vocal Clarity, and Off. | Effect radio button select | Reconfigures Web Audio DSP graph | Smooth transition without audio pops | `src/AudioLab.jsx:59-75` |
| 22 | Audio Lab | Transition & Crossfade | Auto crossfade (3s, 5s), Gapless playback, and Off transitions between consecutive audio tracks. | Transition select | Adjusts GainNode ramps on track transitions | Safe fallback to instant transition on error | `src/AudioLab.jsx:57-59` |
| 23 | Audio Lab | Beat Intensity Mode | Controls background beat motion reactivity: Low, Normal, Aggressive, Off. | Cycle button in player header or settings select | Updates `--beat-energy` CSS property on atmosphere | Disables motion under `prefers-reduced-motion` | `src/PlaybackAtmosphere.jsx:49` |
| 24 | Settings | Theme & Appearance | Visual theme selector: Apple Music Dark (`apple-dark`), Apple Music Light (`apple-light`), Mochy Warm (`mochy`), Pure Black (`pure-black`). | Theme select dropdown | Updates `data-theme` and `meta[name="theme-color"]` | Instant theme change without page reload | `src/main.jsx:404` |
| 25 | Settings | Artwork Shape Customizer | Signature customizable artwork shape: Clover, Rounded, Circle. | Shape select dropdown | Updates CSS class on `.player-art` and `.af-cover-box` | Retains album cover aspect ratio 1:1 | `src/main.jsx:341, 562` |
| 26 | Settings | Library Backup & Restore | Export full library, likes, playlists, and history metadata as downloadable JSON file (`xenn-library.json`). | Export button click | Generates and downloads JSON blob | Cleans up object URL to prevent memory leaks | `src/main.jsx:562` |
| 27 | Modal | Track Options Context Menu | Modal dialog offering track actions: Like/Unlike, Save to Library, Add to Queue, Add to Playlist, Remove. | More options button click | Modifies IndexedDB state, displays confirmation toast | Focus trapped inside dialog, closes on Esc | `src/main.jsx:571` |
| 28 | Ambient | WebGL Album Atmosphere | Real-time WebGL shader rendering fluid animated mesh colors extracted from album artwork tones. | Album cover image URL | Animated canvas background | Canvas downscaled by 4x for high performance | `src/PlaybackAtmosphere.jsx:25-60` |

---

## Edge Cases

| # | Feature | Input / Condition | Observed / Required Behavior |
|---|---------|-------------------|-----------------------------|
| 1 | Library | Empty library (0 local songs, 0 likes, 0 history) | Shows clean empty state illustration (`Music2` vector icon), informative message, and prominent "Import music" button. Never crashes or renders broken blank space. |
| 2 | Search | Search query with zero results | Shows empty state "No songs here yet" with helpful action button "Try Laufey". No console errors. |
| 3 | Search | Network failure during search | Displays inline error container with descriptive message and "Try again" button. Prevents unhandled Promise rejection. |
| 4 | Search | User types very rapidly in search box | Debounce timer (250ms) suppresses redundant requests. `AbortController.abort()` cancels in-flight fetch requests before initiating next query. |
| 5 | Player | Track title or artist is extremely long | Text truncated via `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` (or `overflow-wrap: anywhere;` on now-playing title). Container never clips or stretches beyond viewport. |
| 6 | Player | Audio file with missing or corrupt album artwork | Fallback placeholder container rendered with centered vector icon (`Music2`). Fallback triggered cleanly via `onError` handler without layout jump. |
| 7 | Player | Song without lyrics or instrumental recording | Lyrics panel displays informative instrumental badge (`Music2` icon + "Instrumental") or clean note ("No lyrics found for this song"). No spinning loader or broken view. |
| 8 | Player | Lyrics without word timestamps (standard LRC) | Renders line-level highlighting without crashing word-animation hooks. Active line smooth-scrolls to 38% golden ratio offset. |
| 9 | Player | User manually scrolls lyrics while playing | Pauses auto-scroll for 3.5 seconds (`userScrollTimeoutRef`), then resumes smooth auto-scroll to current lyric line. |
| 10 | Player | User adjusts lyric timing offset | Saves numeric delay (+/- 0.25s) in IndexedDB keyed by track ID. Subsequent playbacks apply saved offset automatically. |
| 11 | Network | Device goes offline while listening | `navigator.onLine` listener updates state; topbar renders `.offline-pill` with `WifiOff` icon. Online search gracefully disabled; local IndexedDB audio playback continues without interruption. |
| 12 | Modals | Modal opens while keyboard focus is active | Active element saved; focus trapped inside modal; `Tab` and `Shift+Tab` cycle through modal controls only; `Escape` key dismisses modal and restores previous focus. |
| 13 | Responsive | Viewport resized to 360px - 390px (Mobile) | Sidebar collapses completely (`display: none`); main padding adjusts to `17px 21px 160px`; bottom floating tab bar and mini player appear; horizontal clipping is strictly 0. |
| 14 | Responsive | Viewport resized to 768px - 1024px (iPad/Tablet) | Sidebar compacts to 165px; album grid reflows to 3-4 columns; right player panel becomes floating modal or docks cleanly without overlapping content. |
| 15 | Responsive | Viewport resized to 1600px+ (Large Display) | Content maxWidth expands to 1320px+; 5-column album grid; sidebar expands to 250px; player panel expands to 360px; whitespace scales proportionally. |
| 16 | Accessibility | User has `prefers-reduced-motion: reduce` enabled | All CSS animations and transitions disabled; WebGL shader freezes on current color frame; lyrics instant-scroll without spring interpolation. |
| 17 | Accessibility | User has `prefers-reduced-transparency: reduce` enabled | Glass platters switch from `backdrop-filter: blur(...)` to solid opaque backgrounds (`rgba(23, 29, 36, 0.98)` / `rgba(247, 247, 247, 0.98)`). |
| 18 | Accessibility | High contrast requirement (WCAG AA) | Text on or under glass maintains ≥ 4.5:1 contrast against backdrop; icons and borders maintain ≥ 3:1 contrast. Light gray on dark gray is strictly prohibited. |
| 19 | Audio Lab | Equalizer toggled off | Audio graph bypasses filters without resetting user band positions. Toggling back on restores previous slider values. |
| 20 | Audio Lab | Crossfade enabled during rapid track skipping | Rapid skip triggers clean fade-out ramp without audio clicking or memory accumulation. |

---

## Master UI Specification & Design System Requirements

### 1. FigCraft Prototyping Specifications

In compliance with user rule 1 and `figcraft-workflow/SKILL.md`, visual prototypes must be scripted, rendered, and exported for the following 5 views before modifying application code:

#### View 1: Player / Now Playing View (`view-player.json`)
- **Canvas Size**: 1440 × 900 (Desktop) and 390 × 844 (Mobile).
- **Composition**:
  - Fullscreen Apple Music atmosphere platter (`#080F16` base with flowing ambient color orbs).
  - Prominent 480 × 480 album artwork with 14px squircle radius and subtle 1px specular border.
  - Floating Liquid Glass playback controls island: 420px pill platter hovering below artwork with Snell's law specular top border, dual inner shadows, 3px scrub bar, and tactile transport controls (`Shuffle`, `SkipBack`, 56px `Play`, `SkipForward`, `Repeat`).
  - Right column: Synchronized animated lyrics panel with active highlighted line, glowing text mask, and timing adjuster.
  - Zero emojis; 100% Lucide vector icons (`Play`, `Pause`, `SkipBack`, `SkipForward`, `Shuffle`, `Repeat`, `Heart`, `Volume2`, `Minimize2`).

#### View 2: Navigation Chrome (`view-navigation.json`)
- **Canvas Size**: 1440 × 900 (Desktop shell) and 390 × 844 (Mobile shell).
- **Composition**:
  - Desktop: 224px fixed Liquid Glass sidebar platter hovering over `#080F16` background with brand logo ("Mochy Music"), navigation items (`Home`, `Search`, `Library`, `Audio Lab`, `Settings`), solid list items, and settings footer.
  - Desktop Topbar: Detached floating glass platter with route breadcrumbs, offline pill, history shortcut, and avatar.
  - Mobile: Floating bottom Liquid Glass navigation bar (`358px × 64px`, `rounded-full`, 5 evenly distributed destinations) + floating mini player platter (`358px × 56px`, `rounded-2xl`).

#### View 3: Library View (`view-library.json`)
- **Canvas Size**: 1440 × 900.
- **Composition**:
  - Header with title "Your Library", track count, and action buttons ("Import Spotify", "Import Audio").
  - Solid content cards for shortcuts: "Liked Songs" (solid `#171D24` container, pink vector icon, track count) and "On this device" (solid `#171D24` container, green vector icon).
  - 3-column bento playlist grid: solid cards with crisp 1px borders (`#30353B`), playlist title, and song count.
  - All Songs track list: solid list items with album thumbnails, titles, artists, durations, and action buttons. Zero `backdrop-filter` on scrolling cards.

#### View 4: Search View (`view-search.json`)
- **Canvas Size**: 1440 × 900.
- **Composition**:
  - Floating Liquid Glass Search Bar Platter: 680px pill platter, `Search` vector icon, input placeholder, and search action button.
  - Spotify Link Detection Card: solid `#171D24` card with Spotify vector badge and import button.
  - Browse Categories: 4 solid bento tiles with deep jewel tones, vinyl record vector line illustration, and arrow icon.
  - Search Results: Track list with cover art, title, artist, duration, like button, and context menu trigger.

#### View 5: Ambient Modes (`view-ambient.json`)
- **Canvas Size**: 1440 × 900.
- **Composition**:
  - Fullscreen dynamic ambient shader representation with multi-stop radial color mesh derived from album artwork.
  - Audio visualizer / beat sync energy wave pulses.
  - Floating glass control island detached above ambient background.
  - Synchronized lyrics display with active word highlight and spring motion indicator.

---

### 2. Design Tokens Reference (Apple Music & Liquid Glass)

#### CSS Variables Matrix:

```css
/* ==========================================================================
   Mochy Music PWA — Master Design Tokens
   ========================================================================== */

:root,
:root[data-theme="apple-dark"] {
  color-scheme: dark;

  /* 1. Core Surfaces (Solid Content Layer) */
  --mochy-bg: #080F16;
  --mochy-surface-solid: #171D24;
  --mochy-surface-raised: #232930;
  --mochy-surface-hover: rgba(255, 255, 255, 0.05);
  --mochy-surface-active: rgba(255, 255, 255, 0.09);

  /* 2. Floating Chrome Layer (Authentic Liquid Glass) */
  --glass-chrome-bg: rgba(23, 29, 36, 0.78);
  --glass-chrome-blur: blur(28px) saturate(190%);
  --glass-chrome-border: 1px solid rgba(255, 255, 255, 0.12);
  --glass-chrome-border-specular: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.05) 100%);
  --glass-chrome-shadow: 
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 2px 0 rgba(0, 0, 0, 0.20),
    0 16px 36px -4px rgba(0, 0, 0, 0.45);

  /* 3. Non-Refractive Inner Controls (Inside Glass Chrome) */
  --glass-inner-button-bg: rgba(255, 255, 255, 0.08);
  --glass-inner-button-hover: rgba(255, 255, 255, 0.14);
  --glass-inner-button-border: 1px solid rgba(255, 255, 255, 0.15);
  /* Note: NO backdrop-filter on inner controls to prevent nested refraction */

  /* 4. Solid Content Cards (Inside Scrolling Main) */
  --card-bg-solid: #171D24;
  --card-border-solid: 1px solid rgba(255, 255, 255, 0.08);
  --card-shadow-solid: 0 4px 16px -2px rgba(0, 0, 0, 0.35);
  --card-hover-border: 1px solid rgba(255, 255, 255, 0.18);
  /* Note: NO backdrop-filter on scrolling cards for high framerates */

  /* 5. Typography & Text Contrast */
  --text-primary: #F5FAFF;        /* Contrast > 12:1 against --mochy-bg */
  --text-secondary: rgba(245, 250, 255, 0.72); /* Contrast > 7:1 */
  --text-muted: #9BA1A6;          /* Contrast > 4.5:1 (WCAG AA compliant) */
  --text-subtle: #636366;

  /* 6. Apple Music Accent & Brand */
  --mochy-accent: #007AFF;        /* Apple System Blue */
  --mochy-accent-hover: #1A8CFF;
  --mochy-accent-tint: rgba(0, 122, 255, 0.15);
  --mochy-accent-glow: 0 0 24px rgba(0, 122, 255, 0.35);

  /* 7. Typography Stack */
  --font-stack: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, sans-serif;
  --font-hero: clamp(32px, 3.5vw, 48px);
  --font-title: 22px;
  --font-subhead: 15px;
  --font-body: 13px;
  --font-caption: 11px;
  --font-eyebrow: 10px;

  /* 8. Radii */
  --radius-platter: 9999px;
  --radius-card: 16px;
  --radius-tile: 12px;
  --radius-track: 8px;
}

:root[data-theme="apple-light"] {
  color-scheme: light;

  --mochy-bg: #FFFFFF;
  --mochy-surface-solid: #F7F7F7;
  --mochy-surface-raised: #EDEDED;
  --mochy-surface-hover: rgba(0, 0, 0, 0.04);
  --mochy-surface-active: rgba(0, 0, 0, 0.08);

  --glass-chrome-bg: rgba(255, 255, 255, 0.82);
  --glass-chrome-blur: blur(28px) saturate(180%);
  --glass-chrome-border: 1px solid rgba(0, 0, 0, 0.08);
  --glass-chrome-border-specular: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.3) 100%);
  --glass-chrome-shadow: 
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 2px 0 rgba(0, 0, 0, 0.06),
    0 16px 36px -4px rgba(0, 0, 0, 0.12);

  --glass-inner-button-bg: rgba(0, 0, 0, 0.05);
  --glass-inner-button-hover: rgba(0, 0, 0, 0.08);
  --glass-inner-button-border: 1px solid rgba(0, 0, 0, 0.06);

  --card-bg-solid: #F7F7F7;
  --card-border-solid: 1px solid #E0E0E0;
  --card-shadow-solid: 0 4px 16px -2px rgba(0, 0, 0, 0.06);
  --card-hover-border: 1px solid #C7C7CC;

  --text-primary: #000000;
  --text-secondary: rgba(0, 0, 0, 0.72);
  --text-muted: #575757;
  --text-subtle: #8E8E93;

  --mochy-accent: #007AFF;
  --mochy-accent-hover: #0062CC;
  --mochy-accent-tint: rgba(0, 122, 255, 0.10);
  --mochy-accent-glow: 0 0 20px rgba(0, 122, 255, 0.20);
}

:root[data-theme="pure-black"] {
  color-scheme: dark;
  --mochy-bg: #000000;
  --mochy-surface-solid: #0A0A0A;
  --mochy-surface-raised: #141414;
  --card-bg-solid: #0A0A0A;
  --card-border-solid: 1px solid #1C1C1E;
}
```

---

### 3. Component Specification & Styling Rules

1. **Floating Chrome Elements (Liquid Glass)**:
   - Elements: `.topbar`, `.sidebar`, `.mobile-nav`, `.player-panel`, `.mobile-mini`, `.af-controls`, `.modal`, `.toast`.
   - Apply: `backdrop-filter: var(--glass-chrome-blur)`, `background: var(--glass-chrome-bg)`, `border: var(--glass-chrome-border)`, `box-shadow: var(--glass-chrome-shadow)`.
   - All inner interactive controls must use solid fills (`var(--glass-inner-button-bg)`) and ZERO `backdrop-filter`.

2. **Content Cards (Solid Surfaces)**:
   - Elements: `.playlist-tile`, `.album-card`, `.settings-group`, `.about-card`, `.bring-music`, `.browse-card`, `.spotify-detect-card`, `.inline-error`.
   - Apply: `background: var(--card-bg-solid) !important`, `border: var(--card-border-solid) !important`, `box-shadow: var(--card-shadow-solid) !important`, `backdrop-filter: none !important`, `-webkit-backdrop-filter: none !important`.
   - Result: 60fps buttery scrolling without GPU composite repaint bottleneck, crystal clear text legibility satisfying WCAG AA (≥ 4.5:1).

3. **Strict Zero-Emoji Directive**:
   - 0 emoji characters allowed anywhere in the interface.
   - Replace any unicode decorative glyphs (e.g. `✳` in mobile breadcrumbs) with clean vector SVGs (`Music2`, `Disc3`, `Sparkles`).
   - All vector icons rendered via `lucide-react` with standardized `strokeWidth={1.75}` (or `1.5` / `2.0`).
   - Accessible names provided for all icon-only buttons via `aria-label` or visually hidden span.

4. **Branding Normalization**:
   - Update all user-facing product mentions from "Xenn" to "Mochy" / "Mochy Music".
   - `index.html`: `<title>Mochy Music</title>`
   - `main.jsx`: `Mochy Music · Now Playing`, `brand: mochy.`, `Mochy / Library`.

5. **Responsive Layout Dimensions**:
   - `Mobile (< 768px)`:
     - 1-column layout, sidebar hidden.
     - Content container `padding: 16px 20px 140px`.
     - Mobile mini player: `bottom: calc(72px + env(safe-area-inset-bottom))`, `left: 12px`, `right: 12px`, `height: 56px`.
     - Mobile bottom tab bar: `position: fixed`, `bottom: 0`, `left: 0`, `right: 0`, `height: calc(64px + env(safe-area-inset-bottom))`.
     - Minimum tap targets: 44px × 44px for all interactive buttons.
   - `Tablet (768px - 1189px)`:
     - Sidebar width: 180px.
     - Player panel width: 310px (collapsible / floating).
     - Album grid: `grid-template-columns: repeat(4, 1fr)`.
     - Playlist grid: `grid-template-columns: repeat(2, 1fr)`.
   - `Desktop (1190px - 1599px)`:
     - Sidebar width: 224px.
     - Player panel width: 316px.
     - Center canvas: `minmax(0, 1fr)` with `max-width: 1320px`.
     - Album grid: `grid-template-columns: repeat(5, 1fr)`.
     - Playlist grid: `grid-template-columns: repeat(3, 1fr)`.
   - `Wide Desktop (1600px+)`:
     - Sidebar width: 250px.
     - Player panel width: 360px.
     - Album grid: `grid-template-columns: repeat(5, 1fr)`.

---

## 6. Implementation Readiness & Transition

This survey provides the complete, authoritative specification for the redesign.
All requirements from `ORIGINAL_REQUEST.md`, `AGENTS.md`, and domain skills are documented and structured.
The orchestrator and downstream workers can proceed immediately to the FigCraft visual prototyping phase, generate the required prototypes, obtain review approval, and then execute the clean UI implementation with zero ambiguity.
