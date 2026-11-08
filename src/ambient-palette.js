// Ported from Mochy Music's flagship/AmbientColors.kt (GPL-3.0).
// Default start tones tuned to authentic Apple Music burgundy/violet fluid mesh (from macOS Apple Music video).
export const START_TONES = [
  [94 / 255, 14 / 255, 44 / 255],   // Deep burgundy (#5E0E2C)
  [140 / 255, 20 / 255, 69 / 255],  // Rich magenta (#8C1445)
  [26 / 255, 5 / 255, 20 / 255],    // Deep dark violet (#1A0514)
  [58 / 255, 9 / 255, 82 / 255],    // Dark violet accent (#3A0952)
];

export function ambientTones(pixels, width, height) {
  if (!width || !height) return START_TONES;
  function average(x0, x1, y0, y1) {
    const rgb = [0, 0, 0]; let count = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      if (pixels[i + 3] < 128) continue;
      for (let c = 0; c < 3; c++) rgb[c] += pixels[i + c] / 255;
      count++;
    }
    return rgb.map(value => count ? value / count : 0);
  }
  const half = Math.floor(width / 2);
  const seam = Math.floor(height * .6);
  return [
    tone(average(0, half, seam, height), .18, .58, 1.35),
    tone(average(half, width, seam, height), .18, .58, 1.35),
    tone(average(0, width, 0, height), .08, .26, 1.05),
    tone(average(0, width, 0, Math.floor(height * .4)), .22, .60, 1.55),
  ];
}

function tone([r, g, b], minimum, maximum, multiplier) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (delta) {
    s = delta / (1 - Math.abs(2 * l - 1));
    h = max === r ? ((g - b) / delta + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / delta + 2) / 6 : ((r - g) / delta + 4) / 6;
  }
  s = Math.min(.90, s * multiplier);
  const light = Math.max(minimum, Math.min(maximum, l));
  const a = s * Math.min(light, 1 - light);
  return [0, 8, 4].map(n => { const k = (n + h * 12) % 12; return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); });
}

const paletteCache = new Map();
export function readArtworkTones(url) {
  if (!url) return Promise.resolve(START_TONES);
  if (paletteCache.has(url)) return Promise.resolve(paletteCache.get(url));
  return new Promise(resolve => {
    const image = new Image(); image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0, 32, 32);
        const tones = ambientTones(context.getImageData(0, 0, 32, 32).data, 32, 32);
        if (paletteCache.size >= 48) paletteCache.delete(paletteCache.keys().next().value);
        paletteCache.set(url, tones); resolve(tones);
      } catch { resolve(START_TONES); }
    };
    image.onerror = () => resolve(START_TONES);
    image.src = url;
  });
}
