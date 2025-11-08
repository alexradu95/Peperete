// Shader template library - Pre-built shaders that users can use as starting points

export const SHADER_TEMPLATES = {
  ANIMATED_GRADIENT: {
    name: 'Animated Gradient',
    description: 'Flowing gradient effect using sine waves',
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
  float r = sin(vUv.x * 3.0 + time) * 0.5 + 0.5;
  float g = sin(vUv.y * 3.0 + time * 1.5) * 0.5 + 0.5;
  float b = sin((vUv.x + vUv.y) * 2.0 + time * 2.0) * 0.5 + 0.5;

  gl_FragColor = vec4(r, g, b, 1.0);
}
    `.trim(),
    uniforms: {
      time: { value: 0.0 }
    }
  },

  ROTATING_COLORS: {
    name: 'Rotating Colors',
    description: 'HSV color wheel with rotation animation',
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

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 center = vUv - vec2(0.5);
  float angle = atan(center.y, center.x);
  float radius = length(center);

  float hue = (angle / (2.0 * 3.14159265359) + 0.5 + time * 0.1);
  hue = fract(hue);

  vec3 color = hsv2rgb(vec3(hue, 1.0, 1.0));

  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: {
      time: { value: 0.0 }
    }
  },

  WAVE_PATTERN: {
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
  vec2 p = vUv * 10.0;

  float wave1 = sin(p.x + time);
  float wave2 = sin(p.y + time * 1.3);
  float wave3 = sin((p.x + p.y) * 0.5 + time * 0.7);

  float pattern = (wave1 + wave2 + wave3) / 3.0;
  pattern = pattern * 0.5 + 0.5;

  vec3 color = vec3(pattern);

  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: {
      time: { value: 0.0 }
    }
  },

  PLASMA: {
    name: 'Plasma',
    description: 'Classic plasma effect with multiple sine waves',
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
  vec2 p = vUv * 8.0;

  float v = 0.0;
  v += sin(p.x + time);
  v += sin(p.y + time);
  v += sin(p.x + p.y + time);
  v += sin(sqrt(p.x * p.x + p.y * p.y) + time);
  v *= 0.25;

  vec3 color = vec3(
    sin(v * 3.14159),
    sin(v * 3.14159 + 2.094),
    sin(v * 3.14159 + 4.189)
  );

  gl_FragColor = vec4(color * 0.5 + 0.5, 1.0);
}
    `.trim(),
    uniforms: {
      time: { value: 0.0 }
    }
  },

  CHECKERBOARD_ANIM: {
    name: 'Animated Checkerboard',
    description: 'Checkerboard pattern with color animation',
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
  float scale = 8.0;
  vec2 pos = floor(vUv * scale);
  float pattern = mod(pos.x + pos.y, 2.0);

  vec3 color1 = vec3(
    sin(time) * 0.5 + 0.5,
    cos(time * 1.3) * 0.5 + 0.5,
    sin(time * 0.7) * 0.5 + 0.5
  );
  vec3 color2 = vec3(1.0 - color1.r, 1.0 - color1.g, 1.0 - color1.b);

  vec3 finalColor = mix(color1, color2, pattern);

  gl_FragColor = vec4(finalColor, 1.0);
}
    `.trim(),
    uniforms: {
      time: { value: 0.0 }
    }
  },

  RADIAL_GRADIENT: {
    name: 'Radial Gradient',
    description: 'Pulsating radial gradient from center',
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
  vec2 center = vUv - vec2(0.5);
  float dist = length(center);

  float pulse = sin(dist * 10.0 - time * 2.0) * 0.5 + 0.5;

  vec3 color = vec3(
    pulse,
    sin(pulse * 3.14159 + time) * 0.5 + 0.5,
    cos(pulse * 3.14159 + time) * 0.5 + 0.5
  );

  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: {
      time: { value: 0.0 }
    }
  },

  BLANK: {
    name: 'Blank Template',
    description: 'Empty shader template to start from scratch',
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
  // Write your shader code here
  vec3 color = vec3(vUv.x, vUv.y, 0.5);

  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: {
      time: { value: 0.0 }
    }
  }
};

// Get list of template names
export const getTemplateNames = () => Object.keys(SHADER_TEMPLATES);

// Get template by name
export const getTemplate = (name) => SHADER_TEMPLATES[name] || SHADER_TEMPLATES.BLANK;
