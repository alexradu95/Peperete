/**
 * Unified Shader Definitions
 * Single source of truth for all shader code used throughout the application
 * Used by both Material components and shader editor templates
 */

/**
 * Common vertex shader used by most effects
 */
const STANDARD_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Shader definitions containing uniforms, vertex shader, and fragment shader
 * Each definition is used both for rendering (in Material components) and as templates (in shader editor)
 */
export const SHADER_DEFINITIONS = {
  BLANK: {
    name: 'Blank Template',
    description: 'Empty starter template with basic structure',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      void main() {
        // Your custom shader code here
        gl_FragColor = vec4(vUv.x, vUv.y, 0.5, 1.0);
      }
    `.trim()
  },

  ANIMATED_GRADIENT: {
    name: 'Animated Gradient',
    description: 'Flowing gradient animation using sine waves',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
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
    `.trim()
  },

  PLASMA: {
    name: 'Plasma Effect',
    description: 'Classic plasma effect with flowing colors',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
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
    `.trim()
  },

  WAVES: {
    name: 'Wave Pattern',
    description: 'Animated wave interference pattern with radial ripples',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv - 0.5;

        float dist = length(uv);
        float wave1 = sin(dist * 20.0 - time * 3.0) * 0.5 + 0.5;
        float wave2 = sin(dist * 15.0 - time * 2.0 + 1.5) * 0.5 + 0.5;
        float wave3 = sin(dist * 25.0 - time * 4.0 + 3.0) * 0.5 + 0.5;

        float waves = (wave1 + wave2 + wave3) / 3.0;

        vec3 color1 = vec3(0.1, 0.3, 0.8);
        vec3 color2 = vec3(0.3, 0.8, 1.0);
        vec3 color3 = vec3(0.0, 0.5, 0.9);

        vec3 finalColor = mix(color1, color2, waves);
        finalColor = mix(finalColor, color3, sin(time + dist * 10.0) * 0.5 + 0.5);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `.trim()
  },

  RAINBOW: {
    name: 'Rainbow Spectrum',
    description: 'Animated rainbow color spectrum with wave motion',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 uv = vUv;

        // Diagonal rainbow flow
        float hue = fract(uv.x * 0.5 + uv.y * 0.5 + time * 0.1);

        // Add some wave motion
        hue += sin(uv.y * 10.0 + time) * 0.05;
        hue += cos(uv.x * 10.0 + time * 1.5) * 0.05;

        vec3 color = hsv2rgb(vec3(hue, 0.9, 1.0));

        gl_FragColor = vec4(color, 1.0);
      }
    `.trim()
  },

  KALEIDOSCOPE: {
    name: 'Kaleidoscope',
    description: 'Symmetric kaleidoscope pattern with polar coordinates',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      #define PI 3.14159265359

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 uv = vUv - 0.5;

        // Convert to polar coordinates
        float radius = length(uv);
        float angle = atan(uv.y, uv.x);

        // Number of kaleidoscope segments
        float segments = 8.0;

        // Create symmetry
        angle = mod(angle, 2.0 * PI / segments);
        angle = abs(angle - PI / segments);

        // Rotate over time
        angle += time * 0.5;

        // Create pattern
        float pattern = sin(radius * 20.0 + time) * 0.5 + 0.5;
        pattern *= sin(angle * 10.0) * 0.5 + 0.5;
        pattern += cos(radius * 15.0 - time * 2.0) * 0.3;

        // Create color based on angle and radius
        float hue = fract(angle / (2.0 * PI) + radius + time * 0.1);
        vec3 color = hsv2rgb(vec3(hue, 0.8, pattern));

        gl_FragColor = vec4(color, 1.0);
      }
    `.trim()
  },

  FIRE: {
    name: 'Fire Effect',
    description: 'Realistic fire/flame effect with fractal noise',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 6; i++) {
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = vUv;

        // Create flame shape - stronger at bottom
        vec2 fireUV = vec2(uv.x, 1.0 - uv.y);

        // Rising flames
        float n = fbm(vec2(fireUV.x * 3.0, fireUV.y * 2.0 - time * 2.0));
        n += fbm(vec2(fireUV.x * 5.0, fireUV.y * 3.0 - time * 3.0)) * 0.5;

        // Fire intensity - stronger at bottom
        float intensity = n * (1.0 - fireUV.y);
        intensity = pow(intensity, 1.5);

        // Fire colors: dark red -> orange -> yellow -> white
        vec3 color = vec3(0.0);

        if (intensity > 0.8) {
          color = vec3(1.0, 1.0, 0.9); // White-yellow (hottest)
        } else if (intensity > 0.5) {
          color = mix(vec3(1.0, 0.7, 0.0), vec3(1.0, 1.0, 0.9), (intensity - 0.5) / 0.3);
        } else if (intensity > 0.2) {
          color = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.7, 0.0), (intensity - 0.2) / 0.3);
        } else {
          color = mix(vec3(0.3, 0.0, 0.0), vec3(1.0, 0.2, 0.0), intensity / 0.2);
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `.trim()
  },

  ROTATING_COLORS: {
    name: 'Rotating Colors',
    description: 'Rotating color wheel effect using polar coordinates',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 uv = vUv;

        // Center point
        vec2 center = vec2(0.5, 0.5);
        vec2 pos = uv - center;

        // Polar coordinates
        float angle = atan(pos.y, pos.x);
        float radius = length(pos);

        // Rotating hue based on angle and time
        float hue = (angle / 6.28318) + time * 0.2;
        hue = fract(hue);

        vec3 color = hsv2rgb(vec3(hue, 0.8, 1.0));

        gl_FragColor = vec4(color, 1.0);
      }
    `.trim()
  },

  NOISE: {
    name: 'Noise Pattern',
    description: 'Animated noise patterns using fractal Brownian motion',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      // Simple pseudo-random function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      // 2D Noise
      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      // Fractal Brownian Motion
      float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;

        for (int i = 0; i < 5; i++) {
          value += amplitude * noise(st * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = vUv * 5.0;

        float n = fbm(uv + time * 0.3);

        vec3 color1 = vec3(0.2, 0.0, 0.4);
        vec3 color2 = vec3(0.8, 0.3, 0.9);
        vec3 color3 = vec3(0.1, 0.6, 0.8);

        vec3 finalColor = mix(color1, color2, n);
        finalColor = mix(finalColor, color3, fbm(uv * 2.0 - time * 0.2));

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `.trim()
  },

  SPIRAL: {
    name: 'Spiral Pattern',
    description: 'Hypnotic spiral pattern with dual rotation',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      #define PI 3.14159265359

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 uv = vUv - 0.5;

        // Polar coordinates
        float radius = length(uv);
        float angle = atan(uv.y, uv.x);

        // Create spiral
        float spiral = radius * 10.0 - angle * 3.0 - time * 2.0;
        float pattern = sin(spiral) * 0.5 + 0.5;

        // Add secondary spiral
        float spiral2 = radius * 15.0 + angle * 2.0 + time * 1.5;
        pattern += (sin(spiral2) * 0.5 + 0.5) * 0.5;

        // Create color based on pattern and radius
        float hue = fract(radius * 2.0 + time * 0.1);
        float saturation = 0.7 + pattern * 0.3;
        float value = pattern;

        vec3 color = hsv2rgb(vec3(hue, saturation, value));

        // Add some pulsing
        color *= 0.8 + 0.2 * sin(time * 2.0);

        gl_FragColor = vec4(color, 1.0);
      }
    `.trim()
  },

  GLITCH: {
    name: 'Glitch Effect',
    description: 'Digital glitch/corruption effect with RGB split',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = vUv;

        // Random glitch intervals
        float glitchStrength = step(0.95, random(vec2(floor(time * 4.0))));

        // Horizontal distortion
        float lineGlitch = step(0.98, random(vec2(floor(uv.y * 20.0), floor(time * 10.0))));
        uv.x += lineGlitch * glitchStrength * (random(vec2(time)) - 0.5) * 0.3;

        // Block displacement
        float blockY = floor(uv.y * 8.0) / 8.0;
        float blockGlitch = step(0.9, random(vec2(blockY, floor(time * 5.0))));
        uv.x += blockGlitch * glitchStrength * (random(vec2(time * 2.0)) - 0.5) * 0.2;

        // RGB split
        float splitAmount = glitchStrength * 0.03;
        vec2 uvR = uv + vec2(splitAmount, 0.0);
        vec2 uvG = uv;
        vec2 uvB = uv - vec2(splitAmount, 0.0);

        // Base pattern
        float patternR = step(0.5, fract(uvR.x * 10.0 + uvR.y * 10.0 + time));
        float patternG = step(0.5, fract(uvG.x * 10.0 + uvG.y * 10.0 + time * 1.1));
        float patternB = step(0.5, fract(uvB.x * 10.0 + uvB.y * 10.0 + time * 0.9));

        vec3 color = vec3(patternR, patternG, patternB);

        // Scan lines
        color *= 0.9 + 0.1 * sin(uv.y * 200.0 + time * 10.0);

        // Random flicker
        color *= 0.8 + 0.2 * random(vec2(floor(time * 30.0)));

        gl_FragColor = vec4(color, 1.0);
      }
    `.trim()
  },

  CHECKERBOARD_ANIMATED: {
    name: 'Animated Checkerboard',
    description: 'Color-shifting checkerboard pattern',
    uniforms: { time: 0 },
    vertexShader: STANDARD_VERTEX_SHADER.trim(),
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
    `.trim()
  }
};

/**
 * Get a shader definition by key
 */
export function getShaderDefinition(key) {
  return SHADER_DEFINITIONS[key] || SHADER_DEFINITIONS.BLANK;
}

/**
 * Get all shader definition keys and metadata for UI
 */
export function getAllShaderDefinitions() {
  return Object.keys(SHADER_DEFINITIONS).map(key => ({
    key,
    name: SHADER_DEFINITIONS[key].name,
    description: SHADER_DEFINITIONS[key].description
  }));
}
