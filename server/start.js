// Explicit entry point for process managers, including symlinked hosting checkouts.
// Keep server/index.js importable without starting a listener for tests/Electron.
import { startServer } from './index.js';

const running = await startServer();
console.log(`Mochy is ready at ${running.url}`);
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => running.server.close(() => process.exit(0)));
}
