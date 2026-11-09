# XENN player refinement

The existing Home, Search, Library and Audio Lab remain. Removed the promotional New and Radio pages and Apple sidebar/sign-in imitation. Playback, queue, local files and track timing reuse the existing player.

Fullscreen lyrics preserve real source timestamps. Enhanced LRC word intervals progressively illuminate Latin graphemes. At the user's request, line-only sources now receive estimated word timing automatically, with a visible approximation label; source word timings always take priority. Joining scripts stay shaped together. Timing adjustment affects both selection and illumination, and clicked lines compensate for that offset.

Following targets 40% of the lyric viewport with a cancellable 380ms ease-out. Manual wheel, touch, pointer or scroll keys suspend following until Return to current lyric. Seeking and changing tracks restore following immediately. Reduced motion removes lift and smooth scrolling. Frames only run during the scroll transition; listeners and frames are cleaned up.

The mini-player preserves its 64px pill and white primary action. Charcoal backdrop blur uses 24px with a one-pixel directional rim and quieter fullscreen controls. The rim is a CSS optical impression, not shader refraction of arbitrary content. Unsupported blur uses a more opaque surface; reduced transparency uses an opaque surface with effects disabled. Decorative layers ignore pointer events.

Verified: 51 Node tests; production build; desktop screenshots of both views; line seeking to 34.2s and focus at 39.9% of viewport; manual keyboard scrolling and Return; nearby/distant opacity .4/.2; reduced-transparency computed background opaque and backdrop none; 393px viewport without horizontal overflow. Word boundaries and joining scripts have unit coverage. Live end-to-end word-timing/audio alignment was not confirmed: the selected YouTube recording rejected embedded playback. Source lyric availability and recording accuracy remain provider-dependent.


## Video reference refinement

Reviewed the supplied 28-second Apple Music screen recording. Replaced layered CSS aurora/glows and blurred artwork with a single slowly warped, soft album-color field. The shader uses real analysed bass for modest local brightness/expansion; without tab-audio access streaming uses ambient drift, with an explicit Connect beat sync button. Removed the synthetic fixed 120 BPM pulse. Fixed local analyser eligibility. Rendering still stops on pause, hidden documents and reduced motion, and releases resources on unmount.

Lyrics now use the upstream licensed Inter Semibold face at its actual 600 weight, with gentler spacing. At the user's explicit request, line-only lyrics receive automatically estimated word intervals, bounded by line timestamps and recording duration. Estimated intervals are visibly labelled and never presented as source timing. Real word timestamps always take priority; joining scripts stay intact. Highlighting uses the same adjusted playback position, freezes on pause, and recomputes on seek. Untimed plain lyrics cannot produce synchronized animation.


## Smooth playback and Settings-only beat controls

Moved Connect beat sync and beat intensity out of fullscreen into Settings. The fullscreen header now contains only Like and Exit. Settings explains the distinction between local audio analysis and explicitly shared streaming tab audio.

The old word fill followed discrete 150ms playback samples. The active line now paints at animation-frame cadence, interpolating between authoritative playback samples with a 200ms stall cap; player polling is 50ms. Pausing and seeking immediately reset the visual clock. Inactive lines have no frame loop, and callbacks/listeners stop on pause, hidden documents, reduced motion, track changes and unmount.

The album field now includes a broad, feathered aurora fold. Real bass transients illuminate the fold with a fast attack and gentle release, without flashing the whole background. It remains an independent WebGL implementation inspired by the supplied video.

Apple references reviewed:
- [Motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion): purposeful, restrained, optional motion and accessibility.
- [Create custom visual effects with SwiftUI, WWDC24](https://developer.apple.com/videos/play/wwdc2024/10151/): animated mesh color fields, custom text effects and shaders.
- [MeshGradient smoothsColors](https://developer.apple.com/documentation/swiftui/meshgradient/smoothscolors): smooth interpolation of mesh colors.
- [Providing animated artwork](https://developer.apple.com/documentation/mediaplayer/providing-animated-artwork-for-media-items): artwork asset fallbacks and Reduce Motion behavior. This is about media artwork rather than Music's lyric-background implementation.

These references do not specify Music's proprietary background shader. XENN does not claim to reproduce that internal algorithm. Estimated word timings remain approximate, as explicitly requested.


## System lyric typography

Lyrics now prefer `-apple-system` / `BlinkMacSystemFont` at semibold 600, then Segoe UI Variable Display on Windows, with the bundled licensed Inter Semibold as fallback. Tracking is -0.018em on desktop and -0.015em on mobile. This uses the Apple platform's installed system typeface without bundling proprietary font files. Verified through Chrome's platform-font inspection on Windows: Segoe-UI-Variable-Display-Semibold. Production build passed.
