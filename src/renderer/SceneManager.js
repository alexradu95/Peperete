import * as THREE from 'three';

/**
 * SceneManager - Handles Three.js scene, camera, renderer setup
 */
export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.projectionQuad = null;
  }

  /**
   * Initialize the Three.js scene
   */
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Create orthographic camera for 2D projection
    this.createCamera();

    // Create WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Enable render order sorting for proper layering
    this.renderer.sortObjects = true;

    this.container.appendChild(this.renderer.domElement);

    // Create the projection quad
    this.createProjectionQuad();

    // Handle window resize
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Create orthographic camera for 2D projection
   */
  createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      -aspect, aspect,  // left, right
      1, -1,            // top, bottom
      0.1, 10           // near, far
    );
    this.camera.position.z = 1;
  }

  /**
   * Create the projection quad geometry
   * Subdivided for proper perspective transformation
   */
  createProjectionQuad() {
    const geometry = new THREE.PlaneGeometry(2, 2, 20, 20);

    // Basic white material for testing
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });

    this.projectionQuad = new THREE.Mesh(geometry, material);
    this.scene.add(this.projectionQuad);
  }

  /**
   * Handle window resize
   */
  resize() {
    const aspect = window.innerWidth / window.innerHeight;

    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.top = 1;
    this.camera.bottom = -1;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Render the scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get the projection quad mesh
   */
  getProjectionQuad() {
    return this.projectionQuad;
  }

  /**
   * Get the scene
   */
  getScene() {
    return this.scene;
  }

  /**
   * Get the camera
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Get the renderer
   */
  getRenderer() {
    return this.renderer;
  }
}
