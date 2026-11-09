export function timedWordProgress(start, end, position) {
  if (position < start) return 0;
  if (!Number.isFinite(end) || end <= start) return 1;
  return Math.max(0, Math.min(1, (position - start) / (end - start)));
}

// Split only Latin text. Arabic, Indic and other joining scripts stay shaped together.
export function lyricGraphemes(text) {
  if (!/\p{Script=Latin}/u.test(text) || /[^\p{Script=Latin}\p{Mark}\p{Number}\p{Punctuation}\p{Separator}\s]/u.test(text)) return null;
  if (typeof Intl.Segmenter !== 'function') return null;
  return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), part => part.segment);
}
