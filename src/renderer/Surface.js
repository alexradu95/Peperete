import * as THREE from 'three';
import { TransformCalculator } from '../calibration/TransformCalculator.js';

/**
 * Surface - Represents a single projection surface with its own geometry and calibration
 */
export class Surface {
  constructor(id, name, scene) {
    this.id = id;
    this.name = name;
    this.scene = scene;
    this.mesh = null;
    this.isVisible = true;
    this.isSelected = false;
    this.priority = 0; // Z-axis rendering priority (higher = render on top)

    // Calibration data
    this.corners = TransformCalculator.getDefaultCorners();

    // Create the projection quad
    this.createMesh();
  }

  /**
   * Create the projection quad mesh
   */
  createMesh() {
    const geometry = new THREE.PlaneGeometry(2, 2, 20, 20);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      depthTest: false, // Disable depth testing for proper render order
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.renderOrder = this.priority;
    this.scene.add(this.mesh);
  }

  /**
   * Update the corner positions and apply transformation
   */
  updateCorners(corners) {
    this.corners = { ...corners };
    this.applyTransformation();
  }

  /**
   * Apply perspective transformation to this surface
   */
  applyTransformation() {
    TransformCalculator.applyTransformToGeometry(this.mesh.geometry, this.corners);
  }

  /**
   * Set the material/content for this surface
   */
  setMaterial(material) {
    // Ensure depth testing is disabled for proper layering (defensive check)
    if (material.depthTest !== false) {
      console.warn(`Material for surface ${this.id} missing depthTest setting, fixing...`);
      material.depthTest = false;
      material.depthWrite = false;
    }
    this.mesh.material = material;
    console.log(`Surface ${this.id} material updated, renderOrder: ${this.mesh.renderOrder}`);
  }

  /**
   * Set visibility of this surface
   */
  setVisible(visible) {
    this.isVisible = visible;
    this.mesh.visible = visible;
  }

  /**
   * Toggle visibility
   */
  toggleVisibility() {
    this.setVisible(!this.isVisible);
  }

  /**
   * Set selected state (visual highlight)
   */
  setSelected(selected) {
    this.isSelected = selected;
    // Update render order when selection changes
    this.updateRenderOrder();
  }

  /**
   * Set rendering priority (z-axis order)
   */
  setPriority(priority) {
    this.priority = priority;
    this.updateRenderOrder();
    console.log(`Surface ${this.id} (${this.name}) priority set to ${priority}, renderOrder: ${this.mesh.renderOrder}`);
  }

  /**
   * Increase priority (move forward)
   */
  increasePriority() {
    this.setPriority(this.priority + 1);
  }

  /**
   * Decrease priority (move backward)
   */
  decreasePriority() {
    this.setPriority(this.priority - 1);
  }

  /**
   * Update the Three.js renderOrder based on priority and selection
   */
  updateRenderOrder() {
    // Base render order from priority
    // Selected surfaces get +1000 to ensure they're slightly highlighted
    const newOrder = this.priority + (this.isSelected ? 1000 : 0);
    this.mesh.renderOrder = newOrder;
    console.log(`Surface ${this.id} renderOrder updated to ${newOrder} (priority: ${this.priority})`);
  }

  /**
   * Get calibration data for this surface
   */
  getCalibrationData() {
    return {
      id: this.id,
      name: this.name,
      corners: { ...this.corners },
      isVisible: this.isVisible,
      priority: this.priority
    };
  }

  /**
   * Load calibration data
   */
  loadCalibrationData(data) {
    if (data.name) this.name = data.name;
    if (data.corners) {
      this.corners = { ...data.corners };
      this.applyTransformation();
    }
    if (data.isVisible !== undefined) {
      this.setVisible(data.isVisible);
    }
    if (data.priority !== undefined) {
      this.setPriority(data.priority);
    }
  }

  /**
   * Dispose of this surface
   */
  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.scene.remove(this.mesh);
    }
  }
}
