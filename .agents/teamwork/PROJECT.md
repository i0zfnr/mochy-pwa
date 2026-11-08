# Project: Mochy Music PWA UI Production Redesign

## Architecture
- **Application Type**: React 19 + Vite 7 Progressive Web App (PWA) with Electron desktop support.
- **Visual Design Paradigm**: Apple Music aesthetics combined with authentic Liquid Glass optics (iOS 26/27 standards), zero-emoji policy, professional Lucide vector icons, solid content surfaces, and responsive spatial hierarchy.
- **Optical Architecture**:
  - **Layer 1: Floating Chrome (Liquid Glass)**: Fixed/floating navigation platters (`.sidebar`, `.topbar`, `.mobile-nav`, `.mobile-mini`, `.player-panel`, `.af-controls` island, `.modal`, `.toast`). Uses `backdrop-filter: blur(28px) saturate(190%)`, specular border gradient, dual inner shadows, and elevation drop shadow.
  - **Layer 2: Content Cards & Lists (Solid Opaque Surfaces)**: All scrollable content containers (`.playlist-tile`, `.album-card`, `.settings-group`, `.about-card`, `.bring-music`, `.browse-card`, `.track-row`). Zero `backdrop-filter`, solid dark/light backgrounds (`#171D24` / `#F7F7F7`), crisp 1px borders, high-contrast typography satisfying WCAG AA (≥ 4.5:1).
  - **Layer 3: Controls Inside Platters**: Non-refractive translucent fills (`rgba(255, 255, 255, 0.08)`), ZERO `backdrop-filter` to prevent nested refraction artifacts and GPU fill-rate waste.
- **Audio & State Engine**: Dual backend `usePlayer` (IndexedDB local audio blobs + YouTube IFrame + Spotify mapping), Web Audio API 5-band EQ & DSP filter graph (`audio-lab.js`), AnalyserNode 20Hz-130Hz bass energy extraction, dynamic WebGL fluid aurora canvas (`PlaybackAtmosphere.jsx`).

## Code Layout
- `src/main.jsx`: Core application shell, navigation state, views (Home, Search, Library, Settings), player panel, full screen player, modals.
- `src/AudioLab.jsx`: Audio Lab control center, 6 DSP feature cards, 6 specialized configuration modals.
- `src/PlaybackAtmosphere.jsx`: Dynamic WebGL fluid aurora living canvas driven by album artwork palette and audio beat energy.
- `src/style.css`: Reset, CSS variables, baseline grid layout, responsive breakpoints.
- `src/apple-music.css`: Apple Music design system, typography scale, Liquid Glass tokens, solid card rules, button styling.
- `src/audio-lab.css`: Equalizer board, audio effect modals, SVG transition visualizers.
- `src/usePlayer.js`: Audio playback engine, media element hooks, Web Audio connection, MediaSession integration.
- `src/storage.js`: IndexedDB `mochy-library` v1 wrapper (`tracks`, `files`, `state`).
- `tests/`: Automated unit test suite run via `node --test tests/*.test.js`.
- `.agents/teamwork/`: Agent coordination workspace, metadata, state files, FigCraft prototypes, and test specifications.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | FigCraft Visual Prototypes | Script and render 2x PNG visual prototypes for 5 core views (Player, Navigation, Library, Search, Ambient) | M1 | Survey / R1 (DONE) |
| 2 | Liquid Glass Design Tokens & Surface System | Restructure CSS variables for authentic Liquid Glass floating chrome and solid content cards; remove nested blurs | M2 | Survey / R2 |
| 3 | Zero-Emoji & Clean Iconography Cleanup | Remove CSS `✳` glyph in `style.css:9`; verify 100% Lucide vector icons; normalize branding to Mochy Music | M2 | Survey / R2 |
| 4 | Responsive Viewport Reset & Layout Discipline | Fix viewport meta in `index.html` (remove `user-scalable=no, maximum-scale=1`); define fluid grid for 390px, 768px/1024px, 1280px+ | M2 | Survey / R2 |
| 5 | Fullscreen Apple Music Player & Atmosphere | Immersive player with living WebGL aurora canvas, squircle artwork, floating glass controls island, karaoke lyrics with word highlight | M3 | Survey / R2 |
| 6 | Desktop Sidebar & Topbar Chrome | Liquid glass floating sidebar with navigation and playlist collections; floating topbar with breadcrumb and status pills | M3 | Survey / R2 |
| 7 | Mobile Nav Dock & Floating Mini Player | Floating glass bottom dock and persistent mini player platter with touch-friendly 44px tap targets | M3 | Survey / R2 |
| 8 | Desktop/Tablet Aside Player Panel | Persistent right-hand glass panel with Playing, Lyrics, and Queue tabs; seek scrubber; volume slider | M3 | Survey / R2 |
| 9 | Home Discovery View & Hero | Personalized daily soundtrack hero, horizontal mood chip row, 2-column recent rotation, 5-column recommendations, local upload CTA | M4 | Survey / R2 |
| 10 | Search View & Spotify Import Card | Debounced search bar with glass sheen, 1-click Spotify link import card, 4 solid bento category cards, search results list | M4 | Survey / R2 |
| 11 | Library Views & Playlist Management | Header with quick actions, solid Liked Songs & On Device cards, 3-column playlist grid, track rows with context menus | M4 | Survey / R2 |
| 12 | Audio Lab DSP & Settings View | 6 high-precision DSP feature cards, 6 audio dialogs (5-band EQ, spatial audio, crossfade), appearance controls, backup export | M4 | Survey / R2 |
| 13 | Modals, Sheets & Toast Notifications | Liquid glass modal sheets for track options, create playlist, Spotify import, and toast notifications | M4 | Survey / R2 |
| 14 | Audio Engine Hook Polish | Fix latent `ReferenceError: silentAudio` in `src/usePlayer.js:177`; maintain Web Audio filter graph and server startup format | M3 | Survey / R3 |
| 15 | E2E Testing Track Infrastructure | Design requirement-driven opaque-box test runner and test cases (Tiers 1-4) in parallel with implementation | E2E | Dual Track / R3 (DONE) |
| 16 | Final E2E Test Pass & Coverage Hardening | Pass 100% of E2E test suite (Tiers 1-4) and adversarial coverage hardening (Tier 5) | M5 | Dual Track / R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | FigCraft Visual Prototyping | Create `.figcraft` models and render high-res 2x PNGs for 5 views (Player, Navigation, Library, Search, Ambient); export to `.agents/teamwork/figcraft_prototypes/` | None | DONE |
| E2E | E2E Testing Track | Independent opaque-box test harness and test suites across Tiers 1-4, publishing TEST_READY.md | None | DONE |
| M2 | Design Tokens, Solid Surfaces & Layout Foundations | Update `style.css` and `apple-music.css` tokens; enforce solid surfaces on content cards; eliminate nested blur; purge `✳` glyph; fix viewport meta; normalize branding | M1 | IN_PROGRESS |
| M3 | Navigation Chrome, Player & Ambient Overhaul | Implement Liquid Glass floating chrome for Sidebar, Topbar, Mobile Nav dock, Mini Player, Aside Player Panel, Fullscreen Player, and fix `usePlayer.js:177` | M2 | PLANNED |
| M4 | Core Views, Audio Lab & Modals Redesign | Implement solid card layouts and refined styling for Home hero/feed, Search & Spotify card, Library playlists/tracks, Audio Lab cards/modals, Settings, Toasts | M3 | PLANNED |
| M5 | Final E2E Test Pass & Adversarial Hardening | Phase 1: 100% pass of E2E tests (Tiers 1-4). Phase 2: Adversarial coverage hardening (Tier 5) | M4, E2E | PLANNED |

## Interface Contracts
### Design Tokens ↔ Component Layer
- Floating Chrome elements (`.sidebar`, `.topbar`, `.mobile-nav`, `.mobile-mini`, `.player-panel`, `.af-controls`, `.modal`, `.toast`):
  - Must use `var(--glass-chrome-bg)`, `var(--glass-chrome-blur)`, `var(--glass-chrome-border)`, `var(--glass-chrome-shadow)`.
- Content Cards (`.playlist-tile`, `.album-card`, `.settings-group`, `.about-card`, `.bring-music`, `.browse-card`, `.track-row`):
  - Must use `var(--card-bg-solid)`, `var(--card-border-solid)`, `var(--card-shadow-solid)`.
  - Must explicitly set `backdrop-filter: none !important; -webkit-backdrop-filter: none !important;`.
- Controls Inside Floating Chrome (`.nav-item`, `.icon-button`, `.secondary` inside chrome):
  - Must use non-refractive background `rgba(255, 255, 255, 0.08)` / `rgba(0, 0, 0, 0.05)` and zero `backdrop-filter`.

### Audio Engine & Server ↔ UI Layer
- `usePlayer.js` exports: `current`, `playing`, `loading`, `position`, `duration`, `volume`, `shuffle`, `repeat`, `queue`, `index`, `play`, `pause`, `toggle`, `seek`, `setVolume`, `next`, `prev`, `setShuffle`, `cycleRepeat`, `playTrack`, `addToQueue`, `removeFromQueue`, `clearQueue`, `reorderQueue`, `analyserRef`.
- `server/start.js` & `server/index.js`: Must retain stdout format `(?:Xenn|Mochy) is ready at (http:\/\/127\.0\.0\.1:\d+)`.
- Automated test scripts: `npm test` must always execute 49/49 pass; `npm run build` must always compile cleanly without errors.
