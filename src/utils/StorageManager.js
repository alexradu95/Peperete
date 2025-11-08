/**
 * StorageManager - Handles localStorage operations for calibration data
 */
export class StorageManager {
  static STORAGE_KEY = 'projectionMapping_surfaces';

  /**
   * Save all surfaces data to localStorage
   */
  static saveSurfaces(surfaceData) {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        ...surfaceData,
        resolution: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('Surfaces saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save surfaces:', error);
      return false;
    }
  }

  /**
   * Load surfaces data from localStorage
   */
  static loadSurfaces() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        console.log('No saved surfaces found');
        return null;
      }

      const parsed = JSON.parse(data);
      console.log('Surfaces loaded successfully');
      return parsed;
    } catch (error) {
      console.error('Failed to load surfaces:', error);
      return null;
    }
  }

  /**
   * Clear saved surfaces data
   */
  static clearSurfaces() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Surfaces cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear surfaces:', error);
      return false;
    }
  }

  /**
   * Check if surfaces data exists
   */
  static hasSurfaces() {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }
}
