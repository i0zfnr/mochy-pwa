// Explicit entry point for process managers, including symlinked hosting checkouts.
// Keep server/index.js importable without starting a listener for tests/Electron.
import { startServer } from './index.js';

const port = process.env.PORT !== undefined && process.env.PORT !== '' ? Number(process.env.PORT) : 8000;
const host = process.env.HOST || '0.0.0.0';
const running = await startServer({ port, host });
console.log(`Xenn is ready at ${running.url}`);
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => running.server.close(() => process.exit(0)));
}
