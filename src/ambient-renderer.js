// WebGL Apple Music-grade Aurora Atmosphere Renderer.
// Fluid undulating aurora ribbons modulated by album accent tones & bass beat energy.
const VERTEX = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const FRAGMENT = `
precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform float energy;
uniform vec3 seamLeft, seamRight, deep, accent;
const float TAU = 6.2831853;

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;
  float aspect = resolution.x / max(resolution.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);

  float t = time * 0.16;
  // Bass impact swells the aurora width and intensity
  float bassPunch = energy * 0.50;

  // Layered sinusoidal domain warping creating organic aurora waves
  float wave1 = sin(p.x * 2.4 + t * 1.3 + sin(p.y * 3.2 + t * 0.9)) * 0.26;
  float wave2 = cos(p.y * 2.0 - t * 0.8 + cos(p.x * 2.8 - t * 1.1)) * 0.22;
  float wave3 = sin((p.x * 1.8 + p.y * 1.4) + t * 0.7) * 0.18;

  vec2 warped = p + vec2(wave1 + wave2, wave2 + wave3);

  // Aurora Ribbon A (Seam Left / Primary accent flowing diagonally)
  float ribbonA = smoothstep(0.68, 0.05, abs(warped.y - (0.48 + wave1 * 0.35 + bassPunch * 0.06)));
  // Aurora Ribbon B (Seam Right / Secondary accent crossing gracefully)
  float ribbonB = smoothstep(0.72, 0.05, abs(warped.x / aspect - (0.52 + wave2 * 0.32 - bassPunch * 0.05)));
  // Aurora Ribbon C (Luminous top accent wave)
  float ribbonC = smoothstep(0.58, 0.02, abs((warped.x * 0.6 + warped.y * 0.8) - (0.75 + wave3 * 0.28)));

  // Radial center bloom that expands dynamically with bass drop
  vec2 bloomCenter = vec2(0.5 * aspect, 0.55) + vec2(sin(t * 0.7) * 0.18, cos(t * 0.5) * 0.14);
  float distToCenter = length(p - bloomCenter);
  float bloom = exp(-distToCenter * (1.85 - energy * 0.42));

  // Base background is deep album tone
  vec3 col = deep;

  // Blend in the album accent colors across the aurora ribbons
  col = mix(col, seamLeft, clamp(ribbonA * 0.82 + bloom * 0.25, 0.0, 1.0));
  col = mix(col, seamRight, clamp(ribbonB * 0.78, 0.0, 1.0));
  // Accent color illuminates the intersecting crests of the aurora ribbons
  float crest = ribbonA * ribbonB + ribbonC * 0.6 + bloom * 0.5;
  col = mix(col, accent, clamp(crest * (0.95 + bassPunch * 0.6), 0.0, 1.0));

  // Bass beat creates radiant luminescence on the aurora waves
  col *= 1.0 + energy * 0.40;

  // Soft subtle corner vignette to maintain contrast for lyrics
  float vignette = smoothstep(1.35, 0.40, length((uv - vec2(0.5, 0.5)) * vec2(aspect, 1.0)));
  col = mix(deep * 0.65, col, vignette);

  gl_FragColor = vec4(col, 1.0);
}`;

export function createAmbientRenderer(canvas) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shaders = [];
  function compile(type, source) {
    const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('Ambient shader unavailable'); }
    shaders.push(shader); return shader;
  }
  let program;
  try {
    program = gl.createProgram(); gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX)); gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT)); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Ambient shader unavailable');
  } catch { shaders.forEach(shader => gl.deleteShader(shader)); if (program) gl.deleteProgram(program); return null; }
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = Object.fromEntries(['resolution','time','energy','seamLeft','seamRight','deep','accent'].map(name => [name, gl.getUniformLocation(program, name)]));
  return {
    draw(time, tones, energy) {
      gl.viewport(0, 0, canvas.width, canvas.height); gl.useProgram(program);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height); gl.uniform1f(uniforms.time, time); gl.uniform1f(uniforms.energy, energy);
      ['seamLeft','seamRight','deep','accent'].forEach((name, i) => gl.uniform3fv(uniforms[name], tones[i]));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    dispose() { gl.deleteBuffer(buffer); shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program); },
  };
}
