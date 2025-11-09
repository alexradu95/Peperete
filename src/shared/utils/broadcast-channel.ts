const CHANNEL_NAME = 'projection-mapping-sync';

type MessageData = {
  type: string;
  payload: unknown;
  timestamp: number;
};

type Listener = (payload: unknown) => void;

class BroadcastManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Listener[]> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<MessageData>) => {
        this.handleMessage(event.data);
      };
    } else {
      console.warn('BroadcastChannel not supported, falling back to localStorage');
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  private handleMessage(data: MessageData): void {
    const { type, payload } = data;
    const listeners = this.listeners.get(type) || [];
    listeners.forEach(callback => callback(payload));
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (event.key === 'projection_mapping_broadcast') {
      try {
        const data = JSON.parse(event.newValue || '');
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing storage event:', error);
      }
    }
  }

  broadcast(type: string, payload: unknown): void {
    const message: MessageData = { type, payload, timestamp: Date.now() };

    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      localStorage.setItem('projection_mapping_broadcast', JSON.stringify(message));
      setTimeout(() => {
        localStorage.removeItem('projection_mapping_broadcast');
      }, 100);
    }
  }

  subscribe(type: string, callback: Listener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);

    return () => {
      const listeners = this.listeners.get(type) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  close(): void {
    if (this.channel) {
      this.channel.close();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
  }
}

export const broadcastManager = new BroadcastManager();

export const MessageTypes = {
  SURFACE_UPDATED: 'SURFACE_UPDATED',
  SURFACE_ADDED: 'SURFACE_ADDED',
  SURFACE_DELETED: 'SURFACE_DELETED',
  SURFACE_SELECTED: 'SURFACE_SELECTED',
  MODE_CHANGED: 'MODE_CHANGED',
  FULLSCREEN_CHANGED: 'FULLSCREEN_CHANGED',
  SURFACES_REORDERED: 'SURFACES_REORDERED',
} as const;

export type MessageType = typeof MessageTypes[keyof typeof MessageTypes];
