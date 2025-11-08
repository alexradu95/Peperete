/**
 * CornerPoint - Represents a draggable corner point for calibration
 */
export class CornerPoint {
  constructor(id, label, initialX, initialY, onChange) {
    this.id = id;
    this.label = label;
    this.position = { x: initialX, y: initialY };
    this.isDragging = false;
    this.element = null;
    this.onChange = onChange;

    this.createUI();
    this.attachEventListeners();
  }

  /**
   * Create the HTML element for the corner point
   */
  createUI() {
    this.element = document.createElement('div');
    this.element.className = 'corner-point';
    this.element.id = `corner-${this.id}`;

    const handle = document.createElement('div');
    handle.className = 'handle';

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = this.label;

    this.element.appendChild(handle);
    this.element.appendChild(label);

    // Set initial position
    this.updatePosition();

    // Add to corner points container
    const container = document.getElementById('corner-points');
    container.appendChild(this.element);
  }

  /**
   * Attach mouse/touch event listeners
   */
  attachEventListeners() {
    // Mouse events
    this.element.addEventListener('mousedown', (e) => this.onDragStart(e));
    window.addEventListener('mousemove', (e) => this.onDrag(e));
    window.addEventListener('mouseup', (e) => this.onDragEnd(e));

    // Touch events
    this.element.addEventListener('touchstart', (e) => this.onDragStart(e));
    window.addEventListener('touchmove', (e) => this.onDrag(e));
    window.addEventListener('touchend', (e) => this.onDragEnd(e));
  }

  /**
   * Handle drag start
   */
  onDragStart(event) {
    event.preventDefault();
    this.isDragging = true;
    this.element.classList.add('dragging');
  }

  /**
   * Handle drag movement
   */
  onDrag(event) {
    if (!this.isDragging) return;

    event.preventDefault();

    // Get coordinates (mouse or touch)
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);

    if (clientX !== undefined && clientY !== undefined) {
      // Get canvas offset and dimensions
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();

        // Convert viewport coordinates to canvas-relative coordinates
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;

        // Constrain to canvas bounds
        this.position.x = Math.max(0, Math.min(rect.width, canvasX));
        this.position.y = Math.max(0, Math.min(rect.height, canvasY));
      } else {
        // Fallback to window bounds
        this.position.x = Math.max(0, Math.min(window.innerWidth, clientX));
        this.position.y = Math.max(0, Math.min(window.innerHeight, clientY));
      }

      this.updatePosition();

      // Notify parent of position change
      if (this.onChange) {
        this.onChange(this.id, this.position);
      }
    }
  }

  /**
   * Handle drag end
   */
  onDragEnd(event) {
    if (!this.isDragging) return;

    event.preventDefault();
    this.isDragging = false;
    this.element.classList.remove('dragging');
  }

  /**
   * Update the visual position of the element
   */
  updatePosition() {
    // Get canvas offset from viewport
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      // Position relative to canvas, not window
      this.element.style.left = `${rect.left + this.position.x}px`;
      this.element.style.top = `${rect.top + this.position.y}px`;
    } else {
      this.element.style.left = `${this.position.x}px`;
      this.element.style.top = `${this.position.y}px`;
    }
  }

  /**
   * Set the position programmatically
   */
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
    this.updatePosition();
  }

  /**
   * Get the current position
   */
  getPosition() {
    return { ...this.position };
  }

  /**
   * Get normalized position (0-1 range)
   */
  getNormalizedPosition() {
    return {
      x: this.position.x / window.innerWidth,
      y: this.position.y / window.innerHeight
    };
  }

  /**
   * Clean up event listeners
   */
  dispose() {
    if (this.element) {
      this.element.remove();
    }
  }
}
