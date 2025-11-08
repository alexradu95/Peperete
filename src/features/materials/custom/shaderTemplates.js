/**
 * Shader Template Library
 * Pre-built shader examples that users can use as starting points for custom shaders
 */

export const SHADER_TEMPLATES = {
  BLANK: {
    name: 'Blank Template',
    description: 'Empty starter template with basic structure',
    vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragmentShader: `
uniform float time;
varying vec2 vUv;

void main() {
  // Your custom shader code here
  gl_FragColor = vec4(vUv.x, vUv.y, 0.5, 1.0);
}
    `.trim(),
    uniforms: { time: 0 }
  },

  ANIMATED_GRADIENT: {
    name: 'Animated Gradient',
    description: 'Flowing gradient animation using sine waves',
    vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragmentShader: `
uniform float time;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // Animated gradient
  float r = 0.5 + 0.5 * sin(time + uv.x * 3.14159);
  float g = 0.5 + 0.5 * sin(time + uv.y * 3.14159 + 2.0);
  float b = 0.5 + 0.5 * sin(time + (uv.x + uv.y) * 3.14159 + 4.0);

  gl_FragColor = vec4(r, g, b, 1.0);
}
    `.trim(),
    uniforms: { time: 0 }
  },

  PLASMA: {
    name: 'Plasma Effect',
    description: 'Classic plasma effect with flowing colors',
    vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragmentShader: `
uniform float time;
varying vec2 vUv;

void main() {
  vec2 uv = vUv * 10.0;

  float v1 = sin(uv.x + time);
  float v2 = sin(uv.y + time);
  float v3 = sin(uv.x + uv.y + time);
  float v4 = sin(sqrt(uv.x * uv.x + uv.y * uv.y) + time);

  float plasma = v1 + v2 + v3 + v4;

  vec3 color1 = vec3(1.0, 0.0, 0.5);
  vec3 color2 = vec3(0.0, 1.0, 0.5);
  vec3 color3 = vec3(0.5, 0.0, 1.0);

  vec3 finalColor = mix(color1, color2, sin(plasma * 0.5) * 0.5 + 0.5);
  finalColor = mix(finalColor, color3, cos(plasma * 0.3) * 0.5 + 0.5);

  gl_FragColor = vec4(finalColor, 1.0);
}
    `.trim(),
    uniforms: { time: 0 }
  },

  WAVES: {
    name: 'Wave Pattern',
    description: 'Animated wave interference pattern',
    vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragmentShader: `
uniform float time;
varying vec2 vUv;

void main() {
  vec2 uv = vUv * 8.0;

  float wave1 = sin(uv.x + time * 2.0);
  float wave2 = sin(uv.y + time * 2.0);
  float combined = (wave1 + wave2) * 0.5;

  vec3 color = vec3(0.0, 0.5 + combined * 0.5, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: { time: 0 }
  },

  RAINBOW: {
    name: 'Rainbow Spectrum',
    description: 'Animated rainbow color spectrum',
    vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragmentShader: `
uniform float time;
varying vec2 vUv;

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float hue = vUv.x + time * 0.1;
  vec3 color = hsv2rgb(vec3(hue, 1.0, 1.0));

  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: { time: 0 }
  },

  KALEIDOSCOPE: {
    name: 'Kaleidoscope',
    description: 'Symmetric kaleidoscope pattern',
    vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragmentShader: `
uniform float time;
varying vec2 vUv;

void main() {
  vec2 uv = vUv - 0.5;
  float angle = atan(uv.y, uv.x);
  float radius = length(uv);

  // Create kaleidoscope effect with 6 segments
  float segments = 6.0;
  angle = mod(angle, 3.14159 * 2.0 / segments);

  vec2 kaleido = vec2(cos(angle), sin(angle)) * radius;

  float pattern = sin(kaleido.x * 10.0 + time) * cos(kaleido.y * 10.0 + time);

  vec3 color = vec3(
    0.5 + 0.5 * sin(pattern + time),
    0.5 + 0.5 * sin(pattern + time + 2.0),
    0.5 + 0.5 * sin(pattern + time + 4.0)
  );

  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: { time: 0 }
  },

  FIRE: {
    name: 'Fire Effect',
    description: 'Animated fire-like effect',
    vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragmentShader: `
uniform float time;
varying vec2 vUv;

// Simple noise function
float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;

  // Create fire effect
  float n = noise(uv * 5.0 + time);
  n += noise(uv * 10.0 + time * 2.0) * 0.5;

  // Fire gradient (red to yellow to black)
  float heat = n * (1.0 - uv.y);

  vec3 color;
  if (heat > 0.7) {
    color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 1.0), (heat - 0.7) / 0.3);
  } else if (heat > 0.4) {
    color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.0), (heat - 0.4) / 0.3);
  } else if (heat > 0.2) {
    color = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 0.5, 0.0), (heat - 0.2) / 0.2);
  } else {
    color = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 0.0), heat / 0.2);
  }

  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: { time: 0 }
  },

  CHECKERBOARD_ANIMATED: {
    name: 'Animated Checkerboard',
    description: 'Color-shifting checkerboard pattern',
    vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragmentShader: `
uniform float time;
varying vec2 vUv;

void main() {
  vec2 uv = vUv * 8.0;
  float checker = mod(floor(uv.x) + floor(uv.y), 2.0);

  vec3 color1 = vec3(
    0.5 + 0.5 * sin(time),
    0.5 + 0.5 * sin(time + 2.0),
    0.5 + 0.5 * sin(time + 4.0)
  );

  vec3 color2 = vec3(
    0.5 + 0.5 * cos(time),
    0.5 + 0.5 * cos(time + 2.0),
    0.5 + 0.5 * cos(time + 4.0)
  );

  vec3 finalColor = mix(color1, color2, checker);

  gl_FragColor = vec4(finalColor, 1.0);
}
    `.trim(),
    uniforms: { time: 0 }
  }
};

/**
 * Get a template by key
 */
export function getTemplate(key) {
  return SHADER_TEMPLATES[key] || SHADER_TEMPLATES.BLANK;
}

/**
 * Get all template keys and names for UI dropdown
 */
export function getAllTemplates() {
  return Object.keys(SHADER_TEMPLATES).map(key => ({
    key,
    name: SHADER_TEMPLATES[key].name,
    description: SHADER_TEMPLATES[key].description
  }));
}
