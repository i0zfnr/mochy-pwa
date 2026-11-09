# Deploying to ryaze.my.id

The public website and its [GitHub deployment guide](https://ryaze.my.id/blog/panduan-lengkap-cara-hosting-web-menggunakan-repository-github-di-ryaze) were inspected in the browser. The web port is published at https://github.com/i0zfnr/mochy-pwa and a Node.js project named `mochy` was created at https://mochy.ryaze.my.id. Ryaze assigned this project port 8000, recorded in the host-only `.port` file.

## Updating this Ryaze project

The observed Node deployment installed dependencies but did not run the frontend build. Its generated `.ryaze-pm2.js` was launched as a script rather than as an ecosystem configuration. Use the committed `ecosystem.config.cjs` to run the actual server. In the project's **Terminal**, execute these commands separately and check each result:

```sh
git pull --ff-only origin main
npm ci --include=dev
npm run build
npx pm2 startOrRestart ecosystem.config.cjs --only mochy-web --update-env
npx pm2 save
```

The ecosystem config reads the host-only `.port` file and binds `0.0.0.0` at that port. It only targets `mochy-web`. Do not run broad PM2 commands against other hosted applications. If Ryaze changes the assigned proxy port, update the ecosystem configuration to match. The dashboard's Active badge alone does not verify the app: check the public homepage and `/api/health` after updates. The PM2 process list is saved for the hosting user's session; restoration after a full host reboot depends on Ryaze's process-manager service.

## Ryaze dashboard configuration

1. Push **this web port** to a new GitHub repository. Do not deploy the upstream Android repository.
2. In the hosting dashboard, choose **Buat Project Hosting → Repository (GitHub)**.
3. Choose **Node.js** as the framework so `/api/search` and `/api/lyrics` run. Choosing static React hosting would omit the backend.
4. Set the new web repository URL, branch and project/subdomain name.
5. Build with `npm ci --include=dev && npm run build`; start with `npm start` (or `node server/index.js`). Set `HOST=0.0.0.0`, `NODE_ENV=production`, `ELECTRON_SKIP_BINARY_DOWNLOAD=1` and the platform-assigned `PORT` if required. Confirm the selected Node version is 22.12+. The build needs dev dependencies even if the runtime environment is production.
6. Inspect **Riwayat Deploy / Build Logs**, then test the assigned HTTPS URL and `/api/health`.

The public guide confirms the framework/repository/branch flow. The authenticated project panel confirmed the Node runtime selection and assigned proxy port; the update procedure above addresses the startup behavior actually observed. No account or subscription changes were made.

## Required hosting capability

This app needs Node.js 22.12+ (24 recommended), outbound HTTPS to `music.youtube.com` and `lrclib.net`, and a persistent web process behind HTTPS. User libraries are browser-local; this version needs no server database. The search endpoint is unofficial and can change; errors leave local listening available.

If Ryaze offers a Node application panel:

1. Upload the source, omitting `node_modules`, `upstream`, `release`, `.git`, and `.env`.
2. Run `npm ci --include=dev` and `npm run build` in the build environment. Set `ELECTRON_SKIP_BINARY_DOWNLOAD=1` during installation to avoid downloading desktop binaries on the host.
3. Start with `node server/start.js`, environment `NODE_ENV=production`, `HOST=0.0.0.0`, and the port assigned by the hosting panel in `PORT`.
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

Keep secrets out of source and chat. This project does not require music-service credentials or a server database.

## Verified XENN redeploy (9 November 2026)

Player implementation commit: `954aeae`. The managed **Redeploy Sekarang** action refreshed the container proxy to the provider-observed destination `172.18.0.4:8000` and wrote `.port` as `8000`. This address is deployment-specific; let Ryaze discover it. A loopback custom proxy produced a gateway error and was reverted. Keep the dashboard's default routing.

The managed log reported its existing PM2 script was already launched. Restarted only `mochy-web` with the ecosystem commands above so it reread `.port`, then saved its process list. The public `/api/health` returned JSON `ok: true`; the homepage served the new XENN bundle, and the artwork endpoint returned a matching catalog cover. Before the managed redeploy the static fallback returned HTML for `/api/health`, which is a failure even with HTTP 200. Always validate response content, not just status.
