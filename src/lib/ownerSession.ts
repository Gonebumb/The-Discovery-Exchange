// In-memory Owner session token store (never persisted to localStorage/sessionStorage).
let activeOwnerToken: string | null = null;

export function getOwnerToken(): string | null {
  return activeOwnerToken;
}

export function setOwnerToken(token: string | null): void {
  activeOwnerToken = token ? token.trim() : null;
  if (typeof window !== 'undefined') {
    try {
      // Remove any legacy browser-storage token from earlier builds
      window.localStorage.removeItem('tdex_owner_token');
    } catch {
      // Ignore storage restrictions
    }
  }
}

export function clearOwnerToken(): void {
  setOwnerToken(null);
}
