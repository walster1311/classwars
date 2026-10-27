'use client';

/**
 * Server Configuration & Intelligent URL Resolver
 * Handles local development, remote hosting (Vercel, Railway, Render),
 * and user-specified custom backend endpoints with automatic protocol upgrade.
 */

const STORAGE_KEY_CUSTOM_SERVER = 'CLASSVERSE_CUSTOM_SERVER_URL';

export function getCustomServerUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_SERVER) || '';
  } catch {
    return '';
  }
}

export function setCustomServerUrl(url: string): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = url.trim().replace(/\/$/, '');
    if (!cleaned) {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_SERVER);
    } else {
      localStorage.setItem(STORAGE_KEY_CUSTOM_SERVER, cleaned);
    }
  } catch (err) {
    console.warn('[ServerConfig] Could not save custom server URL:', err);
  }
}

/**
 * Resolves the authorative HTTP API base URL
 */
export function getServerHttpUrl(): string {
  const custom = getCustomServerUrl();
  if (custom) {
    if (custom.startsWith('ws://')) return custom.replace('ws://', 'http://');
    if (custom.startsWith('wss://')) return custom.replace('wss://', 'https://');
    return custom;
  }

  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) {
      return `http://${hostname}:2567`;
    }
    // Remote host (e.g. Vercel)
    return window.location.origin;
  }

  return 'http://localhost:2567';
}

/**
 * Resolves the authorative Colyseus WebSocket URL (ws:// or wss://)
 */
export function getServerWsUrl(): string {
  const custom = getCustomServerUrl();
  if (custom) {
    if (custom.startsWith('https://')) return custom.replace('https://', 'wss://');
    if (custom.startsWith('http://')) return custom.replace('http://', 'ws://');
    if (custom.startsWith('wss://') || custom.startsWith('ws://')) return custom;
    return `wss://${custom}`;
  }

  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const isHttps = window.location.protocol === 'https:';

    if (isLocal) {
      return `ws://${hostname}:2567`;
    }

    // When loaded over HTTPS (such as Vercel), unencrypted ws:// is blocked by browsers.
    // Use wss:// protocol:
    return `${isHttps ? 'wss' : 'ws'}://${window.location.host}`;
  }

  return 'ws://localhost:2567';
}
