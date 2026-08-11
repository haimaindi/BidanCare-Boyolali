/**
 * Isomorphic & Environment-Agnostic Configuration Reader
 * Supports both Vite (import.meta.env.VITE_*) and Node.js/Vercel (process.env.*) environments safely.
 */

export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Safely reads an environment variable across Vite and Node.js/Vercel runtimes.
 */
export function getEnvVar(key: string, fallback: string = ''): string {
  // 1. Try reading from Vite import.meta.env
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
    if (metaEnv) {
      const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
      if (metaEnv[viteKey] !== undefined) {
        return String(metaEnv[viteKey]);
      }
      if (metaEnv[key] !== undefined) {
        return String(metaEnv[key]);
      }
    }
  } catch {
    // Ignore import.meta access errors in non-ESM environments
  }

  // 2. Try reading from Node.js process.env
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      if (process.env[key] !== undefined) {
        return String(process.env[key]);
      }
      const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
      if (process.env[viteKey] !== undefined) {
        return String(process.env[viteKey]);
      }
    }
  } catch {
    // Ignore process access errors
  }

  return fallback;
}

/**
 * Safely extracts pure storage/file key from proxy URL or full path URL.
 */
export function sanitizeStorageKey(rawKeyOrUrl: string): string {
  if (!rawKeyOrUrl) return '';
  try {
    // If it's a full URL, parse path name
    if (rawKeyOrUrl.startsWith('http://') || rawKeyOrUrl.startsWith('https://')) {
      const parsedUrl = new URL(rawKeyOrUrl);
      const pathname = parsedUrl.pathname;
      const filename = pathname.split('/').pop() || '';
      return decodeURIComponent(filename);
    }
    // Clean leading slashes
    return rawKeyOrUrl.replace(/^\/+/, '');
  } catch {
    return rawKeyOrUrl;
  }
}
