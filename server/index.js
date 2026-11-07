import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { search } from './providers.js';

export async function startServer({ port = Number(process.env.PORT || 4173), host = process.env.HOST || (process.env.HOSTNAME === '0.0.0.0' ? '0.0.0.0' : '127.0.0.1'), dev = false } = {}) {
  const root = fileURLToPath(new URL('../dist/', import.meta.url));
  const vite = dev ? await (await import('vite')).createServer({ server: { middlewareMode: true }, appType: 'spa' }) : null;
  const limits = new Map();
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');
        if (req.method !== 'GET') { res.writeHead(405); return res.end(JSON.stringify({ error: 'Method not allowed' })); }
        if (url.pathname === '/api/health') return res.end(JSON.stringify({ ok: true, version: '0.1.0' }));
        const ip = req.socket.remoteAddress;
        const limit = limits.get(ip);
        if (limit && limit.until > Date.now() && limit.count >= 60) { res.writeHead(429); return res.end(JSON.stringify({ error: 'Too many requests. Try again in a minute.' })); }
        if (!limit || limit.until < Date.now()) limits.set(ip, { count: 1, until: Date.now() + 60000 }); else limit.count++;
        if (limits.size > 10000) for (const [k, v] of limits) if (v.until < Date.now()) limits.delete(k);
        if (url.pathname === '/api/search') {
          const q = url.searchParams.get('q')?.trim();
          if (!q || q.length > 150) { res.writeHead(400); return res.end(JSON.stringify({ error: 'Enter a search between 1 and 150 characters.' })); }
          const tracks = await search(q);
          res.setHeader('Cache-Control', 'private, max-age=300');
          return res.end(JSON.stringify({ tracks }));
        }
        if (url.pathname === '/api/lyrics') {
          const title = url.searchParams.get('title')?.slice(0, 200);
          const artist = url.searchParams.get('artist')?.slice(0, 200);
          if (!title || !artist) { res.writeHead(400); return res.end(JSON.stringify({ error: 'Title and artist are required.' })); }
          const upstream = new URL('https://lrclib.net/api/get');
          upstream.searchParams.set('track_name', title); upstream.searchParams.set('artist_name', artist);
          const result = await fetch(upstream, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'Mochy-Web/0.1.0' } });
          if (result.status === 404) { res.writeHead(404); return res.end(JSON.stringify({ error: 'No lyrics found for this recording.' })); }
          if (!result.ok) throw new Error('Lyrics provider unavailable');
          const lyrics = await result.json();
          return res.end(JSON.stringify({ plainLyrics: lyrics.plainLyrics, syncedLyrics: lyrics.syncedLyrics, instrumental: lyrics.instrumental }));
        }
        res.writeHead(404); return res.end(JSON.stringify({ error: 'Not found' }));
      }
      if (vite) return vite.middlewares(req, res);
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400); return res.end('Invalid path'); }
      let path = resolve(root, '.' + pathname);
      if (path !== resolve(root) && !path.startsWith(resolve(root) + sep)) { res.writeHead(403); return res.end('Forbidden'); }
      try { if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html'); } catch { if (!extname(pathname)) path = resolve(root, 'index.html'); }
      const body = await readFile(path);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
      res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
      res.setHeader('Cache-Control', /[\\/]assets[\\/]/.test(path) ? 'public, max-age=31536000, immutable' : 'no-cache');
      res.end(body);
    } catch (error) {
      const api = req.url.startsWith('/api/');
      res.writeHead(error.code === 'ENOENT' ? 404 : 502, { 'Content-Type': api ? 'application/json' : 'text/plain' });
      res.end(api ? JSON.stringify({ error: 'The music service could not be reached. Your local library still works.' }) : 'Not found');
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); });
  return { server, vite, url: `http://${host}:${server.address().port}` };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const running = await startServer({ dev: process.argv.includes('--dev') });
  console.log(`Mochy is ready at ${running.url}`);
}
