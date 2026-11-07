export const time = value => { const n = Math.max(0, Math.floor(Number(value) || 0)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };
export function parseLrc(text = '') {
  if (!text || typeof text !== 'string') return [];
  return text.split('\n').flatMap(line => {
    const content = line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim();
    const words = [...content.matchAll(/<(\d+):(\d+(?:\.\d+)?)>([^<]*)/g)].map(m => ({ time: Number(m[1]) * 60 + Number(m[2]), text: m[3] }));
    return [...line.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)].map(m => ({
      time: Number(m[1]) * 60 + Number(m[2]),
      text: content.replace(/<\d+:\d+(?:\.\d+)?>/g, ''),
      ...(words.length ? { words } : {}),
    }));
  }).sort((a, b) => a.time - b.time);
}
export function nextIndex(index, length, shuffle, repeat, direction = 1, ended = false) {
  if (!length) return -1;
  if (ended && repeat === 'one') return index;
  if (shuffle && length > 1) return (index + 1 + Math.floor(Math.random() * (length - 1))) % length;
  const next = index + direction;
  if (next >= length) return repeat === 'all' || !ended ? 0 : -1;
  return next < 0 ? length - 1 : next;
}
export async function findMusic(q, signal) { const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal }); const data = await res.json(); if (!res.ok) throw new Error(data.error); return data.tracks; }
