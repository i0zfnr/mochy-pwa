# DESIGN STATE: Apple Music Web Redesign (Revision v02)

**Source References**:
1. `https://music.apple.com/us/new`
2. `media_1794180120660_989ec01b.jpg` (Apple Music Web "New" browse screenshot)
3. `media_1794180616666_31d7a1ee.mp4` (Apple Music Fullscreen Synced Lyrics MacBook video recording)

**Phase**: `AWAITING_DESIGN_APPROVAL`  
**Current Revision**: `v02`  
**Editable Documents**:
- `c:\laragon\www\mochy-pwa\prototypes\proto_apple_new.figcraft`
- `c:\laragon\www\mochy-pwa\prototypes\proto_apple_lyrics.figcraft`

---

## 1. Video Analysis & Empirical Findings (`media_1794180616666_31d7a1ee.mp4`)

From our frame-by-frame analysis of the user's video:
1. **Unboxed Floating Typography**:
   - The lyrics do NOT have any rectangular card, boundary box, or opaque border around them.
   - Text floats organically directly on top of the living fluid mesh canvas.
2. **Optical Focus & Hierarchy**:
   - **Active Line**: Scaled up to 40px, bold font, pure `#FFFFFF`, 100% opacity, with a soft luminous text glow.
   - **Past / Upcoming Lines**: Scaled down (~26px–32px), with progressive opacity falloff (35% to 75%) and subtle optical defocus blur (`filter: blur(1.5px)`), creating deep cinematic depth of field.
3. **Instrumental / Vocal Pause Indicator**:
   - In frame 24s of the video, during an instrumental pause or pre-verse countdown, three animated pulsing dots (`●  ●  ●`) appear smoothly before the next sung line.
4. **Left-Column Alignment & Timeline Scrubber**:
   - Artwork is a squircle on the left with specular rim and ambient elevation shadow.
   - The playback timeline scrubber is located directly beneath the album artwork squircle, showing the elapsed and remaining time (`-3:26`, `-3:38`, `-3:42`) with track title and artist.
5. **Living Liquid Aurora Background**:
   - A slow, continuous, domain-warping fluid mesh that shifts between deep burgundy `#5E0E2C`, magenta `#8C1445`, and dark violet `#3A0952` in organic waves synchronized with the audio energy.

---

## 2. Updated Scene Graph Verification
- Both `proto_apple_new.figcraft` and `proto_apple_lyrics.figcraft` compiled cleanly with `figcraft-cli run` and rendered at 2x scale (`2880×1800`) to `.png`.
- 100% of icons are resolution-independent Lucide vectors. Zero emojis.
- Floating chrome uses authentic Apple Liquid Glass (`backdrop-filter: blur(28px) saturate(190%)`).
