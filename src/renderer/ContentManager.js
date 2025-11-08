import * as THREE from 'three';

/**
 * ContentManager - Creates materials for surfaces
 */
export class ContentManager {
  constructor() {
    // No longer needs projectionQuad - we create materials for individual surfaces
  }

  /**
   * Create checkerboard material
   */
  createCheckerboardMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Draw checkerboard
    const squareSize = 64;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#000000';
        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    });
  }

  /**
   * Create grid with numbers material
   */
  createGridMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;

    const gridSize = 8;
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;

    // Draw grid
    for (let i = 0; i <= gridSize; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, canvas.height);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(canvas.width, i * cellHeight);
      ctx.stroke();
    }

    // Add numbers
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let num = 1;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cx = x * cellWidth + cellWidth / 2;
        const cy = y * cellHeight + cellHeight / 2;
        ctx.fillText(num.toString(), cx, cy);
        num++;
      }
    }

    // Add corner markers
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 60px monospace';
    ctx.fillText('TL', 80, 80);
    ctx.fillText('TR', canvas.width - 80, 80);
    ctx.fillText('BL', 80, canvas.height - 80);
    ctx.fillText('BR', canvas.width - 80, canvas.height - 80);

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    });
  }

  /**
   * Create animated gradient shader material
   */
  createAnimatedGradientMaterial() {
    return new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
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
      `,
      side: THREE.DoubleSide
    });
  }

  /**
   * Create rotating colors shader material
   */
  createRotatingColorsMaterial() {
    return new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
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
      `,
      side: THREE.DoubleSide
    });
  }

  /**
   * Create solid color material
   */
  createSolidColorMaterial(color = 0xffffff) {
    return new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    });
  }

  /**
   * Load image from URL and call callback with material
   */
  loadImageMaterial(url, callback) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      url,
      (texture) => {
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          depthTest: false,
          depthWrite: false
        });
        callback(material);
        console.log('Loaded image:', url);
      },
      undefined,
      (error) => {
        console.error('Failed to load image:', error);
      }
    );
  }
}
