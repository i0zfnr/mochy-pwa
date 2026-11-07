// Explicit entry point for process managers, including symlinked hosting checkouts.
// Keep server/index.js importable without starting a listener for tests/Electron.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './index.js';

let defaultPort = 8001;
try {
  const portFile = resolve(fileURLToPath(import.meta.url), '../../.port');
  const val = readFileSync(portFile, 'utf8').trim();
  if (val && !isNaN(Number(val))) defaultPort = Number(val);
} catch {}

const port = process.env.PORT !== undefined && process.env.PORT !== '' ? Number(process.env.PORT) : defaultPort;
const host = process.env.HOST || '0.0.0.0';
const running = await startServer({ port, host });
console.log(`Xenn is ready at ${running.url}`);
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => running.server.close(() => process.exit(0)));
}
