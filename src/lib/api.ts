/**
 * API Client with 403 Interceptor & Seamless LocalStorage Fallback
 */

let hasLoggedStandaloneMode = false;

export const notifyStandaloneMode = () => {
  if (!hasLoggedStandaloneMode) {
    hasLoggedStandaloneMode = true;
    console.info('[App] Running in Standalone LocalStorage Mode');
  }
};

/**
 * Helper to get authorization headers from token
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

/**
 * Safe fetch wrapper that intercepts 403 Forbidden, 5xx, or network errors
 * without bubbling unhandled promise rejections to the console.
 */
export const safeFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response | null> => {
  try {
    const res = await fetch(input, init);
    if (res.status === 403) {
      notifyStandaloneMode();
      return null;
    }
    return res;
  } catch (err) {
    notifyStandaloneMode();
    return null;
  }
};

/**
 * Generic API request wrapper that falls back to LocalStorage or fallback data
 * if server is unreachable or responds with 403 / network errors.
 */
export const safeApiRequest = async <T>(
  url: string,
  options?: RequestInit,
  fallbackStorageKey?: string,
  defaultFallback?: T
): Promise<T | null> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {})
    };

    const res = await fetch(url, { ...options, headers });
    
    if (res.status === 403) {
      notifyStandaloneMode();
      if (fallbackStorageKey && typeof window !== 'undefined') {
        const stored = localStorage.getItem(fallbackStorageKey);
        if (stored) {
          try {
            return JSON.parse(stored) as T;
          } catch {}
        }
      }
      return defaultFallback !== undefined ? defaultFallback : null;
    }

    if (!res.ok) {
      if (fallbackStorageKey && typeof window !== 'undefined') {
        const stored = localStorage.getItem(fallbackStorageKey);
        if (stored) {
          try {
            return JSON.parse(stored) as T;
          } catch {}
        }
      }
      return defaultFallback !== undefined ? defaultFallback : null;
    }

    const data = await res.json();
    return data as T;
  } catch (e) {
    notifyStandaloneMode();
    if (fallbackStorageKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(fallbackStorageKey);
      if (stored) {
        try {
          return JSON.parse(stored) as T;
        } catch {}
      }
    }
    return defaultFallback !== undefined ? defaultFallback : null;
  }
};

/**
 * LocalStorage Fallback Storage Keys mapping
 */
export const STORAGE_KEYS = {
  PROJECTS: 'orbit_projects_db',
  LEGACY_PROJECTS: 'agency_projects',
  TASKS: 'orbit_tasks_db',
  LEGACY_TASKS: 'agency_tasks',
  USERS: 'orbit_users_db',
  TEAM: 'agency_team',
  NOTIFICATIONS: 'agency_notifications',
  CHATS: 'orbit_chat_messages',
  CONVERSATIONS: 'orbit_chat_conversations',
  ORG_DATA: 'orbit_org_data'
} as const;

/**
 * Read data safely from localStorage
 */
export const getLocalData = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Save data safely to localStorage
 */
export const setLocalData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[LocalStorage] Failed to save key "${key}":`, err);
  }
};
