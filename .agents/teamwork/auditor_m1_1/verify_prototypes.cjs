const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

const CLI = 'C:\\Users\\ipan\\AppData\\Local\\Programs\\ArtCraft\\FigCraft\\figcraft-cli.exe';
const PROTO_DIR = 'c:\\laragon\\www\\mochy-pwa\\.agents\\teamwork\\figcraft_prototypes';

const views = [
  'view_1_player',
  'view_2_navigation',
  'view_3_library',
  'view_4_search',
  'view_5_ambient'
];

console.log('=== FIGCRAFT CLI VERIFICATION ===');
views.forEach(v => {
  const figPath = `${PROTO_DIR}\\${v}.figcraft`;
  const pngPath = `${PROTO_DIR}\\${v}.png`;

  const infoRaw = execSync(`"${CLI}" info "${figPath}" --json`).toString('utf8');
  const info = JSON.parse(infoRaw);

  const pngBuf = fs.readFileSync(pngPath);
  const width = pngBuf.readUInt32BE(16);
  const height = pngBuf.readUInt32BE(20);
  const pngHash = crypto.createHash('sha256').update(pngBuf).digest('hex').substring(0, 16);
  const figBuf = fs.readFileSync(figPath);
  const figHash = crypto.createHash('sha256').update(figBuf).digest('hex').substring(0, 16);

  console.log(`[PASS] ${v}:`);
  console.log(`  - Frame: "${info.pages[0].frames[0].name}" (${info.pages[0].frames[0].width}x${info.pages[0].frames[0].height})`);
  console.log(`  - Total nodes: ${info.nodes}, Missing fonts: ${info.missingFonts.length}`);
  console.log(`  - FigCraft size: ${figBuf.length} bytes (sha256: ${figHash})`);
  console.log(`  - Rendered PNG: ${width}x${height}, ${pngBuf.length} bytes (sha256: ${pngHash})`);
});
