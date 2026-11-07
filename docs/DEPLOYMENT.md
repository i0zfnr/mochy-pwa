# Deploying to ryaze.my.id

The public website and its [GitHub deployment guide](https://ryaze.my.id/blog/panduan-lengkap-cara-hosting-web-menggunakan-repository-github-di-ryaze) were inspected in the browser. Ryaze advertises Node.js hosting, Git deployment and automatic HTTPS. No deployment has been performed; the user's account, assigned runtime version, port and project configuration have not been inspected.

## Ryaze dashboard configuration

1. Push **this web port** to a new GitHub repository. Do not deploy the upstream Android repository.
2. In the hosting dashboard, choose **Buat Project Hosting → Repository (GitHub)**.
3. Choose **Node.js** as the framework so `/api/search` and `/api/lyrics` run. Choosing static React hosting would omit the backend.
4. Set the new web repository URL, branch and project/subdomain name.
5. Build with `npm ci --include=dev && npm run build`; start with `npm start` (or `node server/index.js`). Set `HOST=0.0.0.0`, `NODE_ENV=production`, `ELECTRON_SKIP_BINARY_DOWNLOAD=1` and the platform-assigned `PORT` if required. Confirm the selected Node version is 22.12+. The build needs dev dependencies even if the runtime environment is production.
6. Inspect **Riwayat Deploy / Build Logs**, then test the assigned HTTPS URL and `/api/health`.

The public guide confirms the framework/repository/branch flow; exact build/start/port fields depend on the authenticated project panel and still need verification. No account or subscription changes were made.

## Required hosting capability

This app needs Node.js 22.12+ (24 recommended), outbound HTTPS to `music.youtube.com` and `lrclib.net`, and a persistent web process behind HTTPS. User libraries are browser-local; this version needs no server database. The search endpoint is unofficial and can change; errors leave local listening available.

If Ryaze offers a Node application panel:

1. Upload the source, omitting `node_modules`, `upstream`, `release`, `.git`, and `.env`.
2. Run `npm ci --include=dev` and `npm run build` in the build environment. Set `ELECTRON_SKIP_BINARY_DOWNLOAD=1` during installation to avoid downloading desktop binaries on the host.
3. Start with `node server/index.js`, environment `NODE_ENV=production`, `HOST=0.0.0.0`, and the port assigned by the hosting panel in `PORT`.
4. Map the domain/subdomain to that process. Forward all paths, including `/api/*`, `/sw.js`, `/manifest.webmanifest` and `/assets/*`.
5. Enable HTTPS. Ensure the proxy does not add frame-blocking policies for YouTube or cache `/api/*` as the HTML page.
6. Verify `/api/health`, search, playback, local import, reload and PWA installation.

If it only offers PHP/static uploads, use a separate Node host for this app, or provision a VPS/container. Uploading `dist/` by itself is insufficient for online search and lyrics.

## Docker / VPS

```sh
docker build -t mochy-web .
docker run -d --name mochy-web --restart unless-stopped -p 127.0.0.1:4173:4173 mochy-web
```

Point a TLS reverse proxy at `127.0.0.1:4173`. The runtime container has no frontend/desktop build dependencies; its HTTP server uses Node built-ins.

Example Caddy configuration, after substituting the actual domain you control:

```caddy
music.example.com {
    reverse_proxy 127.0.0.1:4173
}
```

For an existing Nginx TLS virtual host:

```nginx
location / {
    proxy_pass http://127.0.0.1:4173;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

The built-in rate limiter counts socket IPs. Behind a proxy it therefore limits all visitors collectively to 60 music/lyrics requests per minute. For larger deployments, move trusted per-client rate limiting to the proxy and adjust the application limit deliberately. No arbitrary-URL proxy endpoint is exposed.

## Updates

Rebuild and restart the web process/container. HTML and the service worker are sent with revalidation headers; hashed JS/CSS assets are immutable. Close and reopen installed PWA windows if an old service worker is still active. Keep the domain/origin stable to preserve browser-local libraries. Changing the domain does not migrate IndexedDB data.

To complete publication, obtain the Ryaze panel/runtime details and account access through an appropriate secure workflow. Keep secrets out of source and chat.
