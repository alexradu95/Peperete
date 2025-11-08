/**
 * SurfaceUI - Manages the surface selection and management UI
 */
export class SurfaceUI {
  constructor(surfaceManager, app) {
    this.surfaceManager = surfaceManager;
    this.app = app;
    this.listElement = document.getElementById('surface-list');
    this.addButton = document.getElementById('add-surface-btn');
    this.draggedElement = null;
    this.draggedSurfaceId = null;

    this.init();
  }

  /**
   * Initialize UI event listeners
   */
  init() {
    // Add surface button
    this.addButton.addEventListener('click', () => {
      this.app.addSurface();
    });
  }

  /**
   * Render the surface list
   */
  render() {
    this.listElement.innerHTML = '';

    const surfaces = this.surfaceManager.getAllSurfaces();
    const selectedId = this.surfaceManager.selectedSurfaceId;

    if (surfaces.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.style.cssText = 'color: #666; font-size: 12px; padding: 10px; text-align: center;';
      emptyMessage.textContent = 'No surfaces yet. Click "Add Surface" to create one.';
      this.listElement.appendChild(emptyMessage);
      return;
    }

    surfaces.forEach(surface => {
      const item = this.createSurfaceItem(surface, surface.id === selectedId);
      this.listElement.appendChild(item);
    });
  }

  /**
   * Create a surface list item element
   */
  createSurfaceItem(surface, isSelected) {
    const item = document.createElement('div');
    item.className = 'surface-item';
    item.setAttribute('draggable', 'true');
    item.dataset.surfaceId = surface.id;

    if (isSelected) {
      item.classList.add('selected');
    }

    // Drag and drop handlers
    item.addEventListener('dragstart', (e) => this.onDragStart(e, surface.id));
    item.addEventListener('dragover', (e) => this.onDragOver(e));
    item.addEventListener('drop', (e) => this.onDrop(e, surface.id));
    item.addEventListener('dragend', (e) => this.onDragEnd(e));

    // Make the whole item clickable (except action buttons)
    item.addEventListener('click', (e) => {
      // Only trigger if clicking on the item itself or info section, not buttons
      if (!e.target.closest('.surface-item-actions')) {
        this.onSurfaceClick(surface.id);
      }
    });

    // Info section
    const info = document.createElement('div');
    info.className = 'surface-item-info';

    const name = document.createElement('div');
    name.className = 'surface-item-name';
    name.textContent = surface.name;

    const id = document.createElement('div');
    id.className = 'surface-item-id';
    id.textContent = `ID: ${surface.id} | Priority: ${surface.priority}`;

    info.appendChild(name);
    info.appendChild(id);

    // Actions section
    const actions = document.createElement('div');
    actions.className = 'surface-item-actions';

    // Drag handle indicator
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '⋮⋮';
    dragHandle.title = 'Drag to reorder';

    // Visibility toggle
    const visibilityBtn = document.createElement('button');
    visibilityBtn.className = 'surface-item-btn visibility';
    if (!surface.isVisible) {
      visibilityBtn.classList.add('surface-hidden');
    }
    visibilityBtn.textContent = surface.isVisible ? '👁' : '🚫';
    visibilityBtn.title = surface.isVisible ? 'Hide surface' : 'Show surface';
    visibilityBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleVisibility(surface.id);
    });

    // Content button
    const contentBtn = document.createElement('button');
    contentBtn.className = 'surface-item-btn content';
    contentBtn.textContent = '🎨';
    contentBtn.title = 'Set content';
    contentBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onContentClick(surface.id);
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'surface-item-btn delete';
    deleteBtn.textContent = '🗑';
    deleteBtn.title = 'Delete surface';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onDeleteClick(surface.id);
    });

    actions.appendChild(dragHandle);
    actions.appendChild(visibilityBtn);
    actions.appendChild(contentBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(info);
    item.appendChild(actions);

    return item;
  }

  /**
   * Handle surface item click (select)
   */
  onSurfaceClick(surfaceId) {
    console.log(`UI: Selecting surface ${surfaceId}`);
    this.app.selectSurface(surfaceId);
    // Re-render to update visual selection
    this.render();
  }

  /**
   * Handle drag start
   */
  onDragStart(e, surfaceId) {
    this.draggedSurfaceId = surfaceId;
    this.draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
  }

  /**
   * Handle drag over
   */
  onDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';

    const afterElement = this.getDragAfterElement(this.listElement, e.clientY);
    const draggable = this.draggedElement;

    if (afterElement == null) {
      this.listElement.appendChild(draggable);
    } else {
      this.listElement.insertBefore(draggable, afterElement);
    }

    return false;
  }

  /**
   * Handle drop
   */
  onDrop(e, targetSurfaceId) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    return false;
  }

  /**
   * Handle drag end
   */
  onDragEnd(e) {
    e.target.classList.remove('dragging');

    // Get new order from DOM
    const newOrder = [];
    Array.from(this.listElement.children).forEach(child => {
      const surfaceId = parseInt(child.dataset.surfaceId);
      if (!isNaN(surfaceId)) {
        newOrder.push(surfaceId);
      }
    });

    // Update surface manager
    this.surfaceManager.reorderSurfaces(newOrder);

    // Re-render to update priority display
    this.render();
  }

  /**
   * Get element to insert dragged item before
   */
  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.surface-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  /**
   * Handle visibility toggle
   */
  onToggleVisibility(surfaceId) {
    const isVisible = this.surfaceManager.toggleSurfaceVisibility(surfaceId);
    this.render();
  }

  /**
   * Handle content button click
   */
  onContentClick(surfaceId) {
    this.showContentMenu(surfaceId);
  }

  /**
   * Show content selection menu
   */
  showContentMenu(surfaceId) {
    const surface = this.surfaceManager.getSurface(surfaceId);
    if (!surface) return;

    const options = [
      { label: 'Checkerboard', value: 'checkerboard' },
      { label: 'Grid Pattern', value: 'grid' },
      { label: 'Animated Gradient', value: 'animated-gradient' },
      { label: 'Rotating Colors', value: 'rotating-colors' },
      { label: 'White', value: 'white' },
      { label: 'Red', value: 'red' },
      { label: 'Green', value: 'green' },
      { label: 'Blue', value: 'blue' }
    ];

    const choice = prompt(
      `Choose content for "${surface.name}":\n\n${options.map((opt, i) => `${i + 1}. ${opt.label}`).join('\n')}`,
      '1'
    );

    if (choice) {
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < options.length) {
        this.app.loadContentForSurface(surfaceId, options[index].value);
      }
    }
  }

  /**
   * Handle delete button click
   */
  onDeleteClick(surfaceId) {
    const surface = this.surfaceManager.getSurface(surfaceId);
    if (!surface) return;

    const confirmed = confirm(`Delete surface "${surface.name}"?`);
    if (confirmed) {
      this.app.removeSurface(surfaceId);
    }
  }

  /**
   * Update the current surface name display in calibration mode
   */
  updateCurrentSurfaceName() {
    const nameElement = document.getElementById('current-surface-name');
    if (!nameElement) return;

    const selectedSurface = this.surfaceManager.getSelectedSurface();
    if (selectedSurface) {
      nameElement.textContent = `Editing: ${selectedSurface.name}`;
      nameElement.style.display = 'block';
    } else {
      nameElement.style.display = 'none';
    }
  }
}
