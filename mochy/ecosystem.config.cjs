// Ryaze compatibility ecosystem file when Root Directory is set to /mochy
const path = require('path');
const rootEcosystem = require('../ecosystem.config.cjs');

module.exports = {
  apps: rootEcosystem.apps.map(app => ({
    ...app,
    cwd: path.resolve(__dirname, '..'),
    script: path.resolve(__dirname, '../server/start.js'),
  })),
};
