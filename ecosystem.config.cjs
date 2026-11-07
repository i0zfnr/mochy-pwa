// Ryaze assigned port to the mochy project.
let port = 8001;
try {
  const fs = require('fs');
  const path = require('path');
  const portFile = path.resolve(__dirname, '.port');
  const val = fs.readFileSync(portFile, 'utf8').trim();
  if (val && !isNaN(Number(val))) port = Number(val);
} catch {}

module.exports = {
  apps: [{
    name: 'mochy-web',
    cwd: __dirname,
    script: 'server/start.js',
    interpreter: 'node',
    filter_env: ['HTTP_', 'CONTENT_', 'REQUEST_', 'REDIRECT_', 'DOCUMENT_', 'SCRIPT_', 'SERVER_', 'PHP_'],
    env: { NODE_ENV: 'production', PORT: process.env.PORT || port, HOST: '0.0.0.0' },
    autorestart: true,
    max_restarts: 10,
    restart_delay: 2000,
  }],
};
