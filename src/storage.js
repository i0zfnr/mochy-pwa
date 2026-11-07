import { openDB } from 'idb';
const database = openDB('mochy-library', 1, { upgrade(db) { db.createObjectStore('tracks', { keyPath: 'id' }); db.createObjectStore('files'); db.createObjectStore('state'); } });
export const getLibrary = async () => (await database).getAll('tracks');
export const saveTrack = async track => (await database).put('tracks', track);
export const getFile = async id => (await database).get('files', id);
export const saveFile = async (id, file) => (await database).put('files', file, id);
export const readState = async (key, fallback) => (await (await database).get('state', key)) ?? fallback;
export const writeState = async (key, value) => (await database).put('state', value, key);
export async function removeTrack(id) { const db = await database; const tx = db.transaction(['tracks', 'files'], 'readwrite'); await tx.objectStore('tracks').delete(id); await tx.objectStore('files').delete(id); await tx.done; }
export async function importAudio(file) {
  const { parseBlob } = await import('music-metadata');
  let metadata;
  try { metadata = await parseBlob(file); } catch { metadata = { common: {}, format: {} }; }
  const { common, format } = metadata;
  const picture = common.picture?.[0];
  let cover = '';
  if (picture) {
    cover = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(new Blob([picture.data], { type: picture.format })); });
  }
  const id = `local-${file.name}-${file.size}-${file.lastModified}`;
  const track = { id, title: common.title || file.name.replace(/\.[^.]+$/, ''), artist: common.artist || 'Unknown artist', album: common.album || 'Local files', cover, duration: Math.round(format.duration || 0), source: 'local' };
  await saveFile(id, file); await saveTrack(track); return track;
}
