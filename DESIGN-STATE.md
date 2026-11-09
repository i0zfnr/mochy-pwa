# Design State & Implementation Specification (Revision v03 — Approved & Implemented)

## 1. Overview & Status
- **Run Type**: `IMPLEMENTATION RUN`
- **User Approval**: Explicit user specification provided and approved.
- **Brand Identity**: Authentic `xenn.` product naming and `/icon.png` squircle logo preserved (replaces literal Apple marks while retaining high-fidelity Apple Music spatial architecture).
- **Test Suite**: 49 / 49 tests passing (100% green).
- **Production Build**: Built in 5.02s via Vite.
- **Live Target**: `https://mochy.ryaze.my.id/` (Ryaze Hosting, PM2 process `mochy-web` on port 8000).

---

## 2. Implemented Specifications

### A. Fullscreen Lyrics (Image 1 Fidelity)
1. **Layout & Spatial Hierarchy**:
   - Left column: Album artwork squircle, track title, artist name, and a dedicated **Liquid Glass Playback-Control Card** (`.af-controls-card`).
   - Right column: Vertically scrolling lyrics with top and bottom soft gradient fades.
2. **Typography & Spacing**:
   - Font: Bold, approximately 40px type (`clamp(28px, 3.2vw, 40px)`, `font-weight: 700 !important`).
   - Line height: `1.4`.
   - Generous line spacing: `margin-bottom: 34px`.
3. **Word-Level Progressive Highlighting**:
   - Progressive illumination based on actual word timestamps (`position >= word.time`).
   - Sung words: Pure white (`#FFFFFF !important`), luminous ambient glow (`text-shadow: 0 0 20px rgba(255, 255, 255, 0.45)`), with a subtle 0.9px upward lift (`transform: translateY(-0.9px)`).
   - Upcoming words: Subdued dim state (`color: rgba(255, 255, 255, 0.38) !important; opacity: 0.38 !important; transform: translateY(0)`).
   - Preserves joining scripts as whole words without letter breaks.
   - Fallback: Line-level highlighting when word timestamps are unavailable without inventing timestamps.
4. **Subdued Surrounding Lines & Optical Defocus**:
   - Adjacent lines (`data-distance="1"`): 35–45% opacity (`opacity: 0.40; color: rgba(255, 255, 255, 0.42); filter: blur(1.2px)`).
   - Distant lines (`data-distance="2"`+): 15–25% opacity (`opacity: 0.20; color: rgba(255, 255, 255, 0.22); filter: blur(2.0px)`).
   - Inactive line hover: Clears blur and brightens to 85–90% opacity for clear legibility and seeking.
5. **Focus Position & Motion Curves**:
   - Active line moves toward a consistent focus position around **40%** of the lyric viewport height.
   - Restrained ease-out scrolling transition (duration ~380ms within the 300–450ms range).
   - Reduced motion: `@media (prefers-reduced-motion: reduce)` disables lift and animated scrolling.
6. **Playback Synchronization & Interactivity**:
   - Pausing freezes lyric progress immediately.
   - Seeking immediately updates active line, word highlighting, and scroll position.
   - Clicking any timestamped line seeks playback to its start.
   - "Adjust lyric timing" offset (`lyricDelay`) synchronously affects line selection and word highlighting.
7. **Manual Scrolling Suspension & "Return to current lyric"**:
   - Manual scrolling (`wheel`, `touchstart`, `pointerdown`) suspends auto-scrolling.
   - Renders a floating liquid glass pill button: `Return to current lyric` (`.af-return-lyrics`).
   - Clicking resumes automatic following and smoothly scrolls to the active line.
8. **Left Column Liquid Glass Playback-Control Card (`.af-controls-card`)**:
   - Frosted charcoal shell (`background: rgba(22, 26, 32, 0.65); backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px;`).
   - Scrubber track with elapsed time on left (`1:11`) and negative time on right (`-3:26`).
   - Transport controls with strongest control being a 52px white circular play/pause button (`.af-play-button`).
   - Volume slider with percentage indicator.

---

### B. Liquid Glass Mini-Player (Image 2 Fidelity)
1. **Control Order & Geometry**:
   - Pill-shaped bar centered at the bottom of the viewport (`height: 64px`, `border-radius: 9999px`).
   - Order: Shuffle → SkipBack → **White circular Play/Pause button** → SkipForward → Repeat → Cover Thumbnail squircle → Title & Artist → `PREVIEW` badge → `•••` action button → Volume slider → Synced Lyrics button (`Mic2`) → Up Next queue drawer button (`ListMusic`).
2. **Optics & Material Finish**:
   - Translucent charcoal tint (`rgba(22, 26, 32, 0.78)`).
   - Soft 24px background blur (`backdrop-filter: blur(24px) saturate(180%) contrast(102%)`).
   - 1px refracting perimeter rim (`border: 1px solid rgba(255, 255, 255, 0.13)`).
   - Directional highlight: Upper edge slightly brighter than lower edge:
     `box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.28), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.40), 0 16px 36px -8px rgba(0, 0, 0, 0.55);`
   - Razor-sharp interior: distortion is restricted strictly to the outer perimeter.
3. **Control Hierarchy & Focus Visibility**:
   - Dominant 36px white circular play/pause button (`#FFFFFF` background, `#000000` icon, `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35)`).
   - Secondary controls brighten to white on hover.
   - Clear keyboard focus: `:focus-visible { outline: 2px solid #007AFF; outline-offset: 2px; }`.
   - Subtle glass styling applied to top-right fullscreen buttons (`.beat-intensity-button` and `.af-header-actions .icon-button`).
4. **Accessibility Fallbacks**:
   - `@media (prefers-reduced-transparency: reduce)` provides opaque `#171D24` surfaces with no blur.
   - Decorative glass layers remain noninteractive (`pointer-events: none`).

---

### C. Sidebar & Identity Restoration
- Sidebar brand uses `<button className="brand">` with `/icon.png` (28×28px squircle) and `xenn.` typography with accent dot.
