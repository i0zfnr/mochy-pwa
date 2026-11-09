import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { lyricGraphemes, timedWordProgress, visualLyricPosition } from './lyric-progress';

// Only the active line owns a frame callback. Playback samples remain authoritative.
export const TimedLyricWords = memo(function TimedLyricWords({ line, nextLine, position, playing, seekRevision }) {
  const words = useMemo(() => line.words.map(word => ({ ...word, graphemes:lyricGraphemes(word.text) })), [line]);
  const elements = useRef([]);
  const anchor = useRef({ position, at:performance.now() });
  const paintRef = useRef(null);
  useLayoutEffect(() => {
    anchor.current = { position, at:performance.now() };
    paintRef.current?.(position);
  }, [position, playing, seekRevision, line]);
  useEffect(() => {
    let frame = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    function paint(value) {
      words.forEach((word, i) => {
        const node = elements.current[i];
        if (!node) return;
        const progress = timedWordProgress(word.time, word.end ?? words[i + 1]?.time ?? nextLine?.time, value);
        node.style.setProperty('--word-progress', `${progress * 100}%`);
        if (word.graphemes) Array.from(node.children).forEach((glyph, index) => {
          const fill = Math.max(0, Math.min(1, progress * word.graphemes.length - index));
          glyph.style.setProperty('--fill', `${fill * 100}%`);
          glyph.style.setProperty('--lift', reduced.matches ? '0px' : `${-.9 * fill}px`);
        });
      });
    }
    function draw(now) {
      frame = 0;
      paint(visualLyricPosition(anchor.current, now, playing));
      if (playing && !document.hidden && !reduced.matches) frame = requestAnimationFrame(draw);
    }
    function wake() {
      cancelAnimationFrame(frame);
      paint(anchor.current.position);
      if (playing && !document.hidden && !reduced.matches) frame = requestAnimationFrame(draw);
    }
    paintRef.current = paint;
    wake();
    document.addEventListener('visibilitychange', wake);
    reduced.addEventListener('change', wake);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', wake);
      reduced.removeEventListener('change', wake);
      paintRef.current = null;
    };
  }, [words, nextLine, playing]);
  return words.map((word, i) => <span key={i} ref={node => { elements.current[i] = node; }} className={`af-word timed-word ${word.graphemes ? 'has-graphemes' : ''}`}>
    {word.graphemes ? word.graphemes.map((text, index) => <span key={index} className="af-grapheme">{text}</span>) : word.text}
  </span>);
});
