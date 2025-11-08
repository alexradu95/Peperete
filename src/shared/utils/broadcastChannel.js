/**
 * BroadcastChannel utility for cross-tab communication
 * Allows synchronization between /edit and /live views
 */

const CHANNEL_NAME = 'projection-mapping-sync';

class BroadcastManager {
  constructor() {
    this.channel = null;
    this.listeners = new Map();
    this.initialize();
  }

  initialize() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    } else {
      console.warn('BroadcastChannel not supported, falling back to localStorage');
      // Fallback to storage events for browsers that don't support BroadcastChannel
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  handleMessage(data) {
    const { type, payload } = data;
    const listeners = this.listeners.get(type) || [];
    listeners.forEach(callback => callback(payload));
  }

  handleStorageEvent(event) {
    if (event.key === 'projection_mapping_broadcast') {
      try {
        const data = JSON.parse(event.newValue);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing storage event:', error);
      }
    }
  }

  broadcast(type, payload) {
    const message = { type, payload, timestamp: Date.now() };

    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // Fallback: use localStorage
      localStorage.setItem('projection_mapping_broadcast', JSON.stringify(message));
      // Clear after a short delay to trigger storage event in other tabs
      setTimeout(() => {
        localStorage.removeItem('projection_mapping_broadcast');
      }, 100);
    }
  }

  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  close() {
    if (this.channel) {
      this.channel.close();
    }
    window.removeEventListener('storage', this.handleStorageEvent);
  }
}

// Singleton instance
export const broadcastManager = new BroadcastManager();

// Message types
export const MessageTypes = {
  SURFACE_UPDATED: 'SURFACE_UPDATED',
  SURFACE_ADDED: 'SURFACE_ADDED',
  SURFACE_DELETED: 'SURFACE_DELETED',
  SURFACE_SELECTED: 'SURFACE_SELECTED',
  MODE_CHANGED: 'MODE_CHANGED',
  FULLSCREEN_CHANGED: 'FULLSCREEN_CHANGED',
  SURFACES_REORDERED: 'SURFACES_REORDERED',
};
