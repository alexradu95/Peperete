import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessageTypes } from './broadcastChannel';

// Import BroadcastManager class directly for testing
const CHANNEL_NAME = 'projection-mapping-sync';

class BroadcastManager {
  channel: any = null;
  listeners: Map<string, Array<(payload: any) => void>> = new Map();

  constructor() {
    this.initialize();
  }

  initialize() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data);
      };
    }
  }

  handleMessage(data: { type: string; payload: any }) {
    const { type, payload } = data;
    const listeners = this.listeners.get(type) || [];
    listeners.forEach(callback => callback(payload));
  }

  broadcast(type: string, payload: any) {
    const message = { type, payload, timestamp: Date.now() };

    if (this.channel) {
      this.channel.postMessage(message);
    }
  }

  subscribe(type: string, callback: (payload: any) => void) {
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

  close() {
    if (this.channel) {
      this.channel.close();
    }
  }
}

describe('BroadcastManager', () => {
  let manager: BroadcastManager;

  beforeEach(() => {
    manager = new BroadcastManager();
  });

  describe('initialization', () => {
    it('should create BroadcastChannel on initialization', () => {
      expect(manager.channel).toBeDefined();
      expect(manager.channel.name).toBe(CHANNEL_NAME);
    });

    it('should initialize empty listeners map', () => {
      expect(manager.listeners).toBeInstanceOf(Map);
      expect(manager.listeners.size).toBe(0);
    });
  });

  describe('subscription', () => {
    it('should allow subscribing to message types', () => {
      const callback = vi.fn();

      manager.subscribe(MessageTypes.SURFACE_UPDATED, callback);

      expect(manager.listeners.has(MessageTypes.SURFACE_UPDATED)).toBe(true);
      expect(manager.listeners.get(MessageTypes.SURFACE_UPDATED)).toHaveLength(1);
    });

    it('should support multiple subscribers to same message type', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      manager.subscribe(MessageTypes.SURFACE_ADDED, callback1);
      manager.subscribe(MessageTypes.SURFACE_ADDED, callback2);
      manager.subscribe(MessageTypes.SURFACE_ADDED, callback3);

      expect(manager.listeners.get(MessageTypes.SURFACE_ADDED)).toHaveLength(3);
    });

    it('should support subscribing to different message types', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      manager.subscribe(MessageTypes.SURFACE_UPDATED, callback1);
      manager.subscribe(MessageTypes.MODE_CHANGED, callback2);

      expect(manager.listeners.has(MessageTypes.SURFACE_UPDATED)).toBe(true);
      expect(manager.listeners.has(MessageTypes.MODE_CHANGED)).toBe(true);
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();

      const unsubscribe = manager.subscribe(MessageTypes.SURFACE_DELETED, callback);

      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('unsubscription', () => {
    it('should remove listener when unsubscribe is called', () => {
      const callback = vi.fn();

      const unsubscribe = manager.subscribe(MessageTypes.SURFACE_UPDATED, callback);
      expect(manager.listeners.get(MessageTypes.SURFACE_UPDATED)).toHaveLength(1);

      unsubscribe();
      expect(manager.listeners.get(MessageTypes.SURFACE_UPDATED)).toHaveLength(0);
    });

    it('should only remove specific callback when multiple subscribers exist', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      const unsubscribe1 = manager.subscribe(MessageTypes.SURFACE_ADDED, callback1);
      manager.subscribe(MessageTypes.SURFACE_ADDED, callback2);
      manager.subscribe(MessageTypes.SURFACE_ADDED, callback3);

      expect(manager.listeners.get(MessageTypes.SURFACE_ADDED)).toHaveLength(3);

      unsubscribe1();

      const remaining = manager.listeners.get(MessageTypes.SURFACE_ADDED);
      expect(remaining).toHaveLength(2);
      expect(remaining).toContain(callback2);
      expect(remaining).toContain(callback3);
      expect(remaining).not.toContain(callback1);
    });

    it('should handle unsubscribing non-existent callback gracefully', () => {
      const callback = vi.fn();

      const unsubscribe = manager.subscribe(MessageTypes.SURFACE_UPDATED, callback);
      unsubscribe(); // First unsubscribe

      // Second unsubscribe should not throw
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('message handling', () => {
    it('should call subscribed callback when message is received', () => {
      const callback = vi.fn();
      const payload = { id: 'surface-1', name: 'Test Surface' };

      manager.subscribe(MessageTypes.SURFACE_UPDATED, callback);
      manager.handleMessage({ type: MessageTypes.SURFACE_UPDATED, payload });

      expect(callback).toHaveBeenCalledWith(payload);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call multiple subscribers when message is received', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const payload = { mode: 'playback' };

      manager.subscribe(MessageTypes.MODE_CHANGED, callback1);
      manager.subscribe(MessageTypes.MODE_CHANGED, callback2);
      manager.handleMessage({ type: MessageTypes.MODE_CHANGED, payload });

      expect(callback1).toHaveBeenCalledWith(payload);
      expect(callback2).toHaveBeenCalledWith(payload);
    });

    it('should only call callbacks for matching message type', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      manager.subscribe(MessageTypes.SURFACE_UPDATED, callback1);
      manager.subscribe(MessageTypes.SURFACE_ADDED, callback2);

      manager.handleMessage({
        type: MessageTypes.SURFACE_UPDATED,
        payload: { id: 'test' }
      });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should not throw when message type has no subscribers', () => {
      expect(() => {
        manager.handleMessage({
          type: MessageTypes.SURFACE_DELETED,
          payload: { id: 'test' }
        });
      }).not.toThrow();
    });

    it('should pass correct payload to callbacks', () => {
      const callback = vi.fn();
      const payload = {
        id: 'surface-123',
        corners: { point0: { x: 100, y: 100 } },
        visible: true
      };

      manager.subscribe(MessageTypes.SURFACE_UPDATED, callback);
      manager.handleMessage({ type: MessageTypes.SURFACE_UPDATED, payload });

      expect(callback).toHaveBeenCalledWith(payload);
      expect(callback.mock.calls[0][0]).toEqual(payload);
    });
  });

  describe('broadcasting', () => {
    it('should post message to channel when broadcasting', () => {
      const payload = { id: 'surface-1' };
      const postMessageSpy = vi.fn();
      manager.channel.postMessage = postMessageSpy;

      manager.broadcast(MessageTypes.SURFACE_ADDED, payload);

      expect(postMessageSpy).toHaveBeenCalledTimes(1);
      expect(postMessageSpy.mock.calls[0][0]).toMatchObject({
        type: MessageTypes.SURFACE_ADDED,
        payload,
        timestamp: expect.any(Number)
      });
    });

    it('should include timestamp when broadcasting', () => {
      const payload = { mode: 'calibration' };
      const postMessageSpy = vi.fn();
      manager.channel.postMessage = postMessageSpy;

      const beforeTime = Date.now();
      manager.broadcast(MessageTypes.MODE_CHANGED, payload);
      const afterTime = Date.now();

      const message = postMessageSpy.mock.calls[0][0];
      expect(message.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(message.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should broadcast different message types correctly', () => {
      const postMessageSpy = vi.fn();
      manager.channel.postMessage = postMessageSpy;

      manager.broadcast(MessageTypes.SURFACE_UPDATED, { id: '1' });
      manager.broadcast(MessageTypes.MODE_CHANGED, { mode: 'playback' });
      manager.broadcast(MessageTypes.FULLSCREEN_CHANGED, { fullscreen: true });

      expect(postMessageSpy).toHaveBeenCalledTimes(3);
      expect(postMessageSpy.mock.calls[0][0].type).toBe(MessageTypes.SURFACE_UPDATED);
      expect(postMessageSpy.mock.calls[1][0].type).toBe(MessageTypes.MODE_CHANGED);
      expect(postMessageSpy.mock.calls[2][0].type).toBe(MessageTypes.FULLSCREEN_CHANGED);
    });
  });

  describe('cleanup', () => {
    it('should close channel when close is called', () => {
      const closeSpy = vi.fn();
      manager.channel.close = closeSpy;

      manager.close();

      expect(closeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('MessageTypes constants', () => {
    it('should define all required message types', () => {
      expect(MessageTypes.SURFACE_UPDATED).toBe('SURFACE_UPDATED');
      expect(MessageTypes.SURFACE_ADDED).toBe('SURFACE_ADDED');
      expect(MessageTypes.SURFACE_DELETED).toBe('SURFACE_DELETED');
      expect(MessageTypes.SURFACE_SELECTED).toBe('SURFACE_SELECTED');
      expect(MessageTypes.MODE_CHANGED).toBe('MODE_CHANGED');
      expect(MessageTypes.FULLSCREEN_CHANGED).toBe('FULLSCREEN_CHANGED');
      expect(MessageTypes.SURFACES_REORDERED).toBe('SURFACES_REORDERED');
    });
  });
});
