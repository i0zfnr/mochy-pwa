# SOURCE DESIGN BRIEF: Apple Music Web Redesign

**Source URL**: https://music.apple.com/us/new  
**Source Image**: `media_1794180120660_989ec01b.jpg` (User-uploaded Apple Music web screenshot)  
**Received Timestamp**: 2026-11-09T07:23:32+08:00

---

## Raw User Request
```text
https://music.apple.com/us/new

redesign all the page, check on apple music page for the design, i want you to copy the design from the apple music, for the lyric full screen also i want you to explore more how the lyrics, background, and more, add liquid glass same like apple music
```

---

## Reference Image Visual Breakdown (Observed Facts)

### 1. Global Layout & Chromes
- **Left Sidebar Navigation (`220px–240px`)**:
  - `music` logo mark at top.
  - Core navigation links: `Search` (magnifying glass), `Home` (house), `New` (bento/grid icon, active pill with solid dark neutral `#282828` background and white text), `Radio` (broadcast tower icon).
  - Bottom controls: `Open in Music ↗` text link and `Sign In` pill button (`bg-white`, text black, user icon).
- **Floating Liquid Glass Bottom Player Platter**:
  - Centered floating horizontal pill platter (`backdrop-filter: blur(28px) saturate(190%)`, specular rim highlight, subtle border).
  - Transport buttons: Previous, large tactile Play/Pause, Next.
  - Now playing track info: Compact artwork squircle, track title `Blue Moon (Apple Music Sessions)`, artist `Zara Larsson — Sessions`, `PREVIEW` badge, `...` context options.
  - Scrubber & volume slider.
- **Right Side Drawer (`Up Next` Queue)**:
  - Width: `~320px–360px`.
  - Header: `Up Next` in bold white, red accent action `Clear`.
  - Translucent liquid glass background with frosted blur over ambient colors.
  - Track list: 40px album thumbnail, track title, artist, tabular duration (`3:04`, `3:36`, etc.).

### 2. Main Page Content Structure ("New" / Browse)
- **Header**: Large bold title `New` (~34px SF Pro Display).
- **Featured Hero Carousel**:
  - 3-column banner cards with two-line titles:
    - Eyebrow: `NEW PLAYLIST` / `BEST OF 2026` / `NEW ALBUM` (small uppercase, gray/subtle).
    - Title: `Best Songs of 2026` / `Before we reveal Artist of the Year...` / `FRESH` (bold white).
    - Subtitle: `Apple Music` / `Lil Baby`.
    - Rich wide banner artwork cards with carousel navigation arrow button on right.
- **Categorical Bento / Artwork Grid ("Best of 2026 >")**:
  - Section heading with interactive chevron `>`.
  - Square cards with high-impact editorial artwork, bold "2026" typography, and high-saturation colors (Rap Life, R&B Now, A-List Pop, Today's Country, ¡Dale Play!).
- **Song List Section ("Best New Songs >")**:
  - Clean rows with thumbnail, title, artist, options, and duration.

### 3. Fullscreen Lyrics & Immersive Experience Requirements
- Explored dynamic living background:
  - Multi-tone organic fluid aurora curtains derived from album artwork dominant palette.
  - Reactive bass-frequency pulse waves.
- Synced Lyrics presentation:
  - Large bold typography with progressive word-level highlighting (`af-timed-word`).
  - Active line scaling, luminous glow, and subtle ambient blur on past/upcoming lines.
  - Dynamic scrolling centered on active vocal delivery.
- Floating liquid glass controls island with Apple-style rounded buttons and high-contrast specular borders.
