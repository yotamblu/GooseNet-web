/**
 * Crypto Utilities
 * Password hashing with fallback for mobile/non-HTTPS contexts
 */

"use client";

/**
 * Hash string using SHA-256 with crypto.subtle
 */
async function sha256String(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Hash password using SHA-256
 * Uses crypto.subtle if available, falls back to pure JavaScript SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  // Ensure we're in browser context
  if (typeof window === "undefined") {
    throw new Error("Password hashing must be done in the browser");
  }

  // Try crypto.subtle first (works in HTTPS and localhost)
  if (window.crypto && window.crypto.subtle) {
    try {
      return await sha256String(password);
    } catch (error) {
      console.warn("crypto.subtle failed, using pure JavaScript SHA-256 fallback:", error);
      // Fall through to fallback
    }
  }

  // Fallback: Use pure JavaScript SHA-256 for non-HTTPS contexts (mobile browsers, etc.)
  try {
    const { sha256Pure } = await import("./sha256-pure");
    return sha256Pure(password);
  } catch (error) {
    console.error("Failed to hash password:", error);
    throw new Error(
      "Password hashing failed. Please refresh the page and try again."
    );
  }
}

