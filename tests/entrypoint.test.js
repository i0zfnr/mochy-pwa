import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('managed startup entrypoint opens the configured listener', { timeout: 10000 }, async t => {
  const child = spawn(process.execPath, [fileURLToPath(new URL('../server/start.js', import.meta.url))], {
    env: { ...process.env, PORT: '0', HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => child.kill());
  const url = await new Promise((resolve, reject) => {
    let output = '', errors = '';
    child.stderr.on('data', chunk => { errors += chunk; });
    child.stdout.on('data', chunk => { output += chunk; const match = output.match(/(?:Xenn|Mochy) is ready at (http:\/\/127\.0\.0\.1:\d+)/); if (match) resolve(match[1]); });
    child.once('error', reject);
    child.once('exit', code => reject(new Error(`Server exited before listening (${code}): ${errors}`)));
  });
  const response = await fetch(url + '/api/health');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
});
