Redesign the user interface of Mochy Music PWA across the full application as a production upgrade, using FigCraft visual prototyping, Liquid Glass optics, Apple Music aesthetics, high-taste visual standards, zero emoji with Lucide vector icons, solid content cards with floating glass chrome, and responsive iPad, mobile, and desktop layouts.

Working directory: c:\laragon\www\mochy-pwa
Integrity mode: development

## Requirements

### R1. FigCraft Visual Prototype
Create and export high-resolution visual prototypes in FigCraft for the redesigned application views (Player / Now Playing view, navigation chrome, Library, Search, and Ambient modes) demonstrating Apple Music aesthetics, Liquid Glass floating controls, solid content surfaces, and vector iconography before final UI implementation.

### R2. Liquid Glass & Apple Music Design System
Implement the redesigned UI across all application views in Mochy Music PWA:
- Restrict Liquid Glass styling to floating navigation, toolbars, modal sheets, and playback control chrome hovering over backgrounds.
- Keep content containers, lists, and cards as solid opaque surfaces with clear contrast; never nest refractive glass inside refractive glass.
- Enforce a strict zero-emoji policy across all headings, buttons, badges, and labels, using Lucide vector icons throughout.
- Ensure the layout is fully responsive and cleanly adapts across mobile, tablet/iPad, and desktop viewports without horizontal clipping or overflow.

### R3. Functional Integrity and Verification
Preserve all existing audio playback, library management, search, and ambient features without regressions. Verify the implementation with automated build and test suites.

## Acceptance Criteria

### Visual Design and Prototyping
- [ ] FigCraft prototype files and exported PNG renderings exist covering the Player / Now Playing view, navigation, Library, Search, and Ambient modes
- [ ] Glass styling is applied only to floating chrome (navigation bar, playback controls, modal sheets) and content surfaces remain solid and legible
- [ ] No emoji characters exist in any UI elements or component copy; all iconography is rendered with Lucide vector icons
- [ ] Application layout renders without horizontal overflow or clipped controls at standard mobile (390px), tablet (768px/1024px), and desktop (1280px+) widths

### Build and Test Verification
- [ ] `npm run build` exits with code 0 with no bundling or syntax errors
- [ ] `npm test` runs and all test suites pass with code 0
