// WebGL Apple Music-grade Aurora Atmosphere Renderer.
// Fluid undulating aurora ribbons modulated by album accent tones & bass beat energy.
const VERTEX = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
// Soft, slowly folding album-color fields. Beat energy only comes from analysed audio.
const FRAGMENT = `
precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform float energy;
uniform vec3 seamLeft, seamRight, deep, accent;
float field(vec2 p, vec2 center, vec2 spread) {
  vec2 d = (p - center) / spread;
  return exp(-dot(d,d) * 2.0);
}
vec3 colorDepth(vec3 color) {
  float luma = dot(color, vec3(.2126,.7152,.0722));
  return max(vec3(0.), mix(vec3(luma), color, 1.15));
}
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float t = time * .095;
  // Low-frequency deformation keeps the pools broad, with no visible ribbon edges.
  vec2 p = uv + vec2(
    sin(uv.y * 3.1 + t * .8) * .11,
    cos(uv.x * 2.8 - t * .7) * .10);
  vec2 a = vec2(.18 + .30 * sin(t * .8), .36 + .28 * cos(t * .65));
  vec2 b = vec2(.80 + .24 * cos(t * .7 + 1.4), .58 + .30 * sin(t * .6));
  vec2 c = vec2(.48 + .35 * sin(t * .55 + 2.6), .18 + .40 * cos(t * .75 + 1.));
  float swell = 1. + energy * .13;
  float left = field(p, a, vec2(.66,.76) * swell);
  float right = field(p, b, vec2(.72,.65) * swell);
  float glow = field(p, c, vec2(.62,.70) * swell);
  vec3 col = deep * .28;
  col += colorDepth(seamLeft) * left * .65;
  col += colorDepth(seamRight) * right * .58;
  col += colorDepth(accent) * glow * (.52 + energy * .15);
  // Wide, feathered aurora fold: its crest moves through the album colors.
  float fold = .48 + .20 * sin(p.x * 2.7 + t * .85)
    + .09 * sin(p.x * 5.0 - t * .60);
  float distanceToFold = abs(p.y - fold);
  float curtain = exp(-pow(distanceToFold / (.20 + energy * .04), 2.0));
  float crest = exp(-pow(distanceToFold / (.075 + energy * .025), 2.0));
  vec3 foldColor = mix(colorDepth(seamLeft), colorDepth(accent), .5 + .5 * sin(p.x * 2. + t * .6));
  col += foldColor * curtain * .22;
  // A bass transient illuminates the fold locally, then gently falls away.
  col += foldColor * crest * energy * .32;
  float vignette = 1. - smoothstep(.25,.9,length((uv-.5)*vec2(1.,.8))) * .30;
  gl_FragColor = vec4(col * vignette * .84, 1.);
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
