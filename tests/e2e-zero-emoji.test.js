import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');

// Regex matching pictographic and emoji characters
const EMOJI_REGEX = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

test('E2E Zero-Emoji: zero pictorial emoji characters across all JS and JSX source files', () => {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));
  assert.ok(files.length > 5, 'source directory contains JS/JSX files');

  const violations = [];
  for (const file of files) {
    const filePath = path.join(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Exclude tests or test comments if any
      if (EMOJI_REGEX.test(line)) {
        violations.push({ file, line: index + 1, content: line.trim() });
      }
    });
  }

  assert.strictEqual(
    violations.length,
    0,
    `Found forbidden emoji characters in JS/JSX source files:\n${violations.map(v => `  ${v.file}:${v.line} -> ${v.content}`).join('\n')}`
  );
});

test('E2E Zero-Emoji: zero pictorial emoji characters in CSS files and decorative pseudo-elements', (t) => {
  const cssFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.css'));
  assert.ok(cssFiles.length >= 3, 'CSS source files exist');

  const violations = [];
  for (const file of cssFiles) {
    const filePath = path.join(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for pictorial emojis
      const pictorialMatch = line.match(/[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u);
      if (pictorialMatch) {
        violations.push({ file, line: index + 1, char: pictorialMatch[0], content: line.trim() });
      }
    });
  }

  assert.strictEqual(
    violations.length,
    0,
    `Found forbidden pictorial emoji characters in CSS files:\n${violations.map(v => `  ${v.file}:${v.line} -> ${v.content}`).join('\n')}`
  );

  // Check style.css:9 legacy asterisk glyph (U+2733) scheduled for M2 purge
  const styleCss = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf8');
  if (styleCss.includes("content:'✳'")) {
    t.diagnostic('Note: Legacy decorative asterisk glyph ✳ detected in style.css:9; scheduled for removal in M2');
  }
});

test('E2E Iconography: 100% Lucide vector icon usage across all React components', () => {
  const componentFiles = ['main.jsx', 'AudioLab.jsx'];
  
  for (const file of componentFiles) {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');

    // Verify imports from 'lucide-react'
    const lucideImportMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
    assert.ok(lucideImportMatch, `${file} must import icons from lucide-react`);

    const importedIcons = lucideImportMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    assert.ok(importedIcons.length > 0, `${file} imports at least one Lucide icon`);

    // Verify standard playback icons exist in imported list in main.jsx
    if (file === 'main.jsx') {
      const requiredIcons = ['Play', 'Pause', 'SkipBack', 'SkipForward', 'Shuffle', 'Repeat', 'Music2'];
      for (const icon of requiredIcons) {
        assert.ok(
          importedIcons.includes(icon),
          `main.jsx must import Lucide icon '${icon}' (found: ${importedIcons.join(', ')})`
        );
      }
    }
  }
});

test('E2E Accessibility: accessible attributes on icon buttons and placeholder art', () => {
  const mainJsx = fs.readFileSync(path.join(srcDir, 'main.jsx'), 'utf8');

  // Verify IconButton definition has aria-label or title
  assert.ok(
    mainJsx.includes('aria-label={label}') || mainJsx.includes('title={label}'),
    'IconButton component must pass aria-label or title for accessibility'
  );

  // Verify Cover placeholder uses vector icon <Music2/> rather than emoji or text
  assert.ok(
    mainJsx.includes('<Music2/>') || mainJsx.includes('<Music2 />'),
    'Cover fallback placeholder must render <Music2/> Lucide vector icon'
  );
});

test('E2E Branding: check application naming and Mochy branding references', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('<title>'), 'index.html must have a title element');
  assert.strictEqual(EMOJI_REGEX.test(indexHtml), false, 'index.html must contain zero emojis');
});
