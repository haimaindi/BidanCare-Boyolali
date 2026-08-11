import { useEffect, useState, useCallback } from 'react';
import {
  realtimeService,
  ConnectionStatus,
  RealtimePayload,
  RealtimeEventType,
  SubscriptionOptions,
} from '../services/realtimeService.js';

export interface UseActiveListeningOptions extends SubscriptionOptions {
  autoConnect?: boolean;
}

export interface ActiveListeningResult<T> {
  status: ConnectionStatus;
  isConnected: boolean;
  lastPayload: RealtimePayload<T> | null;
  emitEvent: (
    eventType: RealtimeEventType,
    newRecord?: T | null,
    oldRecord?: T | null
  ) => void;
}

/**
 * Custom hook for Active Listening Realtime in components & modules.
 * Listens to database table changes and updates reactive state.
 */
export function useActiveListening<T = Record<string, unknown>>(
  options: UseActiveListeningOptions,
  onPayloadReceived?: (payload: RealtimePayload<T>) => void
): ActiveListeningResult<T> {
  const [status, setStatus] = useState<ConnectionStatus>(realtimeService.getStatus());
  const [lastPayload, setLastPayload] = useState<RealtimePayload<T> | null>(null);

  const { table, schema = 'public', filter, event = '*', autoConnect = true } = options;

  useEffect(() => {
    if (autoConnect) {
      realtimeService.connect();
    }

    const unsubscribeStatus = realtimeService.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    const unsubscribeTable = realtimeService.subscribeTable<T>(
      { table, schema, filter, event },
      (payload) => {
        setLastPayload(payload as RealtimePayload<T>);
        if (onPayloadReceived) {
          onPayloadReceived(payload as RealtimePayload<T>);
        }
      }
    );

    return () => {
      unsubscribeStatus();
      unsubscribeTable();
    };
  }, [table, schema, filter, event, autoConnect, onPayloadReceived]);

  const emitEvent = useCallback(
    (eventType: RealtimeEventType, newRecord: T | null = null, oldRecord: T | null = null) => {
      realtimeService.emitEvent<T>(table, eventType, newRecord, oldRecord, schema);
    },
    [table, schema]
  );

  return {
    status,
    isConnected: status === 'connected',
    lastPayload,
    emitEvent,
  };
}
