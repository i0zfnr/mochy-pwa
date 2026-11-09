# XENN player refinement

The existing Home, Search, Library and Audio Lab remain. Removed the promotional New and Radio pages and Apple sidebar/sign-in imitation. Playback, queue, local files and track timing reuse the existing player.

Fullscreen lyrics use real source line timestamps. Enhanced LRC word intervals progressively illuminate Latin graphemes, interpolating visually within supplied timestamp boundaries; no word times are synthesized for line-only lyrics. Joining scripts stay shaped together. The final word switches at its real timestamp when no end timestamp is available. Timing adjustment affects both selection and illumination, and clicked lines compensate for that offset.

Following targets 40% of the lyric viewport with a cancellable 380ms ease-out. Manual wheel, touch, pointer or scroll keys suspend following until Return to current lyric. Seeking and changing tracks restore following immediately. Reduced motion removes lift and smooth scrolling. Frames only run during the scroll transition; listeners and frames are cleaned up.

The mini-player preserves its 64px pill and white primary action. Charcoal backdrop blur uses 24px with a one-pixel directional rim and quieter fullscreen controls. The rim is a CSS optical impression, not shader refraction of arbitrary content. Unsupported blur uses a more opaque surface; reduced transparency uses an opaque surface with effects disabled. Decorative layers ignore pointer events.

Verified: 51 Node tests; production build; desktop screenshots of both views; line seeking to 34.2s and focus at 39.9% of viewport; manual keyboard scrolling and Return; nearby/distant opacity .4/.2; reduced-transparency computed background opaque and backdrop none; 393px viewport without horizontal overflow. Word boundaries and joining scripts have unit coverage. Live end-to-end word-timing/audio alignment was not confirmed: the selected YouTube recording rejected embedded playback. Source lyric availability and recording accuracy remain provider-dependent.
