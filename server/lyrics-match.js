// Match a recording, not just a similarly named song. Never erase remix/live
// qualifiers before choosing a timed recording.
export function normaliseName(value = '') {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/\s*[-–—]\s*topic$/i, '').replace(/\b(?:official (?:audio|video|music video)|lyrics?|visuali[sz]er|hd|4k)\b/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}
function versions(name) {
  return [...normaliseName(name).matchAll(/\b(live|remix|acoustic|instrumental|sped up|slowed|cover|karaoke)\b/g)].map(m => m[1]).sort().join(',');
}
export function matchRecording(candidate, { title, artist, duration = 0 }) {
  if (!candidate || normaliseName(candidate.trackName) !== normaliseName(title)) return false;
  if (normaliseName(candidate.artistName) !== normaliseName(artist)) return false;
  if (versions(candidate.trackName) !== versions(title)) return false;
  // LRCLIB's timed recording matcher uses a two-second duration tolerance.
  if (duration > 0 && (!Number.isFinite(Number(candidate.duration)) || Math.abs(Number(candidate.duration) - duration) > 2)) return false;
  return true;
}
export function selectRecording(candidates, recording) {
  return candidates.filter(c => matchRecording(c, recording)).sort((a, b) => {
    const difference = Math.abs(Number(a.duration) - recording.duration) - Math.abs(Number(b.duration) - recording.duration);
    return Number(!!b.syncedLyrics) - Number(!!a.syncedLyrics) || difference;
  })[0];
}
