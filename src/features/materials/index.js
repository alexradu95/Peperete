/**
 * Materials Feature Module
 *
 * Auto-registers all materials with the MaterialRegistry
 * Import this module to make all materials available
 */

// Import all material categories - this triggers registration
import './basic';
import './animated';
import './audio';
import './custom';

// Re-export categories for direct access if needed
export * from './basic';
export * from './animated';
export * from './audio';
export * from './custom';
