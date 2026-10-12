import { io, Socket } from 'socket.io-client';

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : '');

let socket: Socket | null = null;
let isOfflineMode = false;

// Internal event listeners for fallback offline mode
type EventHandler = (...args: any[]) => void;
const internalListeners: Map<string, Set<EventHandler>> = new Map();

export const emitInternalEvent = (event: string, ...args: any[]) => {
  const handlers = internalListeners.get(event);
  if (handlers) {
    handlers.forEach(fn => {
      try {
        fn(...args);
      } catch (err) {
        console.error(`[Realtime fallback] Error in event handler for ${event}:`, err);
      }
    });
  }
};

export const registerInternalListener = (event: string, handler: EventHandler) => {
  if (!internalListeners.has(event)) {
    internalListeners.set(event, new Set());
  }
  internalListeners.get(event)!.add(handler);
  return () => {
    internalListeners.get(event)?.delete(handler);
  };
};

export const getSocket = (): Socket | null => {
  if (isOfflineMode) return null;

  if (!socket && typeof window !== 'undefined') {
    try {
      socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 2, // Stop infinite reconnect loops
        reconnectionDelay: 5000,
        timeout: 4000,
        autoConnect: false // Controlled connect
      });

      socket.on('connect_error', (error: any) => {
        // If server responds with 403 or is unavailable, disconnect to avoid console flooding
        const isForbidden = 
          error?.message?.includes('403') || 
          error?.description === 403 || 
          error?.status === 403 ||
          error?.type === 'TransportError' ||
          (error?.context && error.context?.status === 403);

        if (isForbidden) {
          console.warn('[Realtime] Backend 403/Unavailable. Switched to Standalone Storage Mode.');
          isOfflineMode = true;
          try {
            socket?.disconnect();
          } catch {}
        }
      });

      socket.on('error', (err: any) => {
        if (err?.message?.includes('403') || err?.status === 403) {
          isOfflineMode = true;
          try {
            socket?.disconnect();
          } catch {}
        }
      });

      // Try connecting once
      socket.connect();
    } catch (e) {
      console.warn('[Realtime] Socket initialization error, running in offline mode:', e);
      isOfflineMode = true;
      socket = null;
    }
  }

  return socket;
};

export const isRealtimeOffline = () => isOfflineMode;

export const disconnectSocket = () => {
  if (socket) {
    try {
      socket.disconnect();
    } catch {}
    socket = null;
  }
};
