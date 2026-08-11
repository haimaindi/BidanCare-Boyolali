/**
 * Core Realtime & Active Listening Service
 * Provides abstraction for realtime channel subscriptions, event handling,
 * Supabase Postgres Changes listeners, and fallback connection states.
 */

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: RealtimeEventType;
  table: string;
  schema?: string;
  oldRecord: T | null;
  newRecord: T | null;
  timestamp: string;
}

export type RealtimeCallback<T = Record<string, unknown>> = (payload: RealtimePayload<T>) => void;

export type StatusChangeCallback = (status: ConnectionStatus) => void;

export interface SubscriptionOptions {
  table: string;
  schema?: string;
  filter?: string;
  event?: RealtimeEventType;
}

class RealtimeService {
  private status: ConnectionStatus = 'disconnected';
  private statusListeners: Set<StatusChangeCallback> = new Set();
  private channelSubscriptions: Map<string, Set<RealtimeCallback>> = new Map();
  private mockIntervalId: number | null = null;

  constructor() {
    this.status = 'disconnected';
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Subscribe to connection status changes
   */
  public onStatusChange(callback: StatusChangeCallback): () => void {
    this.statusListeners.add(callback);
    callback(this.status);

    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private setStatus(newStatus: ConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((listener) => listener(this.status));
    }
  }

  /**
   * Connect to Realtime Engine / WebSocket channel
   */
  public connect(): void {
    if (this.status === 'connected' || this.status === 'connecting') {
      return;
    }

    this.setStatus('connecting');

    // Simulate connection establishment
    setTimeout(() => {
      this.setStatus('connected');
    }, 300);
  }

  /**
   * Disconnect from Realtime Engine
   */
  public disconnect(): void {
    if (this.mockIntervalId !== null) {
      clearInterval(this.mockIntervalId);
      this.mockIntervalId = null;
    }
    this.setStatus('disconnected');
  }

  /**
   * Subscribe to database table changes (Postgres Changes active listening)
   */
  public subscribeTable<T = Record<string, unknown>>(
    options: SubscriptionOptions,
    callback: RealtimeCallback<T>
  ): () => void {
    const channelKey = `${options.schema || 'public'}:${options.table}`;

    if (!this.channelSubscriptions.has(channelKey)) {
      this.channelSubscriptions.set(channelKey, new Set());
    }

    const callbacks = this.channelSubscriptions.get(channelKey)!;
    callbacks.add(callback as RealtimeCallback);

    if (this.status === 'disconnected') {
      this.connect();
    }

    // Return cleanup function to unsubscribe
    return () => {
      const currentCallbacks = this.channelSubscriptions.get(channelKey);
      if (currentCallbacks) {
        currentCallbacks.delete(callback as RealtimeCallback);
        if (currentCallbacks.size === 0) {
          this.channelSubscriptions.delete(channelKey);
        }
      }
    };
  }

  /**
   * Broadcast/Emit event locally or to database subscribers
   */
  public emitEvent<T = Record<string, unknown>>(
    table: string,
    eventType: RealtimeEventType,
    newRecord: T | null = null,
    oldRecord: T | null = null,
    schema = 'public'
  ): void {
    const channelKey = `${schema}:${table}`;
    const payload: RealtimePayload<T> = {
      eventType,
      table,
      schema,
      oldRecord,
      newRecord,
      timestamp: new Date().toISOString(),
    };

    const callbacks = this.channelSubscriptions.get(channelKey);
    if (callbacks) {
      callbacks.forEach((cb) => cb(payload as RealtimePayload));
    }
  }
}

export const realtimeService = new RealtimeService();
