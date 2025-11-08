import { Surface } from './Surface.js';

/**
 * SurfaceManager - Manages multiple projection surfaces
 */
export class SurfaceManager {
  constructor(scene) {
    this.scene = scene;
    this.surfaces = new Map();
    this.surfaceOrder = []; // Ordered array of surface IDs for render priority
    this.selectedSurfaceId = null;
    this.nextId = 1;
  }

  /**
   * Add a new surface
   */
  addSurface(name = null) {
    const id = this.nextId++;
    const surfaceName = name || `Surface ${id}`;

    const surface = new Surface(id, surfaceName, this.scene);
    this.surfaces.set(id, surface);
    this.surfaceOrder.push(id); // Add to end of order list
    this.updateRenderPriorities();

    // Auto-select if it's the first surface
    if (this.surfaces.size === 1) {
      this.selectSurface(id);
    }

    console.log(`Added surface: ${surfaceName} (ID: ${id})`);
    return surface;
  }

  /**
   * Remove a surface
   */
  removeSurface(id) {
    const surface = this.surfaces.get(id);
    if (!surface) return false;

    surface.dispose();
    this.surfaces.delete(id);

    // Remove from order list
    const index = this.surfaceOrder.indexOf(id);
    if (index > -1) {
      this.surfaceOrder.splice(index, 1);
    }
    this.updateRenderPriorities();

    // If removed surface was selected, select another one
    if (this.selectedSurfaceId === id) {
      this.selectedSurfaceId = this.surfaceOrder.length > 0 ? this.surfaceOrder[0] : null;

      if (this.selectedSurfaceId) {
        this.surfaces.get(this.selectedSurfaceId).setSelected(true);
      }
    }

    console.log(`Removed surface ID: ${id}`);
    return true;
  }

  /**
   * Select a surface for calibration
   */
  selectSurface(id) {
    // Deselect previous surface
    if (this.selectedSurfaceId !== null) {
      const prevSurface = this.surfaces.get(this.selectedSurfaceId);
      if (prevSurface) {
        prevSurface.setSelected(false);
      }
    }

    // Select new surface
    this.selectedSurfaceId = id;
    const surface = this.surfaces.get(id);
    if (surface) {
      surface.setSelected(true);
      console.log(`Selected surface: ${surface.name} (ID: ${id})`);
      return surface;
    }

    return null;
  }

  /**
   * Get the currently selected surface
   */
  getSelectedSurface() {
    return this.selectedSurfaceId !== null
      ? this.surfaces.get(this.selectedSurfaceId)
      : null;
  }

  /**
   * Get surface by ID
   */
  getSurface(id) {
    return this.surfaces.get(id);
  }

  /**
   * Get all surfaces in render order
   */
  getAllSurfaces() {
    return this.surfaceOrder.map(id => this.surfaces.get(id)).filter(s => s);
  }

  /**
   * Get all surface IDs
   */
  getSurfaceIds() {
    return Array.from(this.surfaces.keys());
  }

  /**
   * Toggle surface visibility
   */
  toggleSurfaceVisibility(id) {
    const surface = this.surfaces.get(id);
    if (surface) {
      surface.toggleVisibility();
      return surface.isVisible;
    }
    return false;
  }

  /**
   * Set content for a specific surface
   */
  setSurfaceContent(id, material) {
    const surface = this.surfaces.get(id);
    if (surface) {
      surface.setMaterial(material);
      return true;
    }
    return false;
  }

  /**
   * Update corners for a surface
   */
  updateSurfaceCorners(id, corners) {
    const surface = this.surfaces.get(id);
    if (surface) {
      surface.updateCorners(corners);
      return true;
    }
    return false;
  }

  /**
   * Rename a surface
   */
  renameSurface(id, newName) {
    const surface = this.surfaces.get(id);
    if (surface) {
      surface.name = newName;
      console.log(`Renamed surface ${id} to: ${newName}`);
      return true;
    }
    return false;
  }

  /**
   * Reorder surfaces (for drag and drop)
   */
  reorderSurfaces(newOrder) {
    this.surfaceOrder = newOrder;
    this.updateRenderPriorities();
    console.log('Surfaces reordered:', this.surfaceOrder);
  }

  /**
   * Move surface up in the list (increase priority)
   */
  moveSurfaceUp(id) {
    const index = this.surfaceOrder.indexOf(id);
    if (index > 0) {
      // Swap with previous
      [this.surfaceOrder[index - 1], this.surfaceOrder[index]] =
      [this.surfaceOrder[index], this.surfaceOrder[index - 1]];
      this.updateRenderPriorities();
      return true;
    }
    return false;
  }

  /**
   * Move surface down in the list (decrease priority)
   */
  moveSurfaceDown(id) {
    const index = this.surfaceOrder.indexOf(id);
    if (index >= 0 && index < this.surfaceOrder.length - 1) {
      // Swap with next
      [this.surfaceOrder[index], this.surfaceOrder[index + 1]] =
      [this.surfaceOrder[index + 1], this.surfaceOrder[index]];
      this.updateRenderPriorities();
      return true;
    }
    return false;
  }

  /**
   * Update render priorities based on order in list
   * Surfaces earlier in list have lower priority (render first/behind)
   * Surfaces later in list have higher priority (render last/on top)
   */
  updateRenderPriorities() {
    this.surfaceOrder.forEach((id, index) => {
      const surface = this.surfaces.get(id);
      if (surface) {
        surface.setPriority(index);
      }
    });
  }

  /**
   * Get all calibration data
   */
  getAllCalibrationData() {
    const data = {};
    this.surfaces.forEach((surface, id) => {
      data[id] = surface.getCalibrationData();
    });
    return {
      surfaces: data,
      surfaceOrder: this.surfaceOrder,
      selectedSurfaceId: this.selectedSurfaceId,
      nextId: this.nextId
    };
  }

  /**
   * Load all calibration data
   */
  loadAllCalibrationData(data) {
    if (!data || !data.surfaces) return;

    // Clear existing surfaces
    this.surfaces.forEach(surface => surface.dispose());
    this.surfaces.clear();
    this.surfaceOrder = [];

    // Load surfaces
    Object.entries(data.surfaces).forEach(([id, surfaceData]) => {
      const numId = parseInt(id);
      const surface = new Surface(numId, surfaceData.name, this.scene);
      surface.loadCalibrationData(surfaceData);
      this.surfaces.set(numId, surface);
    });

    // Restore order
    if (data.surfaceOrder && Array.isArray(data.surfaceOrder)) {
      this.surfaceOrder = data.surfaceOrder;
    } else {
      // Fallback: use surface IDs in order
      this.surfaceOrder = Array.from(this.surfaces.keys());
    }

    // Update priorities based on order
    this.updateRenderPriorities();

    // Restore state
    if (data.nextId) {
      this.nextId = data.nextId;
    }

    if (data.selectedSurfaceId) {
      this.selectSurface(data.selectedSurfaceId);
    }

    console.log(`Loaded ${this.surfaces.size} surfaces`);
  }

  /**
   * Clear all surfaces
   */
  clearAll() {
    this.surfaces.forEach(surface => surface.dispose());
    this.surfaces.clear();
    this.surfaceOrder = [];
    this.selectedSurfaceId = null;
    this.nextId = 1;
    console.log('Cleared all surfaces');
  }
}
