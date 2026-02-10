/**
 * Enhanced Socket Service with Auto-Reconnection
 * Improves upon existing socketService.ts with better error handling
 */

import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private isIntentionalDisconnect = false;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Connect to Socket.IO server
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    this.socket = io(serverUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: this.maxReconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
    });

    this.setupEventHandlers();
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection successful
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay
      this.notifyListeners('connect', { socketId: this.socket?.id });
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.notifyListeners('max_reconnect_failed', { attempts: this.reconnectAttempts });
      } else {
        // Exponential backoff
        this.reconnectDelay = Math.min(
          this.reconnectDelay * 2,
          this.maxReconnectDelay
        );
        console.log(`Will retry in ${this.reconnectDelay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      }

      this.notifyListeners('connect_error', { error, attempts: this.reconnectAttempts });
    });

    // Disconnected
    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Socket disconnected:', reason);

      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect manually
        if (!this.isIntentionalDisconnect) {
          console.log('Server disconnected, attempting manual reconnect...');
          setTimeout(() => this.socket?.connect(), 1000);
        }
      }

      this.notifyListeners('disconnect', { reason });
    });

    // Reconnection attempt
    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}/${this.maxReconnectAttempts}`);
      this.notifyListeners('reconnect_attempt', { attempt });
    });

    // Reconnection successful
    this.socket.on('reconnect', (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.notifyListeners('reconnect', { attempt });
    });

    // Reconnection failed
    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after max attempts');
      this.notifyListeners('reconnect_failed', {});
    });

    // Ping/Pong for connection health
    this.socket.on('ping', () => {
      console.log('📡 Ping received');
    });

    this.socket.on('pong', (latency) => {
      console.log(`📡 Pong (latency: ${latency}ms)`);
      this.notifyListeners('pong', { latency });
    });
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.isIntentionalDisconnect = true;
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected intentionally');
    }
  }

  /**
   * Emit event to server
   */
  emit(event: string, data: any, callback?: (response: any) => void): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot emit:', event);
      return;
    }

    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }

  /**
   * Listen to event from server
   */
  on(event: string, callback: Function): void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.on(event, callback as any);

    // Track listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: Function): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback as any);
      this.listeners.get(event)?.delete(callback);
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  /**
   * Notify all listeners of an event
   */
  private notifyListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Get reconnection attempts
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}

// Export singleton instance
export const socketService = new SocketService();
