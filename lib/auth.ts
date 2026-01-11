/**
 * Authentication Token Helpers
 * Browser-safe token storage utilities
 */

const TOKEN_KEY = "goosenet_jwt";

/**
 * Set authentication token in localStorage
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get authentication token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Clear authentication token from localStorage
 */
export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is logged in (has a token)
 */
export function isLoggedIn(): boolean {
  return getToken() !== null;
}





