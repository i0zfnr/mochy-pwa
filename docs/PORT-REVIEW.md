# Source audit and port review

## Inspected source

- Original: https://github.com/realidkroo/Mochy-Music
- Commit: `0e6e3b6764b4001f5b7423da45d1ccc31d88a46e`
- Kotlin/Jetpack Compose Android project; Gradle application plus provider/module libraries. It does not contain a reusable browser frontend.
- Current `Theme.kt` forces a dark palette, with black backgrounds, gray surfaces, white typography and Inter. Some fastlane screenshots show the older light UI.
- Current default home style `MOCHYY` uses `HeroCarousel`, with Keep Listening, Daily Discover and recommendations. Other home styles exist.
- Search filtering and WEB_REMIX client information adapted from `providers/innertube`; this port retains server-side requests because browsers cannot directly reproduce Android HTTP behavior.
- Full original checkout is retained locally under `upstream/` for comparison and excluded from the port's distribution.

## Implementation plan and outcome

1. Inspect Android source, theme, screenshots, providers and license — complete.
2. Implement responsive web foundation using React/Vite and a small Node HTTP backend — complete.
3. Connect online search/embed playback and persistent local audio/library/playlists — implemented.
4. Add lyrics, queue, player controls, PWA shell and mobile layout — implemented.
5. Add a sandboxed Electron wrapper and packaging configuration — implemented; validation results below.
6. Prepare host-neutral deployment instructions and container — complete. Actual Ryaze deployment requires account/runtime access.

## Feature mapping

| Android feature | Web port status |
| --- | --- |
| Dark theme, Inter, rounded cards, clover art | Adapted; desktop sidebar and player rail added. Visual direction preserved, not a pixel-identical transcription of every screen. |
| Home feed | Working search-backed discovery and local recent listening; not the original recommendation engine. |
| Music search | WEB_REMIX song search, first result batch. No pagination or artist/album browse endpoints yet. |
| Online playback | YouTube embedded player. No extraction or raw audio stream resolver. |
| Local music | File picker, tag/art extraction, IndexedDB storage and offline playback. No automatic device filesystem scanner. |
| Library/likes/playlists/history | Local persistent data; playlist creation, add/remove songs and delete playlist. No account sync, playlist rename/reorder or import from external services yet. |
| Queue/shuffle/repeat | Implemented, including removing non-current items. Queue itself is session-only. |
| Lyrics | LRCLIB plain and synced lyrics. Other upstream lyric providers are not ported. |
| Downloads | Imported local files are offline. No downloading YouTube streams. |
| Media controls | Web Media Session and browser audio APIs. OS/browser support applies. |
| Equalizer, AudioLab, crossfade, sleep timer | Not implemented. |
| Spotify/Apple/Tidal imports and YouTube account sync | Not implemented; requires separate supported authentication/provider integration. |
| Discord presence, scrobbling, Shazam, cast, Android widgets | Not implemented. Some need native/API-specific integration. |
| Android module runtime, custom navigation/home styles, iPod/video players, recap | Not ported. |
| PWA | Manifest/icons, service worker, cached shell, local offline playback. HTTPS required in production. |
| Electron | Shared app with local Node server, sandbox, blocked remote navigation, external HTTPS links, single instance and stable storage origin. |

## Verification

Automated tests exercise lyric timestamp parsing, queue end/repeat/shuffle rules, provider renderer parsing and HTTP health/validation/error routing. The production bundle builds successfully.

Browser QA includes online embedded playback and pause, likes, playlist creation/addition, persistence after reload, local WAV import and playback, live search, and responsive viewport inspection. The final handoff records any unverified items; passing a build alone does not verify Android/iOS installation, host deployment or packaged desktop playback.

Additional observed results: the service-worker shell reloaded with network emulation disabled, persisted playlists/library remained available, and an imported generated WAV played while offline. Phone layout was checked at 390×844 with no horizontal document overflow; desktop was checked at 1440×960. The unpacked Windows Electron package launched and returned a successful `/api/health` response on its loopback server. Native mobile installation, packaged desktop online playback, macOS/Linux releases and live Ryaze hosting remain unverified. `npm audit` reported zero known vulnerabilities at the time of handoff.

The unsigned x64 Windows NSIS installer was successfully generated at `release/Mochy Setup 0.1.0.exe`. The installer itself has not been installed on the user's system. Desktop and mobile review screenshots are in this folder. The browser QA library contains one generated six-second WAV fixture and an example playlist created during testing.

## Before calling this full Android parity

The omitted features above need further implementation and provider-specific testing. In particular, the Android provider/token/session system cannot simply run inside browser JavaScript, and its background-service behavior is not guaranteed in a PWA. The current artifact is a usable first web port, not a claim that every upstream capability has been duplicated.
