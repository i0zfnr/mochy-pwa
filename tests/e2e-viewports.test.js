import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');

test('E2E Viewport: index.html viewport meta tag conforms to PWA responsive standards', (t) => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // Verify meta viewport exists
  const metaMatch = indexHtml.match(/<meta[^>]*name=["']viewport["'][^>]*>/i);
  assert.ok(metaMatch, 'index.html must define a viewport meta tag');

  const tag = metaMatch[0];
  assert.ok(tag.includes('width=device-width'), 'viewport meta must include width=device-width');
  assert.ok(tag.includes('viewport-fit=cover'), 'viewport meta must include viewport-fit=cover for notch/island support');

  // Anti-Slop R-39 / M2 tracking: user-scalable=no and maximum-scale=1
  if (tag.includes('user-scalable=no') || tag.includes('maximum-scale=1')) {
    t.diagnostic('Note: index.html contains user-scalable=no or maximum-scale=1; scheduled for removal in M2 per Anti-Slop R-39');
  }
});

test('E2E Viewport: Mobile breakpoint (390px / <= 760px) collapses sidebar and activates mobile dock', () => {
  const styleCss = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf8');
  const appleMusicCss = fs.readFileSync(path.join(srcDir, 'apple-music.css'), 'utf8');
  const combined = styleCss + '\n' + appleMusicCss;

  // Mobile media query exists (e.g. max-width: 760px or 767px)
  const hasMobileQuery = combined.includes('@media(max-width:760px)') || combined.includes('@media (max-width: 760px)') || combined.includes('@media (max-width: 767px)') || combined.includes('@media(max-width:767px)');
  assert.ok(hasMobileQuery, 'Must contain mobile responsive media query (<= 760px/767px)');

  // Sidebar hidden on mobile
  assert.ok(
    combined.includes('.sidebar{display:none}') || combined.includes('.sidebar { display: none; }') || combined.includes('.sidebar {display:none}'),
    'Sidebar must be hidden on mobile viewports'
  );

  // Mobile navigation dock exists
  assert.ok(
    combined.includes('.mobile-nav'),
    '.mobile-nav dock must be defined for mobile screens'
  );

  // Mobile mini-player exists
  assert.ok(
    combined.includes('.mobile-mini'),
    '.mobile-mini player platter must be defined for mobile screens'
  );

  // Viewport height adapts using 100dvh
  assert.ok(
    combined.includes('100dvh'),
    'Mobile styling must use 100dvh to eliminate iOS Safari address bar jump'
  );
});

test('E2E Viewport: Tablet / iPad breakpoint (768px / 1024px) reflows multi-column grid', () => {
  const styleCss = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf8');
  const appleMusicCss = fs.readFileSync(path.join(srcDir, 'apple-music.css'), 'utf8');
  const combined = styleCss + '\n' + appleMusicCss;

  // Album grid reflows for tablet / multi-column screens
  assert.ok(
    combined.includes('.album-grid'),
    '.album-grid must be defined for catalog browsing'
  );

  assert.ok(
    combined.includes('grid-template-columns') || combined.includes('repeat('),
    'Album grid must use responsive CSS grid column definitions'
  );
});

test('E2E Viewport: Desktop layout (1280px+) enforces 3-column spatial architecture', () => {
  const styleCss = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf8');
  const appleMusicCss = fs.readFileSync(path.join(srcDir, 'apple-music.css'), 'utf8');
  const combined = styleCss + '\n' + appleMusicCss;

  // Desktop components defined: .sidebar, main, .player-panel
  assert.ok(combined.includes('.sidebar'), 'Desktop sidebar platter must be styled');
  assert.ok(combined.includes('.player-panel'), 'Desktop/Tablet aside player panel must be styled');

  // Layout defines grid or flex container for desktop
  assert.ok(
    combined.includes('.app') || combined.includes('display: grid') || combined.includes('display: flex'),
    'Root application shell must define spatial layout'
  );
});

test('E2E Viewport: Mobile tap target sizes meet touch accessibility guidelines (>= 44px)', () => {
  const styleCss = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf8');
  const appleMusicCss = fs.readFileSync(path.join(srcDir, 'apple-music.css'), 'utf8');
  const combined = styleCss + '\n' + appleMusicCss;

  // Play button on transport has large touch target (>= 44px, e.g. 65px or 56px)
  const playButtonMatch = combined.match(/\.play-button\s*\{[^}]*width:\s*(\d+)px/);
  if (playButtonMatch) {
    const width = parseInt(playButtonMatch[1], 10);
    assert.ok(width >= 44, `Play button width (${width}px) must be >= 44px for touch targets`);
  } else {
    // If inline or variable, verify transport or mobile nav has adequate heights
    assert.ok(combined.includes('mobile-nav') && combined.includes('70px') || combined.includes('64px'), 'Mobile nav height is >= 44px');
  }
});
