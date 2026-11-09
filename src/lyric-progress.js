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

// An explicitly approximate presentation fallback, never provider-supplied timestamps.
export function estimateWordTimes(lines, duration = 0) {
  return lines.map((line, index) => {
    if (line.words?.length || !line.text.trim()) return line;
    const tokens = line.text.match(/\s*\S+\s*/gu) || [];
    if (!tokens.length) return line;
    const nextTime = lines.slice(index + 1).find(next => next.time > line.time)?.time;
    const boundary = nextTime ?? (duration > line.time ? duration : line.time + tokens.length * .55);
    if (boundary - line.time < .12) return line;
    // Bound long instrumental gaps rather than stretching a single word across them.
    const span = Math.min(boundary - line.time, Math.max(1, tokens.length * 1.05));
    const usable = Math.max(.1, span - Math.min(.18, span * .06));
    const weights = tokens.map(text => Math.max(1, (text.match(/[aeiouyà-ü]+/giu) || []).length) + (/[,.!?;:]\s*$/.test(text) ? .35 : 0));
    const total = weights.reduce((a,b) => a+b, 0);
    let elapsed = 0;
    const words = tokens.map((text, i) => {
      const time = line.time + elapsed / total * usable;
      elapsed += weights[i];
      return { text, time, end:line.time + elapsed / total * usable };
    });
    return { ...line, words, estimatedWordTiming:true };
  });
}

// Extrapolate only between recent clock samples; never run ahead through a stalled player.
export function visualLyricPosition(anchor, now, playing) {
  return anchor.position + (playing ? Math.max(0, Math.min(.20, (now - anchor.at) / 1000)) : 0);
}
