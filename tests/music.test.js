import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLrc, nextIndex, time } from '../src/music.js';
import { parseSearch } from '../server/providers.js';
import { startServer } from '../server/index.js';

test('synced lyrics support fractional seconds, duplicate timestamps and metadata', () => {
  assert.deepEqual(parseLrc('[ar:Artist]\n[00:10.50][01:20.00]Hello\n[00:05.2]Before'), [{ time: 5.2, text: 'Before' }, { time: 10.5, text: 'Hello' }, { time: 80, text: 'Hello' }]);
});
test('queue completion, repeat and previous have distinct behavior', () => {
  assert.equal(nextIndex(2, 3, false, 'off', 1, true), -1);
  assert.equal(nextIndex(2, 3, false, 'all', 1, true), 0);
  assert.equal(nextIndex(1, 3, false, 'one', 1, true), 1);
  assert.equal(nextIndex(0, 3, false, 'off', -1), 2);
  assert.equal(nextIndex(0, 0, false, 'all'), -1);
  for (let i = 0; i < 25; i++) assert.notEqual(nextIndex(1, 3, true, 'off'), 1);
});
test('duration format handles missing and invalid durations', () => { assert.equal(time(NaN), '0:00'); assert.equal(time(-3), '0:00'); assert.equal(time(192.9), '3:12'); });
test('provider parser skips artists and deduplicates track renderers', () => {
  const r = { musicResponsiveListItemRenderer: { flexColumns: [{ musicResponsiveListItemFlexColumnRenderer: { text: { runs: [{ text: 'Song', navigationEndpoint: { watchEndpoint: { videoId: 'abcdefghijk' } } }] } } }, { musicResponsiveListItemFlexColumnRenderer: { text: { runs: [{ text: 'Artist', navigationEndpoint: { browseEndpoint: { browseId: 'UC123' } } }, { text: ' • ' }, { text: '3:12' }] } } }] } };
  const result = parseSearch({ items: [r, r, { musicResponsiveListItemRenderer: { flexColumns: [] } }] });
  assert.equal(result.length, 1); assert.equal(result[0].artist, 'Artist'); assert.equal(result[0].duration, 192);
});
test('production server health, validation, unknown APIs and missing files', async t => {
  const { server, url } = await startServer({ port: 0 }); t.after(() => new Promise(resolve => server.close(resolve)));
  assert.equal((await (await fetch(url + '/api/health')).json()).ok, true);
  assert.equal((await fetch(url + '/api/search?q=')).status, 400);
  assert.equal((await fetch(url + '/api/search?q=' + 'x'.repeat(151))).status, 400);
  assert.equal((await fetch(url + '/api/lyrics')).status, 400);
  assert.equal((await fetch(url + '/api/unknown')).status, 404);
  assert.equal((await fetch(url + '/api/search', { method: 'POST' })).status, 405);
  assert.equal((await fetch(url + '/missing.js')).status, 404);
});
