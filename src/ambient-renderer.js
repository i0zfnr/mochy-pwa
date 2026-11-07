// WebGL adaptation of Mochy's AmbientBackdrop.kt / AmbientShaderSource.
// Four weighted color pools, 100-second loop, quarter-resolution rendering.
const VERTEX = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const FRAGMENT = `
precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform float energy;
uniform vec3 seamLeft, seamRight, deep, accent;
const float TAU=6.2831853;
float pool(vec2 p,vec2 centre,float spread){vec2 d=p-centre;return exp(-dot(d,d)*spread);}
void main(){
  vec2 coord=vec2(gl_FragCoord.x,resolution.y-gl_FragCoord.y);
  vec2 uv=coord/resolution;
  float aspect=resolution.y/max(resolution.x,1.);
  vec2 p=vec2(uv.x,uv.y*aspect);
  float w=TAU/50.,t=time;
  vec2 a=vec2(.22+.16*sin(t*w+.4),(.58+.07*cos(t*w*2.))*aspect);
  vec2 b=vec2(.80+.14*cos(t*w+1.3),(.62+.08*sin(t*w*2.+.7))*aspect);
  vec2 c=vec2(.48+.24*cos(t*w*3.+2.1),(.92+.06*sin(t*w+1.9))*aspect);
  vec2 d=vec2(.62+.22*sin(t*w*2.+3.4),(.78+.10*cos(t*w*3.+.4))*aspect);
  // A bass hit expands the existing color field, rather than adding a flash.
  float swell=1.-energy*.13;
  float wa=pool(p,a,3.2*swell),wb=pool(p,b,3.2*swell);
  float wc=pool(p,c,2.4),wd=pool(p,d,4.*swell)*(.8+energy*.24);
  vec3 col=(seamLeft*wa+seamRight*wb+deep*wc+accent*wd)/(wa+wb+wc+wd+.0001);
  col*=1.-.16*smoothstep(.6,1.,uv.y);
  col*=1.+energy*.20;
  gl_FragColor=vec4(col,1.);
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
