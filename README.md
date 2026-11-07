# Mochy Web

An independent web/PWA adaptation of [realidkroo/Mochy-Music](https://github.com/realidkroo/Mochy-Music), with an Electron desktop wrapper. GPL-3.0-only; see [NOTICE.md](NOTICE.md).

## Run

Requires Node.js 22.12+ (Node.js 24 recommended).

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`. Production:

```sh
npm run build
npm start
```

The Node server serves both the web bundle and `/api/search`, `/api/lyrics`. Uploading only `dist/` to PHP/static hosting leaves search and lyrics unavailable. No API keys or account are required for this first version.

## What works

- Responsive Home, discovery, search, library, liked songs, playlists, history and settings.
- Online music search via the upstream WEB_REMIX provider, played through a visible YouTube embedded player.
- Local audio import with metadata/artwork extraction; audio stays in IndexedDB, not on a server.
- Playback, seeking, volume, previous/next, shuffle, repeat, queue editing and Media Session controls where supported.
- LRCLIB plain/synchronized lyrics with clickable seek timestamps.
- Installable PWA, cached application shell, local-file offline playback, clover/rounded/circle artwork and pure black appearance.
- Metadata backup export.
- Sandboxed Electron app with the same web code and local backend.

Online availability depends on YouTube and its embedding/region rules. Browser background playback and media codecs differ by platform. Local files and playlists belong to the current browser profile and origin, and can be removed by clearing site data. Metadata backups do not contain audio. This app is not an exact feature-complete replacement for the Android app; [docs/PORT-REVIEW.md](docs/PORT-REVIEW.md) records the gaps.

## Desktop

```sh
npm run desktop
npm run desktop:pack
npm run desktop:dist
```

`desktop:pack` creates an unpacked app; `desktop:dist` creates an installer for the current OS in `release/`. Cross-platform releases require their respective build environments. Desktop uses loopback port 4174 for a stable browser-storage origin and only one app instance. No Node APIs are exposed to web pages. Installers are unsigned until you configure signing certificates.

## Checks and hosting

```sh
npm test
npm run build
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for `ryaze.my.id`, Docker and reverse-proxy configuration. Use HTTPS for PWA installation outside localhost.
