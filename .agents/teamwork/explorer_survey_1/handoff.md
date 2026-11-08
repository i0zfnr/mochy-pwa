# Codebase Architecture & Feature Inventory Survey Report

**Explorer**: Survey Explorer 1  
**Target Project**: Mochy Music PWA (`c:\laragon\www\mochy-pwa`)  
**Parent Orchestrator**: `a757a828-6846-44b4-8f4d-2804ea827db6`  
**Date**: 2026-11-08  

---

## 1. Observation

Direct observations from source code inspection, dependency analysis, and automated test runs:

### 1.1 Project Configuration & Dependencies
- **`package.json`** (`package.json:1-60`):
  - Application Name: `"mochy-web"`, version `0.1.0`, license `GPL-3.0-only`.
  - Core UI Framework: `"react": "^19.2.0"`, `"react-dom": "^19.2.0"`.
  - Vector Icons: `"lucide-react": "^0.468.0"` (already installed and widely used).
  - Client Storage: `"idb": "^8.0.0"` (IndexedDB wrapper).
  - Audio Metadata: `"music-metadata": "^12.3.5"` (in-browser client audio tag/artwork parser).
  - Bundler / Build: `"vite": "^7.2.0"` (active `v7.3.7`), `"@vitejs/plugin-react": "^5.1.0"`.
  - Desktop Packaging: `"electron": "^45.2.3"`, `"electron-builder": "^26.18.0"`.
  - Scripts:
    - `"dev"`: `node server/index.js --dev`
    - `"build"`: `vite build`
    - `"start"`: `node server/start.js`
    - `"test"`: `node --test tests/*.test.js`
- **Build & Test Verification**:
  - `npm test` runs 16 tests in 736ms and exits with code 0 (16 pass, 0 fail).
  - `npm run build` runs `vite build`, transforming 1,750 modules, generating `dist/index.html` and bundled assets in 4.80s, exiting with code 0.
- **CSS Architecture**:
  - No Tailwind CSS or PostCSS configuration is present.
  - CSS is plain modular CSS imported in `src/main.jsx:40-41`:
    - `src/style.css` (37,121 bytes): Baseline styles, reset, dark grid layout, responsive breakpoints.
    - `src/apple-music.css` (61,797 bytes): Apple Music design system (`[data-theme="apple-light"]` and `[data-theme="apple-dark"]`), typography scale, liquid glass tokens, buttons, full-screen player.
    - `src/audio-lab.css` (14,282 bytes): Equalizer board, audio effect modals, transition visualizer.
    - `src/playback-atmosphere.css` (14,074 bytes): Dynamic WebGL aurora shaders and backdrop blur.
- **HTML Shell & PWA Setup** (`index.html:1-19`):
  - Viewport configured with `viewport-fit=cover`, `maximum-scale=1, user-scalable=no`.
  - PWA meta tags: `apple-mobile-web-app-capable="yes"`, `apple-mobile-web-app-status-bar-style="black-translucent"`.
  - Background audio retention script (`index.html:2-14`): overrides `document.hidden`, `visibilityState`, cancels `visibilitychange` events.
  - Persistent sub-audible carrier audio element: `<audio id="bg-audio-anchor" preload="auto" loop playsinline style="position:fixed;bottom:-999px;opacity:0.001;pointer-events:none;"></audio>`.

### 1.2 Component Hierarchy & Views
Mapped from `src/main.jsx:1-585`, `src/AudioLab.jsx:1-643`, and `src/PlaybackAtmosphere.jsx:1-212`:
1. **Root Shell (`App`, `main.jsx:537-581`)**:
   - Class structure: `<div className="app theme-${theme} ${pureBlack ? 'pure-black' : ''} ${expanded ? 'player-expanded' : ''}" data-theme={theme} ref={motionRoot}>`
   - Three-column grid desktop layout: Left Sidebar (`aside.sidebar`), Main Content (`main`), Right Player Panel (`aside.player-panel`).
2. **Navigation & Chrome**:
   - **Desktop Sidebar** (`main.jsx:539`): Brand button (`xenn.`), primary navigation (`Home`, `Search`, `Your library`, `Audio Lab`), collections section (`Liked songs`, `On this device`, dynamic `playlists`, `Create playlist` action), bottom settings trigger.
   - **Topbar** (`main.jsx:541`): Breadcrumb (`Xenn / [Active Page]`), offline indicator pill (`WifiOff`), PWA install button (`Download`), listening history quick link (`Clock3`), settings avatar button.
   - **Mobile Bottom Navigation** (`main.jsx:569`): Persistent bottom bar with 5 destinations (`Home`, `Search`, `Library`, `Audio Lab`, `Settings`) padded for iOS safe area (`env(safe-area-inset-bottom)`).
   - **Mobile Mini Player** (`main.jsx:568`): Floating pill above bottom nav containing album thumbnail, title, artist, `Maximize2` button, play/pause toggle, next track button.
3. **Core Views**:
   - **Home (`page === 'home'`, `main.jsx:542-547`)**:
     - Time-of-day greeting (`Good morning / afternoon / evening`) with date stamp.
     - Hero card (`.hero`): "YOUR DAILY SOUNDTRACK", play button, rotating orbit visuals, clover-masked artwork.
     - Mood filter buttons row (`.mood-row`): "For you", "Chill", "Focus", "Feel good", "Late night", "Romance", "Workout".
     - "Back in your rotation" section: 2-column track grid (`Tracks` component) showing recent history.
     - "Your next favorites" section: 5-column card grid (`Cards` component) loaded from search feed.
     - "Your collection" local upload CTA card (`.bring-music`) with file input picker.
   - **Search (`page === 'search'`, `main.jsx:548-560`)**:
     - Search input form with real-time 250ms debounced queries and explicit submit.
     - Spotify Link Detection Banner (`.spotify-detect-card`): triggers 1-click import into IndexedDB when a Spotify URL is pasted.
     - Search results track list (`Tracks` component).
     - Empty search browse grid with 4 color-themed mood cards ("Soft mornings", "After hours", "In your feelings", "A little energy").
   - **Library Views (`page === 'library' | 'likes' | 'local' | 'history' | 'playlist'`, `main.jsx:562`)**:
     - Unified library header with track counts, "Import Spotify" action, and "Import audio" action.
     - Shortcut cards: "Liked songs" and "On this device".
     - Playlist grid with custom playlists and dashed "A new little collection" create card.
     - Track action toolbar ("Play all", "Shuffle", and "Delete playlist" for custom playlists).
     - Full track list with track numbers, play status, durations, like toggle, and context options.
     - Contextual empty states with relevant call-to-action buttons.
   - **Audio Lab (`page === 'audiolab'`, `src/AudioLab.jsx:1-643`)**:
     - Header with back button (`ChevronLeft`) returning to Settings.
     - 6 interactive feature cards:
       1. Equalizer card (preset status badge, custom SVG art).
       2. Audio Effect card (active spatial effect, "FX" SVG art).
       3. Audio Quality card (provider label, waveform SVG art).
       4. Transition card (crossfade status badge, crossfade SVG art).
       5. Audio Pass card (direct hardware bypass status, pass-through SVG art).
       6. Beat Motion card (intensity status, Sparkles icon).
   - **Settings (`page === 'settings'`, `main.jsx:561-562`)**:
     - Audio Lab navigation link card.
     - Appearance controls: Beat motion select, Visual theme select (`apple-dark`, `apple-light`, `mochy`, `pure-black`), Apple Music color mode toggle / Pure black toggle, Player artwork shape select (`clover`, `rounded`, `circle`), Beat sync atmosphere toggle.
     - Music & Data controls: Spotify import modal trigger, Local audio file picker, Export library JSON backup.
     - About Mochy/Xenn card with version and license link.
4. **Player Views**:
   - **Sidebar Player Panel (`aside.player-panel`, `main.jsx:564-567`)**:
     - Top bar: Title (UP NEXT / THE WORDS / NOW PLAYING), `Maximize2` full screen button, close button for mobile, `MoreHorizontal` track options.
     - Panel tabs: "Playing", "Lyrics", "Queue".
     - Playing tab: Artwork cover box with configurable shape, track title, artist, Like button, source tag, YouTube external link.
     - Lyrics tab: Synchronized lyric lines with smooth scrolling (`useSmoothLyricScroll`), plain lyrics fallback, provider attribution.
     - Queue tab: Reorderable/removable track list with playing indicator.
     - Controls: Seek bar slider with timestamps, transport controls (Shuffle, Previous, Play/Pause, Next, Repeat), Volume slider with percentage indicator.
   - **Full Screen Apple Music Player (`div.apple-fullscreen-player`, `main.jsx:574-579`)**:
     - Dynamic WebGL fluid aurora shader (`AlbumAtmosphere`).
     - Header: Brand label, Beat intensity cycle button, Like toggle, `Minimize2` exit button.
     - Left column: Large artwork cover, title, artist, instrumental tag, album artwork source credit, full seek bar and transport controls.
     - Right column: `LyricsTiming` offset adjuster (+/- 0.25s), smooth auto-scrolling karaoke lyrics (`LyricItem`) with word-by-word highlight when word-level timing exists (`af-timed-word`), plain lyrics fallback.
5. **Modals & Overlays**:
   - **Song Options Context Menu** (`main.jsx:571`): Like/Unlike, Save to library, Add to queue, Add to playlist selector, Create new playlist, Remove from playlist, Remove from device.
   - **Create Playlist Dialog** (`main.jsx:572`): Text input with submit button.
   - **Import from Spotify Dialog** (`main.jsx:573`): URL input, spinner, error messages, submit button.
   - **Audio Lab Modals** (`AudioLab.jsx:189-639`):
     - Equalizer Modal: EQ toggle, preset chips (Flat, Bass Boost, Vocal, Electronic, Rock, Acoustic, Treble, Custom), 5-band vertical slider board (-12dB to +12dB).
     - Audio Effect Modal: Radio options for Off, Surround (15ms Haas delay), Bass Immersion, Concert Hall, Vocal Clarity.
     - Audio Quality Modal: Options for Auto (YouTube), High (320kbps), Normal (160kbps), Data Saver (96kbps).
     - Audio Transition Modal: Interactive SVG crossfade curve graph, crossfade duration slider (1-12s), quick preset chips (2s, 3s, 5s, 8s, 12s), mode cards (Crossfade, Gapless, Off).
     - Direct Audio Pass Modal: Hardware bypass toggle and route indicator.
     - Beat Motion Modal: Low, Normal, Aggressive, Off options.
   - **Toast Notifications** (`main.jsx:570`): Floating bottom pill with Check icon and close button.

### 1.3 Audio Engine & State Architecture
- **Hook `usePlayer` (`src/usePlayer.js:41-419`)**:
  - Handles dual audio backends:
    - `local`: HTML5 `Audio` element backed by IndexedDB Object URLs. Connects to Web Audio `AudioContext` (`createMediaElementSource`), routes through `createAudioLabGraph`, and feeds into `AnalyserNode`.
    - `youtube`: YouTube IFrame Player API (`window.YT.Player`). Hidden iframe `<div id="youtube-player"/>` pinned off-screen.
    - `spotify`: Automatically mapped to YouTube playback stream by searching `/api/search?q=${track.title} ${track.artist}` on first play.
  - Web Audio DSP Graph (`src/audio-lab.js:75-177`):
    - 5 BiquadFilter nodes: `b60` (lowshelf), `b250` (peaking), `b1k` (peaking), `b4k` (peaking), `b12k` (highshelf).
    - Audio effect processing: DelayNode (15ms Haas effect), Feedback gain, Dry/Wet gain matrix for spatial stage expansion.
    - Crossfade volume ramping (`rampAudioVolume`, `rampYoutubeVolume`) for seamless track transitions.
  - Analyser Node (`analyserRef`):
    - `fftSize = 1024`, `smoothingTimeConstant = 0.75`.
    - Samples bass energy band (20Hz-130Hz) at 30fps to drive dynamic CSS `--beat-energy` and WebGL shader parameters in `PlaybackAtmosphere.jsx`.
  - State Persistence (`src/storage.js:1-24`):
    - IndexedDB database `mochy-library` v1:
      - `tracks`: Track metadata records.
      - `files`: Raw audio binary blobs for offline playback.
      - `state`: Application state (`likes`, `history`, `playlists`, `appearance`, `audioLabSettings`, `lyricDelays`, `feed`, `beatSync`).
  - MediaSession Integration:
    - Full `navigator.mediaSession` metadata and handlers (`play`, `pause`, `previoustrack`, `nexttrack`, `seekto`).
    - Position state reporting via `setPositionState`.
  - Background Audio Resilience:
    - Sub-audible carrier `/silence.wav` loop in `<audio id="bg-audio-anchor">` locks iOS/iPadOS audio session during tab switches and screen locks.
    - `navigator.audioSession.type = 'playback'`.

### 1.4 Iconography & Emoji Audit
- **Emoji Audit**:
  - Found 1 unicode pictograph glyph in `src/style.css:9`: `.breadcrumb:before { content: '✳'; ... }` (U+2733 Eight-Spoked Asterisk).
  - No emojis exist anywhere in `src/main.jsx`, `src/AudioLab.jsx`, or any other source code files.
  - Zero-emoji policy requirement: The pseudo-element `content: '✳'` in `style.css` must be replaced or removed in favor of vector iconography.
- **Lucide Icon Inventory**:
  - All icons are rendered via `@phosphor-icons` / `lucide-react`:
    `Home`, `Search`, `Library`, `Settings`, `Heart`, `Plus`, `Play`, `Pause`, `SkipBack`, `SkipForward`, `Shuffle`, `Repeat`, `Repeat1`, `ListMusic`, `Mic2`, `Volume2`, `ChevronDown`, `ChevronRight`, `ChevronLeft`, `ArrowUpRight`, `Upload`, `Music2`, `X`, `Download`, `Check`, `MoreHorizontal`, `Clock3`, `Disc3`, `Headphones`, `WifiOff`, `Trash2`, `Maximize2`, `Minimize2`, `Link2`, `SlidersHorizontal`, `Sparkles`.

---

## 2. Logic Chain

1. **Premise 1 (Design Goal)**: The user request (`ORIGINAL_REQUEST.md`) mandates a production UI redesign with Apple Music aesthetics, Liquid Glass optics, high-taste visual standards, zero emoji with Lucide vector icons, solid content surfaces, and responsive layouts across mobile, tablet/iPad, and desktop.
2. **Premise 2 (State & Audio Preservation)**: The audio playback engine (`usePlayer.js`), local IndexedDB library (`storage.js`), Audio Lab DSP (`audio-lab.js`), and backend providers (`server/index.js`, `server/providers.js`) are functionally sound and verified by 16 passing tests. Any UI overhaul must preserve component contract interfaces, audio event listeners, and state keys.
3. **Premise 3 (Liquid Glass Rules)**: Under pro-design directives, Liquid Glass must act strictly as a floating platter/chrome (navigation bar, playback transport controls, modal sheets, floating mini player) hovering above wallpaper/aurora backdrops. Content cards (track rows, album grids, playlist tiles, settings items) must be solid opaque surfaces (`--am-surface`, `--am-surface-raised`) to guarantee legibility and contrast.
4. **Premise 4 (Responsive Layout Architecture)**: Currently, the desktop 3-column layout collapses abruptly to a 2-column drawer layout at 1000px and a single-column layout at 760px. Tablet/iPad viewports (768px-1024px) need unified floating chrome where the player panel floats gracefully without clipping or obscuring content.
5. **Conclusion**: The upcoming FigCraft prototypes and subsequent UI implementation must target all views identified in this survey while strictly honoring the established state contracts, Lucide vector icons, and Liquid Glass chrome boundaries.

---

## 3. Caveats

- **External Network APIs**: Search (`/api/search`), lyrics (`/api/lyrics`), artwork (`/api/artwork`), and Spotify link resolution (`/api/spotify`) rely on upstream external services (YouTube Music, LRCLIB, Lyrics.ovh, Deezer/iTunes). Local playback from IndexedDB is 100% offline-capable.
- **WebGL Hardware Acceleration**: The WebGL fluid aurora shader (`ambient-renderer.js`) requires WebGL support; when unsupported or in reduced motion mode, it gracefully falls back to CSS radial gradients.
- **Browser-Specific Audio Restrictions**: iOS Safari and iPadOS require user gesture activation before playing audio; the existing silent audio carrier anchor in `index.html` and `usePlayer.js` handles this and must not be altered during the UI redesign.

---

## 4. Conclusion

The Mochy Music PWA codebase is lean, modular, and well-architected. The audio engine, state storage, and backend APIs are decoupled from the presentation layer. The UI can be redesigned to Apple Music and Liquid Glass standards without altering core playback, DSP, or storage logic.

---

## 5. Complete Feature & Component Inventory Table

| Component / View | File & Location | Purpose & Features | Inputs / Controls | State & Data Dependencies | Existing Iconography | Redesign Notes & Liquid Glass Guidance |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **App Shell** | `src/main.jsx:537-581` | Top-level grid container, theme provider, global keyboard shortcuts (Space toggle, Esc close). | File input for audio imports, global keydown listeners. | `theme`, `pureBlack`, `expanded`, `fullScreen`, `menu`, `toast`. | N/A | Provide CSS grid with fluid adaptation for desktop (3-col), iPad (2-col floating chrome), and mobile (1-col). |
| **Desktop Sidebar** | `src/main.jsx:539` | Primary desktop navigation, library collections, and playlist management. | Nav buttons (`home`, `search`, `library`, `audiolab`), collection buttons (`likes`, `local`, custom playlists), `Create playlist` button, Settings button. | `page`, `likes`, `library`, `playlists`. | `Home`, `Search`, `Library`, `SlidersHorizontal`, `Heart`, `Download`, `ListMusic`, `Plus`, `Settings`. | Transform into floating or translucent platter with subtle specular border. Solid surface behind collection items. |
| **Topbar Header** | `src/main.jsx:541` | Breadcrumb trail, network status, PWA install prompt, history link, user settings. | Offline pill, Install PWA button, History button, Settings avatar button. | `page`, `online`, `install`. | `WifiOff`, `Download`, `Clock3`. | Clean minimal glass topbar with high-contrast breadcrumb text. |
| **Mobile Nav** | `src/main.jsx:569` | Bottom navigation bar on mobile viewports (<= 760px). | 5 tab buttons: Home, Search, Library, Audio Lab, Settings. | `page`. | `Home`, `Search`, `Library`, `SlidersHorizontal`, `Settings`. | Liquid glass floating dock with `backdrop-filter: blur(25px)`, elevated pill indicator, safe-area padding. |
| **Mobile Mini Player** | `src/main.jsx:568` | Persistent floating playback strip on mobile. | Tap to expand player panel, Fullscreen button, Play/Pause toggle, Next song. | `current`, `playing`. | `Maximize2`, `Play`, `Pause`, `SkipForward`. | Floating glass platter hovering above bottom navigation dock. High-contrast typography and solid artwork thumb. |
| **Player Panel** | `src/main.jsx:564-567` | Persistent desktop right sidebar player and mobile expanded player sheet. | Panel tabs (Playing, Lyrics, Queue), Fullscreen button, Options button, Seek bar range, Transport (Shuffle, Prev, Play/Pause, Next, Repeat), Volume range. | `panel`, `current`, `playing`, `position`, `duration`, `volume`, `shuffle`, `repeat`, `queue`, `index`. | `Maximize2`, `ChevronDown`, `MoreHorizontal`, `Disc3`, `Mic2`, `ListMusic`, `Shuffle`, `SkipBack`, `Play`, `Pause`, `SkipForward`, `Repeat`, `Repeat1`, `Volume2`, `Heart`. | Control layer must be authentic Liquid Glass floating chrome; lyrics and queue list items remain solid high-contrast cards. |
| **Full Screen Player** | `src/main.jsx:574-579` | Immersive Apple Music-style player with dynamic aurora atmosphere. | Beat intensity cycle button, Like toggle, Minimize button, full seek bar and transport, lyric line tap to seek, lyric timing offset adjuster. | `current`, `lyrics`, `synced`, `lyricPosition`, `audioLabSettings`, `fullScreen`. | `Sparkles`, `Heart`, `Minimize2`, `Music2`, `ArrowUpRight`, `Shuffle`, `SkipBack`, `Play`, `Pause`, `SkipForward`, `Repeat`, `Repeat1`, `Volume2`, `Clock3`. | Floating glass header and control platter hovering above living WebGL aurora. Karaoke lyrics with word-by-word active glow. |
| **Home View** | `src/main.jsx:542-547` | Discovery feed, personalized greeting, daily soundtrack hero, mood shortcuts, recent rotation. | Mood filter buttons, Hero play button, Import music CTA button, Track rows. | `greeting`, `hero`, `feed`, `history`, `loading`, `error`. | `Sparkles`, `Play`, `ArrowUpRight`, `Upload`, `Plus`, `Heart`. | Solid opaque cards on rich dark canvas. Reject purple mesh gradients; hero card with refined typography and subtle depth. |
| **Search View** | `src/main.jsx:548-560` | Music search across YouTube Music, Spotify link import, and curated category exploration. | Search input with clear button, submit button, Spotify import button, category cards. | `query`, `results`, `loading`, `error`, `spotifyLoading`. | `Search`, `X`, `Disc3`, `ArrowUpRight`. | Clean search bar with glass sheen; solid result track rows with clear hover states and metadata hierarchy. |
| **Library Views** | `src/main.jsx:562` | Comprehensive collection management (All songs, Liked, Local files, History, Custom Playlists). | Import Spotify button, Import Audio button, Shortcut cards, Playlist tiles, Play all, Shuffle, Delete playlist, Track rows. | `visibleTracks`, `likes`, `playlists`, `selectedPlaylist`. | `Link2`, `Plus`, `Heart`, `Download`, `ChevronRight`, `ListMusic`, `Play`, `Shuffle`, `Trash2`. | Solid card surfaces with crisp borders; quick action toolbars with floating glass pill styling. |
| **Audio Lab** | `src/AudioLab.jsx:1-643` | Advanced audio DSP control center: Equalizer, Effects, Bitrate Quality, Crossfade Transitions, Hardware Pass, Beat Motion. | Feature cards opening dedicated modals: 5-band EQ sliders, Preset chips, Crossfade curve slider, Mode radio cards, DSP bypass toggle. | `settings` (`equalizer`, `effect`, `quality`, `transition`, `audioPass`, `beatIntensity`). | `ChevronLeft`, `Check`, `X`, `Sparkles`, `SlidersHorizontal`, custom SVGs. | High-precision agency-grade card layout with interactive SVG curves and clean typography. |
| **Settings View** | `src/main.jsx:561-562` | Audio Lab link, theme selector, artwork shape selector, beat sync toggle, library backup export. | Audio Lab card, theme select, artwork shape select, beat sync toggle, Spotify import button, export backup button. | `theme`, `pureBlack`, `shape`, `audioLabSettings`, `tabBeatSync`. | `SlidersHorizontal`, `ChevronRight`, `Link2`, `Upload`, `Download`, `ArrowUpRight`. | Grouped inset list sections with solid surface rows and subtle dividers. |
| **Song Options Modal** | `src/main.jsx:571` | Contextual action sheet for tracks (Like, Save, Queue, Add to Playlist, Delete). | Action buttons for playlist assignment and deletion. | `menu`, `likes`, `library`, `playlists`. | `X`, `Heart`, `Library`, `ListMusic`, `Plus`, `Trash2`. | Liquid Glass modal platter with specular edge highlight and backdrop blur. |
| **Create Playlist Dialog**| `src/main.jsx:572` | Modal dialog to create a new custom playlist. | Name input field, Create button, Close button. | `playlistName`, `newPlaylist`. | `X`, `Plus`. | Floating glass dialog sheet with accessible focus trap. |
| **Spotify Import Dialog** | `src/main.jsx:573` | Modal dialog to parse Spotify links and resolve tracks. | URL input field, Import button, Close button. | `spotifyUrl`, `spotifyLoading`, `spotifyError`. | `X`, `Plus`. | Floating glass dialog sheet with loading indicator. |
| **Audio Lab Modals** | `src/AudioLab.jsx:189-639` | 6 specialized modal dialogs for audio DSP configuration. | EQ band sliders (-12dB to +12dB), preset chips, crossfade duration slider (1-12s), radio options. | `activeModal`, `settings`. | `X`, `Check`, `Sparkles`. | Floating glass sheets with solid option rows and interactive SVG visualizations. |
| **Toast Notification** | `src/main.jsx:570` | Ephemeral status notification banner. | Dismiss button. | `toast`. | `Check`, `X`. | Floating pill with subtle glass blur and high-contrast typography. |
| **Ambient Atmosphere** | `src/PlaybackAtmosphere.jsx` | WebGL living aurora canvas extracting album artwork dominant tones and bass energy. | Canvas resize observer, WebGL draw loop. | `artwork`, `tones`, `currentBeatEnergy`. | N/A | Runs in background behind floating glass player chrome and full-screen view. |

---

## 6. Verification Method

To independently verify all findings in this survey report:

1. **Verify Automated Tests**:
   ```powershell
   npm test
   ```
   *Expected result*: 16 passing tests, 0 failures, exit code 0.
2. **Verify Production Build**:
   ```powershell
   npm run build
   ```
   *Expected result*: Vite transforms modules and outputs `dist/` cleanly without syntax or bundling errors, exit code 0.
3. **Verify Zero-Emoji Policy**:
   ```powershell
   node -e "const fs = require('fs'); const text = fs.readFileSync('src/main.jsx', 'utf8') + fs.readFileSync('src/AudioLab.jsx', 'utf8'); const m = text.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u); console.log('Emojis found in JSX:', m);"
   ```
   *Expected result*: `Emojis found in JSX: null`.
4. **Inspect Breadcrumb Glyph in CSS**:
   Inspect `src/style.css:9` to confirm `.breadcrumb:before { content: '✳'; }` is the single pictograph requiring replacement in the redesign.
