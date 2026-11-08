# Survey Report: Test Suites, Build Pipeline & Regression Surface

**Explorer**: Survey Explorer 2 (`explorer_survey_2`)  
**Date**: 2026-11-08T20:23:00Z  
**Parent Orchestrator**: `a757a828-6846-44b4-8f4d-2804ea827db6`  
**Working Directory**: `c:\laragon\www\mochy-pwa\.agents\teamwork\explorer_survey_2`  
**Target Project**: Mochy Music PWA (`c:\laragon\www\mochy-pwa`)  
**Objective**: Investigate build setup, automated tests, mocking mechanisms, coverage gaps, and regression surface to ensure requirement R3 (`npm run build` exits 0, `npm test` passes 100%) and guide test strategy.

---

## 1. Observation

### 1.1 Package Scripts & Tooling Configuration
In `package.json` (lines 6-14):
```json
  "scripts": {
    "dev": "node server/index.js --dev",
    "build": "vite build",
    "start": "node server/start.js",
    "test": "node --test tests/*.test.js",
    "desktop": "npm run build && electron electron/main.cjs",
    "desktop:pack": "npm run build && electron-builder --dir",
    "desktop:dist": "npm run build && electron-builder"
  }
```
- **Test Runner**: Node.js native test runner (`node:test`, `node:assert/strict`). There is **no** Vitest, Jest, Mocha, Playwright, or Cypress installed.
- **Test Modules**: `tests/package.json` contains `{"type": "module"}` enabling standard ES module `import` statements across test files.
- **Build Bundler**: Vite v7.3.7 with `@vitejs/plugin-react` v5.1.0 (`vite.config.js` and identical `vite.config.mjs`):
  ```js
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  export default defineConfig({ plugins: [react()], build: { sourcemap: true } });
  ```
- **Linting**: No `npm run lint` script, no `.eslintrc*` or `eslint.config.*` exists in the repository root.

### 1.2 Build Verification (`npm run build`)
Command executed: `npm run build` (`vite build`).
Output verbatim:
```
vite v7.3.7 building client environment for production...
transforming...
✓ 1750 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                              1.91 kB │ gzip:   0.79 kB
dist/assets/index-UonheX3h.css             105.07 kB │ gzip:  20.25 kB
dist/assets/EmbeddedID3v2-CfYU-KjC.js        0.50 kB │ gzip:   0.37 kB │ map:     2.21 kB
dist/assets/AbstractID3Parser-DPSUjh3B.js    1.02 kB │ gzip:   0.51 kB │ map:     2.91 kB
dist/assets/DsfParser-BXz_nmsk.js            2.59 kB │ gzip:   1.06 kB │ map:     9.08 kB
dist/assets/DsdiffParser-BzGww8LI.js         4.53 kB │ gzip:   1.58 kB │ map:    15.65 kB
dist/assets/WavPackParser-Cr8UepIl.js        4.58 kB │ gzip:   2.00 kB │ map:    17.61 kB
dist/assets/AiffParser-CbdZAQ8K.js           4.76 kB │ gzip:   1.99 kB │ map:    16.31 kB
dist/assets/MusepackParser-DkOUT4QP.js       5.75 kB │ gzip:   2.07 kB │ map:    20.41 kB
dist/assets/WaveParser-Bxl7wrjj.js           7.28 kB │ gzip:   2.73 kB │ map:    25.98 kB
dist/assets/CafParser-DNWJ1hRq.js            8.35 kB │ gzip:   2.85 kB │ map:    29.59 kB
dist/assets/FlacParser-vxAfj4P8.js          10.10 kB │ gzip:   3.62 kB │ map:    40.58 kB
dist/assets/OggParser-BOCaMuOi.js           12.85 kB │ gzip:   4.32 kB │ map:    45.45 kB
dist/assets/MpegParser-eG4fUL1w.js          12.88 kB │ gzip:   4.07 kB │ map:    44.52 kB
dist/assets/ID3v2Parser-Dti0Lx0L.js         13.82 kB │ gzip:   5.07 kB │ map:    61.39 kB
dist/assets/MatroskaParser-CaVJWl3o.js      17.03 kB │ gzip:   5.54 kB │ map:    69.57 kB
dist/assets/AsfParser-Da7GFLuE.js           19.49 kB │ gzip:   6.57 kB │ map:    72.48 kB
dist/assets/MP4Parser-BRyS9iJ2.js           33.74 kB │ gzip:  10.36 kB │ map:   137.79 kB
dist/assets/core-9BXgS4RV.js               135.52 kB │ gzip:  40.50 kB │ map:   494.85 kB
dist/assets/index-DAsBkGA5.js              330.32 kB │ gzip: 101.45 kB │ map: 1,347.16 kB
✓ built in 3.95s - 9.78s
```
Exit code: `0`. 0 errors, 0 warnings.

### 1.3 Test Verification (`npm test`)
Command executed: `npm test` (`node --test tests/*.test.js`).
Output verbatim:
```
✔ album tones preserve cover regions and cap brightness for white lyrics (5.138ms)
✔ audio lab exports valid 5-band frequency definitions (2.7264ms)
✔ audio lab presets define all 5 bands with expected boosts (0.3863ms)
✔ audio effects include surround, bass, concert, vocal and off (0.2661ms)
✔ audio qualities define youtube auto and hd options (1.2801ms)
✔ transition presets support 3s auto crossfade, 5s crossfade, gapless and off (0.3124ms)
✔ createAudioLabGraph constructs Web Audio filter chain and responds to setting updates (1.2707ms)
✔ managed startup entrypoint opens the configured listener (201.129ms)
✔ timed lyrics reject different recordings, versions and artists (2.1021ms)
✔ word timing is used only when the lyrics contain real word timestamps (2.2169ms)
✔ cover sizing requests real high-resolution variants and keeps local art intact (3.7271ms)
✔ synced lyrics support fractional seconds, duplicate timestamps and metadata (3.5249ms)
✔ queue completion, repeat and previous have distinct behavior (0.6854ms)
✔ duration format handles missing and invalid durations (0.9888ms)
✔ provider parser skips artists and deduplicates track renderers (1.0463ms)
✔ production server health, validation, unknown APIs and missing files (63.2877ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 335.6863
```
Exit code: `0`. 16 tests pass out of 16 tests across 5 files.

### 1.4 Flakiness Stress Test
Ran 5 consecutive executions of `npm test`:
- Run 1: PASS (1013ms)
- Run 2: PASS (1052ms)
- Run 3: PASS (942ms)
- Run 4: PASS (996ms)
- Run 5: PASS (1236ms)
Result: 0 failures, 100% stability.

### 1.5 Detailed Test Catalog
Total test files in `tests/`: 5 files containing 16 test cases.

| File | Test Description | Target Unit | What is Verified |
|---|---|---|---|
| `tests/ambient-palette.test.js` | `album tones preserve cover regions and cap brightness for white lyrics` | `src/ambient-palette.js` (`ambientTones`) | Extracts 4-tone palette `[left, right, deep, accent]` from pixel bytes; asserts color boundary preservation and brightness cap (`<= 0.26001`) for white lyrics readability. |
| `tests/audio-lab.test.js` | `audio lab exports valid 5-band frequency definitions` | `src/audio-lab.js` (`EQ_FREQUENCIES`) | Validates 5 frequency bands: `['b60', 'b250', 'b1k', 'b4k', 'b12k']`, filter types (`lowshelf`, `highshelf`). |
| `tests/audio-lab.test.js` | `audio lab presets define all 5 bands with expected boosts` | `src/audio-lab.js` (`EQ_PRESETS`) | Validates `flat`, `bass_boost` (b60 > 5), `vocal` (b1k > 2), and `custom`. |
| `tests/audio-lab.test.js` | `audio effects include surround, bass, concert, vocal and off` | `src/audio-lab.js` (`AUDIO_EFFECTS`) | Validates effect keys: `off`, `surround`, `bass`, `concert`, `vocal`. |
| `tests/audio-lab.test.js` | `audio qualities define youtube auto and hd options` | `src/audio-lab.js` (`AUDIO_QUALITIES`) | Validates quality modes: `auto`, `high`, `normal`, `saver`. |
| `tests/audio-lab.test.js` | `transition presets support 3s auto crossfade, 5s crossfade, gapless and off` | `src/audio-lab.js` (`TRANSITION_PRESETS`) | Validates transition presets: `auto`, `crossfade_5s`, `gapless`, `off`. |
| `tests/audio-lab.test.js` | `createAudioLabGraph constructs Web Audio filter chain and responds to setting updates` | `src/audio-lab.js` (`createAudioLabGraph`, `updateAudioLabGraph`) | Mocks Web Audio API; constructs 5-band biquad filter chain and wet/dry delay nodes; verifies parameter changes when switching presets. |
| `tests/entrypoint.test.js` | `managed startup entrypoint opens the configured listener` | `server/start.js` | Spawns child process on ephemeral port `0`, parses stdout with regex `/(?:Xenn\|Mochy) is ready at (http:\/\/127\.0\.0\.1:\d+)/`, fetches `/api/health`, verifies `{ ok: true }`. |
| `tests/lyrics-match.test.js` | `timed lyrics reject different recordings, versions and artists` | `server/lyrics-match.js` (`matchRecording`, `selectRecording`) | Rejects candidate lyrics if duration delta > 6s, artist differs, or version contains 'Live'/'Remix'. Selects closest match. |
| `tests/lyrics-match.test.js` | `word timing is used only when the lyrics contain real word timestamps` | `src/music.js` (`parseLrc`) | Parses LRC lines; confirms line without word tags has `words: undefined`, line with `<mm:ss.xx>` tags extracts `text` and array of word timestamps. |
| `tests/lyrics-match.test.js` | `cover sizing requests real high-resolution variants and keeps local art intact` | `src/artwork.js` (`highResolutionArtwork`) | Rewrites `=w120-h120` to `=w1000-h1000` for YouTube image URLs; preserves base64 data URLs and standard URLs unchanged. |
| `tests/music.test.js` | `synced lyrics support fractional seconds, duplicate timestamps and metadata` | `src/music.js` (`parseLrc`) | Parses multiline LRC with `[ar:...]` tags and duplicate/out-of-order timestamps; asserts chronological sort order. |
| `tests/music.test.js` | `queue completion, repeat and previous have distinct behavior` | `src/music.js` (`nextIndex`) | Verifies track queue navigation: repeat `off` at end returns `-1`, repeat `all` returns `0`, repeat `one` returns current, backward step wraps, shuffle selects non-current track. |
| `tests/music.test.js` | `duration format handles missing and invalid durations` | `src/music.js` (`time`) | Verifies `time(NaN)` -> `'0:00'`, `time(-3)` -> `'0:00'`, `time(192.9)` -> `'3:12'`. |
| `tests/music.test.js` | `provider parser skips artists and deduplicates track renderers` | `server/providers.js` (`parseSearch`) | Parses mock YouTube Music API response tree, skips artist renderers, deduplicates tracks by videoId, extracts title, artist, duration. |
| `tests/music.test.js` | `production server health, validation, unknown APIs and missing files` | `server/index.js` (`startServer`) | Starts in-process server on port 0; tests `/api/health` 200, `/api/search` validation (empty query 400, >150 chars 400, POST 405), `/api/lyrics` 400, `/api/artwork` 400, `/api/unknown` 404, missing static asset 404. |

### 1.6 How Tests Mock External APIs / DOM / Web Audio / Storage
1. **Web Audio Mocking**:
   - Implemented **only** in `tests/audio-lab.test.js` (lines 62-80):
     ```js
     class MockParam {
       constructor(val = 0) { this.value = val; }
       setTargetAtTime(val) { this.value = val; }
     }
     class MockNode {
       constructor() {
         this.gain = new MockParam(1);
         this.frequency = new MockParam(1000);
         this.Q = new MockParam(1);
         this.delayTime = new MockParam(0);
       }
       connect() {}
     }
     const mockContext = {
       createGain: () => new MockNode(),
       createBiquadFilter: () => new MockNode(),
       createDelay: () => new MockNode(),
     };
     ```
   - Does **not** mock `AudioContext` globally or test `usePlayer.js` audio node connections.
2. **DOM Mocking**:
   - **None**. There is zero DOM mocking (no jsdom, no happy-dom).
   - React components (`main.jsx`, `AudioLab.jsx`, `PlaybackAtmosphere.jsx`) are completely unmounted in the test suite.
3. **localStorage / IndexedDB**:
   - `localStorage` is **not used anywhere** in `src/`.
   - `src/storage.js` uses IndexedDB (`idb` package) to persist tracks, files, and state (`likes`, `history`, `playlists`, `appearance`, `feed`, `audioLabSettings`, `lyricDelays`, `beatSync`).
   - IndexedDB is **never mocked** and has **0 unit tests**.
4. **Network / External Services**:
   - YouTube and Spotify external HTTP calls are not called during unit tests; tests feed synthetic payloads into pure parser functions (`parseSearch`).
   - Tests that need network connectivity (`entrypoint.test.js`, `music.test.js`) spin up local Node HTTP servers on ephemeral port `0`.

### 1.7 Latent Bug Discovered in `src/usePlayer.js`
In `src/usePlayer.js` (lines 175-178):
```javascript
    return () => {
      clearTimeout(backgroundRetryTimer.current);
      silentAudio.pause();
      silentAudio.src = '';
      ...
```
- **Error**: `silentAudio` is not defined anywhere in the module or function scope! (Line 43 defines `const silentAudioRef = useRef(null);`, and line 129 assigns `silentAudioRef.current = bgAudio;`).
- **Consequence**: When `usePlayer` unmounts or cleans up, calling `silentAudio.pause()` throws `ReferenceError: silentAudio is not defined`.
- **Reason it hasn't broken builds or tests**: `usePlayer` is instantiated at the root of `App` in `main.jsx` and never unmounts during app lifetime; additionally, no component unit tests exist to trigger hook unmounting.
- **Recommended fix**:
  ```javascript
  silentAudioRef.current?.pause();
  if (silentAudioRef.current) silentAudioRef.current.src = '';
  ```

### 1.8 Server Log Regex Sensitivity
In `tests/entrypoint.test.js` (line 14):
```javascript
child.stdout.on('data', chunk => {
  output += chunk;
  const match = output.match(/(?:Xenn|Mochy) is ready at (http:\/\/127\.0\.0\.1:\d+)/);
  if (match) resolve(match[1]);
});
```
- The entrypoint test explicitly expects the stdout message to match `(?:Xenn|Mochy) is ready at http://127.0.0.1:<port>`.
- Any worker refactoring `server/start.js` or `server/index.js` must **not** alter this message format or `entrypoint.test.js` will time out (10s) and fail.

### 1.9 Visual and Emoji Audit
- In `src/style.css` (line 9): Unicode character `✳` (U+2733 Eight Spoked Asterisk) is used in `.breadcrumb:before{content:'✳'}`.
- In `src/*.jsx` and `src/*.js`: An automated unicode regex scan (`/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u`) returned **zero emojis** in JS/JSX code.
- All icons in `main.jsx` are sourced from `lucide-react` (e.g. `Play`, `Pause`, `SkipForward`, `SlidersHorizontal`, `Sparkles`).

---

## 2. Logic Chain

1. **Premise 1 (R3 Requirement)**: Requirement R3 mandates that `npm run build` exits 0 with no bundling/syntax errors, and `npm test` runs and all test suites pass with code 0 without regressions.
2. **Premise 2 (Current Baseline)**: Direct execution confirms `npm run build` exits 0 in 3.95s (producing `dist/index.html`, `dist/assets/index-UonheX3h.css`, 17 `music-metadata` chunks, and `index-DAsBkGA5.js`). Direct execution confirms `npm test` runs 16 tests across 5 files via `node --test` and exits 0 in 335ms.
3. **Premise 3 (Test Scope Boundary)**: All 16 existing tests target pure helper functions (`music.js`, `audio-lab.js`, `artwork.js`, `ambient-palette.js`, `server/lyrics-match.js`, `server/providers.js`) or HTTP server endpoints (`server/index.js`, `server/start.js`).
4. **Premise 4 (Coverage Gap)**: Exactly 0 unit tests exist for React components (`main.jsx`, `AudioLab.jsx`, `PlaybackAtmosphere.jsx`), browser hooks (`usePlayer.js`, `useArtwork.js`, `useTabBeatSync.js`), CSS layout, or IndexedDB persistence (`storage.js`).
5. **Deduction 1**: The redesign of the user interface (Liquid Glass chrome, Apple Music aesthetics, solid content cards, responsive viewports) directly modifies files that have **zero unit test coverage**.
6. **Deduction 2**: While `npm test` will easily continue to pass 100% as long as helper functions in `music.js`, `audio-lab.js`, `artwork.js`, and `server/*.js` are not broken, passing `npm test` is **necessary but not sufficient** to guarantee functional integrity of the UI, audio playback, or responsiveness.
7. **Deduction 3**: An **E2E Testing Track** (using Playwright or browser automation) is essential to verify:
   - UI views (Player/Now Playing, Library, Search, Ambient)
   - Zero-emoji enforcement across all rendered elements
   - Lucide vector icon rendering
   - Liquid glass navigation vs solid card surfaces
   - Responsive layout across 390px (mobile), 768px/1024px (iPad/tablet), and 1280px+ (desktop)
   - Audio playback controls and user interaction flows.
8. **Deduction 4**: The latent `ReferenceError: silentAudio is not defined` bug in `src/usePlayer.js` line 177 will manifest if any test mounts and unmounts `usePlayer`, or when components are re-rendered/unmounted during UI navigation. It should be proactively fixed by workers.

---

## 3. Caveats

1. **No Live Playback Testing in Unit Tests**: Unit tests do not verify actual audio output or YouTube iframe video playback because the tests run in a headless Node environment without browser media engines or network access to YouTube.
2. **Subprocess Port Binding**: `tests/entrypoint.test.js` and `tests/music.test.js` rely on binding ephemeral TCP ports (`port: 0`). On environments with aggressive firewall restrictions or socket exhaustion, this could theoretically fail, though in our 5-iteration stress test it proved 100% reliable.
3. **Vite Build Memory/Time**: `npm run build` transforms 1,750 modules due to the large `music-metadata` dependency tree. In resource-constrained CI or concurrent tasks, Vite build time can take up to ~10s.
4. **No Code Modifications**: Per the explorer role constraints, no changes were made to source files during this survey.

---

## 4. Conclusion

1. **Current Health**: Baseline integrity is healthy. `npm run build` exits with code 0 and bundles cleanly. `npm test` executes in ~350ms with 16/16 tests passing consistently with zero flakiness.
2. **Regression Surface**: The primary regression surface for the UI redesign is in the UI layer (`main.jsx`, `AudioLab.jsx`, `PlaybackAtmosphere.jsx`, `apple-music.css`, `style.css`), which currently has **0% automated test coverage**.
3. **Actionable Worker Directives**:
   - **Do not break existing unit tests**: Keep all signatures and return values of `src/music.js`, `src/audio-lab.js`, `src/artwork.js`, `src/ambient-palette.js`, `server/lyrics-match.js`, `server/providers.js`, and `server/index.js` compatible with the 16 existing tests.
   - **Keep server startup message intact**: Maintain `Xenn is ready at ...` or `Mochy is ready at ...` in `server/start.js` and `server/index.js` to satisfy `tests/entrypoint.test.js`.
   - **Fix `src/usePlayer.js` line 177**: Replace `silentAudio.pause()` with `silentAudioRef.current?.pause()`.
   - **Remove `✳` glyph in `src/style.css:9`**: Replace with Lucide vector icon to strictly enforce the zero-emoji / clean iconography rule.
4. **Testing Architecture Recommendation for E2E Track**:
   - Establish Playwright or lightweight automated browser verification covering mobile (390px), tablet (768px/1024px), and desktop (1280px+) viewports.
   - Add automated verification for zero-emoji rendering and Lucide vector icon presence.

---

## 5. Verification Method

### 5.1 Build Verification
Execute in the workspace root (`c:\laragon\www\mochy-pwa`):
```powershell
npm run build
```
- **Expected result**: Exit code `0`.
- **Expected output**: `vite v7.3.7 building client environment for production...`, `✓ 1750 modules transformed`, output chunks in `dist/`.

### 5.2 Test Verification
Execute in the workspace root:
```powershell
npm test
```
- **Expected result**: Exit code `0`.
- **Expected output**: `ℹ tests 16`, `ℹ pass 16`, `ℹ fail 0`.

### 5.3 Flakiness Verification
Execute in the workspace root:
```powershell
node -e "const { execSync } = require('child_process'); for (let i = 1; i <= 5; i++) { const out = execSync('npm test', { stdio: 'pipe' }).toString(); console.log('Run ' + i + ': ' + (out.includes('fail 0') ? 'PASS' : 'FAIL')); }"
```
- **Expected result**: 5 consecutive passes.

### 5.4 Invalidation Conditions
This survey report is invalidated if:
1. `npm run build` fails with bundling errors or exits with non-zero code.
2. Any of the 16 unit tests in `tests/*.test.js` fail.
3. Dependencies in `package.json` are modified in a way that introduces test framework conflicts (e.g. conflicting module loaders or unhandled polyfills).
