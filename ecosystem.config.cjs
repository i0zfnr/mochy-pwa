// Ryaze assigned port 8000 to the mochy project. Keep this name project-specific.
module.exports = {
  apps: [{
    name: 'mochy-web',
    cwd: __dirname,
    script: 'server/index.js',
    interpreter: 'node',
    env: { NODE_ENV: 'production', PORT: process.env.PORT || 8000, HOST: '0.0.0.0' },
    autorestart: true,
    max_restarts: 10,
    restart_delay: 2000,
  }],
};
