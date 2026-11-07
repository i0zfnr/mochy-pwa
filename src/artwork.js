export function highResolutionArtwork(value = '', size = 1000) {
  if (!value || value.startsWith('data:') || value.startsWith('blob:')) return value;
  try {
    const url = new URL(value);
    if (/^(?:lh\d+|yt\d+)\.googleusercontent\.com$/.test(url.hostname)) {
      url.pathname = url.pathname.replace(/=w\d+-h\d+[^/]*$/, `=w${size}-h${size}-l90-rj`).replace(/=s\d+[^/]*$/, `=s${size}`);
    } else if (url.hostname.endsWith('.mzstatic.com')) {
      url.pathname = url.pathname.replace(/\/\d+x\d+[^/]*\.(jpg|png|webp)$/, `/${size}x${size}bb.$1`);
    } else if (url.hostname.endsWith('.dzcdn.net')) {
      url.pathname = url.pathname.replace(/\/\d+x\d+-[^/]*\.jpg$/, `/${size}x${size}-000000-80-0-0.jpg`);
    }
    return url.toString();
  } catch { return value; }
}
