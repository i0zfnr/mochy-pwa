# Mochy Music PWA — Test Infrastructure & Quality Assurance Specification (TEST_INFRA.md)

**Document Version**: 1.0.0  
**Target Project**: Mochy Music PWA (`c:\laragon\www\mochy-pwa`)  
**Lead Track**: E2E Testing Track (`test_writer_e2e_1`)  
**Parent Orchestrator**: `a757a828-6846-44b4-8f4d-2804ea827db6`  
**Status**: Authoritative Test Specification  

---

## 1. Executive Summary & Testing Philosophy

This document defines the authoritative, requirement-driven 4-tier testing methodology for the Mochy Music PWA UI Redesign project.

### Core Testing Directives
1. **Opaque-Box Requirement Verification**: Tests verify behavioral outcomes, design contracts, and interface invariants against `PROJECT.md` and `ORIGINAL_REQUEST.md`, independent of ephemeral implementation details.
2. **Standard Test Framework Alignment**: Full compatibility with the project's native runner: `node --test tests/*.test.js` (`node:test` and `node:assert/strict`). Zero external runtime dependencies required to execute the test suite.
3. **Multi-Layer Static, AST, and Structural Verification**: Comprehensive inspection covering:
   - **Zero-Emoji Policy**: Assert 0 emoji characters exist anywhere across UI components, source files, and templates.
   - **100% Vector Icon Usage**: Assert all iconography strictly originates from `lucide-react` or clean inline SVG with accessible labels.
   - **Liquid Glass Optical Architecture**: Assert liquid glass styling (`backdrop-filter: blur(...) saturate(...)`) is applied **exclusively** to floating chrome (`.sidebar`, `.topbar`, `.mobile-nav`, `.player-panel`, `.mobile-mini`, `.af-controls`, `.modal`, `.toast`).
   - **Solid Surface Layer**: Assert zero `backdrop-filter` on scrolling content cards (`.playlist-tile`, `.settings-group`, `.album-card`, `.about-card`, `.bring-music`, `.browse-card`, `.track-row`) and on nested controls inside platters.
   - **Responsive Spatial Hierarchy**: Assert layout stability, fluid breakpoints (390px mobile, 768px/1024px tablet/iPad, 1280px+ desktop), zero horizontal clipping, and minimum 44px tap targets.
   - **Audio Engine & DSP Integrity**: Assert 100% contract preservation for `usePlayer.js` exports, `audio-lab.js` DSP frequency bands, server startup regex, and existing 16 unit tests.
4. **Progressive Testability**: Verification respects milestone boundaries and enables incremental test passes as M1 (FigCraft), M2 (Tokens/Surfaces), M3 (Chrome/Player), M4 (Views/AudioLab), and M5 (Final Hardening) progress.

---

## 2. Test Runner Architecture & Execution

### 2.1 Test Execution Commands

```powershell
# Run the complete test suite (unit + e2e)
npm test

# Equivalent direct command:
node --test tests/*.test.js

# Run specific E2E test suites individually:
node --test tests/e2e-zero-emoji.test.js
node --test tests/e2e-design-system.test.js
node --test tests/e2e-viewports.test.js
node --test tests/e2e-audio-engine.test.js
node --test tests/e2e-scenarios.test.js

# Verify production build compilation
npm run build
```

### 2.2 Test Suite File Catalog

| File | Target Scope | Verification Method |
|---|---|---|
| `tests/ambient-palette.test.js` | Ambient color extraction & lyric contrast | Unit test (pixel buffer math & brightness cap) |
| `tests/audio-lab.test.js` | DSP EQ graph, presets, effects, transition filters | Unit test (mock Web Audio nodes & parameter checks) |
| `tests/entrypoint.test.js` | Server process startup and health probe | Integration test (spawns child process, parses stdout) |
| `tests/lyrics-match.test.js` | LRC parser, word timing tags, artwork sizing | Unit test (parser logic, fuzzy recording matcher) |
| `tests/music.test.js` | Queue navigation, duration formatter, search parser | Unit test & Integration (queue math, API validation) |
| `tests/e2e-zero-emoji.test.js` | Zero-emoji policy & 100% Lucide icon verification | Static AST & regex scan across `src/` and templates |
| `tests/e2e-design-system.test.js` | Liquid glass platters, solid cards, WCAG AA contrast | CSS AST & rule parser, optical layer assertion |
| `tests/e2e-viewports.test.js` | Responsive breakpoints (390px, 768px/1024px, 1280px+) | CSS media query parser & viewport meta validation |
| `tests/e2e-audio-engine.test.js` | Audio engine exports contract & DSP stability | Module static analysis, interface contract checks |
| `tests/e2e-scenarios.test.js` | Tiers 1-4 functional, corner, combination, and journeys | In-memory simulated state machines & DOM assertions |

---

## 3. Tier 1: Feature Coverage (>=5 Tests per Inventoried Feature)

Coverage matrix addressing all 16 features from `PROJECT.md` Feature Inventory:

### Feature 1: FigCraft Visual Prototypes
- **T1.1.1**: Verify prototype script definitions exist for 5 core views (`view-player`, `view-navigation`, `view-library`, `view-search`, `view-ambient`).
- **T1.1.2**: Verify desktop canvas dimensions (1440x900) and mobile canvas dimensions (390x844) in FigCraft models.
- **T1.1.3**: Verify exported high-resolution 2x PNG rendering files exist in `.agents/teamwork/figcraft_prototypes/`.
- **T1.1.4**: Verify visual prototype structure contains solid content container platters and detached floating chrome.
- **T1.1.5**: Verify visual prototype metadata asserts zero emojis and Lucide vector iconography.

### Feature 2: Liquid Glass Design Tokens & Surface System
- **T1.2.1**: Verify `:root[data-theme="apple-dark"]` defines `--glass-chrome-bg`, `--glass-chrome-blur`, and specular border gradient.
- **T1.2.2**: Verify `:root[data-theme="apple-light"]` defines high-contrast light-mode glass chrome tokens.
- **T1.2.3**: Verify solid content card token definitions (`--card-bg-solid`, `--card-border-solid`, `--card-shadow-solid`).
- **T1.2.4**: Verify inner controls token definitions specify non-refractive translucent fills (`rgba(255, 255, 255, 0.08)` / `rgba(0, 0, 0, 0.05)`).
- **T1.2.5**: Verify reduced transparency media query (`prefers-reduced-transparency: reduce`) provides opaque fallback styles.

### Feature 3: Zero-Emoji & Clean Iconography Cleanup
- **T1.3.1**: Verify zero Unicode pictorial emoji characters across all `.jsx` and `.js` source files in `src/`.
- **T1.3.2**: Verify all icon elements in `main.jsx` and `AudioLab.jsx` import from `lucide-react`.
- **T1.3.3**: Verify absence of legacy `✳` (U+2733) character in mobile breadcrumb styles.
- **T1.3.4**: Verify accessible `aria-label` or `title` attributes exist on icon-only interactive buttons (`IconButton`).
- **T1.3.5**: Verify product branding string normalized to "Mochy" / "Mochy Music" across titles and headings.

### Feature 4: Responsive Viewport Reset & Layout Discipline
- **T1.4.1**: Verify `index.html` viewport meta tag includes `width=device-width` and `viewport-fit=cover`.
- **T1.4.2**: Verify `index.html` viewport meta omits forbidden `user-scalable=no` and `maximum-scale=1` per Anti-Slop R-39.
- **T1.4.3**: Verify CSS media query for mobile (`<= 760px` or `<= 767px`): hides sidebar (`display: none`), enables mobile bottom dock.
- **T1.4.4**: Verify CSS media query for tablet (`768px` to `1189px`): compacts sidebar and reflows album cards to 4 columns.
- **T1.4.5**: Verify CSS layout for desktop (`1280px+`): enforces 3-column architecture (sidebar, center canvas, right player panel).

### Feature 5: Fullscreen Apple Music Player & Atmosphere
- **T1.5.1**: Verify fullscreen overlay element (`.fullscreen-player` / `player-expanded`) toggles via state without page reload.
- **T1.5.2**: Verify WebGL canvas element (`AlbumAtmosphere`) mounts with downscaled rendering resolution for 60fps performance.
- **T1.5.3**: Verify floating controls island (`.af-controls`) hovers detached with liquid glass styling and specular border.
- **T1.5.4**: Verify synced lyrics container supports word-highlight classes and smooth golden-ratio auto-scrolling (38% offset).
- **T1.5.5**: Verify keyboard dismissal via `Escape` key restores previous view and focus.

### Feature 6: Desktop Sidebar & Topbar Chrome
- **T1.6.1**: Verify `.sidebar` has fixed positioning, liquid glass backdrop blur, and specular border highlight.
- **T1.6.2**: Verify navigation items (`Home`, `Search`, `Library`, `Audio Lab`, `Settings`) render Lucide vector icons.
- **T1.6.3**: Verify `.topbar` renders route breadcrumb, offline indicator, and quick settings trigger.
- **T1.6.4**: Verify active navigation state changes page view without causing audio pause or state loss.
- **T1.6.5**: Verify `.sidebar .nav-item` controls have zero nested `backdrop-filter`.

### Feature 7: Mobile Nav Dock & Floating Mini Player
- **T1.7.1**: Verify `.mobile-nav` has fixed bottom positioning with `calc(env(safe-area-inset-bottom) + ...)` padding.
- **T1.7.2**: Verify `.mobile-nav` buttons have minimum 44px x 44px tap target areas.
- **T1.7.3**: Verify `.mobile-mini` player floats above bottom nav dock with track cover, title, artist, and transport controls.
- **T1.7.4**: Verify tapping `.mobile-mini` track info expands fullscreen player.
- **T1.7.5**: Verify `.mobile-mini` gracefully hides when no track is actively loaded.

### Feature 8: Desktop/Tablet Aside Player Panel
- **T1.8.1**: Verify `.player-panel` contains Playing, Lyrics, and Queue tab selector buttons.
- **T1.8.2**: Verify seek bar scrubber allows dragging and updates playback position.
- **T1.8.3**: Verify volume slider allows dragging and adjusts audio gain.
- **T1.8.4**: Verify queue tab renders list of upcoming tracks with remove and jump-to actions.
- **T1.8.5**: Verify empty player panel displays fallback placeholder with clean Lucide vector icon.

### Feature 9: Home Discovery View & Hero
- **T1.9.1**: Verify Daily Soundtrack hero displays recently played track or top recommendation.
- **T1.9.2**: Verify hero primary play button initiates queue playback.
- **T1.9.3**: Verify mood filter chip row ('For you', 'Chill', 'Focus', etc.) enables horizontal scroll without clipping.
- **T1.9.4**: Verify 'Back In Your Rotation' 2-column grid renders tracks with album artwork and like triggers.
- **T1.9.5**: Verify 'Your Next Favorites' responsive album card grid renders 5 columns on desktop.

### Feature 10: Search View & Spotify Import Card
- **T1.10.1**: Verify search input debounces queries by 250ms to suppress redundant network calls.
- **T1.10.2**: Verify Spotify URL pattern detection activates 1-click import card for playlist/album/track links.
- **T1.10.3**: Verify 4 quick browse category bento cards render with solid jewel backgrounds and Lucide icons.
- **T1.10.4**: Verify search results track rows display track number, thumbnail, title, artist, duration, and menu trigger.
- **T1.10.5**: Verify empty search results state provides helpful suggestions without throwing errors.

### Feature 11: Library Views & Playlist Management
- **T1.11.1**: Verify library shortcut cards for 'Liked Songs' and 'On this device' render with solid surfaces.
- **T1.11.2**: Verify custom playlist creation modal validates non-empty playlist name string (max 80 chars).
- **T1.11.3**: Verify playlist deletion removes entry from IndexedDB state and updates UI immediately.
- **T1.11.4**: Verify local audio file import handles multiple files (MP3, FLAC, M4A, WAV, OGG, AAC, OPUS, WEBM).
- **T1.11.5**: Verify library backup exports clean `xenn-library.json` / `mochy-library.json` with tracks, likes, and playlists.

### Feature 12: Audio Lab DSP & Settings View
- **T1.12.1**: Verify 5-band graphic equalizer exports valid frequencies (60Hz, 250Hz, 1kHz, 4kHz, 12kHz).
- **T1.12.2**: Verify EQ slider values clamp between -12dB and +12dB.
- **T1.12.3**: Verify audio effect modes (`off`, `surround`, `bass`, `concert`, `vocal`) update Web Audio graph.
- **T1.12.4**: Verify transition presets (`auto`, `crossfade_5s`, `gapless`, `off`) configure track transitions.
- **T1.12.5**: Verify audio quality modes (`auto`, `high`, `normal`, `saver`) map to appropriate stream bitrates.

### Feature 13: Modals, Sheets & Toast Notifications
- **T1.13.1**: Verify modal backdrop traps focus when open (`role="dialog"`).
- **T1.13.2**: Verify pressing `Escape` closes open modal and restores previous document focus.
- **T1.13.3**: Verify track options context menu offers Like, Add to Queue, and Add to Playlist actions.
- **T1.13.4**: Verify toast notifications render floating with liquid glass styling and auto-dismiss after timeout.
- **T1.13.5**: Verify Spotify import modal displays progress indicator and error messaging for invalid links.

### Feature 14: Audio Engine Hook Polish
- **T1.14.1**: Verify `usePlayer.js` exports required interface properties and methods.
- **T1.14.2**: Verify `usePlayer.js` unmount cleanup safely accesses `silentAudioRef.current?.pause()` without throwing `ReferenceError`.
- **T1.14.3**: Verify Web Audio filter chain updates when switching EQ presets without audio pops.
- **T1.14.4**: Verify MediaSession metadata and action handlers (`play`, `pause`, `previoustrack`, `nexttrack`, `seekto`) register properly.
- **T1.14.5**: Verify server entrypoint startup message retains `/(?:Xenn|Mochy) is ready at (http:\/\/127\.0\.0\.1:\d+)/`.

### Feature 15: E2E Testing Track Infrastructure
- **T1.15.1**: Verify `TEST_INFRA.md` exists and defines the complete 4-tier testing specification.
- **T1.15.2**: Verify automated test files under `tests/` execute via `npm test` without failures.
- **T1.15.3**: Verify test suite runs in under 5 seconds for fast CI/CD feedback.
- **T1.15.4**: Verify tests are self-contained, idempotent, and do not mutate production storage or persistent state.
- **T1.15.5**: Verify `TEST_READY.md` publishes verified results and test run commands.

### Feature 16: Final E2E Test Pass & Coverage Hardening
- **T1.16.1**: Verify 100% test pass rate across all test suites (Tiers 1-4).
- **T1.16.2**: Verify zero test flakiness across 5 consecutive executions.
- **T1.16.3**: Verify clean `npm run build` compilation with zero syntax or bundling errors.
- **T1.16.4**: Verify all 16 original unit tests pass with zero regressions.
- **T1.16.5**: Verify full compliance with user rules: zero emojis, Lucide icons only, glass on floating chrome only, solid content cards.

---

## 4. Tier 2: Boundary & Corner Cases

| Case ID | Boundary / Corner Condition | Target Component | Required System Behavior | Authoritative Expected Output |
|---|---|---|---|---|
| **B2.1** | Empty library (0 songs, 0 likes, 0 history) | `src/main.jsx` (Library view) | Renders clean empty state illustration with `Music2` icon and "Import music" button | No crash, no broken tables, returns empty state container |
| **B2.2** | Obscure search query with 0 results | `src/main.jsx` (Search view) | Displays "No songs here yet" with "Try Laufey" suggestion action | Zero console errors, empty search container displayed |
| **B2.3** | Extremely long track title (>200 characters) | `TrackRow`, `PlayerPanel`, `Cover` | CSS truncates title via `text-overflow: ellipsis; white-space: nowrap;` | Container width does not expand, zero horizontal page scroll |
| **B2.4** | Extremely long artist name string | `TrackRow`, `PlayerPanel` | Secondary text truncated with ellipsis | Layout remains intact, text truncated cleanly |
| **B2.5** | Missing or corrupt album artwork URL (404/invalid) | `Cover` component (`src/main.jsx:57`) | `onError` handler catches failure, renders fallback container with `Music2` icon | Fallback element rendered without broken image icon |
| **B2.6** | Song without lyrics or instrumental track | Lyrics panel (`main.jsx:371`) | Shows `Music2` icon and "Instrumental" badge or "No lyrics found" | No infinite spinner, clean informative note displayed |
| **B2.7** | Plain lyrics without synced timestamps | Lyrics panel (`main.jsx:369`) | Renders plain text lines without crashing timing hook | Lyrics readable as static text |
| **B2.8** | Synced lyrics without word-level timestamps | Lyrics panel (`music.js:parseLrc`) | Words array is `undefined`; falls back to line-level highlighting | Highlight applies to full line without animation crashes |
| **B2.9** | Manual scroll during synced lyrics playback | `useSmoothLyricScroll` hook | Pauses auto-scroll for 3.5s (`userScrollTimeoutRef`), then resumes | User can read upcoming lyrics without jerky snaps |
| **B2.10** | Lyric timing offset boundary (+/- 5.0 seconds) | `setLyricDelay` (`main.jsx:389`) | Clamps or rounds to 2 decimal places, persists in IndexedDB | Offset applied to position math without negative seek crash |
| **B2.11** | Device network disconnects while listening | Topbar offline listener (`main.jsx:398`) | Topbar renders `.offline-pill` with `WifiOff` icon; local audio continues | Local audio playback uninterrupted, UI reflects offline |
| **B2.12** | Offline search query attempted | Search view (`main.jsx:396`) | Displays error notice "Offline" with retry option | Graceful error notice, no uncaught fetch rejection |
| **B2.13** | Zero-duration or NaN track duration | `src/music.js:time()` | `time(NaN)` or `time(-5)` returns `'0:00'` | Returns `'0:00'` string without crashing |
| **B2.14** | Queue completion with repeat mode 'off' | `src/music.js:nextIndex()` | `nextIndex(last, len, false, 'off', 1)` returns `-1` | Playback stops gracefully at queue end |
| **B2.15** | Queue completion with repeat mode 'all' | `src/music.js:nextIndex()` | `nextIndex(last, len, false, 'all', 1)` returns `0` | Queue wraps back to first track |
| **B2.16** | Queue navigation with repeat mode 'one' | `src/music.js:nextIndex()` | `nextIndex(idx, len, false, 'one', 1)` returns current index | Current track replays from start |
| **B2.17** | Equalizer slider boundary values (-12dB to +12dB) | `src/audio-lab.js` | Clamps gains to valid Web Audio dB bounds | No audio distortion or filter node clipping |
| **B2.18** | Keyboard modal navigation | Modal dialog (`main.jsx:406`) | `Escape` key dismisses modal; `Tab` traps focus inside dialog | Accessible focus trap, backdrop click dismisses |
| **B2.19** | Rapid search input changes | Search input (`main.jsx:329`) | 250ms debounce timer suppresses redundant network requests | Only latest query triggers fetch; previous aborted |
| **B2.20** | Unsupported file format dropped on importer | File import (`storage.js`) | Rejects non-audio MIME types with user toast notice | Warning toast shown, valid audio files imported |

---

## 5. Tier 3: Cross-Feature Combinations (Pairwise Interactions)

1. **Audio Playback + Active Search Querying**:
   - Starting a search while a local audio blob or YouTube stream is playing does not stutter, pause, or reset the audio pipeline.
   - Search input debounce cancels in-flight fetch requests without interrupting the Web Audio AnalyserNode beat energy stream.
2. **Theme Switching During Lyrics Auto-Scrolling**:
   - Switching theme (`apple-dark` -> `apple-light` -> `pure-black`) dynamically updates CSS variables (`data-theme`) and `meta[name="theme-color"]` without resetting the current lyric scroll position or re-mounting the audio player.
3. **Custom Artwork Shape Customizer in Fullscreen Player**:
   - Cycling artwork shape (`clover` -> `rounded` -> `circle`) instantly updates `.player-art` and `.af-cover-box` border radii while preserving 1:1 aspect ratio and living WebGL aurora canvas rendering.
4. **Equalizer Preset Switching During Playback**:
   - Switching EQ presets (`flat` -> `bass_boost` -> `vocal` -> `custom`) updates 5 BiquadFilterNode gains in real-time via `setTargetAtTime` without audible audio pop or clicks.
5. **Spatial Audio / Bass Punch Toggling with Volume Scrubbing**:
   - Adjusting volume slider concurrently with audio effect toggling maintains gain staging within `[0.0, 1.0]` master ceiling, avoiding digital clipping.
6. **Track Favoriting (Like/Unlike) Inside Context Menu**:
   - Liking a track from the floating options modal updates `likes` state in IndexedDB and toggles the heart icon on both the track row and Now Playing bar simultaneously.
7. **Queue Reordering During Track Transition Crossfade**:
   - Dragging or removing a track in the Queue panel while an auto-crossfade (3s/5s) is ramping does not corrupt the upcoming `nextIndex` pointer or throw null dereferences.
8. **Dynamic Viewport Resizing (Desktop -> Mobile -> Tablet)**:
   - Resizing viewport from 1440px to 390px docks the aside player panel into `.mobile-mini` without interrupting playback; resizing back to 1440px restores the 3-column spatial architecture.
9. **PWA Installation Banner with Modal Active**:
   - A deferred `beforeinstallprompt` event does not obstruct or steal focus from an active playlist creation or track options dialog.
10. **Local File Drag-and-Drop While Importing Spotify Playlist**:
    - Concurrently importing local MP3 files while an asynchronous Spotify URL metadata fetch is in progress safely sequences writes to IndexedDB `mochy-library` stores (`tracks`, `files`, `state`).

---

## 6. Tier 4: Real-World Application Scenarios (End-to-End User Journeys)

### Journey 1: First-Time User Onboarding & Local File Import
1. User loads Mochy Music PWA on clean state (empty library).
2. App renders Home view with hero recommendation, mood filter row, and prominent "Import your music" CTA.
3. User navigates to Library, clicks "Import Audio", and selects multiple local audio tracks (`.mp3`, `.flac`, `.wav`).
4. Importer extracts ID3 tags (title, artist, album, duration, cover art) and stores audio Blobs into IndexedDB `files` and `tracks`.
5. Library refreshes: "On this device" shortcut shows updated count, and tracks populate the all songs list.
6. User clicks first track: audio playback starts immediately, bottom mini player docks on mobile or right panel opens on desktop.

### Journey 2: Search, Discover & Queue YouTube Audio
1. User enters Search view, types "Laufey" into debounced search box.
2. System waits 250ms, queries YouTube Music API, and displays results with thumbnails and durations.
3. User hovers over third result and clicks "Add to Queue". Toast confirms track added.
4. User clicks second result to play immediately. Current track switches, audio starts, and Now Playing artwork updates with ambient color extraction.
5. User opens Queue tab: verifies queued track is next in line.
6. User clicks skip forward: queued track begins playing seamlessly.

### Journey 3: Immersive Fullscreen Lyrics & Karaoke Mode
1. User starts playing a track with synchronized lyrics.
2. User taps album artwork or fullscreen button (`Maximize2` icon).
3. Fullscreen overlay opens with living WebGL fluid aurora background driven by album tones and audio beat energy.
4. Lyrics scroll automatically to active line with golden ratio (38%) vertical positioning and glowing active line styling.
5. User clicks an upcoming lyric line: player seeks instantly to that timestamp, and auto-scroll resumes.
6. User presses `Escape`: fullscreen overlay dismisses smoothly without disrupting playback.

### Journey 4: Custom Playlist Creation, Curating & Sharing
1. User opens Library view, clicks "New Playlist".
2. Liquid glass modal opens; user types "Late Night Chill" and presses Enter.
3. Modal closes; new playlist card appears in 3-column bento grid.
4. User navigates to Home, opens context menu (`...`) on a recommended song, and selects "Add to Playlist" -> "Late Night Chill".
5. User navigates to Settings, clicks "Export Library Backup": downloads `mochy-library.json` containing the newly created playlist and track references.

### Journey 5: Audiophile DSP & Audio Lab Customization
1. User opens Audio Lab view via sidebar or mobile nav dock.
2. 6 DSP feature cards render with solid surfaces: 5-band EQ, 3D Spatial Surround, Bass Punch, Crossfade, Audio Quality, and Beat Reactive visuals.
3. User opens Equalizer modal, selects "Bass Boost" preset: 60Hz slider ramps up to +6dB.
4. User manually tweaks 1kHz and 12kHz bands to custom positions; preset indicator updates to "Custom".
5. User toggles "3D Spatial Surround" on and sets transition crossfade to "5s Crossfade".
6. Audio graph updates in real-time; subsequent track transitions apply a smooth 5-second fade ramp.

### Journey 6: Offline Resilience & Reconnection
1. User is playing a local audio track on mobile device.
2. Device loses Wi-Fi / cellular connectivity (`navigator.onLine` becomes `false`).
3. Topbar renders `.offline-pill` with `WifiOff` icon.
4. Local audio playback continues completely uninterrupted from IndexedDB cache.
5. User attempts online YouTube search: system shows graceful offline message without crashing.
6. Connection is restored: `.offline-pill` smoothly disappears, and online search resumes functionality.

---

## 7. Pass/Fail Criteria & Quality Gate

A test run is considered **PASSING** only if:
1. `npm test` (`node --test tests/*.test.js`) exits with code `0`.
2. Zero failed tests (`fail 0`).
3. Zero uncaught exceptions or unhandled Promise rejections.
4. Build verification (`npm run build`) exits with code `0`.
5. All 16 baseline unit tests pass with zero regressions.
6. Static and AST assertions confirm zero emoji characters in UI components, 100% Lucide vector icon usage, liquid glass applied only to floating chrome, zero backdrop-filter on scrolling cards, and responsive media queries across standard viewports.

---

## 8. Invalidation Conditions

This test specification and its accompanying test suites are invalidated if:
1. The project switches test runners from Node.js native `node:test` to an incompatible runner without migrating test signatures.
2. Audio engine exports in `src/usePlayer.js` are altered in a way that breaks backward compatibility with `main.jsx`.
3. Server startup output format is changed from `/(?:Xenn|Mochy) is ready at (http:\/\/127\.0\.0\.1:\d+)/`.
4. Any test relies on network calls to live third-party services (YouTube, Spotify) during unit/e2e test execution rather than pure parsers and synthetic mocks.
